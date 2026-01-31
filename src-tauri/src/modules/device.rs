use crate::models::DeviceProfile;
use crate::modules::{logger, process};
use chrono::Local;
use rand::{distributions::Alphanumeric, Rng};
use rusqlite::Connection;
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;

const DATA_DIR: &str = ".antigravity_tools";
const GLOBAL_BASELINE: &str = "device_original.json";

fn get_data_dir() -> Result<PathBuf, String> {
<<<<<<< HEAD
    let home = dirs::home_dir().ok_or("failed_to_get_home_dir")?;
    let data_dir = home.join(DATA_DIR);
    if !data_dir.exists() {
        fs::create_dir_all(&data_dir).map_err(|e| format!("failed_to_create_data_dir: {}", e))?;
=======
    let data_dir = if let Some(dir) = dirs::data_dir() {
        dir.join("Antigravity")
    } else {
        // Fallback to home if data_dir fails (unlikely)
        dirs::home_dir()
            .ok_or("failed_to_get_home_dir")?
            .join(DATA_DIR)
    };

    if !data_dir.exists() {
        fs::create_dir_all(&data_dir).map_err(|e| format!("failed_to_create_data_dir: {:?} {}", data_dir, e))?;
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    }
    Ok(data_dir)
}

/// Find storage.json path (prefer custom/portable paths)
pub fn get_storage_path() -> Result<PathBuf, String> {
<<<<<<< HEAD
=======
    // 0. PRIORITY: Check project app_data (Dev/Source mode) - Matches account.rs logic
    let cwd = std::env::current_dir().unwrap_or_default();
    crate::modules::logger::log_info(&format!("DEBUG_PATH: CWD is {:?}", cwd));
    
    let project_root = if cwd.ends_with("src-tauri") {
        cwd.parent().unwrap_or(&cwd).to_path_buf()
    } else {
        cwd
    };
    let local_data = project_root.join("app_data");
    crate::modules::logger::log_info(&format!("DEBUG_PATH: Checking local_data at {:?}", local_data));
    
    if local_data.exists() {
         crate::modules::logger::log_info("DEBUG_PATH: Using local app_data");
         return Ok(local_data.join("storage.json"));
    }

>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    // 1) --user-data-dir flag
    if let Some(user_data_dir) = process::get_user_data_dir_from_process() {
        let path = user_data_dir
            .join("User")
            .join("globalStorage")
            .join("storage.json");
<<<<<<< HEAD
        if path.exists() {
=======
        // Always allow if dir exists, even if file doesn't
        if user_data_dir.exists() {
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
            return Ok(path);
        }
    }

    // 2) Portable mode (based on executable data/user-data)
    if let Some(exe_path) = process::get_antigravity_executable_path() {
        if let Some(parent) = exe_path.parent() {
            let portable = parent
                .join("data")
                .join("user-data")
                .join("User")
                .join("globalStorage")
                .join("storage.json");
            if portable.exists() {
                return Ok(portable);
            }
        }
    }

    // 3) Standard installation location
    #[cfg(target_os = "macos")]
    {
        let home = dirs::home_dir().ok_or("failed_to_get_home_dir")?;
        let path =
            home.join("Library/Application Support/Antigravity/User/globalStorage/storage.json");
        if path.exists() {
            return Ok(path);
        }
    }

    #[cfg(target_os = "windows")]
    {
        let appdata =
            std::env::var("APPDATA").map_err(|_| "failed_to_get_appdata_env".to_string())?;
        let path = PathBuf::from(appdata).join("Antigravity\\User\\globalStorage\\storage.json");
        if path.exists() {
            return Ok(path);
        }
    }

    #[cfg(target_os = "linux")]
    {
        let home = dirs::home_dir().ok_or("failed_to_get_home_dir")?;
        let path = home.join(".config/Antigravity/User/globalStorage/storage.json");
        if path.exists() {
            return Ok(path);
        }
    }

<<<<<<< HEAD
    Err("storage_json_not_found".to_string())
}

=======
    // Default fallback (create path even if not exists)
    // This allows initialization logic to work when storage.json is missing
    #[cfg(target_os = "macos")]
    {
        let home = dirs::home_dir().ok_or("failed_to_get_home_dir")?;
        Ok(home.join("Library/Application Support/Antigravity/User/globalStorage/storage.json"))
    }
    #[cfg(target_os = "windows")]
    {
        let appdata = std::env::var("APPDATA").map_err(|_| "failed_to_get_appdata_env".to_string())?;
        Ok(PathBuf::from(appdata).join("Antigravity\\User\\globalStorage\\storage.json"))
    }
    #[cfg(target_os = "linux")]
    {
        let home = dirs::home_dir().ok_or("failed_to_get_home_dir")?;
        Ok(home.join(".config/Antigravity/User/globalStorage/storage.json"))
    }
}
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
/// Get directory of storage.json
pub fn get_storage_dir() -> Result<PathBuf, String> {
    let path = get_storage_path()?;
    path.parent()
        .map(|p| p.to_path_buf())
        .ok_or_else(|| "failed_to_get_storage_parent_dir".to_string())
}

/// Get state.vscdb path (same directory as storage.json)
pub fn get_state_db_path() -> Result<PathBuf, String> {
    let dir = get_storage_dir()?;
    Ok(dir.join("state.vscdb"))
}

/// Backup storage.json, returns backup file path
#[allow(dead_code)]
pub fn backup_storage(storage_path: &Path) -> Result<PathBuf, String> {
    if !storage_path.exists() {
        return Err(format!("storage_json_missing: {:?}", storage_path));
    }
    let dir = storage_path
        .parent()
        .ok_or_else(|| "failed_to_get_storage_parent_dir".to_string())?;
    let backup_path = dir.join(format!(
        "storage.json.backup_{}",
        Local::now().format("%Y%m%d_%H%M%S")
    ));
    fs::copy(storage_path, &backup_path).map_err(|e| format!("backup_failed: {}", e))?;
    Ok(backup_path)
}

/// Read current device profile from storage.json
#[allow(dead_code)]
pub fn read_profile(storage_path: &Path) -> Result<DeviceProfile, String> {
    let content =
        fs::read_to_string(storage_path).map_err(|e| format!("read_failed ({:?}): {}", storage_path, e))?;
    let json: Value =
        serde_json::from_str(&content).map_err(|e| format!("parse_failed ({:?}): {}", storage_path, e))?;

    // Supports nested telemetry or flat telemetry.xxx
    let get_field = |key: &str| -> Option<String> {
        if let Some(obj) = json.get("telemetry").and_then(|v| v.as_object()) {
            if let Some(v) = obj.get(key).and_then(|v| v.as_str()) {
                return Some(v.to_string());
            }
        }
        if let Some(v) = json
            .get(format!("telemetry.{key}"))
            .and_then(|v| v.as_str())
        {
            return Some(v.to_string());
        }
        None
    };

    Ok(DeviceProfile {
        machine_id: get_field("machineId").ok_or("missing_machine_id")?,
        mac_machine_id: get_field("macMachineId").ok_or("missing_mac_machine_id")?,
        dev_device_id: get_field("devDeviceId").ok_or("missing_dev_device_id")?,
        sqm_id: get_field("sqmId").ok_or("missing_sqm_id")?,
<<<<<<< HEAD
=======
        service_machine_id: json
            .get("storage.serviceMachineId")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string()),
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    })
}

/// Write device profile to storage.json
pub fn write_profile(storage_path: &Path, profile: &DeviceProfile) -> Result<(), String> {
<<<<<<< HEAD
    if !storage_path.exists() {
        return Err(format!("storage_json_missing: {:?}", storage_path));
    }

    let content =
        fs::read_to_string(storage_path).map_err(|e| format!("read_failed: {}", e))?;
    let mut json: Value =
        serde_json::from_str(&content).map_err(|e| format!("parse_failed: {}", e))?;
=======
    // 1. Create parent directory if missing
    if let Some(parent) = storage_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| format!("failed_to_create_storage_dir: {}", e))?;
        }
    }

    // 2. Load existing or create new JSON
    let mut json: Value = if storage_path.exists() {
        let content = fs::read_to_string(storage_path).map_err(|e| format!("read_failed: {}", e))?;
        serde_json::from_str(&content).map_err(|e| format!("parse_failed: {}", e))?
    } else {
        serde_json::json!({})
    };
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)

    // Ensure telemetry is an object
    if !json.get("telemetry").map_or(false, |v| v.is_object()) {
        if json.as_object_mut().is_some() {
            json["telemetry"] = serde_json::json!({});
        } else {
            return Err("json_top_level_not_object".to_string());
        }
    }

    if let Some(telemetry) = json.get_mut("telemetry").and_then(|v| v.as_object_mut()) {
        telemetry.insert(
            "machineId".to_string(),
            Value::String(profile.machine_id.clone()),
        );
        telemetry.insert(
            "macMachineId".to_string(),
            Value::String(profile.mac_machine_id.clone()),
        );
        telemetry.insert(
            "devDeviceId".to_string(),
            Value::String(profile.dev_device_id.clone()),
        );
        telemetry.insert("sqmId".to_string(), Value::String(profile.sqm_id.clone()));
    } else {
        return Err("telemetry_not_object".to_string());
    }

    // Write flat keys as well, compatible with old formats
    if let Some(map) = json.as_object_mut() {
        map.insert(
            "telemetry.machineId".to_string(),
            Value::String(profile.machine_id.clone()),
        );
        map.insert(
            "telemetry.macMachineId".to_string(),
            Value::String(profile.mac_machine_id.clone()),
        );
        map.insert(
            "telemetry.devDeviceId".to_string(),
            Value::String(profile.dev_device_id.clone()),
        );
        map.insert(
            "telemetry.sqmId".to_string(),
            Value::String(profile.sqm_id.clone()),
        );
<<<<<<< HEAD
=======

        if let Some(sid) = &profile.service_machine_id {
            map.insert(
                "storage.serviceMachineId".to_string(),
                Value::String(sid.clone()),
            );
        }
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    }

    // Sync storage.serviceMachineId (match with devDeviceId), place at root level
    if let Some(map) = json.as_object_mut() {
        map.insert(
            "storage.serviceMachineId".to_string(),
            Value::String(profile.dev_device_id.clone()),
        );
    }

    let updated = serde_json::to_string_pretty(&json)
        .map_err(|e| format!("serialize_failed: {}", e))?;
    fs::write(storage_path, updated).map_err(|e| format!("write_failed ({:?}): {}", storage_path, e))?;
    logger::log_info(&format!("device_profile_written to {:?}", storage_path));

    // Sync ItemTable.storage.serviceMachineId in state.vscdb
    let _ = sync_state_service_machine_id_value(&profile.dev_device_id);
    Ok(())
}

/// Only sync serviceMachineId, don't change other fields
#[allow(dead_code)]
pub fn sync_service_machine_id(storage_path: &Path, service_id: &str) -> Result<(), String> {
    let content =
        fs::read_to_string(storage_path).map_err(|e| format!("read_failed: {}", e))?;
    let mut json: Value =
        serde_json::from_str(&content).map_err(|e| format!("parse_failed: {}", e))?;

    if let Some(map) = json.as_object_mut() {
        map.insert(
            "storage.serviceMachineId".to_string(),
            Value::String(service_id.to_string()),
        );
    }

    let updated = serde_json::to_string_pretty(&json)
        .map_err(|e| format!("serialize_failed: {}", e))?;
    fs::write(storage_path, updated).map_err(|e| format!("write_failed: {}", e))?;
    logger::log_info("service_machine_id_synced");

    let _ = sync_state_service_machine_id_value(service_id);
    Ok(())
}

/// Read serviceMachineId from storage.json (fallback to devDeviceId), sync back if missing and sync state.vscdb
#[allow(dead_code)]
pub fn sync_service_machine_id_from_storage(storage_path: &Path) -> Result<(), String> {
    if !storage_path.exists() {
        return Err("storage_json_missing".to_string());
    }
    let content = fs::read_to_string(storage_path).map_err(|e| format!("read_failed: {}", e))?;
    let mut json: Value = serde_json::from_str(&content).map_err(|e| format!("parse_failed: {}", e))?;

    let service_id = json
        .get("storage.serviceMachineId")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .or_else(|| {
            json.get("telemetry")
                .and_then(|t| t.get("devDeviceId"))
                .and_then(|v| v.as_str())
                .map(|s| s.to_string())
        })
        .or_else(|| {
            json.get("telemetry.devDeviceId")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string())
        })
        .ok_or("missing_ids_in_storage")?;

    let mut dirty = false;
    if json
        .get("storage.serviceMachineId")
        .and_then(|v| v.as_str())
        .is_none()
    {
        if let Some(map) = json.as_object_mut() {
            map.insert("storage.serviceMachineId".to_string(), Value::String(service_id.clone()));
            dirty = true;
        }
    }

    if dirty {
        let updated = serde_json::to_string_pretty(&json).map_err(|e| format!("serialize_failed: {}", e))?;
        fs::write(storage_path, updated).map_err(|e| format!("write_failed: {}", e))?;
        logger::log_info("service_machine_id_added");
    }

    sync_state_service_machine_id_value(&service_id)
}

fn sync_state_service_machine_id_value(service_id: &str) -> Result<(), String> {
    let db_path = get_state_db_path()?;
    if !db_path.exists() {
        logger::log_warn(&format!(
            "state_db_missing: {:?}",
            db_path
        ));
        return Ok(());
    }

    let conn = Connection::open(&db_path).map_err(|e| format!("db_open_failed: {}", e))?;
<<<<<<< HEAD
=======
    // Set busy timeout and WAL mode for reliability
    let _ = conn.execute("PRAGMA journal_mode=WAL", []);
    let _ = conn.execute("PRAGMA busy_timeout=5000", []);


>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ItemTable (key TEXT PRIMARY KEY, value TEXT);",
        [],
    )
    .map_err(|e| format!("failed_to_create_item_table: {}", e))?;
    conn.execute(
        "INSERT OR REPLACE INTO ItemTable (key, value) VALUES ('storage.serviceMachineId', ?1);",
        [service_id],
    )
    .map_err(|e| format!("failed_to_write_to_db: {}", e))?;
    logger::log_info("service_machine_id_synced_to_db");
<<<<<<< HEAD
=======
    logger::log_info("service_machine_id_synced_to_db");
    Ok(())
}

/// Clear auth tokens from state.vscdb to force IDE session refresh
pub fn clear_auth_state() -> Result<(), String> {
    let db_path = get_state_db_path()?;
    if !db_path.exists() {
        return Ok(());
    }

    let conn = Connection::open(&db_path).map_err(|e| format!("db_open_failed: {}", e))?;
    // Set busy timeout
    let _ = conn.execute("PRAGMA busy_timeout=5000", []);

    // Delete keys related to authentication to force re-login/re-identification
    let count = conn.execute(
        "DELETE FROM ItemTable WHERE key LIKE '%auth%' OR key LIKE '%token%'",
        [],
    ).map_err(|e| format!("delete_failed: {}", e))?;

    logger::log_info(&format!("cleared_auth_state: {} keys removed", count));
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    Ok(())
}

/// Load/Save global original profile (shared across all accounts)
pub fn load_global_original() -> Option<DeviceProfile> {
    if let Ok(dir) = get_data_dir() {
        let path = dir.join(GLOBAL_BASELINE);
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(profile) = serde_json::from_str::<DeviceProfile>(&content) {
                    return Some(profile);
                }
            }
        }
    }
    None
}

pub fn save_global_original(profile: &DeviceProfile) -> Result<(), String> {
    let dir = get_data_dir()?;
    let path = dir.join(GLOBAL_BASELINE);
    if path.exists() {
        return Ok(()); // already exists, don't overwrite
    }
    let content =
        serde_json::to_string_pretty(profile).map_err(|e| format!("serialize_failed: {}", e))?;
    fs::write(&path, content).map_err(|e| format!("write_failed: {}", e))
}

/// List storage.json backups in current directory (descending by time)
#[allow(dead_code)]
pub fn list_backups(storage_path: &Path) -> Result<Vec<PathBuf>, String> {
    let dir = storage_path
        .parent()
        .ok_or_else(|| "failed_to_get_storage_parent_dir".to_string())?;
    let mut backups = Vec::new();
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                if name.starts_with("storage.json.backup_") {
                    backups.push(path);
                }
            }
        }
    }
    // Sort by modification time (new to old)
    backups.sort_by(|a, b| {
        let ma = fs::metadata(a).and_then(|m| m.modified()).ok();
        let mb = fs::metadata(b).and_then(|m| m.modified()).ok();
        mb.cmp(&ma)
    });
    Ok(backups)
}

/// Restore backup to storage.json. If use_oldest=true, use oldest backup, else use latest.
#[allow(dead_code)]
pub fn restore_backup(storage_path: &Path, use_oldest: bool) -> Result<PathBuf, String> {
    let backups = list_backups(storage_path)?;
    if backups.is_empty() {
        return Err("no_backups_found".to_string());
    }
    let target = if use_oldest {
<<<<<<< HEAD
        backups.last().unwrap().clone()
    } else {
        backups.first().unwrap().clone()
=======
        backups.last().ok_or("No backups available")?.clone()
    } else {
        backups.first().ok_or("No backups available")?.clone()
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    };
    // backup current first
    let _ = backup_storage(storage_path)?;
    fs::copy(&target, storage_path).map_err(|e| format!("restore_failed: {}", e))?;
    logger::log_info(&format!("storage_json_restored: {:?}", target));
    Ok(target)
}

/// Generate a new set of device fingerprints (Cursor/VSCode style)
pub fn generate_profile() -> DeviceProfile {
    DeviceProfile {
        machine_id: format!("auth0|user_{}", random_hex(32)),
        mac_machine_id: new_standard_machine_id(),
        dev_device_id: Uuid::new_v4().to_string(),
        sqm_id: format!("{{{}}}", Uuid::new_v4().to_string().to_uppercase()),
<<<<<<< HEAD
=======
        service_machine_id: Some(Uuid::new_v4().to_string()),
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    }
}

fn random_hex(length: usize) -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect::<String>()
        .to_lowercase()
}

fn new_standard_machine_id() -> String {
    // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (y in 8..b)
    let mut rng = rand::thread_rng();
    let mut id = String::with_capacity(36);
    for ch in "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".chars() {
        if ch == '-' || ch == '4' {
            id.push(ch);
        } else if ch == 'x' {
            id.push_str(&format!("{:x}", rng.gen_range(0..16)));
        } else if ch == 'y' {
            id.push_str(&format!("{:x}", rng.gen_range(8..12)));
        }
<<<<<<< HEAD
    }
    id
}
=======

    }
    id
}


>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
