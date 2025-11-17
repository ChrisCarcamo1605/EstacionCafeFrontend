import type { Mesa } from "../types/mesa";

/**
 * Componente para renderizar tarjetas de mesas
 */
export class MesaCard {
  /**
   * Crea un elemento de tarjeta de mesa
   */
  static create(mesa: Mesa, onSelect: (mesa: Mesa) => void): HTMLElement {
    const card = document.createElement("div");
    card.className = "mesa-card";
    card.setAttribute("data-mesa-id", mesa.tableId);

    // Filtrar cuentas activas
    const cuentasActivas = mesa.bills.filter((c) => c.status === "open");
    const cuentasDraft = mesa.bills.filter((c) => c.status === "draft");

    // Determinar estado real de la mesa
    const statusReal = this.getStatusReal(cuentasActivas, cuentasDraft);
    const statusClass = this.getStatusClass(statusReal);

    // Información de cuentas
    const numeroCuentas = cuentasActivas.length;
    const cuentasText = this.getCuentasText(numeroCuentas);

    // Nombre del primer cliente (abreviado)
    const primerCliente = mesa.bills[0]?.customer || "";
    const nombreCorto = primerCliente.split(" ")[0] || "N/A";

    card.innerHTML = `
      <div class="mesa-content ${statusClass}">
        <div class="mesa-header">
          <h5 class="mesa-nombre fw-bold mb-0">${nombreCorto}</h5>
          <p class="mesa-id mb-0">${mesa.tableId}</p>
        </div>
        ${
          numeroCuentas > 0
            ? `<div class="mesa-footer">
                <small class="bills-badge">${cuentasText}</small>
              </div>`
            : ""
        }
      </div>
    `;

    card.addEventListener("click", () => onSelect(mesa));

    return card;
  }

  /**
   * Determina el estado real de la mesa
   */
  private static getStatusReal(
    cuentasActivas: any[],
    cuentasDraft: any[]
  ): string {
    const hasActivas = cuentasActivas.length > 0;
    const hasDraft = cuentasDraft.length > 0;

    if ((hasDraft && hasActivas) || (!hasDraft && hasActivas)) {
      return "ocupada";
    } else if (hasDraft && !hasActivas) {
      return "reservada";
    }
    return "disponible";
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  private static getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      disponible: "mesa-disponible",
      ocupada: "mesa-ocupada",
      reservada: "mesa-reservada",
    };
    return statusMap[status] || "mesa-disponible";
  }

  /**
   * Obtiene el texto descriptivo de las cuentas
   */
  private static getCuentasText(numeroCuentas: number): string {
    if (numeroCuentas === 0) return "";
    return `${numeroCuentas} cuenta${numeroCuentas > 1 ? "s" : ""}`;
  }

  /**
   * Marca una tarjeta como seleccionada
   */
  static markAsSelected(tableId: string): void {
    document.querySelectorAll(".mesa-card").forEach((card) => {
      card.classList.remove("mesa-selected");
    });
    document
      .querySelector(`[data-mesa-id="${tableId}"]`)
      ?.classList.add("mesa-selected");
  }
}
