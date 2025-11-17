import { DetailsCollection } from "./details-collection";
import type { Mesa, Cuenta } from "../types/mesa";

interface Detail {
  productId: number,
  name: string;
  quantity: number;
  price: number;
  subTotal: number;
}

document.addEventListener("DOMContentLoaded", async (x) => {
  x.preventDefault();

  let details: Array<Detail> = [];
  const detailsCollection = new DetailsCollection(details); 
  let products = [];

  //ELEMENTS
  let cardContainer = document.querySelector("#products_container");
  let billBar = document.querySelector(".bill-bar tbody");
  let total = document.querySelector(".total h5");
  const container = document.querySelector(".container-fluid");
  const userDataStr = container?.getAttribute("data-user");

  // OBTENER DATOS DE MESA Y CUENTA DESDE sessionStorage
  let mesaSeleccionada: Mesa | null = null;
  let cuentaSeleccionada: Cuenta | null = null;

  try {
    const mesaData = sessionStorage.getItem("mesaSeleccionada");
    const cuentaData = sessionStorage.getItem("billSeleccionada");

    if(mesaData && cuentaData){
          console.log('LA MESA: ' +mesaData, 'EL BILL: ' + cuentaData)
    }else{
      console.log("Mesa y cuenta vacios")
    }

    if (mesaData) mesaSeleccionada = JSON.parse(mesaData);
    if (cuentaData) {
      const cuentaParsed = JSON.parse(cuentaData);
      cuentaSeleccionada = cuentaParsed;

      console.log('la cuenta: ');
      
      console.log(cuentaData);

      // Actualizar información en el BillBar
      if (cuentaParsed) {
        updateBillBarInfo(cuentaParsed, mesaSeleccionada);
        
        // Cargar detalles existentes si los hay
        if (cuentaParsed.detalles && cuentaParsed.detalles.length > 0) {
          details = cuentaParsed.detalles.map((det: Detail) => ({
            productId: det.productId,
            name: det.name,
            quantity: det.quantity,
            price: det.price,
            subTotal: det.subTotal
          }));
          renderBill();
        }
      }
    }
  } catch (error) {
    console.error("Error al cargar datos de mesa/cuenta:", error);
  }

  // FUNCIÓN PARA ACTUALIZAR INFO DEL BILLBAR
  function updateBillBarInfo(cuenta: Cuenta, mesa: Mesa | null) {
    const mesaGroup = document.querySelector("#mesaGroup p");
    const clienteGroup = document.querySelector("#clienteGroup p");
    const aperturaGroup = document.querySelector("#aperturaGroup");
    const aperturaText = aperturaGroup?.querySelector("p");

    if (mesaGroup) mesaGroup.innerHTML = `<strong>Mesa:</strong> ${mesa?.tableId || cuenta.tableId}`;
    if (clienteGroup) clienteGroup.innerHTML = `<strong>Cliente:</strong> ${cuenta.customer}`;
    if (aperturaText) {
      const fecha = new Date(cuenta.date);
      const fechaFormateada = `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()} ${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;
      aperturaText.innerHTML = `<strong>Apertura:</strong> ${fechaFormateada}`;
    }
    if (aperturaGroup) aperturaGroup.setAttribute("data-aperture", cuenta.date.toString());
  }

  //FINALIZAR ORDEN
  const finishOrderBtn = document.querySelector("#finishOrder");
  finishOrderBtn?.addEventListener("click", async (e: any) => {
    try {
      if (!cuentaSeleccionada) {
        alert("No hay cuenta seleccionada");
        return;
      }

      if (details.length === 0) {
        alert("Debe agregar al menos un producto al pedido");
        return;
      }

      const aperture = document
        .querySelector("#aperturaGroup")
        ?.getAttribute("data-aperture");
      const totalAmount = details.reduce((acc, det) => acc + det.subTotal, 0);

      // 🆕 Si la cuenta estaba en 'draft' y ahora tiene productos, cambiarla a 'open'
      const nuevoStatus = cuentaSeleccionada.status === 'draft' && details.length > 0 
        ? 'open' 
        : cuentaSeleccionada.status;

      // Actualizar la cuenta con los nuevos detalles
      const cuentaActualizada = {
        status:nuevoStatus,
        total: totalAmount
      };

      const billJson = JSON.stringify(cuentaActualizada);

      // TODO: Cuando tengas el backend, enviar la actualización
      const responseBill = await fetch(`http://localhost:3484/api/bills/${cuentaSeleccionada.billId}`, {
        method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: billJson,
      });

      if (responseBill.ok) {
        const data = await responseBill.json();
        console.log("Orden creada:", data);
      
      const detailsJSON = JSON.stringify({
       billId: cuentaSeleccionada.billId,
        billDetails: details

       });
       console.log(`EL JSON A ENVIAR ES: ` + detailsJSON);
       console.log("========== DETALLES COMPLETOS ==========");
       console.log(details);
       console.log("========== CADA DETALLE INDIVIDUAL ==========");
       details.forEach((det, index) => {
         console.log(`Detalle ${index + 1}:`, {
           productId: det.productId,
           name: det.name,
           quantity: det.quantity,
           price: det.price,
           subTotal: det.subTotal
         });
       });
       
       
      const responseDetails = await fetch(`http://localhost:3484/api/bill-details`, {
        method: "POST",
       headers: { "Content-Type": "application/json" },
       body:detailsJSON ,
      });

      console.log(detailsJSON)
      console.log(await responseDetails.json())
        alert("Pedido finalizado exitosamente");
        sessionStorage.clear();
        window.location.href = "/realizar-pedido/mesas";
      } else {
        console.log(await responseBill.json());
        alert("Error al crear la orden");
      }
    } catch (error: any) {
      console.log(error.message);
      alert("Error al finalizar el pedido");
    }
  });

  //BOTÓN VOLVER A MESAS
  const backToTablesBtn = document.querySelector("#backToTables");
  backToTablesBtn?.addEventListener("click", () => {
    if (confirm("¿Desea guardar los cambios antes de volver a las mesas?")) {
      // Guardar el estado actual de la cuenta
      if (cuentaSeleccionada && details.length > 0) {
        const totalAmount = details.reduce((acc, det) => acc + det.subTotal, 0);
        
        // 🆕 Cambiar a 'open' si tiene productos y estaba en 'draft'
        const nuevoStatus = cuentaSeleccionada.status === 'draft' && details.length > 0 
          ? 'open' 
          : cuentaSeleccionada.status;
        
        const cuentaActualizada = {
          ...cuentaSeleccionada,
          status: nuevoStatus, // 🆕 Actualizar estado
          detalles: details.map((det, index) => ({
            detalleId: index + 1,
            billId: cuentaSeleccionada!.billId,
            productoId: index + 1,
            nombreProducto: det.name,
            cantidad: det.quantity,
            precioUnitario: det.price,
            subtotal: det.subTotal
          })),
          total: totalAmount,
          ultimaModificacion: new Date().toISOString()
        };

      }
    }
    sessionStorage.clear();
    window.location.href = "/realizar-pedido/mesas";
  });

  //AGREGAR LISTENERS
  function addQuantityListeners() {
    let incrementBtns = document.querySelectorAll(".increment-btn");
    incrementBtns.forEach((btn: any) => {
      btn.addEventListener("click", (e: any) => {
        e.stopPropagation();
        const element = e.currentTarget as HTMLElement;
        const name = element.getAttribute("data-name");
        if (name) {
          detailsCollection.changeQuantity(name, 1);
              renderBill();
            }
      });
    });

    let decreaseBtns = document.querySelectorAll(".decrease-btn");
    decreaseBtns.forEach((btn: any) => {
      btn.addEventListener("click", (e: any) => {
        e.stopPropagation();
        const element = e.currentTarget as HTMLElement;
        const name = element.getAttribute("data-name");
        if (name){  detailsCollection.changeQuantity(name, -1);
          renderBill();
        }
      });
    });

    document.querySelectorAll(".deleteBtn").forEach((x) => {
      x.addEventListener("click", (e: any) => {
        e.stopPropagation();
        const element = e.currentTarget as HTMLElement;
        const name = element.getAttribute("data-name");
        console.log("detail a borrar: " + name);
        if (name){
         details =  detailsCollection.deleteDetail(name);
         renderBill();
       }
      });
    });
  }

//RENDERIZAR BILL
  function renderBill() {
    billBar!.innerHTML = "";

    details.forEach((detail) => {
      let row = document.createElement("tr");
      row.innerHTML = `
            <tr class="align-content-center">
            <th class="fw-normal" scope="col">
              ${detail.name}
            </th>
            <th class="fw-normal gap-2 align-content-center" scope="col">
              <div class="d-flex flex-row gap-2">
                <div class="decrease-btn quantity-btn" data-name="${
                  detail.name
                }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
                    viewBox="0 0 24 24"><path fill="currentColor" d="M18 11H6a2 2 
                    0 0 0 0 4h12a2 2 0 0 0 0-4"/></svg></div>
                     ${detail.quantity}
                 <div class="increment-btn quantity-btn" data-name="${
                   detail.name
                 }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                 viewBox="0 0 24 24"><path fill="currentColor"
                  d="M18 10h-4V6a2 2 0 0 0-4 0l.071 4H6a2 2 0 0 0 0 4l4.071-.071L10 
                  18a2 2 0 0 0 4 0v-4.071L18 14a2 2 0 0 0 0-4"/></svg></div>                 
              </div>
            </th>
            <th class="fw-normal align-content-center" scope="col">
                <strong>$</strong> ${detail.subTotal.toFixed(2)}
            </th>
              <th data-name="${
                detail.name
              }" class="deleteBtn fw-normal align-content-center"  style="width: 50px; cursor:pointer;" scope="col">
                <div >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
               </svg></div>
            </th>
          </tr>`;
      billBar?.appendChild(row);
    });

    total!.innerHTML = `TOTAL <strong>$</strong> ${details
      .reduce((acc, det) => acc + det.subTotal, 0)
      .toFixed(2)}`;
    addQuantityListeners();
  }

  //AÑADIR DETAIL AL ARRAY
  function addProductToBill(element: HTMLDivElement) {
    const productId = parseInt(element.getAttribute("prodId" )||"0");
    const name = element.getAttribute("prodName") || "N/A";
    let quantity = parseFloat(element.getAttribute("prodQuantity") || "0");
    const price: number = parseFloat(element.getAttribute("prodPrice") || "0");
    const subTotal: number = quantity * price;
    let detailExisting = details.find((detail) => detail.name === name);

    if (detailExisting) {
      detailExisting.quantity += 1;
      detailExisting.subTotal = detailExisting.quantity * price;
    } else {
      const newDetail: Detail = {
        productId: productId,
        name: name,
        quantity: quantity,
        price: price,
        subTotal: subTotal,
      };
      details.push(newDetail);
    }
    renderBill();
  }

  //PETICION PARA OBTENER PRODUCTOS
  const responseProds = await fetch("http://localhost:3484/api/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (responseProds.ok) {
    const data = await responseProds.json();
    products = data.data;
  }

  products.forEach((x: any) => {
    const card = document.createElement("div");
    card.classList.add("prod-card");
    card.classList.add("fourth_color");
    card.classList.add("card");
    card.setAttribute(
      "style",
      "width: 18.7rem; height:10rem; user-select: none !important;"
    );
    
    card.setAttribute("prodId",x.productId);
    card.setAttribute("prodName", x.name);
    card.setAttribute("prodPrice", x.price);
    card.setAttribute("prodQuantity", "1");

    card.innerHTML = `
              <div class="card-body text-center align-content-center">
                <h5 class="card-title">${x.name}</h5>
              </div>
          `;
    card.addEventListener("click", async (detail) => {
      addProductToBill(card);
    });
    cardContainer?.append(card);
  });
});
