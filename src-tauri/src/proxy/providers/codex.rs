use axum::{
    body::Body,
    http::{header, header::HeaderName, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use bytes::{Bytes, BytesMut};
use chrono::Utc;
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    collections::HashSet,
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicUsize, Ordering},
        OnceLock,
    },
};
use tokio::time::Duration;
use uuid::Uuid;

use crate::proxy::{CodexConfig, server::AppState};

static CODEX_RR: OnceLock<AtomicUsize> = OnceLock::new();

const DEFAULT_BROWSER_UA: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

#[derive(Debug, Clone, Serialize)]
pub struct CodexProviderStatus {
    pub enabled: bool,
    pub detected_accounts: usize,
    pub auth_path: Option<String>,
    pub accounts_path: Option<String>,
    pub last_error: Option<String>,
}

#[derive(Debug, Clone)]
struct CodexCredential {
    label: String,
    access_token: String,
    account_id: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
struct StoredCodexTokens {
    access_token: Option<String>,
    account_id: Option<String>,
}

#[derive(Debug, Deserialize)]
struct StoredCodexAuth {
    access_token: Option<String>,
    account_id: Option<String>,
    #[serde(default)]
    tokens: Option<StoredCodexTokens>,
}

#[derive(Debug, Clone, Deserialize)]
struct StoredCodexAccount {
    name: Option<String>,
    access_token: Option<String>,
    account_id: Option<String>,
    enabled: Option<bool>,
    #[serde(default)]
    tokens: Option<StoredCodexTokens>,
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum StoredCodexAccountsFile {
    List(Vec<StoredCodexAccount>),
    Wrapped { accounts: Vec<StoredCodexAccount> },
}

#[derive(Debug, Default)]
struct CollectedCodexOutput {
    response_id: Option<String>,
    text: String,
}

fn rr_counter() -> &'static AtomicUsize {
    CODEX_RR.get_or_init(|| AtomicUsize::new(0))
}

fn default_auth_path() -> Option<PathBuf> {
    dirs::home_dir().map(|home| home.join(".codex").join("auth.json"))
}

fn default_accounts_path() -> Option<PathBuf> {
    crate::modules::account::get_data_dir()
        .ok()
        .map(|dir| dir.join("codex_accounts.json"))
}

fn resolve_path(raw: Option<&str>, fallback: Option<PathBuf>) -> Option<PathBuf> {
    match raw.map(str::trim).filter(|p| !p.is_empty()) {
        Some(path) if path == "~" => dirs::home_dir(),
        Some(path) if path.starts_with("~/") => dirs::home_dir().map(|home| home.join(&path[2..])),
        Some(path) => Some(PathBuf::from(path)),
        None => fallback,
    }
}

fn is_codex_target_model(model: &str) -> bool {
    let normalized = model.trim().to_ascii_lowercase();
    normalized.contains("codex")
        || normalized == "gpt-5"
        || normalized.starts_with("gpt-5-")
        || normalized.starts_with("gpt-5.")
}

pub fn should_route_request(config: &CodexConfig, body: &Value) -> bool {
    if !config.enabled {
        return false;
    }

    if let Some(model) = body.get("model").and_then(Value::as_str) {
        return is_codex_target_model(model);
    }

    body.get("input").is_some() || body.get("instructions").is_some()
}

pub fn advertised_models() -> Vec<String> {
    vec![
        "gpt-5".to_string(),
        "gpt-5.4".to_string(),
        "gpt-5-mini".to_string(),
        "gpt-5-nano".to_string(),
        "gpt-5-codex".to_string(),
        "gpt-5.2-codex".to_string(),
        "gpt-5.3-codex".to_string(),
    ]
}

pub fn inspect_provider(config: &CodexConfig) -> CodexProviderStatus {
    let auth_path = resolve_path(config.auth_path.as_deref(), default_auth_path());
    let accounts_path = resolve_path(config.accounts_path.as_deref(), default_accounts_path());

    match load_credentials(config) {
        Ok(credentials) => CodexProviderStatus {
            enabled: config.enabled,
            detected_accounts: credentials.len(),
            auth_path: auth_path.map(|path| path.display().to_string()),
            accounts_path: accounts_path
                .filter(|path| path.exists())
                .map(|path| path.display().to_string()),
            last_error: None,
        },
        Err(error) => CodexProviderStatus {
            enabled: config.enabled,
            detected_accounts: 0,
            auth_path: auth_path.map(|path| path.display().to_string()),
            accounts_path: accounts_path.map(|path| path.display().to_string()),
            last_error: Some(error),
        },
    }
}

fn credential_from_auth(auth: StoredCodexAuth, label: impl Into<String>) -> Option<CodexCredential> {
    let access_token = auth
        .tokens
        .as_ref()
        .and_then(|tokens| tokens.access_token.clone())
        .or(auth.access_token)?;

    let account_id = auth
        .tokens
        .as_ref()
        .and_then(|tokens| tokens.account_id.clone())
        .or(auth.account_id);

    Some(CodexCredential {
        label: label.into(),
        access_token,
        account_id,
    })
}

fn credential_from_account(account: StoredCodexAccount, index: usize) -> Option<CodexCredential> {
    if account.enabled == Some(false) {
        return None;
    }

    let access_token = account
        .tokens
        .as_ref()
        .and_then(|tokens| tokens.access_token.clone())
        .or(account.access_token)?;

    let account_id = account
        .tokens
        .as_ref()
        .and_then(|tokens| tokens.account_id.clone())
        .or(account.account_id);

    Some(CodexCredential {
        label: account.name.unwrap_or_else(|| format!("codex-{}", index + 1)),
        access_token,
        account_id,
    })
}

fn read_json_file(path: &Path) -> Result<Value, String> {
    let content = std::fs::read_to_string(path)
        .map_err(|error| format!("Failed to read {}: {}", path.display(), error))?;

    serde_json::from_str(&content)
        .map_err(|error| format!("Failed to parse {}: {}", path.display(), error))
}

fn load_credentials(config: &CodexConfig) -> Result<Vec<CodexCredential>, String> {
    let auth_path = resolve_path(config.auth_path.as_deref(), default_auth_path());
    let accounts_path = resolve_path(config.accounts_path.as_deref(), default_accounts_path());

    let mut credentials = Vec::new();
    let mut dedupe = HashSet::new();
    let mut errors = Vec::new();

    if let Some(path) = accounts_path.as_ref().filter(|path| path.exists()) {
        match read_json_file(path) {
            Ok(value) => {
                let parsed: Result<StoredCodexAccountsFile, _> = serde_json::from_value(value);
                match parsed {
                    Ok(StoredCodexAccountsFile::List(accounts)) => {
                        for (index, account) in accounts.into_iter().enumerate() {
                            if let Some(credential) = credential_from_account(account, index) {
                                let key = format!(
                                    "{}:{}",
                                    credential.account_id.clone().unwrap_or_default(),
                                    credential.access_token
                                );
                                if dedupe.insert(key) {
                                    credentials.push(credential);
                                }
                            }
                        }
                    }
                    Ok(StoredCodexAccountsFile::Wrapped { accounts }) => {
                        for (index, account) in accounts.into_iter().enumerate() {
                            if let Some(credential) = credential_from_account(account, index) {
                                let key = format!(
                                    "{}:{}",
                                    credential.account_id.clone().unwrap_or_default(),
                                    credential.access_token
                                );
                                if dedupe.insert(key) {
                                    credentials.push(credential);
                                }
                            }
                        }
                    }
                    Err(error) => errors.push(format!(
                        "Failed to parse Codex accounts file {}: {}",
                        path.display(),
                        error
                    )),
                }
            }
            Err(error) => errors.push(error),
        }
    }

    if let Some(path) = auth_path.as_ref().filter(|path| path.exists()) {
        match read_json_file(path) {
            Ok(value) => {
                let parsed: Result<StoredCodexAuth, _> = serde_json::from_value(value);
                match parsed {
                    Ok(auth) => {
                        if let Some(credential) = credential_from_auth(auth, "local-auth") {
                            let key = format!(
                                "{}:{}",
                                credential.account_id.clone().unwrap_or_default(),
                                credential.access_token
                            );
                            if dedupe.insert(key) {
                                credentials.push(credential);
                            }
                        }
                    }
                    Err(error) => errors.push(format!(
                        "Failed to parse Codex auth file {}: {}",
                        path.display(),
                        error
                    )),
                }
            }
            Err(error) => errors.push(error),
        }
    }

    if credentials.is_empty() {
        if errors.is_empty() {
            return Err("No Codex credentials found. Log into Codex CLI first or provide a codex_accounts.json pool.".to_string());
        }
        return Err(errors.join(" | "));
    }

    Ok(credentials)
}

fn pick_credential(config: &CodexConfig) -> Result<CodexCredential, String> {
    let credentials = load_credentials(config)?;
    let slot = rr_counter().fetch_add(1, Ordering::Relaxed) % credentials.len();
    Ok(credentials[slot].clone())
}

fn build_client(
    upstream_proxy: crate::proxy::config::UpstreamProxyConfig,
    timeout_secs: u64,
) -> Result<reqwest::Client, String> {
    let mut builder = reqwest::Client::builder()
        .timeout(Duration::from_secs(timeout_secs.max(15)))
        .user_agent(DEFAULT_BROWSER_UA);

    if upstream_proxy.enabled && !upstream_proxy.url.trim().is_empty() {
        let proxy = reqwest::Proxy::all(upstream_proxy.url.trim())
            .map_err(|error| format!("Invalid upstream proxy url: {}", error))?;
        builder = builder.proxy(proxy);
    }

    builder
        .build()
        .map_err(|error| format!("Failed to build Codex HTTP client: {}", error))
}

fn build_headers(credential: &CodexCredential) -> Result<HeaderMap, String> {
    let mut headers = HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("application/json"),
    );
    headers.insert(
        header::ACCEPT,
        HeaderValue::from_static("text/event-stream"),
    );
    headers.insert(
        header::AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", credential.access_token))
            .map_err(|error| error.to_string())?,
    );
    headers.insert(
        header::ORIGIN,
        HeaderValue::from_static("https://chatgpt.com"),
    );
    headers.insert(
        header::REFERER,
        HeaderValue::from_static("https://chatgpt.com/"),
    );
    headers.insert(
        header::USER_AGENT,
        HeaderValue::from_static(DEFAULT_BROWSER_UA),
    );
    headers.insert(
        HeaderName::from_static("openai-beta"),
        HeaderValue::from_static("responses=experimental"),
    );

    if let Some(account_id) = credential.account_id.as_deref() {
        headers.insert(
            HeaderName::from_static("chatgpt-account-id"),
            HeaderValue::from_str(account_id).map_err(|error| error.to_string())?,
        );
    }

    Ok(headers)
}

fn stringify_text_content(value: Option<&Value>) -> String {
    match value {
        Some(Value::String(text)) => text.clone(),
        Some(Value::Array(items)) => items
            .iter()
            .filter_map(|item| {
                item.get("text")
                    .and_then(Value::as_str)
                    .map(str::to_string)
                    .or_else(|| item.as_str().map(str::to_string))
            })
            .collect::<Vec<_>>()
            .join("\n"),
        Some(other) => other.to_string(),
        None => String::new(),
    }
}

fn normalize_content_blocks(value: Option<&Value>) -> Vec<Value> {
    match value {
        Some(Value::String(text)) => vec![json!({ "type": "input_text", "text": text })],
        Some(Value::Array(items)) => items
            .iter()
            .filter_map(|item| {
                let item_type = item.get("type").and_then(Value::as_str).unwrap_or("text");
                match item_type {
                    "text" | "input_text" => item
                        .get("text")
                        .and_then(Value::as_str)
                        .map(|text| json!({ "type": "input_text", "text": text })),
                    "image_url" => item
                        .get("image_url")
                        .and_then(|image| image.get("url").or(Some(image)))
                        .and_then(Value::as_str)
                        .map(|url| json!({ "type": "input_image", "image_url": url })),
                    "input_image" => item
                        .get("image_url")
                        .and_then(Value::as_str)
                        .map(|url| json!({ "type": "input_image", "image_url": url })),
                    _ => item.as_str().map(|text| json!({ "type": "input_text", "text": text })),
                }
            })
            .collect(),
        Some(other) => vec![json!({ "type": "input_text", "text": other.to_string() })],
        None => Vec::new(),
    }
}

fn messages_to_codex_payload(body: &Value) -> Value {
    let mut instructions = Vec::new();
    let mut input = Vec::new();

    if let Some(messages) = body.get("messages").and_then(Value::as_array) {
        for message in messages {
            let role = message
                .get("role")
                .and_then(Value::as_str)
                .unwrap_or("user");

            if role == "system" {
                let content = stringify_text_content(message.get("content"));
                if !content.is_empty() {
                    instructions.push(content);
                }
                continue;
            }

            if role == "tool" {
                input.push(json!({
                    "type": "function_call_output",
                    "call_id": message.get("tool_call_id").and_then(Value::as_str).unwrap_or("call_unknown"),
                    "output": stringify_text_content(message.get("content"))
                }));
                continue;
            }

            if let Some(tool_calls) = message.get("tool_calls").and_then(Value::as_array) {
                for tool_call in tool_calls {
                    let name = tool_call
                        .get("function")
                        .and_then(|function| function.get("name"))
                        .and_then(Value::as_str)
                        .unwrap_or("tool");
                    let arguments = tool_call
                        .get("function")
                        .and_then(|function| function.get("arguments"))
                        .cloned()
                        .unwrap_or(json!("{}"));

                    input.push(json!({
                        "type": "function_call",
                        "call_id": tool_call.get("id").and_then(Value::as_str).unwrap_or("call_unknown"),
                        "name": name,
                        "arguments": arguments
                    }));
                }
            }

            let content_blocks = normalize_content_blocks(message.get("content"));
            if !content_blocks.is_empty() {
                input.push(json!({
                    "type": "message",
                    "role": role,
                    "content": content_blocks
                }));
            }
        }
    }

    let tools = body
        .get("tools")
        .cloned()
        .unwrap_or_else(|| Value::Array(Vec::new()));
    let has_tools = tools.as_array().map(|items| !items.is_empty()).unwrap_or(false);
    let mut payload = json!({
        "model": body.get("model").cloned().unwrap_or(json!("gpt-5")),
        "stream": true,
        "store": false,
        "include": [
            "reasoning.encrypted_content",
            "code_interpreter_call.outputs"
        ],
        "input": input,
        "reasoning": body.get("reasoning").cloned().unwrap_or(json!({
            "effort": "medium",
            "summary": "detailed"
        })),
        "tool_choice": if has_tools {
            body.get("tool_choice").cloned().unwrap_or(json!("auto"))
        } else {
            json!("none")
        }
    });

    if has_tools {
        payload["tools"] = tools;
    }

    if !instructions.is_empty() {
        payload["instructions"] = json!(instructions.join("\n\n"));
    }

    if let Some(max_tokens) = body.get("max_tokens").and_then(Value::as_u64) {
        payload["max_output_tokens"] = json!(max_tokens);
    }

    if let Some(temperature) = body.get("temperature") {
        payload["temperature"] = temperature.clone();
    }

    payload
}

fn normalize_responses_input(value: &Value) -> Value {
    match value {
        Value::String(text) => json!([{
            "type": "message",
            "role": "user",
            "content": [{ "type": "input_text", "text": text }]
        }]),
        Value::Array(items) => {
            let looks_structured = items
                .first()
                .and_then(Value::as_object)
                .map(|object| object.contains_key("type") || object.contains_key("role"))
                .unwrap_or(false);

            if looks_structured {
                value.clone()
            } else {
                json!([{
                    "type": "message",
                    "role": "user",
                    "content": items
                }])
            }
        }
        other => json!([{
            "type": "message",
            "role": "user",
            "content": [{ "type": "input_text", "text": other.to_string() }]
        }]),
    }
}

fn build_responses_payload(body: &Value) -> Value {
    if body.get("input").is_none() && body.get("messages").is_some() {
        return messages_to_codex_payload(body);
    }

    let tools = body
        .get("tools")
        .cloned()
        .unwrap_or_else(|| Value::Array(Vec::new()));
    let has_tools = tools.as_array().map(|items| !items.is_empty()).unwrap_or(false);
    let input = body
        .get("input")
        .map(normalize_responses_input)
        .unwrap_or_else(|| Value::Array(Vec::new()));

    let mut payload = json!({
        "model": body.get("model").cloned().unwrap_or(json!("gpt-5")),
        "stream": true,
        "store": false,
        "include": body.get("include").cloned().unwrap_or(json!([
            "reasoning.encrypted_content",
            "code_interpreter_call.outputs"
        ])),
        "input": input,
        "reasoning": body.get("reasoning").cloned().unwrap_or(json!({
            "effort": "medium",
            "summary": "detailed"
        })),
        "tool_choice": if has_tools {
            body.get("tool_choice").cloned().unwrap_or(json!("auto"))
        } else {
            json!("none")
        }
    });

    if let Some(instructions) = body.get("instructions") {
        payload["instructions"] = instructions.clone();
    }

    if has_tools {
        payload["tools"] = tools;
    }

    if let Some(max_output_tokens) = body
        .get("max_output_tokens")
        .or_else(|| body.get("max_tokens"))
        .and_then(Value::as_u64)
    {
        payload["max_output_tokens"] = json!(max_output_tokens);
    }

    payload
}

async fn send_request(
    state: &AppState,
    config: &CodexConfig,
    payload: &Value,
    credential: &CodexCredential,
) -> Result<reqwest::Response, String> {
    let client = build_client(state.upstream_proxy.read().await.clone(), state.request_timeout)?;
    let headers = build_headers(credential)?;
    client
        .post(config.base_url.trim())
        .headers(headers)
        .json(payload)
        .send()
        .await
        .map_err(|error| format!("Codex upstream request failed: {}", error))
}

async fn read_error_response(response: reqwest::Response) -> Response {
    let status = StatusCode::from_u16(response.status().as_u16()).unwrap_or(StatusCode::BAD_GATEWAY);
    let body = response
        .text()
        .await
        .unwrap_or_else(|_| "Unknown Codex upstream error".to_string());

    (
        status,
        Json(json!({
            "error": {
                "message": body,
                "type": "codex_upstream_error"
            }
        })),
    )
        .into_response()
}

fn parse_sse_line(line: &str) -> Option<Value> {
    let trimmed = line.trim();
    if trimmed.is_empty() || !trimmed.starts_with("data: ") {
        return None;
    }

    let payload = trimmed.trim_start_matches("data: ").trim();
    if payload == "[DONE]" {
        return None;
    }

    serde_json::from_str(payload).ok()
}

fn apply_event_to_output(collected: &mut CollectedCodexOutput, event: &Value) -> Result<(), String> {
    match event.get("type").and_then(Value::as_str).unwrap_or_default() {
        "response.created" => {
            if let Some(id) = event
                .get("response")
                .and_then(|response| response.get("id"))
                .and_then(Value::as_str)
            {
                collected.response_id = Some(id.to_string());
            }
        }
        "response.output_text.delta" => {
            if let Some(delta) = event.get("delta").and_then(Value::as_str) {
                collected.text.push_str(delta);
            }
        }
        "response.completed" => {
            if collected.response_id.is_none() {
                collected.response_id = event
                    .get("response")
                    .and_then(|response| response.get("id"))
                    .and_then(Value::as_str)
                    .map(str::to_string);
            }
        }
        "response.failed" | "error" => {
            let message = event
                .get("error")
                .and_then(|error| error.get("message").or_else(|| error.get("code")))
                .and_then(Value::as_str)
                .unwrap_or("Codex upstream returned an error event");
            return Err(message.to_string());
        }
        _ => {}
    }

    Ok(())
}

async fn collect_codex_output(response: reqwest::Response) -> Result<CollectedCodexOutput, String> {
    let mut buffer = BytesMut::new();
    let mut collected = CollectedCodexOutput::default();
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let bytes = chunk.map_err(|error| format!("Codex stream read error: {}", error))?;
        buffer.extend_from_slice(&bytes);

        while let Some(position) = buffer.iter().position(|byte| *byte == b'\n') {
            let raw_line = buffer.split_to(position + 1);
            let line = std::str::from_utf8(&raw_line)
                .map_err(|error| format!("Codex stream decoding error: {}", error))?;

            if let Some(event) = parse_sse_line(line) {
                apply_event_to_output(&mut collected, &event)?;
            }
        }
    }

    if collected.response_id.is_none() {
        collected.response_id = Some(format!("resp_{}", Uuid::new_v4()));
    }

    Ok(collected)
}

fn create_chat_stream_from_codex(
    response: reqwest::Response,
    model: String,
) -> impl futures::Stream<Item = Result<Bytes, String>> + Send {
    let mut upstream = response.bytes_stream();
    let mut buffer = BytesMut::new();
    let stream_id = format!("chatcmpl-{}", Uuid::new_v4());
    let created = Utc::now().timestamp();

    async_stream::stream! {
        let role_chunk = json!({
            "id": stream_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": model,
            "choices": [{
                "index": 0,
                "delta": { "role": "assistant" },
                "finish_reason": Value::Null
            }]
        });
        yield Ok(Bytes::from(format!("data: {}\n\n", serde_json::to_string(&role_chunk).unwrap_or_default())));

        while let Some(chunk) = upstream.next().await {
            let bytes = match chunk {
                Ok(bytes) => bytes,
                Err(error) => {
                    yield Err(format!("Codex stream read error: {}", error));
                    break;
                }
            };

            buffer.extend_from_slice(&bytes);
            while let Some(position) = buffer.iter().position(|byte| *byte == b'\n') {
                let raw_line = buffer.split_to(position + 1);
                let line = match std::str::from_utf8(&raw_line) {
                    Ok(line) => line,
                    Err(error) => {
                        yield Err(format!("Codex stream decoding error: {}", error));
                        continue;
                    }
                };

                if let Some(event) = parse_sse_line(line) {
                    match event.get("type").and_then(Value::as_str).unwrap_or_default() {
                        "response.output_text.delta" => {
                            if let Some(delta) = event.get("delta").and_then(Value::as_str) {
                                let chunk = json!({
                                    "id": stream_id,
                                    "object": "chat.completion.chunk",
                                    "created": created,
                                    "model": model,
                                    "choices": [{
                                        "index": 0,
                                        "delta": { "content": delta },
                                        "finish_reason": Value::Null
                                    }]
                                });
                                yield Ok(Bytes::from(format!("data: {}\n\n", serde_json::to_string(&chunk).unwrap_or_default())));
                            }
                        }
                        "response.completed" => {
                            let done = json!({
                                "id": stream_id,
                                "object": "chat.completion.chunk",
                                "created": created,
                                "model": model,
                                "choices": [{
                                    "index": 0,
                                    "delta": {},
                                    "finish_reason": "stop"
                                }]
                            });
                            yield Ok(Bytes::from(format!("data: {}\n\n", serde_json::to_string(&done).unwrap_or_default())));
                            yield Ok(Bytes::from("data: [DONE]\n\n"));
                            return;
                        }
                        "response.failed" | "error" => {
                            let message = event
                                .get("error")
                                .and_then(|error| error.get("message").or_else(|| error.get("code")))
                                .and_then(Value::as_str)
                                .unwrap_or("Codex upstream returned an error event");
                            yield Err(message.to_string());
                            return;
                        }
                        _ => {}
                    }
                }
            }
        }

        let done = json!({
            "id": stream_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": model,
            "choices": [{
                "index": 0,
                "delta": {},
                "finish_reason": "stop"
            }]
        });
        yield Ok(Bytes::from(format!("data: {}\n\n", serde_json::to_string(&done).unwrap_or_default())));
        yield Ok(Bytes::from("data: [DONE]\n\n"));
    }
}

pub async fn forward_chat_completions(state: &AppState, body: Value) -> Response {
    let config = state.codex.read().await.clone();
    let credential = match pick_credential(&config) {
        Ok(credential) => credential,
        Err(error) => return (StatusCode::SERVICE_UNAVAILABLE, error).into_response(),
    };

    let model = body
        .get("model")
        .and_then(Value::as_str)
        .unwrap_or("gpt-5")
        .to_string();
    let client_wants_stream = body.get("stream").and_then(Value::as_bool).unwrap_or(false);
    let payload = messages_to_codex_payload(&body);

    let response = match send_request(state, &config, &payload, &credential).await {
        Ok(response) => response,
        Err(error) => return (StatusCode::BAD_GATEWAY, error).into_response(),
    };

    if !response.status().is_success() {
        return read_error_response(response).await;
    }

    if client_wants_stream {
        let stream = create_chat_stream_from_codex(response, model.clone());
        return Response::builder()
            .status(StatusCode::OK)
            .header(header::CONTENT_TYPE, "text/event-stream")
            .header("X-Codex-Account", credential.label.as_str())
            .body(Body::from_stream(stream))
            .unwrap_or_else(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to build Codex SSE response").into_response());
    }

    match collect_codex_output(response).await {
        Ok(collected) => {
            let completion_tokens = (collected.text.chars().count() / 4).max(1) as u32;
            let prompt_tokens = (payload.to_string().chars().count() / 4).max(1) as u32;
            (
                StatusCode::OK,
                [("X-Codex-Account", credential.label.as_str())],
                Json(json!({
                    "id": collected.response_id.unwrap_or_else(|| format!("chatcmpl-{}", Uuid::new_v4())),
                    "object": "chat.completion",
                    "created": Utc::now().timestamp(),
                    "model": model,
                    "choices": [{
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": collected.text
                        },
                        "finish_reason": "stop"
                    }],
                    "usage": {
                        "prompt_tokens": prompt_tokens,
                        "completion_tokens": completion_tokens,
                        "total_tokens": prompt_tokens + completion_tokens
                    }
                })),
            )
                .into_response()
        }
        Err(error) => (StatusCode::BAD_GATEWAY, error).into_response(),
    }
}

pub async fn forward_responses(state: &AppState, body: Value) -> Response {
    let config = state.codex.read().await.clone();
    let credential = match pick_credential(&config) {
        Ok(credential) => credential,
        Err(error) => return (StatusCode::SERVICE_UNAVAILABLE, error).into_response(),
    };

    let model = body
        .get("model")
        .and_then(Value::as_str)
        .unwrap_or("gpt-5")
        .to_string();
    let client_wants_stream = body.get("stream").and_then(Value::as_bool).unwrap_or(true);
    let payload = build_responses_payload(&body);

    let response = match send_request(state, &config, &payload, &credential).await {
        Ok(response) => response,
        Err(error) => return (StatusCode::BAD_GATEWAY, error).into_response(),
    };

    if !response.status().is_success() {
        return read_error_response(response).await;
    }

    if client_wants_stream {
        let stream = response.bytes_stream().map(|chunk| match chunk {
            Ok(bytes) => Ok::<Bytes, std::io::Error>(bytes),
            Err(error) => Ok(Bytes::from(format!(
                "data: {}\n\n",
                serde_json::to_string(&json!({
                    "type": "error",
                    "error": {
                        "message": format!("Codex stream read error: {}", error)
                    }
                }))
                .unwrap_or_default()
            ))),
        });

        return Response::builder()
            .status(StatusCode::OK)
            .header(header::CONTENT_TYPE, "text/event-stream")
            .header("X-Codex-Account", credential.label.as_str())
            .body(Body::from_stream(stream))
            .unwrap_or_else(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to build Codex responses stream").into_response());
    }

    match collect_codex_output(response).await {
        Ok(collected) => {
            let completion_tokens = (collected.text.chars().count() / 4).max(1) as u32;
            let prompt_tokens = (payload.to_string().chars().count() / 4).max(1) as u32;
            (
                StatusCode::OK,
                [("X-Codex-Account", credential.label.as_str())],
                Json(json!({
                    "id": collected.response_id.unwrap_or_else(|| format!("resp_{}", Uuid::new_v4())),
                    "object": "response",
                    "created": Utc::now().timestamp(),
                    "model": model,
                    "status": "completed",
                    "output": [{
                        "type": "message",
                        "id": format!("msg_{}", Uuid::new_v4()),
                        "status": "completed",
                        "role": "assistant",
                        "content": [{
                            "type": "output_text",
                            "text": collected.text,
                            "annotations": []
                        }]
                    }],
                    "usage": {
                        "input_tokens": prompt_tokens,
                        "output_tokens": completion_tokens,
                        "total_tokens": prompt_tokens + completion_tokens
                    }
                })),
            )
                .into_response()
        }
        Err(error) => (StatusCode::BAD_GATEWAY, error).into_response(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn should_route_codex_targets_and_responses_requests() {
        let config = CodexConfig {
            enabled: true,
            ..CodexConfig::default()
        };

        assert!(should_route_request(&config, &json!({ "model": "gpt-5" })));
        assert!(should_route_request(&config, &json!({ "model": "gpt-5.4" })));
        assert!(should_route_request(
            &config,
            &json!({ "model": "gpt-5-codex", "messages": [] })
        ));
        assert!(should_route_request(
            &config,
            &json!({ "input": "Write a test" })
        ));
        assert!(!should_route_request(
            &config,
            &json!({ "model": "claude-3-7-sonnet" })
        ));
    }

    #[test]
    fn credential_from_auth_supports_nested_tokens_shape() {
        let credential = credential_from_auth(
            StoredCodexAuth {
                access_token: None,
                account_id: None,
                tokens: Some(StoredCodexTokens {
                    access_token: Some("token_123".to_string()),
                    account_id: Some("acct_456".to_string()),
                }),
            },
            "local-auth",
        )
        .expect("credential should be parsed");

        assert_eq!(credential.label, "local-auth");
        assert_eq!(credential.access_token, "token_123");
        assert_eq!(credential.account_id.as_deref(), Some("acct_456"));
    }

    #[test]
    fn messages_payload_extracts_system_instructions_and_user_content() {
        let payload = messages_to_codex_payload(&json!({
            "model": "gpt-5",
            "messages": [
                { "role": "system", "content": "Follow the repo rules." },
                { "role": "user", "content": "Implement Codex proxy support." }
            ]
        }));

        assert_eq!(payload["model"], "gpt-5");
        assert_eq!(payload["instructions"], "Follow the repo rules.");
        assert_eq!(payload["input"][0]["type"], "message");
        assert_eq!(payload["input"][0]["role"], "user");
        assert_eq!(payload["input"][0]["content"][0]["type"], "input_text");
        assert_eq!(
            payload["input"][0]["content"][0]["text"],
            "Implement Codex proxy support."
        );
    }
}
