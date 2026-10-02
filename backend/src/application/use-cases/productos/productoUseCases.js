import { Producto } from "../../../domain/entities/Producto.js";

export class ProductoUseCases {

    constructor(productoRepository) {
        this.productoRepository = productoRepository;
    }

    async obtenerTodos() {
        return await this.productoRepository.obtenerTodos();
    }

    async obtenerPorId(id) {
        return await this.productoRepository.obtenerPorId(id);
    }

    async crear(datos) {

        if (!datos.nombre) {
            throw new Error("El nombre es obligatorio");
        }

        if (datos.precio === undefined || datos.precio < 0) {
            throw new Error("El precio no puede ser negativo");
        }

        if (datos.stock === undefined || datos.stock < 0) {
            throw new Error("El stock no puede ser negativo");
        }

        const producto = new Producto({
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            precio: datos.precio,
            stock: datos.stock
        });

        return await this.productoRepository.crear(producto);
    }

    async actualizar(id, datos) {

        const producto =
            await this.productoRepository.obtenerPorId(id);

        if (!producto) {
            throw new Error("Producto no encontrado");
        }

        if (datos.precio < 0 || datos.stock < 0) {
            throw new Error("Precio y stock no pueden ser negativos");
        }

        return await this.productoRepository.actualizar(id, {
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            precio: datos.precio,
            stock: datos.stock
        });
    }

    async eliminar(id) {

        const eliminado =
            await this.productoRepository.eliminar(id);

        if (!eliminado) {
            throw new Error("Producto no encontrado");
        }

        return true;
    }
}
