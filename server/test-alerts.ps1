# PowerShell Script - Prueba del sistema de alertas

Write-Host "🧪 Probando Sistema de Alertas de Inventario" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1️⃣ Verificando estado del servidor..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3004/api/health" -Method GET | ConvertTo-Json -Depth 10
Write-Host ""

# 2. Ver configuración actual
Write-Host "2️⃣ Configuración actual de alertas..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3004/api/alert-config" -Method GET | ConvertTo-Json -Depth 10
Write-Host ""

# 3. Actualizar configuración (ejemplo)
Write-Host "3️⃣ Actualizando configuración de prueba..." -ForegroundColor Yellow
$body = @{
    alertEmail = "vanegaschristopher1@gmail.com"
    thresholdPercentage = 30
    checkIntervalHours = 24
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3004/api/alert-config" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 10
Write-Host ""

# 4. Verificar inventario ahora
Write-Host "4️⃣ Ejecutando verificación de inventario..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3004/api/check-inventory" -Method POST | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "✅ Pruebas completadas!" -ForegroundColor Green
Write-Host "📧 Si hay alertas, se habrá enviado un correo" -ForegroundColor Green
Write-Host "🔍 Revisa la consola del servidor para ver los detalles" -ForegroundColor Green
