/**
 * Componente para filtrar mesas por zona
 */
export class ZonaFilter {
  private selectedZone: string | null = null;

  constructor(sidebarOptions: NodeListOf<Element>) {
    this.setupListeners(sidebarOptions);
  }

  /**
   * Configura los event listeners para el filtro de zonas
   */
  private setupListeners(sidebarOptions: NodeListOf<Element>): void {
    sidebarOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const zone = option.textContent?.trim();

        // Toggle: si clickeas la misma zona, se deselecciona
        if (this.selectedZone === zone) {
          this.selectedZone = null;
          option.classList.remove("sidebar_option_active");
        } else {
          // Remover clase activa de todas las opciones
          sidebarOptions.forEach((opt) =>
            opt.classList.remove("sidebar_option_active")
          );
          this.selectedZone = zone || null;
          option.classList.add("sidebar_option_active");
        }

        this.filterZones();
      });
    });
  }

  /**
   * Filtra las zonas visibles según la selección
   */
  private filterZones(): void {
    document.querySelectorAll("[data-zona]").forEach((section) => {
      if (this.selectedZone === null) {
        section.classList.remove("d-none");
      } else {
        const zonaSection = (section as HTMLElement).getAttribute("data-zona");
        section.classList.toggle("d-none", zonaSection !== this.selectedZone);
      }
    });
  }

  /**
   * Obtiene la zona actualmente seleccionada
   */
  getSelectedZone(): string | null {
    return this.selectedZone;
  }

  /**
   * Resetea el filtro
   */
  reset(): void {
    this.selectedZone = null;
    document
      .querySelectorAll(".sidebar_option_active")
      .forEach((opt) => opt.classList.remove("sidebar_option_active"));
    this.filterZones();
  }
}
