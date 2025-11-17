import type { Mesa, Cuenta } from "../types/mesa";
import { MesaApiService } from "../services/mesa-api.service";
import { StorageService } from "../services/storage.service";
import { MesaCard } from "../components/mesa-card";
import { MesaSidebar } from "../components/mesa-sidebar";

/**
 * Manager principal para manejar la lógica de negocio de las mesas
 */
export class MesaManager {
  private mesas: Mesa[] = [];
  private mesaSeleccionada: Mesa | null = null;
  private billSeleccionada: Cuenta | null = null;
  private userId: number;
  private tablesContainer: HTMLElement;
  private sidebar: MesaSidebar;

  constructor(
    tablesContainer: HTMLElement,
    sidebarContainer: HTMLElement,
    userId: number
  ) {
    this.tablesContainer = tablesContainer;
    this.userId = userId;

    // Inicializar sidebar
    this.sidebar = new MesaSidebar(
      sidebarContainer,
      (cuenta) => this.handleSelectCuenta(cuenta),
      (mesa, customer) => this.handleNewCuenta(mesa, customer),
      (mesa) => this.handleCloseBills(mesa)
    );
  }

  /**
   * Inicializa el manager cargando las mesas
   */
  async initialize(): Promise<void> {
    await this.loadMesas();
    this.renderMesas();
  }

  /**
   * Carga las mesas desde el backend
   */
  private async loadMesas(): Promise<void> {
    try {
      this.mesas = await MesaApiService.getMesas();
    } catch (error) {
      console.error("Error al cargar mesas:", error);
      alert("Error al cargar las mesas. Por favor recargue la página.");
    }
  }

  /**
   * Renderiza todas las mesas agrupadas por zona
   */
  renderMesas(): void {
    this.tablesContainer.innerHTML = "";

    // Obtener zonas únicas
    const zonasUnicas = [...new Set(this.mesas.map((m) => m.zone))];

    zonasUnicas.forEach((zonaCompleta) => {
      const mesasZona = this.mesas.filter((m) => m.zone === zonaCompleta);

      if (mesasZona.length === 0) return;

      // Extraer letra de la zona
      const zonaLetra = zonaCompleta.split(" ")[1] || zonaCompleta;

      // Crear sección de zona
      const zoneSection = document.createElement("div");
      zoneSection.className = `zona-${zonaLetra} w-100 mb-3`;
      zoneSection.setAttribute("data-zona", zonaLetra);
      zoneSection.innerHTML = `
        <h4 class="fw-bold mb-2" style="color: #482E21;">Zona ${zonaLetra}</h4>
        <div class="zone-grid d-flex flex-wrap gap-2"></div>
      `;

      const zoneGrid = zoneSection.querySelector(".zone-grid");

      // Renderizar mesas de la zona
      mesasZona.forEach((mesa) => {
        const mesaCard = MesaCard.create(mesa, (m) => this.selectMesa(m));
        zoneGrid?.appendChild(mesaCard);
      });

      this.tablesContainer.appendChild(zoneSection);
    });
  }

  /**
   * Selecciona una mesa
   */
  selectMesa(mesa: Mesa): void {
    this.mesaSeleccionada = mesa;
    MesaCard.markAsSelected(mesa.tableId);
    this.sidebar.update(mesa);
  }

  /**
   * Maneja la selección de una cuenta
   */
  private async handleSelectCuenta(cuenta: Cuenta): Promise<void> {
    try {
      // Cargar detalles de la cuenta
      const details = await MesaApiService.getBillDetails(cuenta.billId);
      cuenta.detalles = details;

      this.billSeleccionada = cuenta;
      console.log(this.billSeleccionada);
      
      this.goToRealizarPedido();
    } catch (error) {
      console.error("Error al cargar detalles de la cuenta:", error);
      alert("Error al cargar la cuenta. Por favor intente nuevamente.");
    }
  }

  /**
   * Maneja la creación de una nueva cuenta
   */
  private async handleNewCuenta(mesa: Mesa, customer: string): Promise<void> {
    try {
      const nuevaCuenta = {
        tableId: mesa.tableId,
        cashRegister: this.userId,
        customer: customer,
        date: new Date().toISOString(),
        ultimaModificacion: new Date().toISOString(),
        status: "draft" as const,
        detalles: [],
        total: 0,
        numeroCuenta: mesa.bills.length + 1,
      };

      const cuentaCreada = await MesaApiService.createBill(nuevaCuenta);
      this.billSeleccionada = cuentaCreada;
      this.goToRealizarPedido();
    } catch (error) {
      console.error("Error al crear cuenta:", error);
      alert("Error al crear la cuenta. Por favor intente nuevamente.");
    }
  }

  /**
   * Maneja el cierre de cuentas de una mesa
   */
  private async handleCloseBills(mesa: Mesa): Promise<void> {
    try {
      await MesaApiService.closeTableBills(mesa.tableId);

      // Actualizar estado local de la mesa
      const mesaToUpdate = this.mesas.find(
        (m) => m.tableId === mesa.tableId
      );
      if (mesaToUpdate) {
        mesaToUpdate.status = "disponible";
        mesaToUpdate.bills = [];
      }

      this.renderMesas();
      alert("Cuentas cerradas exitosamente");
    } catch (error) {
      console.error("Error al cerrar cuentas:", error);
      alert("Error al cerrar las cuentas. Por favor intente nuevamente.");
    }
  }

  /**
   * Navega a la vista de realizar pedido
   */
  private goToRealizarPedido(): void {
    StorageService.setMesa(this.mesaSeleccionada!);
    StorageService.setCuenta(this.billSeleccionada!);
    window.location.href = "/realizar-pedido/pedido";
  }

  /**
   * Obtiene las mesas actuales
   */
  getMesas(): Mesa[] {
    return this.mesas;
  }
}
