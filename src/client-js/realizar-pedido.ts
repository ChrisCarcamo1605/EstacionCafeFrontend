// Imports de módulos
import type { Detail, Product } from "../types/detail.interface";
import type { Mesa, Cuenta } from "../types/mesa";
import { StorageService } from "../services/storage.service";
import { BillApiService } from "../services/bill-api.service";
import { BillFormatter } from "../utils/bill-formatter";
import { BillBarManager } from "../components/bill-bar-manager";
import { ProductsGrid } from "../components/products-grid";
import { OrderManager } from "../managers/order-manager";

document.addEventListener("DOMContentLoaded", async () => {
  // ELEMENTOS DEL DOM
  const cardContainer = document.querySelector("#products_container") as HTMLElement;
  const billBar = document.querySelector(".bill-bar tbody") as HTMLElement;
  const total = document.querySelector(".total h5") as HTMLElement;

  if (!cardContainer || !billBar || !total) {
    console.error("Elementos del DOM no encontrados");
    return;
  }

  // OBTENER DATOS DE SESIÓN
  let mesaSeleccionada: Mesa | null = StorageService.getMesaSeleccionada();
  let cuentaSeleccionada: Cuenta | null = StorageService.getCuentaSeleccionada();
  let initialDetails: Detail[] = [];

  // CARGAR DETALLES EXISTENTES
  if (cuentaSeleccionada?.detalles && cuentaSeleccionada.detalles.length > 0) {
    initialDetails = BillFormatter.mapDbDetailsToLocal(cuentaSeleccionada.detalles);
  }

  // INICIALIZAR MANAGERS Y COMPONENTES
  const billBarManager = new BillBarManager(billBar, total);
  const productsGrid = new ProductsGrid(cardContainer);
  const orderManager = new OrderManager(
    initialDetails,
    cuentaSeleccionada,
    mesaSeleccionada
  );

  // ACTUALIZAR INFO DEL BILLBAR
  if (cuentaSeleccionada) {
    billBarManager.updateInfo(cuentaSeleccionada, mesaSeleccionada);
  }

  // CONFIGURAR CALLBACKS
  billBarManager.setCallbacks(
    (name) => orderManager.incrementQuantity(name),
    (name) => orderManager.decrementQuantity(name),
    (name) => orderManager.removeDetail(name)
  );

  orderManager.setOnDetailsChange(() => {
    billBarManager.render(orderManager.getDetails());
  });

  // RENDERIZAR ESTADO INICIAL
  if (initialDetails.length > 0) {
    billBarManager.render(orderManager.getDetails());
  }

  // EVENT LISTENERS

  // Botón finalizar orden
  const finishOrderBtn = document.querySelector("#finishOrder");
  finishOrderBtn?.addEventListener("click", async () => {
    try {
      await orderManager.finishOrder();
    } catch (error) {
      console.error("Error al finalizar orden:", error);
    }
  });

  const closeOrderBtn = document.querySelector("#closeOrder");
  closeOrderBtn?.addEventListener("click", async () => {
    try {
      await orderManager.closeOrder();
    } catch (error) {
      console.error("Error al finalizar orden:", error);
    }
  });

  // Botón volver a mesas
  const backToTablesBtn = document.querySelector("#backToTables");
  backToTablesBtn?.addEventListener("click", () => {
    orderManager.saveAndGoBack();
  });

  // CARGAR Y RENDERIZAR PRODUCTOS
  try {
    const products = await BillApiService.getProducts();
    productsGrid.render(products, (product) => {
      orderManager.addProduct(product);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
    alert("Error al cargar los productos");
  }
});
