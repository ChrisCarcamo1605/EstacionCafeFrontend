interface Detail {
  name: string;
  quantity: number;
  price: number;
  subTotal: number;
}

document.addEventListener("DOMContentLoaded", async (x) => {
  x.preventDefault();

  let products = [];
  let details: Array<Detail> = [];

  let cardContainer = document.querySelector("#products_container");
  let billBar = document.querySelector(".bill-bar tbody");
  let total = document.querySelector(".total h5");

  const container = document.querySelector(".container-fluid");
  const userDataStr = container?.getAttribute("data-user");

  //BORRAR DETAIL
  function deleteDetail(name: string) {
    details = details.filter((detail) => detail.name !== name);
    console.log("BORRANDO: " + name);
    console.log(details);

    renderBill();
  }

  //FINALIZAR ORDEN
  const finishOrderBtn = document.querySelector("#finishOrder");
  finishOrderBtn?.addEventListener("click", async (e: any) => {
    try {
      const aperture = document
        .querySelector("#aperturaGroup")
        ?.getAttribute("data-aperture");
      const totalAmount = details.reduce((acc, det) => acc + det.subTotal, 0);

      const response = await fetch("http://localhost:3484/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cashRegister: 1,
          customer: userDataStr,
          date: aperture,
          total: totalAmount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Orden creada:", data);
        window.location.href = "/home";
      } else {
        console.log(await response.json());
      }
    } catch (error: any) {
      console.log(error.message);
    }
  });

  function changeQuantity(name: string, delta: number) {
    let detail = details.find((x) => x.name === name);

    if (!detail) return;

    detail.quantity += delta;
    console.log(detail.quantity);
    if (detail.quantity <= 0) {
      details = details.filter((d) => d.name !== name);
    } else {
      detail.subTotal = detail.quantity * detail.price;
    }
    renderBill();
  }

  function addQuantityListeners() {
    let incrementBtns = document.querySelectorAll(".increment-btn");
    incrementBtns.forEach((btn: any) => {
      btn.addEventListener("click", (e: any) => {
        e.stopPropagation();
        const element = e.currentTarget as HTMLElement;
        const name = element.getAttribute("data-name");
        if (name) changeQuantity(name, 1);
      });
    });

    let decreaseBtns = document.querySelectorAll(".decrease-btn");
    decreaseBtns.forEach((btn: any) => {
      btn.addEventListener("click", (e: any) => {
        e.stopPropagation();
        const element = e.currentTarget as HTMLElement;
        const name = element.getAttribute("data-name");
        if (name) changeQuantity(name, -1);
      });
    });

    document.querySelectorAll(".deleteBtn").forEach((x) => {
      x.addEventListener("click", (e: any) => {
        e.stopPropagation();
        const element = e.currentTarget as HTMLElement;
        const name = element.getAttribute("data-name");
        console.log("detail a borrar: " + name);
        if (name) deleteDetail(name);
      });
    });
  }

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

  function addProductToBill(element: HTMLDivElement) {
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
        name: name,
        quantity: quantity,
        price: price,
        subTotal: subTotal,
      };
      details.push(newDetail);
    }
    renderBill();
  }

  const response = await fetch("http://localhost:3484/api/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const data = await response.json();
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
