import pool from "../../infrastructure/database/database.js";

export class PedidosUseCases {

    constructor({ emailService, usuarioRepository }) {
        this.emailService = emailService;
        this.usuarioRepository = usuarioRepository;
    }

    async crear(datos) {

        if (!datos.usuarioId || !datos.productos?.length) {
            throw new Error("Usuario y productos son obligatorios");
        }

        const connection = await pool.getConnection();
        let pedidoCreado;

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
                    producto: producto.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: Number(producto.precio),
                    subtotal
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
                 VALUES (?, ?, 'Pendiente de Pago')`,
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
                        detalle.precioUnitario
                    ]
                );
            }

            await connection.commit();

            pedidoCreado = {
                id: pedido.insertId,
                usuarioId: datos.usuarioId,
                total,
                estado: "Pendiente de Pago",
                fecha: new Date(),
                detalles
            };

        } catch (error) {

            await connection.rollback();
            throw error;

        } finally {
            connection.release();
        }

        const notificaciones = {
            cliente: false,
            administrador: false
        };
        let cliente = {};

        try {
            cliente = await this.usuarioRepository.obtenerPorId(datos.usuarioId);
        } catch (error) {
            console.error(
                `No se pudo consultar el cliente del pedido #${pedidoCreado.id}:`,
                error
            );
        }

        try {
            if (!cliente?.email) {
                throw new Error("El cliente no tiene un correo electrónico disponible");
            }

            await this.emailService.enviarComprobanteCliente({
                pedido: pedidoCreado,
                cliente
            });
            notificaciones.cliente = true;
        } catch (error) {
            console.error(
                `No se pudo enviar el comprobante del pedido #${pedidoCreado.id} al cliente:`,
                error
            );
        }

        try {
            await this.emailService.enviarNotificacionAdministrador({
                pedido: pedidoCreado,
                cliente: cliente || {}
            });
            notificaciones.administrador = true;
        } catch (error) {
            console.error(
                `No se pudo notificar al administrador del pedido #${pedidoCreado.id}:`,
                error
            );
        }

        return {
            ...pedidoCreado,
            notificaciones
        };
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

    async obtenerPorUsuario(usuarioId) {
        const [rows] = await pool.query(
            `SELECT
                p.id,
                p.usuario_id,
                p.fecha,
                p.estado,
                p.total,
                d.id AS detalle_id,
                d.producto_id,
                pr.nombre AS producto,
                d.cantidad,
                d.precio_unitario
             FROM pedidos p
             LEFT JOIN detalle_pedido d
                ON d.pedido_id = p.id
             LEFT JOIN productos pr
                ON pr.id = d.producto_id
             WHERE p.usuario_id = ?
             ORDER BY p.id DESC, d.id ASC`,
            [usuarioId]
        );

        const pedidos = new Map();

        for (const row of rows) {
            if (!pedidos.has(row.id)) {
                pedidos.set(row.id, {
                    id: row.id,
                    usuario_id: row.usuario_id,
                    fecha: row.fecha,
                    estado: row.estado,
                    total: row.total,
                    detalles: []
                });
            }

            if (row.detalle_id) {
                pedidos.get(row.id).detalles.push({
                    id: row.detalle_id,
                    producto_id: row.producto_id,
                    producto: row.producto,
                    cantidad: row.cantidad,
                    precio_unitario: row.precio_unitario
                });
            }
        }

        return Array.from(pedidos.values());
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
