import pool from "../database/database.js";

export class UsuarioRepository {

    async obtenerTodos() {
        const { rows } = await pool.query(`
            SELECT id, nombre, email, rol, created_at
            FROM usuarios
            ORDER BY id
        `);

        return rows;
    }

    async obtenerPorId(id) {
        const { rows } = await pool.query(
            `SELECT id, nombre, email, rol, created_at
             FROM usuarios
             WHERE id = $1`,
            [id]
        );

        return rows[0];
    }

    async obtenerPorEmail(email) {
        const { rows } = await pool.query(
            `SELECT *
             FROM usuarios
             WHERE email = $1`,
            [email]
        );

        return rows[0];
    }

    async crear(usuario) {
        const { rows } = await pool.query(
            `INSERT INTO usuarios
             (nombre, email, password_hash, rol)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [
                usuario.nombre,
                usuario.email,
                usuario.passwordHash,
                usuario.rol
            ]
        );

        return this.obtenerPorId(rows[0].id);
    }

    async actualizar(id, usuario) {
        await pool.query(
            `UPDATE usuarios
             SET nombre = $1, email = $2, rol = $3
             WHERE id = $4`,
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
        const result = await pool.query(
            `DELETE FROM usuarios WHERE id = $1`,
            [id]
        );

        return result.rowCount > 0;
    }
}
