# Sistema de Navegación con LeftBar

## Descripción

El componente `LeftBar` ahora soporta navegación automática entre páginas relacionadas. Este sistema permite que los usuarios naveguen entre diferentes secciones (como inventario, estadísticas, ajustes) simplemente haciendo clic en las opciones del sidebar.

## Características

- ✅ Navegación automática entre páginas relacionadas
- ✅ Resaltado visual de la opción activa
- ✅ Efectos hover para mejor UX
- ✅ Sistema centralizado y reutilizable
- ✅ Sin necesidad de scripts personalizados en cada página

## Cómo Usar

### 1. Definir el Mapa de Rutas

En la sección de frontmatter de tu página Astro, define un objeto con las rutas:

```astro
---
const inventoryRouteMap: Record<string, string> = {
    "Consumibles": "/administracion/inventario/consumibles",
    "Productos": "/administracion/inventario/productos",
    "Ingredientes": "/administracion/inventario/ingredientes",
    "Proveedores": "/administracion/inventario/proveedores"
};
---
```

### 2. Pasar el Mapa al LeftBar

```astro
<LeftBar 
    title="Inventario" 
    options={["Consumibles", "Productos", "Ingredientes", "Proveedores"]}
    selectedOption="Consumibles"
    routeMap={inventoryRouteMap}
/>
```

### 3. Propiedades del LeftBar

| Propiedad | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `title` | string | ✅ | Título que aparece en el sidebar |
| `options` | string[] | ✅ | Lista de opciones a mostrar |
| `selectedOption` | string | ❌ | Opción actualmente seleccionada (se resalta) |
| `returnPath` | string | ❌ | Ruta del botón "Volver" (default: "/administracion") |
| `routeMap` | Record<string, string> | ❌ | Mapa de opciones a rutas para navegación |

## Ejemplos por Módulo

### Módulo de Inventario

```astro
---
const sidebarOptions = ["Consumibles", "Productos", "Ingredientes", "Proveedores"];

const inventoryRouteMap: Record<string, string> = {
    "Consumibles": "/administracion/inventario/consumibles",
    "Productos": "/administracion/inventario/productos",
    "Ingredientes": "/administracion/inventario/ingredientes",
    "Proveedores": "/administracion/inventario/proveedores"
};
---

<LeftBar 
    title="Inventario" 
    options={sidebarOptions} 
    selectedOption="Consumibles" 
    routeMap={inventoryRouteMap} 
/>
```

### Módulo de Estadísticas

```astro
---
const estadisticasRouteMap: Record<string, string> = {
    "Estadisticas de Ventas": "/administracion/estadisticas/estadisticas-ventas",
    "Estadisticas de Gastos": "/administracion/estadisticas/estadisticas-gastos",
    "Reporte de Ventas": "/administracion/estadisticas/reporte-ventas"
};
---

<LeftSidebar 
    title="Resumen" 
    options={["Estadisticas de Ventas", "Estadisticas de Gastos", "Reporte de Ventas"]}
    selectedOption="Estadisticas de Ventas"
    routeMap={estadisticasRouteMap}
/>
```

### Módulo de Ajustes

```astro
---
const ajustesRouteMap: Record<string, string> = {
    "General": "/administracion/ajustes/ajustes-general",
    "Alertas": "/administracion/ajustes/ajustes-alerta"
};
---

<LeftBar 
    title="Ajustes" 
    options={["General", "Alertas"]} 
    selectedOption="General" 
    routeMap={ajustesRouteMap} 
/>
```

### Módulo de Pedidos (Sin Navegación)

Si no necesitas navegación entre opciones, simplemente no pases el `routeMap`:

```astro
---
const productTypes = ["Bebidas Calientes", "Bebidas Frías", "Postres"];
---

<LeftBar 
    options={productTypes} 
    title="Pedido" 
    returnPath="/home" 
/>
```

## Estilos y Comportamiento

### Opción Seleccionada
- Fondo: `#482E21` (marrón café)
- Texto: Blanco
- Automáticamente aplicado cuando `selectedOption` coincide con una opción

### Opción Hover (no seleccionada)
- Fondo: `rgba(72, 46, 33, 0.1)` (marrón claro transparente)
- Escala: `1.02` (efecto de zoom sutil)
- Transición suave

### Cursor
- Solo las opciones con rutas definidas muestran cursor pointer
- Las opciones sin ruta no son clickeables

## Estructura de Archivos Actualizada

```
src/
├── components/
│   └── LeftBar.astro          ← Componente mejorado con navegación
├── pages/
│   └── administracion/
│       ├── inventario/
│       │   ├── consumibles.astro     ← ✅ Con navegación
│       │   ├── productos.astro       ← ✅ Con navegación
│       │   ├── ingredientes.astro    ← ✅ Con navegación
│       │   └── proveedores.astro     ← ✅ Con navegación
│       ├── estadisticas/
│       │   ├── estadisticas-ventas.astro  ← ✅ Con navegación
│       │   ├── estadisticas-gastos.astro  ← ✅ Con navegación
│       │   └── reporte-ventas.astro       ← ✅ Con navegación
│       └── ajustes/
│           ├── ajustes-general.astro      ← ✅ Con navegación
│           └── ajustes-alerta.astro       ← ✅ Con navegación
```

## Ventajas del Nuevo Sistema

1. **Código más limpio**: No necesitas scripts personalizados de navegación en cada página
2. **Mantenibilidad**: Cambiar rutas es tan simple como actualizar el objeto `routeMap`
3. **Consistencia**: Todas las páginas usan el mismo sistema de navegación
4. **Reutilizable**: El mismo componente funciona para diferentes módulos
5. **Type-safe**: Usando TypeScript para definir las rutas

## Migración de Código Antiguo

### ❌ Antes (con scripts personalizados)

```astro
<script>
    const routeMap = {
        "Consumibles": "http://localhost:4321/administracion/inventario/consumibles",
        "Productos": "http://localhost:4321/administracion/inventario/productos"
    };

    function setupLeftBarNavigation() {
        // 50+ líneas de código...
    }

    document.addEventListener('DOMContentLoaded', setupLeftBarNavigation);
</script>
```

### ✅ Después (con routeMap)

```astro
---
const inventoryRouteMap: Record<string, string> = {
    "Consumibles": "/administracion/inventario/consumibles",
    "Productos": "/administracion/inventario/productos"
};
---

<LeftBar routeMap={inventoryRouteMap} />
```

## Troubleshooting

### La navegación no funciona
- Verifica que el nombre de la opción en `options` coincida exactamente con la clave en `routeMap`
- Revisa que las rutas en `routeMap` sean correctas

### La opción no se resalta
- Asegúrate de que `selectedOption` coincida exactamente con el nombre de la opción
- Verifica que estés usando el mismo string (mayúsculas/minúsculas)

### El cursor no cambia a pointer
- Solo las opciones con rutas en `routeMap` muestran cursor pointer
- Si una opción no tiene ruta definida, no será clickeable

## Próximas Mejoras

- [ ] Soporte para rutas con parámetros dinámicos
- [ ] Animaciones de transición entre páginas
- [ ] Breadcrumbs automáticos
- [ ] Navegación con teclado (flechas)
- [ ] Guardar estado de navegación en localStorage

## Soporte

Si encuentras problemas o tienes sugerencias, por favor contacta al equipo de desarrollo.
