import type { Mesa, Cuenta } from "../types/mesa";
import { BACKEND_API_URL } from "../config/api";

/**
 * Servicio para manejar todas las llamadas API relacionadas con mesas y cuentas
 */
export class MesaApiService {
  private static BASE_URL = BACKEND_API_URL;

  /**
   * Obtener todas las mesas desde el backend
   */
  static async getMesas(): Promise<Mesa[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/tables`);
      if (!response.ok) {
        throw new Error("Error al obtener mesas");
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error en getMesas:", error);
      throw error;
    }
  }

  /**
   * Crear una nueva cuenta en una mesa
   */
  static async createBill(nuevaCuenta: Omit<Cuenta, 'billId'>): Promise<Cuenta> {
    try {
      const response = await fetch(`${this.BASE_URL}/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaCuenta),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear la cuenta");
      }

      const data = await response.json();
      return {
        billId: data.data.billId,
        cashRegister: data.data.cashRegisterId,
        customer: data.data.customer,
        total: data.data.total,
        date: data.data.date,
        tableId: data.data.tableId,
        status: data.data.status,
        ultimaModificacion: data.data.updatedAt,
        detalles: [],
        numeroCuenta: data.data.numeroCuenta,
      };
    } catch (error) {
      console.error("Error en createBill:", error);
      throw error;
    }
  }

  /**
   * Obtener detalles de una cuenta específica
   */
  static async getBillDetails(billId: number): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/bill-details/bill/${billId}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener detalles de la cuenta");
      }
      const details = await response.json();
      return details.data || [];
    } catch (error) {
      console.error("Error en getBillDetails:", error);
      throw error;
    }
  }

  /**
   * Cerrar todas las cuentas de una mesa
   */
  static async closeTableBills(tableId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/bills/table/${tableId}/close`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al cerrar cuentas");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en closeTableBills:", error);
      throw error;
    }
  }
}
