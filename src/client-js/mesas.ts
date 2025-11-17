// Imports de módulos
import { MesaManager } from "../managers/mesa-manager";
import { ZonaFilter } from "../components/zona-filter";

/**
 * Punto de entrada principal para la vista de mesas
 */
document.addEventListener("DOMContentLoaded", async () => {
  // ELEMENTOS DEL DOM
  const tablesContainer = document.querySelector("#tables_container") as HTMLElement;
  const sidebarContent = document.querySelector("#sidebar-content") as HTMLElement;
  const sidebarOptions = document.querySelectorAll(".sidebar_option");

  if (!tablesContainer || !sidebarContent) {
    console.error("Elementos del DOM no encontrados");
    return;
  }

  // OBTENER USER ID
  const userId = parseInt(
    tablesContainer.getAttribute("data-user") || "0"
  ) || 0;

  // INICIALIZAR MANAGER DE MESAS
  const mesaManager = new MesaManager(
    tablesContainer,
    sidebarContent,
    userId
  );

  try {
    await mesaManager.initialize();
  } catch (error) {
    console.error("Error al inicializar mesas:", error);
    alert("Error al cargar las mesas. Por favor recargue la página.");
  }

  // INICIALIZAR FILTRO DE ZONAS
  if (sidebarOptions.length > 0) {
    new ZonaFilter(sidebarOptions);
  }
});
