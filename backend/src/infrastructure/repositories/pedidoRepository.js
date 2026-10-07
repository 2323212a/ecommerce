import pool from "../database/database.js";

export class PedidoRepository {

    async crear(usuarioId, total) {
        const { rows } = await pool.query(
            `INSERT INTO pedidos (usuario_id, total)
             VALUES ($1, $2)
             RETURNING id`,
            [usuarioId, total]
        );

        return rows[0].id;
    }

    async agregarDetalle(pedidoId, productoId, cantidad, precio) {
        await pool.query(
            `INSERT INTO detalle_pedido
             (pedido_id, producto_id, cantidad, precio_unitario)
             VALUES ($1, $2, $3, $4)`,
            [pedidoId, productoId, cantidad, precio]
        );
    }

    async obtenerTodos() {
        const { rows } = await pool.query(`
            SELECT
                p.id,
                p.usuario_id,
                p.fecha,
                p.estado,
                p.total
            FROM pedidos p
            ORDER BY p.id DESC
        `);

        return rows;
    }

    async obtenerPorId(id) {
        const { rows: pedidos } = await pool.query(
            `SELECT * FROM pedidos WHERE id = $1`,
            [id]
        );

        if (!pedidos[0]) return null;

        const { rows: detalles } = await pool.query(
            `SELECT
                d.id,
                d.producto_id,
                pr.nombre AS producto,
                d.cantidad,
                d.precio_unitario
             FROM detalle_pedido d
             INNER JOIN productos pr
                ON pr.id = d.producto_id
             WHERE d.pedido_id = $1`,
            [id]
        );

        return {
            ...pedidos[0],
            detalles
        };
    }

    async actualizarEstado(id, estado) {
        await pool.query(
            `UPDATE pedidos SET estado = $1 WHERE id = $2`,
            [estado, id]
        );

        return this.obtenerPorId(id);
    }

    async eliminar(id) {
        const result = await pool.query(
            `DELETE FROM pedidos WHERE id = $1`,
            [id]
        );

        return result.rowCount > 0;
    }
}
