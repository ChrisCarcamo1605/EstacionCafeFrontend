# 🏗️ Arquitectura: Orquesta de Mesas y Pedidos

## 📋 Índice
1. [Visión General](#visión-general)
2. [Flujo de Datos](#flujo-de-datos)
3. [Componentes Principales](#componentes-principales)
4. [Flujo de Usuario](#flujo-de-usuario)
5. [Comunicación con Backend](#comunicación-con-backend)
6. [Gestión de Estado](#gestión-de-estado)

---

## 🎯 Visión General

El sistema de mesas y pedidos está diseñado con una arquitectura clara que separa responsabilidades en tres capas principales:

```
┌─────────────────────────────────────────┐
│         VISTA (Pages/Astro)             │
│  - mesas.astro                          │
│  - pedido.astro                         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      MANAGERS (Lógica de Negocio)       │
│  - MesaManager                          │
│  - OrderManager                         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│        SERVICES (API/Storage)           │
│  - MesaApiService                       │
│  - BillApiService                       │
│  - StorageService                       │
└─────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

### 1. **Vista de Mesas → Selección de Mesa/Cuenta**

```typescript
[Usuario] 
   ↓ Selecciona Mesa
[MesaCard] 
   ↓ Evento click
[MesaManager.selectMesa()]
   ↓ Actualiza UI
[MesaSidebar.update()]
   ↓ Usuario selecciona cuenta o crea nueva
[handleSelectCuenta() / handleNewCuenta()]
   ↓ Guarda en sessionStorage
[StorageService.setMesa() / setCuenta()]
   ↓ Navega
[window.location.href = "/realizar-pedido/pedido"]
```

### 2. **Vista de Pedido → Gestión de Productos**

```typescript
[Usuario en vista pedido]
   ↓ Carga componente
[realizar-pedido.ts]
   ↓ Lee sessionStorage
[StorageService.getMesaSeleccionada() / getCuentaSeleccionada()]
   ↓ Inicializa managers
[OrderManager + BillBarManager + ProductsGrid]
   ↓ Carga productos desde API
[BillApiService.getProducts()]
   ↓ Usuario selecciona producto
[ProductsGrid → callback]
   ↓ Agrega al pedido
[OrderManager.addProduct()]
   ↓ Actualiza vista
[BillBarManager.render()]
```

### 3. **Finalización de Pedido → Backend**

```typescript
[Usuario click "Finalizar"]
   ↓
[OrderManager.finishOrder()]
   ↓ Calcula total
[BillFormatter.calculateTotal()]
   ↓ Actualiza estado de cuenta
[BillApiService.updateBill(billId, {status, total})]
   ↓ Crea detalles del pedido
[BillApiService.createBillDetails(billId, details)]
   ↓ Limpia sesión
[StorageService.clearSession()]
   ↓ Redirige a mesas
[window.location.href = "/realizar-pedido/mesas"]
```

---

## 🧩 Componentes Principales

### **1. MesaManager** 
**Ubicación:** `src/managers/mesa-manager.ts`

**Responsabilidades:**
- ✅ Cargar y renderizar todas las mesas desde el backend
- ✅ Gestionar la selección de mesas
- ✅ Controlar el sidebar con información de la mesa seleccionada
- ✅ Crear nuevas cuentas en una mesa
- ✅ Cargar detalles de cuentas existentes
- ✅ Cerrar todas las cuentas de una mesa
- ✅ Navegación hacia la vista de pedidos

**Métodos clave:**
```typescript
// Inicialización
async initialize(): Promise<void>

// Carga de datos
private async loadMesas(): Promise<void>

// Renderizado
renderMesas(): void
selectMesa(mesa: Mesa): void

// Gestión de cuentas
private async handleSelectCuenta(cuenta: Cuenta): Promise<void>
private async handleNewCuenta(mesa: Mesa, customer: string): Promise<void>
private async handleCloseBills(mesa: Mesa): Promise<void>

// Navegación
private goToRealizarPedido(): void
```

**Flujo interno:**
1. Constructor recibe contenedores DOM y userId
2. Inicializa el sidebar (MesaSidebar) con callbacks
3. `initialize()` carga mesas desde API
4. `renderMesas()` agrupa por zonas y crea cards
5. Al seleccionar mesa → actualiza sidebar
6. Al seleccionar/crear cuenta → guarda en storage y navega

---

### **2. OrderManager**
**Ubicación:** `src/managers/order-manager.ts`

**Responsabilidades:**
- ✅ Gestionar el carrito de productos (detalles)
- ✅ Agregar, incrementar, decrementar y eliminar productos
- ✅ Calcular totales del pedido
- ✅ Finalizar orden (enviar a backend)
- ✅ Cerrar cuenta completamente
- ✅ Guardar cambios y volver a mesas

**Métodos clave:**
```typescript
// Gestión de productos
addProduct(product: Product): void
incrementQuantity(name: string): void
decrementQuantity(name: string): void
removeDetail(name: string): void

// Operaciones de cuenta
async finishOrder(): Promise<void>
async closeOrder(): Promise<void>
saveAndGoBack(): void

// Estado
getDetails(): Detail[]
hasUnsavedChanges(): boolean
setOnDetailsChange(callback: () => void): void
```

**Flujo de finalización:**
1. Valida que exista cuenta y productos
2. Calcula total con `BillFormatter.calculateTotal()`
3. Cambia estado de 'draft' → 'open' si aplica
4. Actualiza cuenta en backend (`updateBill`)
5. Crea detalles en backend (`createBillDetails`)
6. Limpia sesión y redirige

---

### **3. MesaApiService**
**Ubicación:** `src/services/mesa-api.service.ts`

**Responsabilidades:**
- ✅ Comunicación con endpoints de mesas
- ✅ Obtener lista de mesas con sus cuentas
- ✅ Crear nuevas cuentas (bills)
- ✅ Obtener detalles de una cuenta específica
- ✅ Cerrar cuentas de una mesa

**Endpoints utilizados:**
```typescript
GET    /api/tables                    // Obtener todas las mesas
POST   /api/bills                     // Crear nueva cuenta
GET    /api/bill-details/bill/{id}    // Obtener detalles de cuenta
POST   /api/bills/table/{id}/close    // Cerrar cuentas de mesa
```

---

### **4. BillApiService**
**Ubicación:** `src/services/bill-api.service.ts`

**Responsabilidades:**
- ✅ Actualizar estado y total de cuentas
- ✅ Crear detalles de cuenta (productos del pedido)
- ✅ Obtener productos disponibles
- ✅ Obtener tipos de productos

**Endpoints utilizados:**
```typescript
PUT    /api/bills/{id}                // Actualizar cuenta
POST   /api/bill-details              // Crear detalles de cuenta
GET    /api/products                  // Obtener productos
GET    /api/product-type              // Obtener tipos de productos
```

---

### **5. StorageService**
**Ubicación:** `src/services/storage.service.ts`

**Responsabilidades:**
- ✅ Persistir mesa y cuenta seleccionadas en `sessionStorage`
- ✅ Recuperar datos entre navegaciones
- ✅ Limpiar sesión al finalizar

**Datos almacenados:**
```typescript
sessionStorage {
  "mesaSeleccionada": Mesa,
  "billSeleccionada": Cuenta
}
```

**Por qué sessionStorage:**
- ✅ Datos se mantienen durante la sesión del navegador
- ✅ Se limpian automáticamente al cerrar la pestaña
- ✅ No persisten indefinidamente como localStorage
- ✅ Ideal para flujos temporales (seleccionar mesa → hacer pedido)

---

## 👤 Flujo de Usuario Completo

### **Escenario 1: Nueva Cuenta en Mesa Disponible**

```
1. Usuario entra a /realizar-pedido/mesas
   └─ mesas.ts inicializa MesaManager
   └─ MesaManager carga mesas desde API
   └─ Renderiza mesas agrupadas por zona

2. Usuario hace clic en una mesa DISPONIBLE (verde)
   └─ MesaManager.selectMesa(mesa)
   └─ Marca card como seleccionada (azul)
   └─ MesaSidebar.update(mesa) muestra opciones

3. Usuario ingresa nombre del cliente y presiona "Nueva Cuenta"
   └─ MesaManager.handleNewCuenta(mesa, customer)
   └─ MesaApiService.createBill() → POST /api/bills
   └─ Backend crea cuenta con status='draft'
   └─ StorageService.setMesa() y setCuenta()
   └─ Navega a /realizar-pedido/pedido

4. Usuario ve vista de pedido
   └─ realizar-pedido.ts lee sessionStorage
   └─ Inicializa OrderManager con cuenta vacía
   └─ BillBarManager muestra mesa y cuenta
   └─ ProductsGrid carga productos desde API

5. Usuario selecciona productos
   └─ Click en producto → OrderManager.addProduct()
   └─ Si existe, incrementa cantidad
   └─ Si no existe, crea nuevo Detail
   └─ BillBarManager.render() actualiza vista
   └─ Total se actualiza automáticamente

6. Usuario incrementa/decrementa cantidades
   └─ Botones +/- en BillBar
   └─ OrderManager actualiza DetailsCollection
   └─ Re-renderiza automáticamente

7. Usuario presiona "Finalizar Pedido"
   └─ OrderManager.finishOrder()
   └─ Valida cuenta y productos
   └─ Calcula total
   └─ updateBill({status: 'open', total})
   └─ createBillDetails(billId, details)
   └─ Limpia sessionStorage
   └─ Redirige a /realizar-pedido/mesas
   └─ Mesa ahora aparece OCUPADA (naranja)
```

---

### **Escenario 2: Cuenta Existente en Mesa Ocupada**

```
1. Usuario hace clic en mesa OCUPADA (naranja)
   └─ MesaSidebar muestra lista de cuentas activas
   └─ Cada cuenta muestra: cliente, total, número

2. Usuario selecciona una cuenta existente
   └─ MesaManager.handleSelectCuenta(cuenta)
   └─ MesaApiService.getBillDetails(billId)
   └─ Carga detalles existentes desde backend
   └─ StorageService guarda mesa y cuenta
   └─ Navega a /realizar-pedido/pedido

3. Usuario ve pedido existente
   └─ OrderManager inicializa con detalles existentes
   └─ BillFormatter.mapDbDetailsToLocal() convierte datos
   └─ BillBarManager renderiza productos actuales
   └─ Total actual se muestra

4. Usuario agrega más productos
   └─ Productos nuevos se marcan como isEditable=true
   └─ Productos existentes con isEditable=false
   └─ Puede modificar ambos

5. Usuario finaliza orden
   └─ Solo se envían al backend los cambios
   └─ Cuenta mantiene status='open'
   └─ Total se actualiza sumando nuevos productos
```

---

### **Escenario 3: Cerrar Cuenta Completamente**

```
1. Usuario en vista de pedido presiona "Cerrar Cuenta"
   └─ OrderManager.closeOrder()
   └─ Muestra confirmación

2. Si confirma:
   └─ Calcula total final
   └─ updateBill({status: 'closed', total})
   └─ Backend marca cuenta como cerrada
   └─ StorageService.clearSession()
   └─ Redirige a /realizar-pedido/mesas

3. En vista de mesas:
   └─ Si era la última cuenta, mesa vuelve a DISPONIBLE
   └─ Si quedan cuentas activas, sigue OCUPADA
```

---

### **Escenario 4: Cerrar Todas las Cuentas de una Mesa**

```
1. Usuario selecciona mesa OCUPADA
   └─ MesaSidebar muestra botón "Cerrar Cuentas"

2. Usuario presiona "Cerrar Cuentas"
   └─ MesaManager.handleCloseBills(mesa)
   └─ MesaApiService.closeTableBills(tableId)
   └─ Backend cierra todas las cuentas de esa mesa
   └─ Mesa cambia a status='disponible'
   └─ Renderiza mesas actualizado
   └─ Mesa aparece DISPONIBLE (verde)
```

---

## 🔐 Gestión de Estado

### **Estados de Mesa (Table)**
```typescript
type TableStatus = "disponible" | "ocupada" | "reservada";

// Color visual:
disponible → Verde    (sin cuentas activas)
ocupada    → Naranja  (tiene cuentas con status='draft' o 'open')
reservada  → Amarillo (reserva futura - no implementado aún)
```

### **Estados de Cuenta (Bill)**
```typescript
type BillStatus = "draft" | "open" | "closed";

draft  → Cuenta creada pero sin productos aún
open   → Cuenta con productos, pedido activo
closed → Cuenta cerrada y pagada
```

### **Transiciones de Estado**

```
DRAFT → OPEN
└─ Cuando se finaliza un pedido con productos por primera vez
└─ OrderManager.finishOrder() cambia el status

OPEN → OPEN
└─ Cuando se agregan más productos a una cuenta existente
└─ Se mantiene en 'open'

OPEN → CLOSED
└─ Cuando se cierra la cuenta completamente
└─ OrderManager.closeOrder() o closeTableBills()

CLOSED → (final)
└─ Las cuentas cerradas no se modifican más
```

---

## 🎨 Componentes UI Auxiliares

### **1. MesaCard**
- Renderiza card visual de cada mesa
- Colores según estado
- Evento click para selección

### **2. MesaSidebar**
- Muestra información de mesa seleccionada
- Lista cuentas activas
- Botones para nueva cuenta / cerrar cuentas

### **3. BillBarManager**
- Renderiza tabla de productos en pedido
- Botones +/- para cantidades
- Botón eliminar producto
- Actualiza total automáticamente

### **4. ProductsGrid**
- Renderiza grid de productos disponibles
- Filtro por tipo de producto
- Card por cada producto con imagen, nombre, precio

### **5. DetailsCollection**
- Utilidad para manipular array de Details
- Métodos para incrementar, decrementar, eliminar
- Mantiene integridad de datos

---

## 📊 Estructura de Datos

### **Mesa (Table)**
```typescript
interface Mesa {
  tableId: string;           // ID único de la mesa
  zone: string;              // "Zona A", "Zona B", etc.
  status: TableStatus;       // Estado actual
  bills: Cuenta[];           // Cuentas activas en la mesa
}
```

### **Cuenta (Bill)**
```typescript
interface Cuenta {
  billId: number;                    // ID único de la cuenta
  tableId: string;                   // Mesa a la que pertenece
  cashRegister: number;              // ID del cajero/usuario
  customer: string;                  // Nombre del cliente
  total: number;                     // Total de la cuenta
  date: string;                      // Fecha de creación
  status: BillStatus;                // Estado actual
  ultimaModificacion: string;        // Timestamp última modificación
  detalles: BillDetail[];            // Productos del pedido
  numeroCuenta: number;              // Número de cuenta en la mesa (1, 2, 3...)
}
```

### **Detalle (Detail)**
```typescript
interface Detail {
  productId: number;         // ID del producto
  name: string;              // Nombre del producto
  quantity: number;          // Cantidad en el pedido
  price: number;             // Precio unitario
  subTotal: number;          // quantity * price
  isEditable: boolean;       // Si es producto nuevo (no guardado aún)
  originalQuantity: number;  // Cantidad original (para tracking)
}
```

---

## 🔧 Utilidades y Formatters

### **BillFormatter**
```typescript
// Calcula el total sumando todos los subtotales
calculateTotal(details: Detail[]): number

// Convierte detalles de DB a formato local
mapDbDetailsToLocal(dbDetails: BillDetail[]): Detail[]

// Convierte detalles locales a formato DB
mapDetailsToBillDetails(details: Detail[], billId: number): BillDetail[]
```

### **DateFormatter**
```typescript
// Formatea fechas para mostrar al usuario
formatDate(isoDate: string): string
formatTime(isoDate: string): string
```

---

## 🚀 Ventajas de esta Arquitectura

### **1. Separación de Responsabilidades**
- ✅ Managers manejan lógica de negocio
- ✅ Services manejan comunicación API
- ✅ Components manejan UI
- ✅ Utils manejan transformaciones de datos

### **2. Reusabilidad**
- ✅ Services pueden usarse desde cualquier manager
- ✅ Components son independientes
- ✅ Utils son funciones puras reutilizables

### **3. Testabilidad**
- ✅ Cada capa puede probarse independientemente
- ✅ Mock fácil de services para testing
- ✅ Lógica de negocio aislada

### **4. Mantenibilidad**
- ✅ Cambios en UI no afectan lógica
- ✅ Cambios en API solo afectan services
- ✅ Código organizado y fácil de entender

### **5. Escalabilidad**
- ✅ Fácil agregar nuevas features
- ✅ Fácil agregar nuevos managers
- ✅ Fácil agregar nuevos componentes

---

## 🐛 Puntos de Atención

### **1. Manejo de Errores**
- Cada service captura y re-lanza errores
- Managers muestran alertas al usuario
- Try-catch en operaciones async

### **2. Sincronización de Estado**
- sessionStorage mantiene consistencia entre vistas
- Re-carga de mesas después de operaciones
- Callbacks para actualizar UI automáticamente

### **3. Validaciones**
- No permitir finalizar sin productos
- Validar que exista cuenta antes de finalizar
- Confirmar acciones destructivas (cerrar cuentas)

---

## 📚 Resumen del Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                     INICIO: Vista de Mesas                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
         [MesaManager.initialize()]
                  │
                  ├─ MesaApiService.getMesas()
                  │    └─ GET /api/tables
                  │
                  ├─ renderMesas() → Agrupa por zona
                  │
                  └─ Usuario selecciona mesa
                         │
                         ├─ Mesa DISPONIBLE
                         │    └─ handleNewCuenta()
                         │         └─ POST /api/bills
                         │
                         └─ Mesa OCUPADA
                              └─ handleSelectCuenta()
                                   └─ GET /api/bill-details
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────┐
│              StorageService guarda mesa + cuenta            │
│                        en sessionStorage                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  NAVEGACIÓN: Vista de Pedido                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
     [realizar-pedido.ts inicializa]
                  │
                  ├─ Lee sessionStorage
                  │
                  ├─ OrderManager(cuenta, mesa, details)
                  │
                  ├─ BillApiService.getProducts()
                  │    └─ GET /api/products
                  │
                  ├─ ProductsGrid.render()
                  │
                  └─ Usuario agrega productos
                         │
                         ├─ addProduct() → Agrega al carrito
                         ├─ incrementQuantity() → Aumenta cantidad
                         ├─ decrementQuantity() → Reduce cantidad
                         └─ removeDetail() → Elimina del carrito
                                │
                                ▼
                    [Usuario finaliza o cierra]
                                │
                                ├─ finishOrder()
                                │    ├─ PUT /api/bills/{id}
                                │    └─ POST /api/bill-details
                                │
                                └─ closeOrder()
                                     └─ PUT /api/bills/{id} (status: closed)
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│           StorageService.clearSession() + Redirige          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                 RETORNO: Vista de Mesas                     │
│                   (estado actualizado)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Conclusión

Esta arquitectura implementa un patrón **Manager-Service** donde:

1. **Managers** orquestan la lógica de negocio
2. **Services** abstraen la comunicación con backend
3. **Components** manejan la interfaz de usuario
4. **StorageService** persiste estado temporal

El resultado es un sistema **robusto**, **mantenible** y **escalable** para gestionar mesas y pedidos en un restaurante.
