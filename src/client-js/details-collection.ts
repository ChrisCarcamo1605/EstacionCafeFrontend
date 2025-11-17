

export class DetailsCollection {

    constructor(private details:any[]){

    }

    //BORRAR DETAIL
   deleteDetail(name: string):any[] {
    const detailToDelete = this.details.find((detail) => detail.name === name);
    
    // Solo eliminar si es editable
    if (detailToDelete && detailToDelete.isEditable) {
      this.details = this.details.filter((detail) => detail.name !== name);
    } else {
      console.warn(`No se puede eliminar el detalle "${name}" porque no es editable o no existe`);
    }
    
    return this.details;
  }

  //CAMBIAR CANTIDAD
  changeQuantity(name: string, delta: number):any[] {
    let detail =  this.details.find((x) => x.name === name);
    console.log(this.details)
 
    const newQuantity = detail.quantity + delta;
    console.log(`Cantidad original: ${detail.originalQuantity} , Cantidad Nueva ${newQuantity}`)

    if(!detail.isEditable && detail.originalQuantity < newQuantity) {
          detail.quantity += delta;
          detail.subTotal = detail.quantity * detail.price;
    } else if(detail.isEditable){
          detail.quantity += delta;

          if (detail.quantity <= 0) {
                 this.deleteDetail(detail.name);
                 return this.details;
          } else {
            detail.subTotal = detail.quantity * detail.price;
          }
    }
    return this.details;
  }
}