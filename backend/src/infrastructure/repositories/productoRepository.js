import pool from "../database/database.js";

export class ProductoRepository {

    async obtenerTodos() {
        const [rows] = await pool.query(`
            SELECT id, nombre, descripcion, precio, stock, created_at
            FROM productos
            ORDER BY id
        `);

        return rows;
    }

    async obtenerPorId(id) {
        const [rows] = await pool.query(
            `SELECT id, nombre, descripcion, precio, stock, created_at
             FROM productos
             WHERE id = ?`,
            [id]
        );

        return rows[0];
    }

    async crear(producto) {
        const [result] = await pool.query(
            `INSERT INTO productos
             (nombre, descripcion, precio, stock)
             VALUES (?, ?, ?, ?)`,
            [
                producto.nombre,
                producto.descripcion,
                producto.precio,
                producto.stock
            ]
        );

        return this.obtenerPorId(result.insertId);
    }

    async actualizar(id, producto) {
        await pool.query(
            `UPDATE productos
             SET nombre = ?, descripcion = ?, precio = ?, stock = ?
             WHERE id = ?`,
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
        const [result] = await pool.query(
            `DELETE FROM productos
             WHERE id = ?`,
            [id]
        );

        return result.affectedRows > 0;
    }
}
