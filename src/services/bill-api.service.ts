import type { Detail, Product } from "../types/detail.interface";
import { BACKEND_API_URL } from "../config/api";

export class BillApiService {
  private static BASE_URL = BACKEND_API_URL;

  /**
   * Actualizar una cuenta existente
   */
  static async updateBill(
    billId: number,
    data: { status: string; total: number }
  ): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/bills/${billId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message)
        throw new Error(error.message || "Error al actualizar la cuenta");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en updateBill:", error);
      throw error;
    }
  }

  /**
   * Crear detalles de cuenta
   */
  static async createBillDetails(
    billId: number,
    details: Detail[]
  ): Promise<any> {
    try {
      const payload = {
        billId: billId,
        billDetails: details,
      };

      const response = await fetch(`${this.BASE_URL}/bill-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear detalles de cuenta");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en createBillDetails:", error);
      throw error;
    }
  }

  /**
   * Obtener productos disponibles
   */
  static async getProducts(): Promise<Product[]> {
    // Datos estáticos de ejemplo
    return [
      // Tipo 1: Café
      { productId: 1, name: "Café Americano", price: 25, productTypeId: 1 },
      { productId: 2, name: "Capuchino", price: 30, productTypeId: 1 },
      { productId: 3, name: "Espresso", price: 22, productTypeId: 1 },
      { productId: 4, name: "Latte", price: 28, productTypeId: 1 },
      { productId: 5, name: "Mocha", price: 32, productTypeId: 1 },
      { productId: 6, name: "Café con Leche", price: 27, productTypeId: 1 },
      // Tipo 2: Té
      { productId: 7, name: "Té Verde", price: 20, productTypeId: 2 },
      { productId: 8, name: "Té Negro", price: 18, productTypeId: 2 },
      { productId: 9, name: "Té Chai", price: 24, productTypeId: 2 },
      { productId: 10, name: "Té de Manzanilla", price: 19, productTypeId: 2 },
      { productId: 11, name: "Té de Frutas", price: 21, productTypeId: 2 },
      { productId: 12, name: "Té Rojo", price: 23, productTypeId: 2 },
      // Tipo 3: Bebidas Frías
      { productId: 13, name: "Limonada", price: 15, productTypeId: 3 },
      { productId: 14, name: "Agua Fresca", price: 12, productTypeId: 3 },
      { productId: 15, name: "Smoothie Fresa", price: 28, productTypeId: 3 },
      { productId: 16, name: "Smoothie Mango", price: 28, productTypeId: 3 },
      { productId: 17, name: "Frappé", price: 30, productTypeId: 3 },
      { productId: 18, name: "Iced Latte", price: 29, productTypeId: 3 },
      // Tipo 4: Postres
      { productId: 19, name: "Cheesecake", price: 35, productTypeId: 4 },
      { productId: 20, name: "Brownie", price: 22, productTypeId: 4 },
      { productId: 21, name: "Tarta de Manzana", price: 30, productTypeId: 4 },
      { productId: 22, name: "Muffin", price: 18, productTypeId: 4 },
      { productId: 23, name: "Croissant", price: 20, productTypeId: 4 },
      { productId: 24, name: "Galleta", price: 10, productTypeId: 4 },
      // Tipo 5: Snacks
      { productId: 25, name: "Sandwich Jamón", price: 32, productTypeId: 5 },
      { productId: 26, name: "Sandwich Pollo", price: 34, productTypeId: 5 },
      { productId: 27, name: "Wrap Vegetal", price: 28, productTypeId: 5 },
      { productId: 28, name: "Panini", price: 30, productTypeId: 5 },
      { productId: 29, name: "Tostada", price: 16, productTypeId: 5 },
      { productId: 30, name: "Empanada", price: 20, productTypeId: 5 }
    ];
    // try {
    //   const response = await fetch(`${this.BASE_URL}/products`, {
    //     method: "GET",
    //     headers: { "Content-Type": "application/json" },
    //   });
    //   if (!response.ok) {
    //     throw new Error("Error al obtener productos");
    //   }
    //   const data = await response.json();
    //   return data.data || [];
    // } catch (error) {
    //   console.error("Error en getProducts:", error);
    //   throw error;
    // }
  }

  /**
   * Obtener tipos de productos disponibles
   */
  static async getProductTypes(): Promise<any[]> {
    // Datos estáticos de ejemplo
    return [
      { productTypeId: 1, name: "Café" },
      { productTypeId: 2, name: "Té" },
      { productTypeId: 3, name: "Bebidas Frías" },
      { productTypeId: 4, name: "Postres" },
      { productTypeId: 5, name: "Snacks" }
    ];
    // try {
    //   const response = await fetch(`${this.BASE_URL}/product-type`, {
    //     method: "GET",
    //     headers: { "Content-Type": "application/json" },
    //   });
    //   if (!response.ok) {
    //     throw new Error("Error al obtener tipos de productos");
    //   }
    //   const data = await response.json();
    //   return data.data || [];
    // } catch (error) {
    //   console.error("Error en getProductTypes:", error);
    //   throw error;
    // }
  }
}
