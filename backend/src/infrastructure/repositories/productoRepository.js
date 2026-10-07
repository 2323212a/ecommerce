import pool from "../database/database.js";

export class ProductoRepository {

    async obtenerTodos() {
        const { rows } = await pool.query(`
            SELECT id, nombre, descripcion, precio, stock, created_at
            FROM productos
            ORDER BY id
        `);

        return rows;
    }

    async obtenerPorId(id) {
        const { rows } = await pool.query(
            `SELECT id, nombre, descripcion, precio, stock, created_at
             FROM productos
             WHERE id = $1`,
            [id]
        );

        return rows[0];
    }

    async crear(producto) {
        const { rows } = await pool.query(
            `INSERT INTO productos
             (nombre, descripcion, precio, stock)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [
                producto.nombre,
                producto.descripcion,
                producto.precio,
                producto.stock
            ]
        );

        return this.obtenerPorId(rows[0].id);
    }

    async actualizar(id, producto) {
        await pool.query(
            `UPDATE productos
             SET nombre = $1, descripcion = $2, precio = $3, stock = $4
             WHERE id = $5`,
            [
                producto.nombre,
                producto.descripcion,
                producto.precio,
                producto.stock,
                id
            ]
        );

        return this.obtenerPorId(id);
    }

    async eliminar(id) {
        const result = await pool.query(
            `DELETE FROM productos
             WHERE id = $1`,
            [id]
        );

        return result.rowCount > 0;
    }
}
