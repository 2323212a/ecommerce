export class Producto {
    constructor({
        id = null,
        nombre,
        descripcion = null,
        precio,
        stock = 0,
        createdAt = null
    }) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.createdAt = createdAt;
    }
}
