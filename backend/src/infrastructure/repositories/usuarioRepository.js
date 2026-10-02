import pool from "../database/database.js";

export class UsuarioRepository {

    async obtenerTodos() {
        const [rows] = await pool.query(`
            SELECT id, nombre, email, rol, created_at
            FROM usuarios
            ORDER BY id
        `);

        return rows;
    }

    async obtenerPorId(id) {
        const [rows] = await pool.query(
            `SELECT id, nombre, email, rol, created_at
             FROM usuarios
             WHERE id = ?`,
            [id]
        );

        return rows[0];
    }

    async obtenerPorEmail(email) {
        const [rows] = await pool.query(
            `SELECT *
             FROM usuarios
             WHERE email = ?`,
            [email]
        );

        return rows[0];
    }

    async crear(usuario) {
        const [result] = await pool.query(
            `INSERT INTO usuarios
             (nombre, email, password_hash, rol)
             VALUES (?, ?, ?, ?)`,
            [
                usuario.nombre,
                usuario.email,
                usuario.passwordHash,
                usuario.rol
            ]
        );

        return this.obtenerPorId(result.insertId);
    }

    async actualizar(id, usuario) {
        await pool.query(
            `UPDATE usuarios
             SET nombre = ?, email = ?, rol = ?
             WHERE id = ?`,
            [
                usuario.nombre,
                usuario.email,
                usuario.rol,
                id
            ]
        );

        return this.obtenerPorId(id);
    }

    async eliminar(id) {
        const [result] = await pool.query(
            `DELETE FROM usuarios WHERE id = ?`,
            [id]
        );

        return result.affectedRows > 0;
    }
}
