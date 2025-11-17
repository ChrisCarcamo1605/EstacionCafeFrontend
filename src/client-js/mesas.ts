import { Alert } from "bootstrap";
import type { Mesa, Cuenta } from "../types/mesa";

// CONSTANTES DE CONFIGURACIÓN
const API_BASE_URL = "http://localhost:3484/api";
const zoneS = ["A", "B", "C", "D", "E"];
const MESAS_POR_zone = 15; // 3 columnas x 5 filas

// VARIABLES GLOBALES
let mesas: Mesa[] = [];
let mesaSeleccionada: Mesa | null = null;
let billseleccionada: Cuenta | null = null;
const user = parseInt(document.querySelector("#tables_container")?.getAttribute("data-user")||"0") || 0;

// ELEMENTOS DEL DOM
let tablesContainer: HTMLElement | null;
let inputs: {
  customer: HTMLInputElement | null;
  mesa: HTMLInputElement | null;
  date: HTMLInputElement | null;
  ultimaVezAbierto: HTMLInputElement | null;
};
let buttons: {
  verMesa: HTMLButtonElement | null;
  cerrarbills: HTMLButtonElement | null;
};

document.addEventListener("DOMContentLoaded", async () => {
  initializeElements();
  await fetchMesas();
  renderMesas();
  setupEventListeners();
});

// INICIALIZAR ELEMENTOS DEL DOM
function initializeElements() {
  tablesContainer = document.querySelector("#tables_container");
  
  // Esperar a que el DOM esté completamente cargado
  const sidebarContent = document.querySelector("#sidebar-content");
  
  inputs = {
    customer: sidebarContent?.querySelector(".data-groupd:nth-child(2) input") as HTMLInputElement,
    mesa: sidebarContent?.querySelector(".data-groupd:nth-child(3) input") as HTMLInputElement,
    date: sidebarContent?.querySelector(".data-groupd:nth-child(4) input") as HTMLInputElement,
    ultimaVezAbierto: sidebarContent?.querySelector(".data-groupd:nth-child(5) input") as HTMLInputElement,
  };
  buttons = {
    verMesa: document.querySelector("#finishOrder") as HTMLButtonElement,
    cerrarbills: document.querySelector("#closeOrder") as HTMLButtonElement,
  };

  // Deshabilitar inputs (solo lectura)
  Object.values(inputs).forEach((input) => {
    if (input) input.readOnly = true;
  });
  
}

// FETCH MESAS DESDE EL BACKEND
async function fetchMesas() {
  try {
    // TODO: Reemplazar con tu endpoint real cuando esté disponible
     const response = await fetch(`${API_BASE_URL}/tables`);
     if (response.ok) {
       const data = await response.json();
      mesas = data.data;
     }

    // DATOS MOCK PARA DESARROLLO (eliminar cuando tengas el backend)
  } catch (error) {
    console.error("Error al cargar mesas:", error);
    // Usar datos mock en caso de error
    mesas = generateMockMesas();
  }
}

// GENERAR MESAS MOCK (temporal para desarrollo)
function generateMockMesas(): Mesa[] {
  const mockMesas: Mesa[] = [];
  const nombresClientes = [
    "Christian Carcamo",
    "Pablo Escobar",
    "El Chapo",
    "Messi",
    "Ronaldo",
    "Zidane",
    "Bukele",
    "Maradona",
  ];

  zoneS.forEach((zone) => {
    for (let i = 1; i <= MESAS_POR_zone; i++) {
      const tableId = `${zone}${i}`;
      const tieneClientes = Math.random() > 0.6; // 40% de mesas ocupadas
      const numbills = tieneClientes ? Math.floor(Math.random() * 3) + 1 : 0; // 1-3 bills

      const bills: Cuenta[] = [];
      if (tieneClientes) {
        for (let j = 0; j < numbills; j++) {
          const date = new Date();
          date.setHours(date.getHours() - Math.floor(Math.random() * 3));
          
          bills.push({
            billId: parseInt(`${zone.charCodeAt(0)}${i}${j}`),
            tableId: tableId,
            cashRegister:user,
            customer: nombresClientes[Math.floor(Math.random() * nombresClientes.length)],
            date: date.toISOString(),
            ultimaModificacion: new Date().toISOString(),
            status: "open",
            detalles: [],
            total: Math.random() * 100 + 10,
            numeroCuenta: j + 1,
          });
        }
      }

      mockMesas.push({
        tableId: tableId,
        zone: `Zona ${zone}`,
        status: tieneClientes ? "ocupada" : "disponible",
        bills: bills,
        numeroMesa: i,
      });
    }
  });
  return mockMesas;
}

// RENDERIZAR TODAS LAS MESAS
function renderMesas() {
  if (!tablesContainer) return;
  
  tablesContainer.innerHTML = "";
  
  zoneS.forEach((zone) => {
    const mesaszone = mesas.filter((m) => m.zone === `ZONA ${zone}`);
    if (mesaszone.length === 0) return;

    // Crear sección de zone
    const zoneSection = document.createElement("div");
    zoneSection.className = "w-100 mb-3";
    zoneSection.innerHTML = `
      <h4 class="fw-bold mb-2" style="color: #482E21;">zone ${zone}</h4>
      <div class="zone-grid d-flex flex-wrap gap-2"></div>
    `;
    const zoneGrid = zoneSection.querySelector(".zone-grid");
    // Renderizar mesas de la zone
    mesaszone.forEach((mesa) => {
      const mesaCard = createMesaCard(mesa);
      zoneGrid?.appendChild(mesaCard);
    });

    if (tablesContainer) {
      tablesContainer.appendChild(zoneSection);
    }
  });
}

// CREAR CARD DE MESA
function createMesaCard(mesa: Mesa): HTMLElement {
  const card = document.createElement("div");
  card.className = "mesa-card";
  card.setAttribute("data-mesa-id", mesa.tableId);

  //Filtra cuentas activas en status open
  const cuentasActivas = mesa.bills.filter(c => c.status === 'open');
  const cuentasDraft = mesa.bills.filter(c => c.status === 'draft');
  const statusReal = (cuentasDraft.length > 0 && cuentasActivas.length > 0) || (cuentasDraft.length == 0 && cuentasActivas.length >0) ? 'ocupada' : 
                   cuentasDraft.length > 0 && cuentasActivas.length ==0  ? 'reservada' : 'disponible';

  const statusClass = {
    disponible: "mesa-disponible",
    ocupada: "mesa-ocupada",
    reservada: "mesa-reservada",
  }[statusReal];

  const numerobills = cuentasActivas.length;
  const billsText = numerobills > 0 ? `${numerobills} cuenta${numerobills > 1 ? "s" : ""}` : "";

  // Obtener nombre del primer cliente si existe
  const primerCliente = mesa.bills[0]?.customer || "";
  const nombreCorto = primerCliente.split(" ")[0] || "N/A";


  card.innerHTML = `
    <div class="mesa-content ${statusClass}">
      <div class="mesa-header">
        <h5 class="mesa-nombre fw-bold mb-0">${nombreCorto}</h5>
        <p class="mesa-id mb-0">${mesa.tableId}</p>
      </div>
      ${
        numerobills > 0
          ? `<div class="mesa-footer">
              <small class="bills-badge">${billsText}</small>
            </div>`
          : ""
      }
    </div>
  `;
  card.addEventListener("click", () => selectMesa(mesa));

  return card;
}

function selectMesa(mesa: Mesa) {
  mesaSeleccionada = mesa;

  // Actualizar visual de selección
  document.querySelectorAll(".mesa-card").forEach((card) => {
    card.classList.remove("mesa-selected");
  });
  document.querySelector(`[data-mesa-id="${mesa.tableId}"]`)?.classList.add("mesa-selected");
  updateSidebar(mesa);
}

function updateSidebar(mesa: Mesa) {
  console.log("Actualizando sidebar para mesa:", mesa.tableId, "bills:", mesa.bills.length);
  
  if (mesa.bills.length === 0) {
    // Mesa disponible - mostrar formulario para nueva cuenta
    console.log("Mostrando formulario nueva cuenta");
    showNewAccountForm(mesa);
  } else if (mesa.bills.length === 1) {
    // Una sola cuenta - mostrar detalles directamente
    console.log("Mostrando detalles de cuenta única");
    billseleccionada = mesa.bills[0];
    showAccountDetails(mesa.bills[0]);
  } else {
    // Múltiples bills - mostrar lista de bills
    console.log("Mostrando lista de bills");
    showAccountsList(mesa);
  }
}

// MOSTRAR LISTA DE bills
function showAccountsList(mesa: Mesa) {
  const container = document.querySelector("#sidebar-content");
  if (!container) {
    console.error("No se encontró #sidebar-content");
    return;
  }

  container.innerHTML = `
    <div class="bills-list-container">
      <h5 class="fw-bold mb-3" style="color: #482E21;">Mesa ${mesa.tableId}</h5>
      <p class="text-muted mb-3">${mesa.bills.length} cuenta${mesa.bills.length > 1 ? "s" : ""} activa${mesa.bills.length > 1 ? "s" : ""}</p>
      
      <div class="bills-list">
        ${mesa.bills
          .map(
            (cuenta, index) => `
          <div class="cuenta-item" data-cuenta-id="${cuenta.billId}">
            <div class="cuenta-info">
              <h6 class="fw-bold mb-1">Cuenta #${cuenta.numeroCuenta || index + 1}</h6>
              <p class="mb-1"><strong>Cliente:</strong> ${cuenta.customer}</p>
              <p class="mb-1"><small>Abierta: ${formatTime(cuenta.date)}</small></p>
              <p class="mb-0"><strong>Total: $${Number(cuenta.total || 0).toFixed(2)}</strong></p>
            </div>
            <button class="btn btn-sm fourth_color  select-cuenta-btn" data-cuenta-id="${cuenta.billId}">
              Seleccionar
            </button>
          </div>
        `
          )
          .join("")}
      </div>
      
      <button class="btn w-100 mt-3 third_color nueva-cuenta-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle me-2" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
        </svg>
        Nueva Cuenta
      </button>
         <button id="closeOrder" class="bill-btn w-100 third_color_light mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle me-2" viewBox="0 0 16 16" style="vertical-align: middle;">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
          </svg>
          Cerrar Cuentas
        </button>

    </div>
  `;

  // Event listeners para seleccionar cuenta
  container.querySelectorAll(".select-cuenta-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const billId = parseInt((e.target as HTMLElement).getAttribute("data-cuenta-id") || "0");
      const cuenta = mesa.bills.find((c) => c.billId === billId);
      if (cuenta) {
        billseleccionada = cuenta;
        goToRealizarPedido();
      }
    });
  });

  // Event listener para nueva cuenta
  container.querySelector(".nueva-cuenta-btn")?.addEventListener("click", () => {
    showNewAccountForm(mesa);
  });

  // Event listener para cerrar cuentas
  container.querySelector("#closeOrder")?.addEventListener("click", async () => {
    if (!mesaSeleccionada) return;

    if (confirm(`¿Está seguro de cerrar todas las cuentas de la mesa ${mesaSeleccionada.tableId}?`)) {
      await cerrarbillsMesa(mesaSeleccionada);
    }
  });

  // Ocultar botones principales
  if (buttons.verMesa) buttons.verMesa.style.display = "none";
  if (buttons.cerrarbills) buttons.cerrarbills.style.display = "none";
}

// MOSTRAR DETALLES DE UNA CUENTA
function showAccountDetails(cuenta: Cuenta) {
  // Restaurar la estructura HTML original si fue reemplazada
  const container = document.querySelector("#sidebar-content");
  if (!container) return;
  
  // Verificar si necesitamos restaurar el HTML
  if (!container.querySelector(".data-groupd")) {
    container.innerHTML = `
      <!-- Header del panel -->
      <div class="text-center mb-2">
        <h5 class="fw-bold mb-1" style="color: #482E21;">Información de Mesa</h5>
        <p class="text-muted mb-0" style="font-size: 0.9rem;">Detalles de la cuenta</p>
      </div>

      <!-- Campos de información -->
      <div class="data-groupd d-flex flex-column">
        <label class="fw-bold mb-2" style="color: #482E21;">Nombre de Cliente</label>
        <input class="w-100 border-0 rounded-2 input fw-light" readonly />
      </div>
      <div class="data-groupd d-flex flex-column">
        <label class="fw-bold mb-2" style="color: #482E21;">Mesa</label>
        <input class="w-100 border-0 rounded-2 input fw-light" readonly />
      </div>
      <div class="data-groupd d-flex flex-column">
        <label class="fw-bold mb-2" style="color: #482E21;">Hora de Apertura</label>
        <input class="w-100 border-0 rounded-2 input fw-light" readonly />
      </div>
      <div class="data-groupd d-flex flex-column">
        <label class="fw-bold mb-2" style="color: #482E21;">Última vez abierto</label>
        <input class="w-100 border-0 rounded-2 input fw-light" readonly />
      </div>

      <!-- Botones de acción -->
      <div class="d-flex flex-column gap-2 mt-3">
        <button id="finishOrder" class="bill-btn w-100 fourth_color">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-circle me-2" viewBox="0 0 16 16" style="vertical-align: middle;">
            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/>
          </svg>
          Ir a Pedido
        </button>
        <button id="closeOrder" class="bill-btn w-100 third_color_light">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle me-2" viewBox="0 0 16 16" style="vertical-align: middle;">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
          </svg>
          Cerrar Cuenta
        </button>
      </div>
    `;
    
    // Re-inicializar referencias a botones
    buttons.verMesa = document.querySelector("#finishOrder") as HTMLButtonElement;
    buttons.cerrarbills = document.querySelector("#closeOrder") as HTMLButtonElement;
    
    // Re-configurar event listeners
    setupEventListeners();
  }
  
  // Actualizar valores
  const nombreInput = container.querySelector(".data-groupd:nth-child(2) input") as HTMLInputElement;
  const mesaInput = container.querySelector(".data-groupd:nth-child(3) input") as HTMLInputElement;
  const aperturaInput = container.querySelector(".data-groupd:nth-child(4) input") as HTMLInputElement;
  const ultimaInput = container.querySelector(".data-groupd:nth-child(5) input") as HTMLInputElement;
  
  if (nombreInput) nombreInput.value = cuenta.customer;
  if (mesaInput) mesaInput.value = mesaSeleccionada?.tableId || "";
  if (aperturaInput) aperturaInput.value = formatDateTime(cuenta.date);
  if (ultimaInput) ultimaInput.value = formatDateTime(cuenta.ultimaModificacion);

  // Mostrar botones
  if (buttons.verMesa) {
    buttons.verMesa.style.display = "block";
  }
  if (buttons.cerrarbills) {
    buttons.cerrarbills.style.display = "block";
  }
}

// MOSTRAR FORMULARIO PARA NUEVA CUENTA
function showNewAccountForm(mesa: Mesa) {
  const container = document.querySelector("#sidebar-content");
  if (!container) {
    console.error("No se encontró #sidebar-content");
    return;
  }

  container.innerHTML = `
    <div class="nueva-cuenta-form">
      <h5 class="fw-bold mb-3" style="color: #482E21;">Nueva Cuenta - Mesa ${mesa.tableId}</h5>
      
      <div class="mb-3">
        <label class="fw-bold mb-2">Nombre del Cliente</label>
        <input type="text" class="form-control" id="nuevo-cliente-input" placeholder="Ingrese nombre del cliente">
      </div>
      
      <div class="mb-3">
        <label class="fw-bold mb-2">Mesa</label>
        <input type="text" class="form-control" value="${mesa.tableId}" readonly>
      </div>
      
      <div class="mb-3">
        <label class="fw-bold mb-2">Hora de Apertura</label>
        <input type="text" class="form-control" value="${formatDateTime(new Date())}" readonly>
      </div>
      
      <button class="btn w-100 fourth_color crear-cuenta-btn">
        Crear Cuenta e Ir a Pedido
      </button>
      
      ${
        mesa.bills.length > 0
          ? `<button class="btn w-100 mt-2 btn-outline-secondary cancelar-btn">
              Cancelar
            </button>`
          : ""
      }
    </div>
  `;

  // Event listener para crear cuenta
  container.querySelector(".crear-cuenta-btn")?.addEventListener("click", async () => {
    const customer = (document.querySelector("#nuevo-cliente-input") as HTMLInputElement)?.value.trim();
    
    if (!customer) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }
    await crearNuevaCuenta(mesa, customer);
  });

  // Event listener para cancelar
  container.querySelector(".cancelar-btn")?.addEventListener("click", () => {
    updateSidebar(mesa);
  });
}

// CREAR NUEVA CUENTA
async function crearNuevaCuenta(mesa: Mesa, customer: string) {
  try {
    const nuevaCuenta: Cuenta = {
      billId: Date.now(), // Temporal, el backend debería generar el ID
      tableId: mesa.tableId,
      cashRegister: user,
      customer: customer,
      date: new Date().toISOString(),
      ultimaModificacion: new Date().toISOString(),
      status: "draft", // 🆕 Crear en estado 'draft' hasta que tenga productos
      detalles: [],
      total: 0,
      numeroCuenta: mesa.bills.length + 1,
    };

    // TODO: Enviar al backend cuando esté disponible
    const response = await fetch(`${API_BASE_URL}/bills`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaCuenta)
   })
      if(response.ok){
        console.log('EL JSON DE CREAR EL BILL: ')
        const data = (await response.json()).data;
                console.log(data);

        billseleccionada = {
          cashRegister: data.cashRegisterId,
          customer: data.customer,
          total: data.total,
          billId: data.billId,
          date: data.date,
          tableId: data.tableId,
          status: data.status,
          ultimaModificacion: data.updatedAt,
          detalles: []
        };
        console.log('EL BILL SELECTED ES: ');
        console.log(billseleccionada);
         goToRealizarPedido();
    }else{
      console.log(await response.json());
    }
  } catch (error) {
    console.error("Error al crear cuenta:", error);
    alert("Error al crear la cuenta. Por favor intente nuevamente.");
  }
}

// IR A REALIZAR PEDIDO
async function goToRealizarPedido() {
  // Guardar en sessionStorage para usar en la vista de pedido
  const details = await fetch(`${API_BASE_URL}/details/${billseleccionada?.billId}`);
  billseleccionada!.detalles = details.ok ? await details.json() : null;;
  sessionStorage.setItem("mesaSeleccionada", JSON.stringify(mesaSeleccionada));
  sessionStorage.setItem("billSeleccionada", JSON.stringify(billseleccionada));

  // Redirigir a la vista de pedido
  window.location.href = "/realizar-pedido/pedido";
}

// SETUP EVENT LISTENERS
function setupEventListeners() {
  // Botón Ver Mesa / Ir a Pedido
  buttons.verMesa?.addEventListener("click", () => {
    if (billseleccionada) {
      goToRealizarPedido();
    }
  });

  // Botón Cerrar bills
  buttons.cerrarbills?.addEventListener("click", async () => {
    if (!mesaSeleccionada) return;

    if (confirm(`¿Está seguro de cerrar todas las bills de la mesa ${mesaSeleccionada.tableId}?`)) {
      await cerrarbillsMesa(mesaSeleccionada);
    }
  });
}

// CERRAR bills DE LA MESA
async function cerrarbillsMesa(mesa: Mesa) {
  try {
    // TODO: Implementar cierre en el backend
    if(!mesa.tableId){
      alert('NO EXISTE EL TABLE ID');
      return;
    }
    const response = await fetch(`${API_BASE_URL}/bills/table/${mesa.tableId}/close`, {
    method: 'POST'
    });

    if(response.ok){
    // Re-renderizar
    const mesaToUpdate = mesas.find(m=> m.tableId === mesaSeleccionada?.tableId);
    if (mesaToUpdate) {
      mesaToUpdate.status = 'disponible';
      mesaToUpdate.bills = [];
    }
    renderMesas();
    
    // Limpiar panel lateral
    if (inputs.customer) inputs.customer.value = "";
    if (inputs.mesa) inputs.mesa.value = "";
    if (inputs.date) inputs.date.value = "";
    if (inputs.ultimaVezAbierto) inputs.ultimaVezAbierto.value = "";
    }

   console.log(await response.json());
    
  } catch (error) {
    console.error("Error al cerrar bills:", error);
    alert("Error al cerrar las bills. Por favor intente nuevamente.");
  }
}

// UTILIDADES DE FORMATO
function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}