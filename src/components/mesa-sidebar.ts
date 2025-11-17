import type { Mesa, Cuenta } from "../types/mesa";
import { DateFormatter } from "../utils/date-formatter";

/**
 * Componente para manejar el sidebar lateral de mesas
 */
export class MesaSidebar {
  private container: HTMLElement;
  private onSelectCuenta: (cuenta: Cuenta) => void;
  private onNewCuenta: (mesa: Mesa, customer: string) => void;
  private onCloseBills: (mesa: Mesa) => void;

  constructor(
    container: HTMLElement,
    onSelectCuenta: (cuenta: Cuenta) => void,
    onNewCuenta: (mesa: Mesa, customer: string) => void,
    onCloseBills: (mesa: Mesa) => void
  ) {
    this.container = container;
    this.onSelectCuenta = onSelectCuenta;
    this.onNewCuenta = onNewCuenta;
    this.onCloseBills = onCloseBills;
  }

  /**
   * Actualiza el sidebar según la mesa seleccionada
   */
  update(mesa: Mesa): void {
    if (mesa.bills.length === 0) {
      this.showNewAccountForm(mesa);
    } else {
      this.showAccountsList(mesa);
    }
  }

  /**
   * Muestra la lista de cuentas de una mesa
   */
  private showAccountsList(mesa: Mesa): void {
    const cuentasActivas = mesa.bills.filter((c) => c.status === "open");
    const numCuentas = cuentasActivas.length;

    this.container.innerHTML = `
      <div class="bills-list-container">
        <h5 class="fw-bold mb-3" style="color: #482E21;">Mesa ${mesa.tableId}</h5>
        <p class="text-muted mb-3">${numCuentas} cuenta${
      numCuentas > 1 ? "s" : ""
    } activa${numCuentas > 1 ? "s" : ""}</p>
        
        <div class="bills-list">
          ${mesa.bills
            .filter((cuenta) => cuenta.status === "open" || cuenta.status === "draft")
            .map(
              (cuenta, index) => `
            <div class="cuenta-item" data-cuenta-id="${cuenta.billId}">
              <div class="cuenta-info">
                <h6 class="fw-bold mb-1">Cuenta #${
                  cuenta.numeroCuenta || index + 1
                }</h6>
                <p class="mb-1"><strong>Cliente:</strong> ${cuenta.customer}</p>
                <p class="mb-1"><small>Abierta: ${DateFormatter.formatTime(
                  cuenta.date
                )}</small></p>
                <p class="mb-0"><strong>Total: $${Number(
                  cuenta.total || 0
                ).toFixed(2)}</strong></p>
              </div>
              <button class="btn btn-sm fourth_color select-cuenta-btn" data-cuenta-id="${
                cuenta.billId
              }">
                Seleccionar
              </button>
            </div>
          `
            )
            .join("")}
        </div>
        
        <button class="btn w-100 mt-3 third_color nueva-cuenta-btn bill-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle me-2" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
          Nueva Cuenta
        </button>

        <button id="closeOrder" class="bill-btn w-100 third_color_light mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle me-2" viewBox="0 0 16 16" style="vertical-align: middle;">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
          </svg>
          Cerrar Cuentas
        </button>
      </div>
    `;

    this.attachAccountsListListeners(mesa);
  }

  /**
   * Adjunta los event listeners de la lista de cuentas
   */
  private attachAccountsListListeners(mesa: Mesa): void {
    // Seleccionar cuenta
    this.container.querySelectorAll(".cuenta-item").forEach((item) => {
      item.addEventListener("click", () => {
        const billId = parseInt(
          (item as HTMLElement).getAttribute("data-cuenta-id") || "0"
        );
        const cuenta = mesa.bills.find((c) => c.billId === billId);
        if (cuenta) {
          this.onSelectCuenta(cuenta);
        }
      });
    });

    // Nueva cuenta
    this.container
      .querySelector(".nueva-cuenta-btn")
      ?.addEventListener("click", () => {
        this.showNewAccountForm(mesa);
      });

    // Cerrar cuentas
    this.container
      .querySelector("#closeOrder")
      ?.addEventListener("click", async () => {
        if (
          confirm(
            `¿Está seguro de cerrar todas las cuentas de la mesa ${mesa.tableId}?`
          )
        ) {
          this.onCloseBills(mesa);
        }
      });
  }

  /**
   * Muestra el formulario para crear una nueva cuenta
   */
  private showNewAccountForm(mesa: Mesa): void {
    this.container.innerHTML = `
      <div class="nueva-cuenta-form">
        <h5 class="fw-bold mb-3" style="color: #482E21;">Nueva Cuenta - Mesa ${
          mesa.tableId
        }</h5>
        
        <div class="mb-3">
          <label class="fw-bold mb-2">Nombre del Cliente</label>
          <input type="text" class="form-control" id="nuevo-cliente-input" placeholder="Ingrese nombre del cliente">
        </div>
        
        <div class="mb-3">
          <label class="fw-bold mb-2">Mesa</label>
          <input type="text" class="form-control" value="${
            mesa.tableId
          }" readonly>
        </div>
        
        <div class="mb-3">
          <label class="fw-bold mb-2">Hora de Apertura</label>
          <input type="text" class="form-control" value="${DateFormatter.formatDateTime(
            new Date()
          )}" readonly>
        </div>
        
        <button class="btn w-100 fourth_color nueva-cuenta-btn bill-btn">
          Crear Cuenta e Ir a Pedido
        </button>
        
        ${
          mesa.bills.length > 0
            ? `<button class="btn w-100 mt-2 btn-outline-secondary cancelar-btn">
                Cancelar
              </button>`
            : ""
        }
      </div>
    `;

    this.attachNewAccountFormListeners(mesa);
  }

  /**
   * Adjunta los event listeners del formulario de nueva cuenta
   */
  private attachNewAccountFormListeners(mesa: Mesa): void {
    // Crear cuenta
    this.container
      .querySelector(".nueva-cuenta-btn")
      ?.addEventListener("click", () => {
        const customerInput = document.querySelector(
          "#nuevo-cliente-input"
        ) as HTMLInputElement;
        const customer = customerInput?.value.trim();

        if (!customer) {
          alert("Por favor ingrese el nombre del cliente");
          return;
        }

        this.onNewCuenta(mesa, customer);
      });

    // Cancelar
    this.container.querySelector(".cancelar-btn")?.addEventListener("click", () => {
      this.update(mesa);
    });
  }
}
