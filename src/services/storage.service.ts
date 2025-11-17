import type { Mesa, Cuenta } from "../types/mesa";

export class StorageService {
  private static MESA_KEY = "mesaSeleccionada";
  private static CUENTA_KEY = "billSeleccionada";

  /**
   * Obtener mesa seleccionada desde sessionStorage
   */
  static getMesaSeleccionada(): Mesa | null {
    try {
      const mesaData = sessionStorage.getItem(this.MESA_KEY);
      if (mesaData) {
        return JSON.parse(mesaData);
      }
      return null;
    } catch (error) {
      console.error("Error al obtener mesa:", error);
      return null;
    }
  }

  /**
   * Obtener cuenta seleccionada desde sessionStorage
   */
  static getCuentaSeleccionada(): Cuenta | null {
    try {
      const cuentaData = sessionStorage.getItem(this.CUENTA_KEY);
      if (cuentaData) {
        return JSON.parse(cuentaData);
      }
      return null;
    } catch (error) {
      console.error("Error al obtener cuenta:", error);
      return null;
    }
  }

  /**
   * Guardar mesa en sessionStorage
   */
  static setMesa(mesa: Mesa): void {
    try {
      sessionStorage.setItem(this.MESA_KEY, JSON.stringify(mesa));
    } catch (error) {
      console.error("Error al guardar mesa:", error);
    }
  }

  /**
   * Guardar cuenta en sessionStorage
   */
  static setCuenta(cuenta: Cuenta): void {
    try {
      sessionStorage.setItem(this.CUENTA_KEY, JSON.stringify(cuenta));
    } catch (error) {
      console.error("Error al guardar cuenta:", error);
    }
  }

  /**
   * Limpiar sessionStorage
   */
  static clearSession(): void {
    sessionStorage.clear();
  }

  /**
   * Verificar si hay datos en sessionStorage
   */
  static hasData(): boolean {
    return (
      sessionStorage.getItem(this.MESA_KEY) !== null &&
      sessionStorage.getItem(this.CUENTA_KEY) !== null
    );
  }
}
