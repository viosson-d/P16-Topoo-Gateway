use crate::utils::protobuf;
use base64::{engine::general_purpose, Engine as _};
use rusqlite::Connection;
use std::path::PathBuf;

fn get_antigravity_path() -> Option<PathBuf> {
    if let Ok(config) = crate::modules::config::load_app_config() {
        if let Some(path_str) = config.antigravity_executable {
            let path = PathBuf::from(path_str);
            if path.exists() {
                return Some(path);
            }
        }
    }
    crate::modules::process::get_antigravity_executable_path()
}

/// Get Antigravity database path (cross-platform)
pub fn get_db_path() -> Result<PathBuf, String> {
<<<<<<< HEAD
=======
    // 0. PRIORITY: Check project app_data (Dev/Source mode)
    let cwd = std::env::current_dir().unwrap_or_default();
    let project_root = if cwd.ends_with("src-tauri") {
        cwd.parent().unwrap_or(&cwd).to_path_buf()
    } else {
        cwd
    };
    let local_data = project_root.join("app_data");
    let local_db = local_data.join("state.vscdb");
    
    // Only use local DB if the FILE actually exists (don't get fooled by the directory existing)
    if local_db.exists() {
         return Ok(local_db);
    }

>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    // Prefer path specified by --user-data-dir argument
    if let Some(user_data_dir) = crate::modules::process::get_user_data_dir_from_process() {
        let custom_db_path = user_data_dir.join("User").join("globalStorage").join("state.vscdb");
        if custom_db_path.exists() {
            return Ok(custom_db_path);
        }
    }

    // Check if in portable mode
    if let Some(antigravity_path) = get_antigravity_path() {
        if let Some(parent_dir) = antigravity_path.parent() {
            let portable_db_path = PathBuf::from(parent_dir)
                .join("data")
                .join("user-data")
                .join("User")
                .join("globalStorage")
                .join("state.vscdb");

            if portable_db_path.exists() {
                return Ok(portable_db_path);
            }
        }
    }

    // Standard mode: use system default path
    #[cfg(target_os = "macos")]
    {
        let home = dirs::home_dir().ok_or("Failed to get home directory")?;
        Ok(home.join("Library/Application Support/Antigravity/User/globalStorage/state.vscdb"))
    }

    #[cfg(target_os = "windows")]
    {
        let appdata =
            std::env::var("APPDATA").map_err(|_| "Failed to get APPDATA environment variable".to_string())?;
        Ok(PathBuf::from(appdata).join("Antigravity\\User\\globalStorage\\state.vscdb"))
    }

    #[cfg(target_os = "linux")]
    {
        let home = dirs::home_dir().ok_or("Failed to get home directory")?;
        Ok(home.join(".config/Antigravity/User/globalStorage/state.vscdb"))
    }
}

/// Inject Token and Email into database
pub fn inject_token(
    db_path: &PathBuf,
    access_token: &str,
    refresh_token: &str,
    expiry: i64,
    email: &str,
) -> Result<String, String> {
    // 1. Open database
    let conn = Connection::open(db_path).map_err(|e| format!("Failed to open database: {}", e))?;

<<<<<<< HEAD
    // 2. Read current data
    let current_data: String = conn
        .query_row(
            "SELECT value FROM ItemTable WHERE key = ?",
            ["jetskiStateSync.agentManagerInitState"],
            |row| row.get(0),
        )
        .map_err(|e| format!("Failed to read data: {}", e))?;

    // 3. Base64 decode
    let blob = general_purpose::STANDARD
        .decode(&current_data)
        .map_err(|e| format!("Base64 decoding failed: {}", e))?;

    // 4. Remove old Identity and Token fields
    // Field 1: UserID
    // Field 2: Email
    // Field 6: OAuthTokenInfo
    let mut clean_data = protobuf::remove_field(&blob, 1)?;
    clean_data = protobuf::remove_field(&clean_data, 2)?;
    clean_data = protobuf::remove_field(&clean_data, 6)?;

    // 5. Create new fields
    let new_email_field = protobuf::create_email_field(email);
    let new_oauth_field = protobuf::create_oauth_field(access_token, refresh_token, expiry);

    // 6. Merge data
=======
    // Enable WAL mode and set busy timeout
    if let Err(e) = conn.execute("PRAGMA journal_mode=WAL", []) {
        eprintln!("WARN: Failed to set WAL mode (continuing): {}", e);
    }
    if let Err(e) = conn.execute("PRAGMA busy_timeout=5000", []) {
        eprintln!("WARN: Failed to set busy timeout (continuing): {}", e);
    }

    // [Safety] Ensure table exists
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ItemTable (key TEXT PRIMARY KEY, value TEXT)",
        [],
    ).map_err(|e| format!("Failed to ensure ItemTable existence: {}", e))?;

    // 2. Read existing data
    let current_data_result: Result<String, _> = conn.query_row(
        "SELECT value FROM ItemTable WHERE key = ?",
        ["jetskiStateSync.agentManagerInitState"],
        |row| row.get(0),
    );

    let clean_data = match current_data_result {
        Ok(b64_str) => {
            // Decode
            let blob = general_purpose::STANDARD
                .decode(&b64_str)
                .map_err(|e| format!("Base64 decoding failed: {}", e))?;
            
            // 3. Remove old Identity and Token fields
            // Field 1: UserID
            // Field 2: Email
            // Field 6: OAuthTokenInfo
            let mut data = protobuf::remove_field(&blob, 1)?;
            data = protobuf::remove_field(&data, 2)?;
            protobuf::remove_field(&data, 6)?
        },
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            // Key missing: Start with empty buffer
            Vec::new()
        },
        Err(e) => return Err(format!("Failed to read ItemTable: {}", e)),
    };

    // 4. Create new fields
    let new_email_field = protobuf::create_email_field(email);
    let new_oauth_field = protobuf::create_oauth_field(access_token, refresh_token, expiry);

    // 5. Merge data
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    // We intentionally do NOT re-inject Field 1 (UserID) to force the client 
    // to re-authenticate the session with the new token.
    let final_data = [clean_data, new_email_field, new_oauth_field].concat();
    let final_b64 = general_purpose::STANDARD.encode(&final_data);

<<<<<<< HEAD
    // 7. Write to database
    conn.execute(
        "UPDATE ItemTable SET value = ? WHERE key = ?",
        [&final_b64, "jetskiStateSync.agentManagerInitState"],
    )
    .map_err(|e| format!("Failed to write data: {}", e))?;

    // 8. Inject Onboarding flag
=======
    // 6. Write to database (Upsert)
    conn.execute(
        "INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)",
        ["jetskiStateSync.agentManagerInitState", &final_b64],
    )
    .map_err(|e| format!("Failed to write data: {}", e))?;

    // 7. Inject Onboarding flag
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    let onboarding_key = "antigravityOnboarding";
    conn.execute(
        "INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)",
        [onboarding_key, "true"],
    )
    .map_err(|e| format!("Failed to write Onboarding flag: {}", e))?;

    Ok(format!("Token and Identity injection successful!\nDatabase: {:?}", db_path))
}
