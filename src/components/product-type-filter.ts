/**
 * Componente para filtrar productos por tipo
 */
export class ProductTypeFilter {
  private selectedType: string | null = null;

  constructor(sidebarOptions: NodeListOf<Element>) {
    this.setupListeners(sidebarOptions);
  }

  /**
   * Configura los event listeners para el filtro de tipos de producto
   */
  private setupListeners(sidebarOptions: NodeListOf<Element>): void {
    sidebarOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const type = option.textContent?.trim();

        // Toggle: si clickeas el mismo tipo, se deselecciona
        if (this.selectedType === type) {
          this.selectedType = null;
          option.classList.remove("sidebar_option_active");
        } else {
          // Remover clase activa de todas las opciones
          sidebarOptions.forEach((opt) =>
            opt.classList.remove("sidebar_option_active")
          );
          this.selectedType = type || null;
          option.classList.add("sidebar_option_active");
        }

        this.filterProductTypes();
      });
    });
  }

  /**
   * Filtra los tipos de productos visibles según la selección
   */
  private filterProductTypes(): void {
    document.querySelectorAll("[data-product-type]").forEach((section) => {
      if (this.selectedType === null) {
        section.classList.remove("d-none");
      } else {
        const productType = (section as HTMLElement).getAttribute("data-product-type");
        section.classList.toggle("d-none", productType !== this.selectedType);
      }
    });
  }

  /**
   * Obtiene el tipo de producto actualmente seleccionado
   */
  getSelectedType(): string | null {
    return this.selectedType;
  }

  /**
   * Resetea el filtro
   */
  reset(): void {
    this.selectedType = null;
    document
      .querySelectorAll(".sidebar_option_active")
      .forEach((opt) => opt.classList.remove("sidebar_option_active"));
    this.filterProductTypes();
  }
}
