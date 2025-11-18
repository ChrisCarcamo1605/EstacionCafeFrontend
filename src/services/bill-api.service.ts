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
    try {
      const response = await fetch(`${this.BASE_URL}/products`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Error al obtener productos");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error en getProducts:", error);
      throw error;
    }
  }

  /**
   * Obtener tipos de productos disponibles
   */
  static async getProductTypes(): Promise<any[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/product-type`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Error al obtener tipos de productos");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error en getProductTypes:", error);
      throw error;
    }
  }
}
