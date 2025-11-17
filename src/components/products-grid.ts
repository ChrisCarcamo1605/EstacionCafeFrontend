import type { Product, ProductType } from "../types/detail.interface";

export class ProductsGrid {
  private containerElement: HTMLElement;
  private onProductClick: ((product: Product) => void) | null = null;
  private productTypeNames: Record<number, string> = {};

  constructor(containerElement: HTMLElement) {
    this.containerElement = containerElement;
  }

  /**
   * Establecer el mapeo de tipos de productos
   */
  setProductTypes(productTypes: ProductType[]): void {
    this.productTypeNames = productTypes.reduce((acc, type) => {
      acc[type.productTypeId] = type.name;
      return acc;
    }, {} as Record<number, string>);
    console.log("Mapeo de tipos de productos establecido:", this.productTypeNames);
  }

  /**
   * Renderizar grilla de productos agrupados por tipo
   */
  render(products: Product[], onProductClick: (product: Product) => void): void {
    console.log("ProductsGrid.render() - Iniciando con", products.length, "productos");
    this.onProductClick = onProductClick;
    this.containerElement.innerHTML = "";

    if (products.length === 0) {
      console.warn("No hay productos para renderizar");
      return;
    }

    // Agrupar productos por tipo
    const productsByType = this.groupProductsByType(products);
    console.log("Productos agrupados por tipo:", productsByType);

    // Renderizar cada grupo
    Object.entries(productsByType).forEach(([typeId, typeProducts]) => {
      console.log(`Creando sección para tipo ${typeId} con ${typeProducts.length} productos`);
      const section = this.createTypeSection(parseInt(typeId), typeProducts);
      this.containerElement.appendChild(section);
    });
    console.log("ProductsGrid.render() - Completado");
  }

  /**
   * Agrupar productos por tipo
   */
  private groupProductsByType(products: Product[]): Record<number, Product[]> {
    return products.reduce((acc, product) => {
      const typeId = product.productTypeId;
      if (!acc[typeId]) {
        acc[typeId] = [];
      }
      acc[typeId].push(product);
      return acc;
    }, {} as Record<number, Product[]>);
  }

  /**
   * Crear sección para un tipo de producto
   */
  private createTypeSection(typeId: number, products: Product[]): HTMLDivElement {
    const section = document.createElement("div");
    const typeName = this.productTypeNames[typeId] || `Tipo ${typeId}`;
    
    section.classList.add("w-100");
    section.setAttribute("data-product-type", typeName);

    // Título de la sección
    const title = document.createElement("h4");
    title.classList.add("mb-3", "mt-2");
    title.textContent = typeName;
    section.appendChild(title);

    // Contenedor de productos
    const productsContainer = document.createElement("div");
    productsContainer.classList.add("d-flex", "flex-wrap", "gap-2", "mb-4");

    products.forEach((product) => {
      const card = this.createProductCard(product);
      productsContainer.appendChild(card);
    });

    section.appendChild(productsContainer);
    return section;
  }

  /**
   * Crear tarjeta de producto
   */
  private createProductCard(product: Product): HTMLDivElement {
    const card = document.createElement("div");
    card.classList.add("prod-card", "fourth_color", "card");
    card.setAttribute(
      "style",
      "width: 18.7rem; height:10rem; user-select: none !important;"
    );

    // Guardar datos del producto en atributos
    card.setAttribute("prodId", product.productId.toString());
    card.setAttribute("prodName", product.name);
    card.setAttribute("prodPrice", product.price.toString());    
    card.setAttribute("prodType", product.productTypeId.toString());
    card.setAttribute("prodQuantity", "1");

    card.innerHTML = `
      <div class="card-body text-center align-content-center">
        <h5 class="card-title">${product.name}</h5>
      </div>
    `;

    // Event listener para click
    card.addEventListener("click", () => {
      if (this.onProductClick) {
        this.onProductClick(product);
      }
    });

    return card;
  }

  /**
   * Limpiar grilla
   */
  clear(): void {
    this.containerElement.innerHTML = "";
  }
}
