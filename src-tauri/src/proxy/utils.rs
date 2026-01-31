use hyper::header::USER_AGENT;
use hyper::Request;
use hyper::body::Incoming;

/// 根据请求头识别客户端工具
pub fn identify_client<B>(req: &Request<B>) -> String {
    let ua = req.headers()
        .get(USER_AGENT)
        .and_then(|h| h.to_str().ok())
        .unwrap_or("");

    let ua_lower = ua.to_lowercase();

    if ua_lower.contains("antigravity") {
        "antigravity".to_string()
    } else if ua_lower.contains("cursor") {
        "cursor".to_string()
    } else if ua_lower.contains("vscode") {
        "vscode".to_string()
    } else if ua_lower.contains("curl") {
        "curl".to_string()
    } else if ua_lower.contains("postman") {
        "postman".to_string()
    } else if ua_lower.contains("insomnia") {
        "insomnia".to_string()
    } else if ua_lower.contains("python-requests") || ua_lower.contains("python-urllib") {
        "python-sdk".to_string()
    } else if ua_lower.contains("node-fetch") || ua_lower.contains("axios") {
        "node-sdk".to_string()
    } else if ua_lower.contains("go-http-client") {
        "go-sdk".to_string()
    } else if ua_lower.contains("mozilla") || ua_lower.contains("chrome") || ua_lower.contains("safari") {
        "browser".to_string()
    } else if ua.is_empty() {
        "unknown".to_string()
    } else {
        // 如果无法精确匹配，返回 UA 的前 20 个字符，方便后续分析
        ua.chars().take(20).collect::<String>()
    }
}
