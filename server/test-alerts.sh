#!/bin/bash
# Script de prueba del sistema de alertas

echo "🧪 Probando Sistema de Alertas de Inventario"
echo "============================================"
echo ""

# 1. Health Check
echo "1️⃣ Verificando estado del servidor..."
curl -s http://localhost:3004/api/health | jq .
echo ""

# 2. Ver configuración actual
echo "2️⃣ Configuración actual de alertas..."
curl -s http://localhost:3004/api/alert-config | jq .
echo ""

# 3. Actualizar configuración (ejemplo)
echo "3️⃣ Actualizando configuración de prueba..."
curl -s -X POST http://localhost:3004/api/alert-config \
  -H "Content-Type: application/json" \
  -d '{
    "alertEmail": "vanegaschristopher1@gmail.com",
    "thresholdPercentage": 30,
    "checkIntervalHours": 24
  }' | jq .
echo ""

# 4. Verificar inventario ahora
echo "4️⃣ Ejecutando verificación de inventario..."
curl -s -X POST http://localhost:3004/api/check-inventory | jq .
echo ""

echo "✅ Pruebas completadas!"
echo "📧 Si hay alertas, se habrá enviado un correo"
echo "🔍 Revisa la consola del servidor para ver los detalles"
