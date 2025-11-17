import type { Detail, Product } from "../types/detail.interface";
import type { Mesa, Cuenta } from "../types/mesa";
import { DetailsCollection } from "../client-js/details-collection";
import { BillApiService } from "../services/bill-api.service";
import { StorageService } from "../services/storage.service";
import { BillFormatter } from "../utils/bill-formatter";
import { MesaApiService } from "../services/mesa-api.service";

export class OrderManager {
  private details: Detail[];
  private detailsCollection: DetailsCollection;
  private cuenta: Cuenta | null;
  private mesa: Mesa | null;
  private onDetailsChange: (() => void) | null = null;
  private userId = document
    .querySelector("#products-container")
    ?.getAttribute("data-user");

  constructor(
    initialDetails: Detail[],
    cuenta: Cuenta | null,
    mesa: Mesa | null
  ) {
    this.details = initialDetails;
    this.detailsCollection = new DetailsCollection(this.details);
    this.cuenta = cuenta;
    this.mesa = mesa;
  }

  /**
   * Configurar callback para cuando cambien los detalles
   */
  setOnDetailsChange(callback: () => void): void {
    this.onDetailsChange = callback;
  }

  /**
   * Obtener detalles actuales
   */
  getDetails(): Detail[] {
    return this.details;
  }

  /**
   * Agregar producto al pedido
   */
  addProduct(product: Product): void {
    const existingDetail = this.details.find(
      (detail) => detail.name === product.name
    );

    if (existingDetail) {
      // Incrementar cantidad si ya existe
      existingDetail.quantity += 1;
      existingDetail.subTotal = existingDetail.quantity * existingDetail.price;
    } else {
      // Crear nuevo detalle
      const newDetail: Detail = {
        productId: product.productId,
        name: product.name,
        quantity: 1,
        price: product.price,
        subTotal: product.price,
        isEditable: true,
        originalQuantity: 0,
      };
      this.details.push(newDetail);
    }

    this.notifyChange();
  }

  /**
   * Incrementar cantidad de un producto
   */
  incrementQuantity(name: string): void {
    this.details = this.detailsCollection.changeQuantity(name, 1);
    this.notifyChange();
  }

  /**
   * Decrementar cantidad de un producto
   */
  decrementQuantity(name: string): void {
    this.details = this.detailsCollection.changeQuantity(name, -1);
    this.notifyChange();
  }

  /**
   * Eliminar detalle
   */
  removeDetail(name: string): void {
    this.details = this.detailsCollection.deleteDetail(name);
    this.notifyChange();
  }

  /**
   * Finalizar orden y enviar al backend
   */
  async finishOrder(): Promise<void> {
    try {
      if (!this.cuenta) {
        const nuevaCuenta: Cuenta = {
          billId: 1,
          tableId: "A1",
          cashRegister: parseInt(this.userId || "0"),
          customer: "Para Llevar",
          date: new Date().toISOString(),
          ultimaModificacion: new Date().toISOString(),
          status: "closed" as const,
          detalles: [],
          total: 0,
          numeroCuenta: 1,
        };

        this.cuenta = await MesaApiService.createBill(nuevaCuenta);
      }

      if (this.details.length === 0) {
        throw new Error("Debe agregar al menos un producto al pedido");
      }

      const totalAmount = BillFormatter.calculateTotal(this.details);

      // Cambiar estado a 'open' si estaba en 'draft'
      const nuevoStatus =
        this.cuenta.status === "draft" && this.details.length > 0
          ? "open"
          : this.cuenta.status;

      // Actualizar cuenta
      await BillApiService.updateBill(this.cuenta.billId, {
        status: nuevoStatus,
        total: totalAmount,
      });

      // Crear detalles
      await BillApiService.createBillDetails(this.cuenta.billId, this.details);

      // Limpiar sesión y redirigir
      StorageService.clearSession();
      alert("Pedido finalizado exitosamente");
      window.location.href = "/realizar-pedido/mesas";
    } catch (error: any) {
      console.error("Error al finalizar pedido:", error);
      alert(error.message || "Error al finalizar el pedido");
      throw error;
    }
  }

  async closeOrder(): Promise<void> {
    const shouldClose = confirm("Esta seguro de cerrar la cuenta?");

    if (shouldClose && this.cuenta) {
      const totalAmount = BillFormatter.calculateTotal(this.details);
      const cuentaActualizada = {
        status: "closed" as const,
        total: totalAmount,
      };
      const response = await BillApiService.updateBill(
        this.cuenta.billId,
        cuentaActualizada
      );
    }

    StorageService.clearSession();
    window.location.href = "/realizar-pedido/mesas";
  }

  /**
   * Guardar cambios y volver a mesas
   */
  saveAndGoBack(): void {
    StorageService.clearSession();
    window.location.href = "/realizar-pedido/mesas";
  }

  /**
   * Notificar cambio en detalles
   */
  private notifyChange(): void {
    if (this.onDetailsChange) {
      this.onDetailsChange();
    }
  }

  /**
   * Verificar si hay cambios sin guardar
   */
  hasUnsavedChanges(): boolean {
    return this.details.some((detail) => detail.isEditable);
  }
}
