import type { Detail, BillDetail } from "../types/detail.interface";

export class BillFormatter {
  /**
   * Formatear fecha para mostrar en UI
   * Formato: DD/MM/YYYY HH:mm
   */
  static formatDate(fecha: Date | string): string {
    const date = typeof fecha === "string" ? new Date(fecha) : fecha;
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  /**
   * Transformar detalles locales a formato de API
   */
  static mapDetailsToBillDetails(
    details: Detail[],
    billId: number
  ): BillDetail[] {
    return details.map((det, index) => ({
      detalleId: index + 1,
      billId: billId,
      productoId: det.productId,
      nombreProducto: det.name,
      cantidad: det.quantity,
      precioUnitario: det.price,
      subtotal: det.subTotal,
    }));
  }

  /**
   * Transformar detalles de DB a formato local
   */
  static mapDbDetailsToLocal(dbDetails: any[]): Detail[] {
    return dbDetails.map((det) => ({
      productId: det.productId || det.productoId,
      name: det.name || det.nombreProducto,
      quantity: det.quantity || det.cantidad,
      price: det.price || det.precioUnitario,
      subTotal: det.subTotal || det.subtotal,
      isEditable: false,
      originalQuantity: det.quantity || det.cantidad,
    }));
  }

  /**
   * Calcular total de detalles
   */
  static calculateTotal(details: Detail[]): number {
    return details.reduce((acc, det) => acc + det.subTotal, 0);
  }

  /**
   * Formatear precio con símbolo de dólar
   */
  static formatPrice(amount: number): string {
    return `$ ${amount.toFixed(2)}`;
  }
}
