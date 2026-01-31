use crate::modules::config::load_app_config;
use once_cell::sync::Lazy;
use reqwest::{Client, Proxy};
<<<<<<< HEAD

/// Global shared HTTP client (15s timeout)
/// Client has a built-in connection pool; cloning it is light and shares the pool
pub static SHARED_CLIENT: Lazy<Client> = Lazy::new(|| create_base_client(15));

/// Global shared HTTP client (Long timeout: 60s, for warmup etc.)
pub static SHARED_CLIENT_LONG: Lazy<Client> = Lazy::new(|| create_base_client(60));

/// Base client creation logic
fn create_base_client(timeout_secs: u64) -> Client {
    let mut builder = Client::builder().timeout(std::time::Duration::from_secs(timeout_secs));
=======
use std::sync::RwLock;

/// Standard client (15s timeout) - Wrapped in RwLock for dynamic updates
pub static SHARED_CLIENT: Lazy<RwLock<Client>> = Lazy::new(|| RwLock::new(create_base_client(15)));
/// Long timeout client (60s timeout) for OAuth or big uploads - Wrapped in RwLock for dynamic updates
pub static SHARED_CLIENT_LONG: Lazy<RwLock<Client>> = Lazy::new(|| RwLock::new(create_base_client(60)));

/// Base client creation logic
fn create_base_client(timeout_secs: u64) -> Client {
    let mut builder = Client::builder()
        .timeout(std::time::Duration::from_secs(timeout_secs))
        .user_agent("AntigravityGate/1.0");
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)

    if let Ok(config) = load_app_config() {
        let proxy_config = config.proxy.upstream_proxy;
        if proxy_config.enabled && !proxy_config.url.is_empty() {
<<<<<<< HEAD
            match Proxy::all(&proxy_config.url) {
                Ok(proxy) => {
                    builder = builder.proxy(proxy);
                    tracing::info!(
                        "HTTP shared client enabled upstream proxy: {}",
                        proxy_config.url
                    );
                }
                Err(e) => {
                    tracing::error!("invalid_proxy_url: {}, error: {}", proxy_config.url, e);
                }
            }
        }
    }

    builder.build().unwrap_or_else(|_| Client::new())
}

/// Get uniformly configured HTTP client (15s timeout)
pub fn get_client() -> Client {
    SHARED_CLIENT.clone()
}

/// Get long timeout HTTP client (60s timeout)
pub fn get_long_client() -> Client {
    SHARED_CLIENT_LONG.clone()
}
=======
            let proxy_url = if !proxy_config.url.contains("://") {
                format!("http://{}", proxy_config.url)
            } else {
                proxy_config.url.clone()
            };

            match Proxy::all(&proxy_url) {
                Ok(proxy) => {
                    builder = builder.proxy(proxy); // Removed invalid .no_proxy("127.0.0.1")
                    crate::modules::logger::log_info(&format!(
                        "HTTP Shared Client initialized with proxy: {} (Timeout: {}s, bypass: 127.0.0.1)",
                        proxy_url, timeout_secs
                    ));
                }
                Err(e) => {
                    crate::modules::logger::log_error(&format!("Invalid proxy URL: {} - Error: {}", proxy_url, e));
                }
            }
        } else if timeout_secs > 30 {
            // Log direct connection only for long-lived clients to reduce noise
            crate::modules::logger::log_info(&format!("HTTP Shared Client initialized with DIRECT connection (Timeout: {}s)", timeout_secs));
        }
    }

    builder.build().unwrap_or_else(|e| {
        crate::modules::logger::log_error(&format!("FAILED to build HTTP client: {}", e));
        Client::new()
    })
}

/// Force update shared clients from current config
pub fn update_proxy_clients() {
    crate::modules::logger::log_info("Triggering reload of global HTTP clients...");
    
    // [OPTIMIZATION] Create clients OUTSIDE the lock to prevent blocking readers during file I/O or logging
    let new_client = create_base_client(15);
    let new_long_client = create_base_client(60);

    {
        let mut client = SHARED_CLIENT.write().unwrap();
        *client = new_client;
    }
    {
        let mut long_client = SHARED_CLIENT_LONG.write().unwrap();
        *long_client = new_long_client;
    }
    crate::modules::logger::log_info("Global HTTP clients successfully re-initialized with new config");
}

/// Get uniformly configured HTTP client
pub fn get_client() -> Client {
    SHARED_CLIENT.read().unwrap().clone()
}

/// Get client with long timeout
pub fn get_long_client() -> Client {
    SHARED_CLIENT_LONG.read().unwrap().clone()
}

/// Diagnostic: Check if we can reach Google via proxy
pub async fn check_connectivity() {
    let client = get_long_client();
    crate::modules::logger::log_info("[Connectivity] Checking connection to Google (via proxy if configured)...");
    match client.get("https://www.google.com").send().await {
        Ok(resp) => {
            crate::modules::logger::log_info(&format!("[Connectivity] SUCCESS: Reached Google, Status: {}", resp.status()));
        }
        Err(e) => {
            crate::modules::logger::log_error(&format!("[Connectivity] FAILED: Could not reach Google. Error: {:?}", e));
            // Improve diagnostic message
            if e.is_timeout() {
                crate::modules::logger::log_warn("Tip: Connection timed out. Please verify your upstream proxy settings.");
            } else if e.is_connect() {
                 crate::modules::logger::log_warn("Tip: Connection refused. Please check if your proxy server is running.");
            } else {
                crate::modules::logger::log_warn("Tip: If error is -9808 (bad certificate format), please check your proxy settings or try rustls build.");
            }
        }
    }
}

>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
