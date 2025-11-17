# 🍽️ Sistema de Mesas con Múltiples Cuentas

## 📋 Descripción

Sistema completo para gestionar mesas de restaurante con soporte para **múltiples cuentas por mesa**. Permite a los meseros manejar grupos de clientes que comparten mesa pero tienen cuentas separadas.

## ✨ Características Implementadas

### 1. **Gestión Visual de Mesas**
- ✅ Visualización por zonas (A, B, C, D, E)
- ✅ Estados visuales: Disponible, Ocupada, Reservada
- ✅ Indicador de número de cuentas activas
- ✅ Selección interactiva de mesas

### 2. **Sistema de Múltiples Cuentas**
- ✅ Crear múltiples cuentas en una misma mesa
- ✅ Ver lista de todas las cuentas de una mesa
- ✅ Seleccionar cuenta específica para tomar pedido
- ✅ Información individual por cuenta:
  - Nombre del cliente
  - Hora de apertura
  - Última modificación
  - Total acumulado

### 3. **Flujo de Trabajo**
1. **Seleccionar Mesa** → Ver estado y cuentas existentes
2. **Crear Nueva Cuenta** → Ingresar nombre de cliente
3. **Tomar Pedido** → Agregar productos a la cuenta seleccionada
4. **Finalizar Pedido** → Generar factura y cerrar cuenta
5. **Cerrar Mesa** → Cerrar todas las cuentas activas

### 4. **Interfaz Mejorada**
- ✅ Panel lateral dinámico que se adapta según:
  - Mesa sin clientes → Formulario de nueva cuenta
  - Mesa con 1 cuenta → Detalles directos
  - Mesa con múltiples cuentas → Lista de cuentas
- ✅ Estilos responsive y modernos
- ✅ Iconos SVG para mejor UX
- ✅ Feedback visual en hover y selección

## 🗂️ Estructura de Archivos

```
src/
├── types/
│   └── mesa.ts                    # Interfaces TypeScript
├── client-js/
│   ├── mesas.ts                   # Lógica principal de mesas
│   └── realizar-pedido.ts         # Lógica de pedidos (actualizada)
├── pages/
│   └── realizar-pedido/
│       ├── mesas.astro            # Vista de mesas
│       └── pedido.astro           # Vista de pedido
├── components/
│   └── BillBar.astro              # Componente de cuenta (actualizado)
└── styles/
    └── style.css                  # Estilos del sistema
```

## 🎨 Estados de Mesa

### Mesa Disponible (Gris Oscuro)
```css
background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
```

### Mesa Ocupada (Marrón)
```css
background: linear-gradient(135deg, #482e21 0%, #6d4a36 100%);
```

### Mesa Reservada (Naranja)
```css
background: linear-gradient(135deg, #e67e22 0%, #f39c12 100%);
```

## 📊 Modelo de Datos

### Mesa
```typescript
interface Mesa {
  mesaId: string;          // ej: "A2", "B5"
  zona: string;            // ej: "ZONA A"
  estado: 'disponible' | 'ocupada' | 'reservada';
  cuentas: Cuenta[];
  numeroMesa: number;
}
```

### Cuenta
```typescript
interface Cuenta {
  cuentaId: number;
  mesaId: string;
  nombreCliente: string;
  horaApertura: Date | string;
  ultimaModificacion: Date | string;
  estado: 'activa' | 'cerrada';
  detalles: DetalleCuenta[];
  total: number;
  numeroCuenta?: number;   // 1, 2, 3, etc.
}
```

### DetalleCuenta
```typescript
interface DetalleCuenta {
  detalleId?: number;
  cuentaId: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
```

## 🔌 Integración con Backend

### Endpoints Necesarios (TODO)

#### Mesas
```typescript
GET    /api/tables              // Obtener todas las mesas
GET    /api/tables/:tableId     // Obtener mesa específica
PATCH  /api/tables/:tableId     // Actualizar estado de mesa
```

#### Cuentas
```typescript
GET    /api/tables/:tableId/accounts         // Listar cuentas de mesa
POST   /api/tables/:tableId/accounts         // Crear nueva cuenta
GET    /api/accounts/:accountId              // Obtener cuenta específica
PATCH  /api/accounts/:accountId              // Actualizar cuenta
DELETE /api/accounts/:accountId              // Cerrar/eliminar cuenta
POST   /api/tables/:tableId/close-all        // Cerrar todas las cuentas
```

### Implementación Actual

Actualmente el sistema usa:
- ✅ **Datos Mock** para desarrollo (generados dinámicamente)
- ✅ **sessionStorage** para persistencia temporal entre vistas
- ⏳ **TODO**: Conectar con endpoints reales del backend

Para conectar con tu backend:
1. Reemplazar función `generateMockMesas()` con fetch real
2. Descomentar llamadas API en funciones:
   - `fetchMesas()`
   - `crearNuevaCuenta()`
   - `cerrarCuentasMesa()`
3. Actualizar URLs de API en constantes

## 🚀 Cómo Usar

### Para Desarrollo (Datos Mock)
El sistema funciona completamente con datos mock. Solo navega a:
```
/realizar-pedido/mesas
```

### Para Producción (Con Backend)
1. Configurar `API_BASE_URL` en `mesas.ts`:
```typescript
const API_BASE_URL = "http://tu-backend-url/api";
```

2. Descomentar las llamadas fetch en:
- `fetchMesas()`
- `crearNuevaCuenta()`
- `cerrarCuentasMesa()`

3. Implementar endpoints en tu backend según la sección anterior

## 🎯 Casos de Uso

### Caso 1: Mesa Nueva (Sin Clientes)
1. Usuario hace clic en mesa disponible
2. Sistema muestra formulario "Nueva Cuenta"
3. Usuario ingresa nombre del cliente
4. Hace clic en "Crear Cuenta e Ir a Pedido"
5. Sistema redirige a vista de pedido

### Caso 2: Mesa con 1 Cuenta
1. Usuario hace clic en mesa ocupada
2. Sistema muestra detalles de la única cuenta
3. Botón "Ir a Pedido" disponible directamente

### Caso 3: Mesa con Múltiples Cuentas
1. Usuario hace clic en mesa ocupada
2. Sistema muestra lista de cuentas (2, 3, o más)
3. Usuario puede:
   - Seleccionar cuenta existente → Ir a pedido
   - Crear nueva cuenta → Agregar otro cliente

### Caso 4: Cerrar Mesa
1. Seleccionar mesa ocupada
2. Hacer clic en "Cerrar Cuentas"
3. Confirmar acción
4. Sistema libera la mesa

## 🎨 Personalización

### Cambiar Colores de Estados
Editar en `style.css`:
```css
.mesa-disponible { background: TU_COLOR; }
.mesa-ocupada { background: TU_COLOR; }
.mesa-reservada { background: TU_COLOR; }
```

### Cambiar Número de Mesas por Zona
Editar en `mesas.ts`:
```typescript
const MESAS_POR_ZONA = 15; // Cambiar según necesidad
```

### Agregar Más Zonas
Editar en `mesas.ts`:
```typescript
const ZONAS = ["A", "B", "C", "D", "E", "F"]; // Agregar más
```

## 📱 Responsive Design

El sistema es totalmente responsive:
- **Desktop**: Grid de 3-4 mesas por fila
- **Tablet**: Grid de 2-3 mesas por fila
- **Mobile**: Grid adaptativo con mesas más pequeñas

## 🐛 Debugging

### SessionStorage
Ver datos guardados en DevTools:
```javascript
console.log(sessionStorage.getItem("mesaSeleccionada"));
console.log(sessionStorage.getItem("cuentaSeleccionada"));
```

### Limpiar SessionStorage
```javascript
sessionStorage.clear();
```

## ⚠️ Notas Importantes

1. **Datos Mock**: El sistema genera datos aleatorios en cada carga
2. **Persistencia**: Los datos solo persisten en sessionStorage
3. **Backend**: Se debe implementar para persistencia real
4. **Sincronización**: Implementar websockets para actualizaciones en tiempo real (futuro)

## 🔜 Futuras Mejoras

- [ ] WebSockets para actualización en tiempo real
- [ ] Sistema de reservas
- [ ] Historial de cuentas cerradas
- [ ] Reportes por mesa/zona
- [ ] Transferir cuenta entre mesas
- [ ] Dividir cuenta entre personas
- [ ] Unir/dividir mesas
- [ ] Sistema de propinas por cuenta

## 📞 Soporte

Para dudas o problemas con la implementación, revisar:
1. Console del navegador (errores JavaScript)
2. Network tab (llamadas API)
3. SessionStorage (datos guardados)

---

**Desarrollado para Estación Café** ☕
