use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
    body::Body,
};
use std::time::Instant;
use crate::proxy::server::AppState;
use crate::proxy::monitor::ProxyRequestLog;
<<<<<<< HEAD
use serde_json::Value;
use futures::StreamExt;

const MAX_REQUEST_LOG_SIZE: usize = 100 * 1024 * 1024; // 100MB
const MAX_RESPONSE_LOG_SIZE: usize = 100 * 1024 * 1024; // 100MB for image responses
=======
use crate::proxy::utils::identify_client;
use serde_json::Value;
use futures::StreamExt;

const MAX_REQUEST_LOG_SIZE: usize = 1 * 1024 * 1024; // 1MB
const MAX_RESPONSE_LOG_SIZE: usize = 1 * 1024 * 1024; // 1MB
const MAX_LOG_BODY_SIZE: usize = 256 * 1024; // 256KB - Only store this much in DB

use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use std::sync::Arc;
use tokio::sync::Mutex;
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)

pub async fn monitor_middleware(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Response {
<<<<<<< HEAD
    let _logging_enabled = state.monitor.is_enabled();
    
    let method = request.method().to_string();
    let uri = request.uri().to_string();
    
    if uri.contains("event_logging") || uri.contains("/api/") {
        return next.run(request).await;
    }
    
    let start = Instant::now();
    
    // Extract client IP from headers (X-Forwarded-For or X-Real-IP)
    // IMPORTANT: Extract from Request headers, not Response headers (since we want the client's IP)
    // Note: We need to do this BEFORE consuming the request body if possible, or extract it from the original request
    let client_ip = request
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or(s).trim().to_string())
        .or_else(|| {
            request
                .headers()
                .get("x-real-ip")
                .and_then(|v| v.to_str().ok())
                .map(|s| s.to_string())
        });

=======
    let method = request.method().to_string();
    let uri = request.uri().to_string();
    
    if uri.contains("event_logging") {
        return next.run(request).await;
    }

    tracing::info!("[Monitor] Intercepting request: {} {}", method, uri);
    
    let start = Instant::now();
    
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    let mut model = if uri.contains("/v1beta/models/") {
        uri.split("/v1beta/models/")
            .nth(1)
            .and_then(|s| s.split(':').next())
            .map(|s| s.to_string())
    } else {
        None
    };

<<<<<<< HEAD
    let request_body_str;
    let request = if method == "POST" {
        let (parts, body) = request.into_parts();
        match axum::body::to_bytes(body, MAX_REQUEST_LOG_SIZE).await {
            Ok(bytes) => {
                if model.is_none() {
                    model = serde_json::from_slice::<Value>(&bytes).ok().and_then(|v|
                        v.get("model").and_then(|m| m.as_str()).map(|s| s.to_string())
                    );
                }
                request_body_str = if let Ok(s) = std::str::from_utf8(&bytes) {
                    Some(s.to_string())
                } else {
                    Some("[Binary Request Data]".to_string())
                };
                Request::from_parts(parts, Body::from(bytes))
            }
            Err(_) => {
                request_body_str = None;
                Request::from_parts(parts, Body::empty())
            }
        }
    } else {
        request_body_str = None;
        request
    };
    
=======
    let monitor_enabled = state.monitor.is_enabled();
    let request_id = uuid::Uuid::new_v4().to_string();
    let captured_request_body = Arc::new(Mutex::new(Vec::new()));
    let captured_request_body_clone = captured_request_body.clone();
    
    let mut model_raw = model.clone();

    // Streaming request handling: forward immediately, capture in parallel
    let request = if method == "POST" {
        let (parts, body) = request.into_parts();
        let mut stream = body.into_data_stream();
        let (tx, rx) = mpsc::channel(64);
        
        tokio::spawn(async move {
            while let Some(chunk_res) = stream.next().await {
                match chunk_res {
                    Ok(chunk) => {
                        // Capture data for logging (up to limit)
                        {
                            let mut buf = captured_request_body_clone.lock().await;
                            if buf.len() < MAX_REQUEST_LOG_SIZE {
                                let to_add = std::cmp::min(chunk.len(), MAX_REQUEST_LOG_SIZE - buf.len());
                                buf.extend_from_slice(&chunk[..to_add]);
                            }
                        }
                        
                        if let Err(_) = tx.send(Ok::<_, axum::Error>(chunk)).await {
                            break; // Downstream (upstream proxy) disconnected
                        }
                    }
                    Err(e) => {
                        let _ = tx.send(Err(e)).await;
                        break;
                    }
                }
            }
        });
        
        Request::from_parts(parts, Body::from_stream(ReceiverStream::new(rx)))
    } else {
        request
    };
    
    let client_id = crate::proxy::utils::identify_client(&request);
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    let response = next.run(request).await;
    
    let duration = start.elapsed().as_millis() as u64;
    let status = response.status().as_u16();
    
    let content_type = response.headers().get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

<<<<<<< HEAD
    // Extract account email from X-Account-Email header if present
=======
    // Extract account information from headers if present
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    let account_email = response
        .headers()
        .get("X-Account-Email")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

<<<<<<< HEAD
=======
    let account_name = response
        .headers()
        .get("X-Account-Name")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    // Extract mapped model from X-Mapped-Model header if present
    let mapped_model = response
        .headers()
        .get("X-Mapped-Model")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    // Determine protocol from URL path
<<<<<<< HEAD
    let protocol = if uri.contains("/v1/messages") {
=======
    let protocol = if uri.contains("/internal/warmup") {
        Some("internal".to_string())
    } else if uri.contains("/v1/messages") {
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        Some("anthropic".to_string())
    } else if uri.contains("/v1beta/models") {
        Some("gemini".to_string())
    } else if uri.starts_with("/v1/") {
        Some("openai".to_string())
    } else {
        None
    };

<<<<<<< HEAD
    // Client IP has been extracted at the beginning of the function

    let monitor = state.monitor.clone();
    let mut log = ProxyRequestLog {
        id: uuid::Uuid::new_v4().to_string(),
=======
    let monitor = state.monitor.clone();
    // Finalize monitoring data in background after response headers are received
    // but before the response body starts flowing to avoid holding up the UI.

    
    // Extract model from captured request if not already found from URI
    if model_raw.is_none() {
        let buf = captured_request_body.lock().await;
        if !buf.is_empty() {
            model_raw = serde_json::from_slice::<Value>(&buf).ok().and_then(|v|
                v.get("model").and_then(|m| m.as_str()).map(|s| s.to_string())
            );
        }
    }

    let request_body_str = if monitor_enabled {
        let buf = captured_request_body.lock().await;
        if buf.is_empty() {
            None
        } else if let Ok(s) = std::str::from_utf8(&buf) {
            if s.len() > MAX_LOG_BODY_SIZE {
                Some(format!("{}... [Truncated]", &s[..MAX_LOG_BODY_SIZE]))
            } else {
                Some(s.to_string())
            }
        } else {
            Some("[Binary Request Data]".to_string())
        }
    } else {
        None
    };

    let mut log = ProxyRequestLog {
        id: request_id,
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        timestamp: chrono::Utc::now().timestamp_millis(),
        method,
        url: uri,
        status,
        duration,
<<<<<<< HEAD
        model,
        mapped_model,
        account_email,
        client_ip,
=======
        model: model_raw,
        mapped_model,
        account_email,
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        error: None,
        request_body: request_body_str,
        response_body: None,
        input_tokens: None,
        output_tokens: None,
        protocol,
<<<<<<< HEAD
    };


=======
        client: Some(client_id),
        account_name,
    };

>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    if content_type.contains("text/event-stream") {
        let (parts, body) = response.into_parts();
        let mut stream = body.into_data_stream();
        let (tx, rx) = tokio::sync::mpsc::channel(64);
        
        tokio::spawn(async move {
            let mut all_stream_data = Vec::new();
            let mut last_few_bytes = Vec::new();
            
            while let Some(chunk_res) = stream.next().await {
                if let Ok(chunk) = chunk_res {
                    all_stream_data.extend_from_slice(&chunk);
                    
                    if chunk.len() > 8192 {
                        last_few_bytes = chunk.slice(chunk.len()-8192..).to_vec();
                    } else {
                        last_few_bytes.extend_from_slice(&chunk);
                        if last_few_bytes.len() > 8192 {
                            last_few_bytes.drain(0..last_few_bytes.len()-8192);
                        }
                    }
<<<<<<< HEAD
                    let _ = tx.send(Ok::<_, axum::Error>(chunk)).await;
                } else if let Err(e) = chunk_res {
                    let _ = tx.send(Err(axum::Error::new(e))).await;
=======
                    if let Err(_) = tx.send(Ok::<_, axum::Error>(chunk)).await {
                        // Client disconnected, terminate early to release upstream connection
                        tracing::warn!("Client disconnected during SSE stream monitoring, terminating background task");
                        break;
                    }
                } else if let Err(e) = chunk_res {
                    if let Err(_) = tx.send(Err(axum::Error::new(e))).await {
                        break;
                    }
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
                }
            }
            
            // Parse and consolidate stream data into readable format
            if let Ok(full_response) = std::str::from_utf8(&all_stream_data) {
                let mut thinking_content = String::new();
                let mut response_content = String::new();
                let mut thinking_signature = String::new();
                
                for line in full_response.lines() {
                    if !line.starts_with("data: ") {
                        continue;
                    }
                    let json_str = line.trim_start_matches("data: ").trim();
                    if json_str == "[DONE]" {
                        continue;
                    }
                    
                    if let Ok(json) = serde_json::from_str::<Value>(json_str) {
                        // OpenAI format: choices[0].delta.content / reasoning_content
                        if let Some(choices) = json.get("choices").and_then(|c| c.as_array()) {
                            for choice in choices {
                                if let Some(delta) = choice.get("delta") {
                                    // Thinking/reasoning content
                                    if let Some(thinking) = delta.get("reasoning_content").and_then(|v| v.as_str()) {
                                        thinking_content.push_str(thinking);
                                    }
                                    // Main response content
                                    if let Some(content) = delta.get("content").and_then(|v| v.as_str()) {
                                        response_content.push_str(content);
                                    }
                                }
                            }
                        }
                        
                        // Claude/Anthropic format: content_block_delta
                        if let Some(delta) = json.get("delta") {
                            // Thinking block
                            if let Some(thinking) = delta.get("thinking").and_then(|v| v.as_str()) {
                                thinking_content.push_str(thinking);
                            }
                            // Thinking signature
                            if let Some(sig) = delta.get("signature").and_then(|v| v.as_str()) {
                                thinking_signature = sig.to_string();
                            }
                            // Text content
                            if let Some(text) = delta.get("text").and_then(|v| v.as_str()) {
                                response_content.push_str(text);
                            }
                        }
                        
                        // Token usage extraction
                        if let Some(usage) = json.get("usage")
                            .or(json.get("usageMetadata"))
                            .or(json.get("response").and_then(|r| r.get("usage")))
                        {
                            log.input_tokens = usage.get("prompt_tokens")
                                .or(usage.get("input_tokens"))
                                .or(usage.get("promptTokenCount"))
                                .and_then(|v| v.as_u64())
                                .map(|v| v as u32);
                            log.output_tokens = usage.get("completion_tokens")
                                .or(usage.get("output_tokens"))
                                .or(usage.get("candidatesTokenCount"))
                                .and_then(|v| v.as_u64())
                                .map(|v| v as u32);
                            
                            if log.input_tokens.is_none() && log.output_tokens.is_none() {
                                log.output_tokens = usage.get("total_tokens")
                                    .or(usage.get("totalTokenCount"))
                                    .and_then(|v| v.as_u64())
                                    .map(|v| v as u32);
                            }
                        }
                    }
                }
                
                // Build consolidated response object
                let mut consolidated = serde_json::Map::new();
                
                if !thinking_content.is_empty() {
                    consolidated.insert("thinking".to_string(), Value::String(thinking_content));
                }
                if !thinking_signature.is_empty() {
                    consolidated.insert("thinking_signature".to_string(), Value::String(thinking_signature));
                }
                if !response_content.is_empty() {
                    consolidated.insert("content".to_string(), Value::String(response_content));
                }
                if let Some(input) = log.input_tokens {
                    consolidated.insert("input_tokens".to_string(), Value::Number(input.into()));
                }
                if let Some(output) = log.output_tokens {
                    consolidated.insert("output_tokens".to_string(), Value::Number(output.into()));
                }
                
                if consolidated.is_empty() {
                    // Fallback: store raw SSE data if parsing failed
                    log.response_body = Some(full_response.to_string());
                } else {
                    log.response_body = Some(serde_json::to_string_pretty(&Value::Object(consolidated)).unwrap_or_else(|_| full_response.to_string()));
                }
            } else {
                log.response_body = Some(format!("[Binary Stream Data: {} bytes]", all_stream_data.len()));
            }
            
            // Fallback token extraction from tail if not already extracted
            if log.input_tokens.is_none() && log.output_tokens.is_none() {
                if let Ok(full_tail) = std::str::from_utf8(&last_few_bytes) {
                    for line in full_tail.lines().rev() {
                        if line.starts_with("data: ") && (line.contains("\"usage\"") || line.contains("\"usageMetadata\"")) {
                            let json_str = line.trim_start_matches("data: ").trim();
                            if let Ok(json) = serde_json::from_str::<Value>(json_str) {
                                if let Some(usage) = json.get("usage")
                                    .or(json.get("usageMetadata"))
                                    .or(json.get("response").and_then(|r| r.get("usage")))
                                {
                                    log.input_tokens = usage.get("prompt_tokens")
                                        .or(usage.get("input_tokens"))
                                        .or(usage.get("promptTokenCount"))
                                        .and_then(|v| v.as_u64())
                                        .map(|v| v as u32);
                                    log.output_tokens = usage.get("completion_tokens")
                                        .or(usage.get("output_tokens"))
                                        .or(usage.get("candidatesTokenCount"))
                                        .and_then(|v| v.as_u64())
                                        .map(|v| v as u32);
                                    break;
                                }
<<<<<<< HEAD
=======
                                
                                // Alternative: Look for top-level token fields in the tail
                                if let (Some(input), Some(output)) = (
                                    json.get("input_tokens").or(json.get("prompt_tokens")),
                                    json.get("output_tokens").or(json.get("completion_tokens"))
                                ) {
                                    log.input_tokens = input.as_u64().map(|v| v as u32);
                                    log.output_tokens = output.as_u64().map(|v| v as u32);
                                    break;
                                }
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
                            }
                        }
                    }
                }
            }
            
            if log.status >= 400 {
                log.error = Some("Stream Error or Failed".to_string());
            }
            monitor.log_request(log).await;
        });

        Response::from_parts(parts, Body::from_stream(tokio_stream::wrappers::ReceiverStream::new(rx)))
<<<<<<< HEAD
    } else if content_type.contains("application/json") || content_type.contains("text/") {
        let (parts, body) = response.into_parts();
        match axum::body::to_bytes(body, MAX_RESPONSE_LOG_SIZE).await {
            Ok(bytes) => {
                if let Ok(s) = std::str::from_utf8(&bytes) {
                    if let Ok(json) = serde_json::from_str::<Value>(&s) {
                        // 支持 OpenAI "usage" 或 Gemini "usageMetadata"
                        if let Some(usage) = json.get("usage").or(json.get("usageMetadata")) {
                            log.input_tokens = usage.get("prompt_tokens")
                                .or(usage.get("input_tokens"))
                                .or(usage.get("promptTokenCount"))
                                .and_then(|v| v.as_u64())
                                .map(|v| v as u32);
                            log.output_tokens = usage.get("completion_tokens")
                                .or(usage.get("output_tokens"))
                                .or(usage.get("candidatesTokenCount"))
                                .and_then(|v| v.as_u64())
                                .map(|v| v as u32);
                                
                            if log.input_tokens.is_none() && log.output_tokens.is_none() {
                                log.output_tokens = usage.get("total_tokens")
                                    .or(usage.get("totalTokenCount"))
                                    .and_then(|v| v.as_u64())
                                    .map(|v| v as u32);
                            }
                        }
                    }
                    log.response_body = Some(s.to_string());
                } else {
                    log.response_body = Some("[Binary Response Data]".to_string());
                }
                
                if log.status >= 400 {
                    log.error = log.response_body.clone();
                }
                monitor.log_request(log).await;
                Response::from_parts(parts, Body::from(bytes))
            }
            Err(_) => {
                log.response_body = Some("[Response too large (>100MB)]".to_string());
                monitor.log_request(log).await;
                Response::from_parts(parts, Body::empty())
            }
        }
    } else {
        log.response_body = Some(format!("[{}]", content_type));
        monitor.log_request(log).await;
=======
    } else if (content_type.contains("application/json") || content_type.contains("text/")) && monitor_enabled {
        let (parts, body) = response.into_parts();
        let mut stream = body.into_data_stream();
        let (tx, rx) = mpsc::channel(64);
        
        tokio::spawn(async move {
            let mut captured_buf = Vec::new();
            while let Some(chunk_res) = stream.next().await {
                match chunk_res {
                    Ok(chunk) => {
                        if captured_buf.len() < MAX_RESPONSE_LOG_SIZE {
                            let to_add = std::cmp::min(chunk.len(), MAX_RESPONSE_LOG_SIZE - captured_buf.len());
                            captured_buf.extend_from_slice(&chunk[..to_add]);
                        }
                        if let Err(_) = tx.send(Ok::<_, axum::Error>(chunk)).await {
                            break;
                        }
                    }
                    Err(e) => {
                        let _ = tx.send(Err(e)).await;
                        break;
                    }
                }
            }
            
            // Finalize log after response is fully streamed
            if let Ok(s) = std::str::from_utf8(&captured_buf) {
                if let Ok(json) = serde_json::from_str::<Value>(&s) {
                    if let Some(usage) = json.get("usage").or(json.get("usageMetadata")) {
                        log.input_tokens = usage.get("prompt_tokens")
                            .or(usage.get("input_tokens"))
                            .or(usage.get("promptTokenCount"))
                            .and_then(|v| v.as_u64())
                            .map(|v| v as u32);
                        log.output_tokens = usage.get("completion_tokens")
                            .or(usage.get("output_tokens"))
                            .or(usage.get("candidatesTokenCount"))
                            .and_then(|v| v.as_u64())
                            .map(|v| v as u32);
                    }
                    
                    // Fallback to top-level fields (e.g. from internal warmup API)
                    if log.input_tokens.is_none() {
                        log.input_tokens = json.get("input_tokens")
                            .or(json.get("prompt_tokens"))
                            .and_then(|v| v.as_u64())
                            .map(|v| v as u32);
                    }
                    if log.output_tokens.is_none() {
                        log.output_tokens = json.get("output_tokens")
                            .or(json.get("completion_tokens"))
                            .and_then(|v| v.as_u64())
                            .map(|v| v as u32);
                    }
                }
                
                if s.len() > MAX_LOG_BODY_SIZE {
                    log.response_body = Some(format!("{}... [Truncated]", &s[..MAX_LOG_BODY_SIZE]));
                } else {
                    log.response_body = Some(s.to_string());
                }
            } else {
                log.response_body = Some("[Binary Response Data]".to_string());
            }
            
            if log.status >= 400 {
                log.error = log.response_body.clone();
            }
            monitor.log_request(log).await;
        });

        Response::from_parts(parts, Body::from_stream(ReceiverStream::new(rx)))
    } else {
        if monitor_enabled {
            log.response_body = Some(format!("[{}]", content_type));
            tracing::info!("[Monitor] Logging non-stream request (type: {})", content_type);
            monitor.log_request(log).await;
        }
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        response
    }
}
