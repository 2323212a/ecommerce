import pool from "../../infrastructure/database/database.js";
export class PedidosUseCases {

    async crear(datos) {

        if (!datos.usuarioId || !datos.productos?.length) {
            throw new Error("Usuario y productos son obligatorios");
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            let total = 0;
            const detalles = [];

            for (const item of datos.productos) {

                const [rows] = await connection.query(
                    `SELECT id, nombre, precio, stock
                     FROM productos
                     WHERE id = ?
                     FOR UPDATE`,
                    [item.productoId]
                );

                const producto = rows[0];

                if (!producto) {
                    throw new Error(
                        `Producto ${item.productoId} no encontrado`
                    );
                }

                if (item.cantidad <= 0) {
                    throw new Error("La cantidad debe ser mayor a 0");
                }

                if (producto.stock < item.cantidad) {
                    throw new Error(
                        `Stock insuficiente para ${producto.nombre}`
                    );
                }

                const subtotal =
                    Number(producto.precio) * Number(item.cantidad);

                total += subtotal;

                detalles.push({
                    productoId: producto.id,
                    cantidad: item.cantidad,
                    precio: producto.precio
                });

                await connection.query(
                    `UPDATE productos
                     SET stock = stock - ?
                     WHERE id = ?`,
                    [item.cantidad, producto.id]
                );
            }

            const [pedido] = await connection.query(
                `INSERT INTO pedidos
                 (usuario_id, total, estado)
                 VALUES (?, ?, 'pendiente')`,
                [datos.usuarioId, total]
            );

            for (const detalle of detalles) {
                await connection.query(
                    `INSERT INTO detalle_pedido
                     (pedido_id, producto_id, cantidad, precio_unitario)
                     VALUES (?, ?, ?, ?)`,
                    [
                        pedido.insertId,
                        detalle.productoId,
                        detalle.cantidad,
                        detalle.precio
                    ]
                );
            }

            await connection.commit();

            return {
                id: pedido.insertId,
                usuarioId: datos.usuarioId,
                total,
                estado: "pendiente",
                detalles
            };

        } catch (error) {

            await connection.rollback();
            throw error;

        } finally {
            connection.release();
        }
    }

    async obtenerTodos() {
        const [rows] = await pool.query(`
            SELECT * FROM pedidos
            ORDER BY id DESC
        `);

        return rows;
    }

    async obtenerPorId(id) {

        const [pedidos] = await pool.query(
            `SELECT * FROM pedidos WHERE id = ?`,
            [id]
        );

        if (!pedidos[0]) return null;

        const [detalles] = await pool.query(
            `SELECT d.*, p.nombre
             FROM detalle_pedido d
             INNER JOIN productos p
             ON p.id = d.producto_id
             WHERE d.pedido_id = ?`,
            [id]
        );

        return {
            ...pedidos[0],
            detalles
        };
    }

    async actualizar(id, estado) {

        const [result] = await pool.query(
            `UPDATE pedidos SET estado = ? WHERE id = ?`,
            [estado, id]
        );

        if (!result.affectedRows) {
            throw new Error("Pedido no encontrado");
        }

        return this.obtenerPorId(id);
    }

    async eliminar(id) {

        const [result] = await pool.query(
            `DELETE FROM pedidos WHERE id = ?`,
            [id]
        );

        if (!result.affectedRows) {
            throw new Error("Pedido no encontrado");
        }

        return true;
    }
}
