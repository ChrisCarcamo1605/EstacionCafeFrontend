import type { Detail } from "../types/detail.interface";
import type { Mesa, Cuenta } from "../types/mesa";
import { BillFormatter } from "../utils/bill-formatter";

export class BillBarManager {
  private billBarElement: HTMLElement;
  private totalElement: HTMLElement;
  private onIncrement: ((name: string) => void) | null = null;
  private onDecrement: ((name: string) => void) | null = null;
  private onDelete: ((name: string) => void) | null = null;

  constructor(billBarElement: HTMLElement, totalElement: HTMLElement) {
    this.billBarElement = billBarElement;
    this.totalElement = totalElement;
  }

  /**
   * Actualizar información de la cuenta en el BillBar
   */
  updateInfo(cuenta: Cuenta, mesa: Mesa | null): void {
    const mesaGroup = document.querySelector("#mesaGroup p");
    const clienteGroup = document.querySelector("#clienteGroup p");
    const aperturaGroup = document.querySelector("#aperturaGroup");
    const aperturaText = aperturaGroup?.querySelector("p");

    if (mesaGroup) {
      mesaGroup.innerHTML = `<strong>Mesa:</strong> ${
        mesa?.tableId || cuenta.tableId
      }`;
    }

    if (clienteGroup) {
      clienteGroup.innerHTML = `<strong>Cliente:</strong> ${cuenta.customer}`;
    }

    if (aperturaText) {
      const fechaFormateada = BillFormatter.formatDate(cuenta.date);
      aperturaText.innerHTML = `<strong>Apertura:</strong> ${fechaFormateada}`;
    }

    if (aperturaGroup) {
      aperturaGroup.setAttribute("data-aperture", cuenta.date.toString());
    }
  }

  /**
   * Renderizar la lista de detalles en el BillBar
   */
  render(details: Detail[]): void {
    this.billBarElement.innerHTML = "";

    details.forEach((detail) => {
      const row = this.createDetailRow(detail);
      this.billBarElement.appendChild(row);
    });

    this.updateTotal(details);
    this.attachQuantityListeners();
  }

  /**
   * Crear fila de detalle HTML
   */
  private createDetailRow(detail: Detail): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.classList.add("align-content-center");

    row.innerHTML = `
      <th class="fw-normal" scope="col">
        ${detail.name}
      </th>
      <th class="fw-normal gap-2 align-content-center" scope="col">
        <div class="d-flex flex-row gap-2">
          <div class="decrease-btn quantity-btn" data-name="${detail.name}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
              viewBox="0 0 24 24"><path fill="currentColor" d="M18 11H6a2 2 
              0 0 0 0 4h12a2 2 0 0 0 0-4"/></svg>
          </div>
          ${detail.quantity}
          <div class="increment-btn quantity-btn" data-name="${detail.name}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 24 24"><path fill="currentColor"
              d="M18 10h-4V6a2 2 0 0 0-4 0l.071 4H6a2 2 0 0 0 0 4l4.071-.071L10 
              18a2 2 0 0 0 4 0v-4.071L18 14a2 2 0 0 0 0-4"/></svg>
          </div>                 
        </div>
      </th>
      <th class="fw-normal align-content-center" scope="col">
        <strong>$</strong> ${detail.subTotal.toFixed(2)}
      </th>
      <th data-name="${detail.name}" 
          class="deleteBtn fw-normal align-content-center" 
          style="width: 50px; cursor:pointer;" 
          scope="col">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
               class="bi bi-trash-fill" viewBox="0 0 16 16">
            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
          </svg>
        </div>
      </th>
    `;

    return row;
  }

  /**
   * Actualizar el total
   */
  updateTotal(details: Detail[]): void {
    const total = BillFormatter.calculateTotal(details);
    this.totalElement.innerHTML = `TOTAL <strong>$</strong> ${total.toFixed(
      2
    )}`;
  }

  /**
   * Configurar callbacks para eventos
   */
  setCallbacks(
    onIncrement: (name: string) => void,
    onDecrement: (name: string) => void,
    onDelete: (name: string) => void
  ): void {
    this.onIncrement = onIncrement;
    this.onDecrement = onDecrement;
    this.onDelete = onDelete;
  }

  /**
   * Adjuntar event listeners a los botones de cantidad
   */
  private attachQuantityListeners(): void {
    // Botones de incrementar
    document.querySelectorAll(".increment-btn").forEach((btn) => {
      btn.addEventListener("click", (e: Event) => {
        e.stopPropagation();
        const element = e.currentTarget as HTMLElement;
        const name = element.getAttribute("data-name");
        if (name && this.onIncrement) {
          this.onIncrement(name);
        }
      });
    });

    // Botones de decrementar
    document.querySelectorAll(".decrease-btn").forEach((btn) => {
      btn.addEventListener("click", (e: Event) => {
        e.stopPropagation();
        const element = e.currentTarget as HTMLElement;
        const name = element.getAttribute("data-name");
        if (name && this.onDecrement) {
          this.onDecrement(name);
        }
      });
    });

    // Botones de eliminar
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", (e: Event) => {
        e.stopPropagation();
        const element = e.currentTarget as HTMLElement;
        const name = element.getAttribute("data-name");
        if (name && this.onDelete) {
          this.onDelete(name);
        }
      });
    });
  }
}
