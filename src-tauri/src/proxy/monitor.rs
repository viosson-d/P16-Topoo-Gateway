use serde::{Serialize, Deserialize};
use std::collections::VecDeque;
use tokio::sync::RwLock;
use tauri::Emitter;
use std::sync::atomic::{AtomicBool, Ordering};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyRequestLog {
    pub id: String,
    pub timestamp: i64,
    pub method: String,
    pub url: String,
    pub status: u16,
    pub duration: u64, // ms
    pub model: Option<String>,        // 客户端请求的模型名
    pub mapped_model: Option<String>, // 实际路由后使用的模型名
    pub account_email: Option<String>,
<<<<<<< HEAD
    pub client_ip: Option<String>,    // 客户端 IP 地址
=======
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    pub error: Option<String>,
    pub request_body: Option<String>,
    pub response_body: Option<String>,
    pub input_tokens: Option<u32>,
    pub output_tokens: Option<u32>,
    pub protocol: Option<String>,     // 协议类型: "openai", "anthropic", "gemini"
<<<<<<< HEAD
=======
    pub client: Option<String>,       // 客户端标识: "antigravity", "cursor", "curl" etc.
    pub account_name: Option<String>, // 账号别名/昵称
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProxyStats {
    pub total_requests: u64,
    pub success_count: u64,
    pub error_count: u64,
}

pub struct ProxyMonitor {
    pub logs: RwLock<VecDeque<ProxyRequestLog>>,
    pub stats: RwLock<ProxyStats>,
    pub max_logs: usize,
    pub enabled: AtomicBool,
    app_handle: Option<tauri::AppHandle>,
}

impl ProxyMonitor {
    pub fn new(max_logs: usize, app_handle: Option<tauri::AppHandle>) -> Self {
        // Initialize DB
        if let Err(e) = crate::modules::proxy_db::init_db() {
            tracing::error!("Failed to initialize proxy DB: {}", e);
        }

        // Auto cleanup old logs (keep last 30 days)
        tokio::spawn(async {
            match crate::modules::proxy_db::cleanup_old_logs(30) {
                Ok(deleted) => {
                    if deleted > 0 {
                        tracing::info!("Auto cleanup: removed {} old logs (>30 days)", deleted);
                    }
                }
                Err(e) => {
                    tracing::error!("Failed to cleanup old logs: {}", e);
                }
            }
        });

        Self {
            logs: RwLock::new(VecDeque::with_capacity(max_logs)),
            stats: RwLock::new(ProxyStats::default()),
            max_logs,
<<<<<<< HEAD
            enabled: AtomicBool::new(false), // Default to disabled
=======
            enabled: AtomicBool::new(true), // Default to enabled
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
            app_handle,
        }
    }

    pub fn set_enabled(&self, enabled: bool) {
        self.enabled.store(enabled, Ordering::Relaxed);
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled.load(Ordering::Relaxed)
    }

    pub async fn log_request(&self, log: ProxyRequestLog) {
        if let (Some(account), Some(input), Some(output)) = (
            &log.account_email,
            log.input_tokens,
            log.output_tokens,
        ) {
<<<<<<< HEAD
            let model = log.model.clone().unwrap_or_else(|| "unknown".to_string());
            let account = account.clone();
            tokio::spawn(async move {
=======
            // 优先使用映射后的物理模型名进行 Token 统计，以确保前端能正确按模型厂商(Gemini/Claude)分类
            let model = log.mapped_model.as_ref()
                .or(log.model.as_ref())
                .cloned()
                .unwrap_or_else(|| "unknown".to_string());
                
            let account = account.clone();
            // Use spawn_blocking for synchronous DB operations to avoid blocking the async executor
            tokio::task::spawn_blocking(move || {
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
                if let Err(e) = crate::modules::token_stats::record_usage(&account, &model, input, output) {
                    tracing::debug!("Failed to record token stats: {}", e);
                }
            });
        }

        if !self.is_enabled() {
<<<<<<< HEAD
            return;
        }
        tracing::info!("[Monitor] Logging request: {} {}", log.method, log.url);
=======
            tracing::debug!("[Monitor] Logging disabled, skipping log for {}", log.url);
            return;
        }
        tracing::info!("[Monitor] Logging request: {} {} (Protocol: {:?})", log.method, log.url, log.protocol);
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        // Update stats
        {
            let mut stats = self.stats.write().await;
            stats.total_requests += 1;
            if log.status >= 200 && log.status < 400 {
                stats.success_count += 1;
            } else {
                stats.error_count += 1;
            }
        }

        // Add log to memory
        {
            let mut logs = self.logs.write().await;
            if logs.len() >= self.max_logs {
                logs.pop_back();
            }
            logs.push_front(log.clone());
        }

        // Save to DB
<<<<<<< HEAD
        let log_to_save = log.clone();
        tokio::spawn(async move {
            if let Err(e) = crate::modules::proxy_db::save_log(&log_to_save) {
                tracing::error!("Failed to save proxy log to DB: {}", e);
            }

            // Sync to Security DB (IpAccessLogs) so it appears in Security Monitor
            if let Some(ip) = &log_to_save.client_ip {
                let security_log = crate::modules::security_db::IpAccessLog {
                    id: uuid::Uuid::new_v4().to_string(),
                    client_ip: ip.clone(),
                    timestamp: log_to_save.timestamp / 1000, // ms to s
                    method: Some(log_to_save.method.clone()),
                    path: Some(log_to_save.url.clone()),
                    user_agent: None, // We don't have UA in ProxyRequestLog easily accessible here without plumbing
                    status: Some(log_to_save.status as i32),
                    duration: Some(log_to_save.duration as i64),
                    api_key_hash: None,
                    blocked: false, // This comes from monitor, so it wasn't blocked by IP filter
                    block_reason: None,
                };

                if let Err(e) = crate::modules::security_db::save_ip_access_log(&security_log) {
                     tracing::error!("Failed to save security log: {}", e);
                }
            }

            // Record token stats if available
            if let (Some(account), Some(input), Some(output)) = (
                &log_to_save.account_email,
                log_to_save.input_tokens,
                log_to_save.output_tokens,
            ) {
                let model = log_to_save.model.clone().unwrap_or_else(|| "unknown".to_string());
                if let Err(e) = crate::modules::token_stats::record_usage(account, &model, input, output) {
                    tracing::debug!("Failed to record token stats: {}", e);
                }
=======
        // Save to DB and update stats in a blocking task
        let log_to_save = log.clone();
        tokio::task::spawn_blocking(move || {
            match crate::modules::proxy_db::save_log(&log_to_save) {
                Ok(_) => tracing::debug!("[Monitor] Request log saved to database"),
                Err(e) => tracing::error!("Failed to save proxy log to DB: {}", e),
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
            }
        });

        // Emit event (send summary only, without body to reduce memory)
<<<<<<< HEAD
        if let Some(app) = &self.app_handle {
=======
        // Emit event (send summary only, without body to reduce memory)
        /* [OPTIMIZE] IPC Flooding Prevention
           We have switched to polling on the frontend (ProxyMonitor.tsx) to avoid UI freezing
           during high-traffic periods. Therefore, we no longer need to emit events for every request.
           This saves significant CPU and IPC bandwidth.
        
        if let Some(app) = &self.app_handle {
            // Debug Log: Trace event emission
            tracing::debug!("[Monitor] Emitting proxy://request event for {}", log.id);
            
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
            let log_summary = ProxyRequestLog {
                id: log.id.clone(),
                timestamp: log.timestamp,
                method: log.method.clone(),
                url: log.url.clone(),
                status: log.status,
                duration: log.duration,
                model: log.model.clone(),
                mapped_model: log.mapped_model.clone(),
                account_email: log.account_email.clone(),
<<<<<<< HEAD
                client_ip: log.client_ip.clone(),
=======
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
                error: log.error.clone(),
                request_body: None,  // Don't send body in event
                response_body: None, // Don't send body in event
                input_tokens: log.input_tokens,
                output_tokens: log.output_tokens,
                protocol: log.protocol.clone(),
<<<<<<< HEAD
            };
            let _ = app.emit("proxy://request", &log_summary);
        }
=======
                client: log.client.clone(),
                account_name: log.account_name.clone(),
            };
            
            // 1. Original Broadcast
            if let Err(e) = app.emit("proxy://request", &log_summary) {
                 tracing::error!("[Monitor] Failed to emit event (broadcast): {}", e);
            }

            // 2. Simplified Event Name Broadcast (fallback for special char issues)
            let _ = app.emit("proxy-request", &log_summary);

            // 3. Direct Target to 'main' window (fallback for broadcast issues)
            // Use tauri::Manager trait to get window
            use tauri::Manager;
            if let Some(window) = app.get_webview_window("main") {
                if let Err(e) = window.emit("proxy://request", &log_summary) {
                     tracing::warn!("[Monitor] Failed to emit to main window: {}", e);
                }
                // Also emit simplified name to main window
                let _ = window.emit("proxy-request", &log_summary);
            }
        }
        */
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    }

    pub async fn get_logs(&self, limit: usize) -> Vec<ProxyRequestLog> {
        // Try to get from DB first for true history
<<<<<<< HEAD
        let db_result = tokio::task::spawn_blocking(move || {
            crate::modules::proxy_db::get_logs(limit)
        }).await;

        match db_result {
            Ok(Ok(logs)) => logs,
            Ok(Err(e)) => {
=======
        match crate::modules::proxy_db::get_logs(limit) {
            Ok(logs) => logs,
            Err(e) => {
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
                tracing::error!("Failed to get logs from DB: {}", e);
                // Fallback to memory
                let logs = self.logs.read().await;
                logs.iter().take(limit).cloned().collect()
            }
<<<<<<< HEAD
            Err(e) => {
                tracing::error!("Spawn blocking failed for get_logs: {}", e);
                let logs = self.logs.read().await;
                logs.iter().take(limit).cloned().collect()
            }
=======
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        }
    }

    pub async fn get_stats(&self) -> ProxyStats {
<<<<<<< HEAD
        let db_result = tokio::task::spawn_blocking(|| {
            crate::modules::proxy_db::get_stats()
        }).await;

        match db_result {
            Ok(Ok(stats)) => stats,
            Ok(Err(e)) => {
                tracing::error!("Failed to get stats from DB: {}", e);
                self.stats.read().await.clone()
            }
            Err(e) => {
                tracing::error!("Spawn blocking failed for get_stats: {}", e);
                self.stats.read().await.clone()
            }
        }
    }
    
    pub async fn get_logs_filtered(
        &self,
        page: usize,
        page_size: usize,
        search_text: Option<String>,
        level: Option<String>,
    ) -> Result<Vec<ProxyRequestLog>, String> {
        let offset = (page.max(1) - 1) * page_size;
        let errors_only = level.as_deref() == Some("error");
        let search = search_text.unwrap_or_default();

        let res = tokio::task::spawn_blocking(move || {
            crate::modules::proxy_db::get_logs_filtered(&search, errors_only, page_size, offset)
        }).await;

        match res {
            Ok(r) => r,
            Err(e) => Err(format!("Spawn blocking failed: {}", e)),
=======
        match crate::modules::proxy_db::get_stats() {
            Ok(stats) => stats,
            Err(e) => {
                tracing::error!("Failed to get stats from DB: {}", e);
                self.stats.read().await.clone()
            }
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        }
    }
    
    pub async fn clear(&self) {
        let mut logs = self.logs.write().await;
        logs.clear();
        let mut stats = self.stats.write().await;
        *stats = ProxyStats::default();

<<<<<<< HEAD
        let _ = tokio::task::spawn_blocking(|| {
            if let Err(e) = crate::modules::proxy_db::clear_logs() {
                tracing::error!("Failed to clear logs in DB: {}", e);
            }
        }).await;
=======
        if let Err(e) = crate::modules::proxy_db::clear_logs() {
            tracing::error!("Failed to clear logs in DB: {}", e);
        }
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    }
}