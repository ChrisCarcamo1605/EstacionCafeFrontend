

export class DetailsCollection {

    constructor(private details:any[]){

    }

    //BORRAR DETAIL
   deleteDetail(name: string):any[] {
    this.details =  this.details.filter((detail) => detail.name !== name);
    return this.details;
  }

  //CAMBIAR CANTIDAD
  changeQuantity(name: string, delta: number) {
    let detail =  this.details.find((x) => x.name === name);

    if (!detail) return;

    detail.quantity += delta;
    console.log(detail.quantity);
    if (detail.quantity <= 0) {
       this.details =  this.details.filter((d) => d.name !== name);
    } else {
      detail.subTotal = detail.quantity * detail.price;
    }
  }
}