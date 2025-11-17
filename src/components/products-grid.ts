import type { Product } from "../types/detail.interface";

export class ProductsGrid {
  private containerElement: HTMLElement;
  private onProductClick: ((product: Product) => void) | null = null;

  constructor(containerElement: HTMLElement) {
    this.containerElement = containerElement;
  }

  /**
   * Renderizar grilla de productos
   */
  render(products: Product[], onProductClick: (product: Product) => void): void {
    this.onProductClick = onProductClick;
    this.containerElement.innerHTML = "";

    products.forEach((product) => {
      const card = this.createProductCard(product);
      this.containerElement.appendChild(card);
    });
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
