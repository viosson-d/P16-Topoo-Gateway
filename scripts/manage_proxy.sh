#!/bin/bash

# Topoo Gateway - macOS System Proxy Manager
# 作用: 自动设置系统代理到 127.0.0.1:8046

PORT=8046
HOST="127.0.0.1"

# 获取活跃的网络服务名称 (通常是 Wi-Fi)
get_active_service() {
    services=$(networksetup -listallnetworkservices | grep -v "\*")
    for service in $services; do
        if [[ $(networksetup -getnetworkserviceorder "$service") == *"Device: en"* ]]; then
            echo "$service"
            return
        fi
    done
    echo "Wi-Fi" # 默认回退
}

SERVICE=$(get_active_service)

case "$1" in
    on)
        echo "正在开启系统代理 ($SERVICE) -> $HOST:$PORT ..."
        networksetup -setwebproxy "$SERVICE" "$HOST" "$PORT"
        networksetup -setsecurewebproxy "$SERVICE" "$HOST" "$PORT"
        echo "完成。Antigravity 和其他应用现在应该经由 Topoo Gateway 转发。"
        ;;
    off)
        echo "正在关闭系统代理 ($SERVICE) ..."
        networksetup -setwebproxystate "$SERVICE" off
        networksetup -setsecurewebproxystate "$SERVICE" off
        echo "完成。系统网络已恢复直连。"
        ;;
    status)
        echo "当前代理状态 ($SERVICE):"
        networksetup -getwebproxy "$SERVICE"
        networksetup -getsecurewebproxy "$SERVICE"
        ;;
    *)
        echo "用法: $0 {on|off|status}"
        exit 1
esac
