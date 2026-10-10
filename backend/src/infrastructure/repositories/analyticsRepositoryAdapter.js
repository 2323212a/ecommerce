import pool from "../database/database.js";
import { AnalyticsRepositoryPort } from "../../application/ports/analyticsRepositoryPort.js";

function parseNumeric(value) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

export class AnalyticsRepositoryAdapter extends AnalyticsRepositoryPort {
    async obtenerResumen({ desde, hasta }) {
        const { rows } = await pool.query(
            `SELECT
                COALESCE(SUM(CASE WHEN LOWER(p.estado) = 'pagado' THEN p.total ELSE 0 END), 0)::numeric AS ingresos_totales,
                COUNT(*)::int AS total_pedidos,
                COUNT(CASE WHEN LOWER(p.estado) = 'pagado' THEN 1 END)::int AS pedidos_pagados,
                COALESCE(AVG(CASE WHEN LOWER(p.estado) = 'pagado' THEN p.total END), 0)::numeric AS ticket_promedio,
                COUNT(DISTINCT CASE WHEN LOWER(p.estado) = 'pagado' THEN p.usuario_id END)::int AS usuarios_compradores
             FROM pedidos p
             WHERE p.fecha >= $1::timestamptz
               AND p.fecha <= $2::timestamptz`,
            [desde, hasta]
        );

        const row = rows[0] || {};

        return {
            ingresosTotales: parseNumeric(row.ingresos_totales),
            totalPedidos: Number(row.total_pedidos || 0),
            pedidosPagados: Number(row.pedidos_pagados || 0),
            ticketPromedio: parseNumeric(row.ticket_promedio),
            usuariosCompradores: Number(row.usuarios_compradores || 0)
        };
    }

    async obtenerProductosMasVendidos({ desde, hasta, limite }) {
        const { rows } = await pool.query(
            `SELECT
                pr.id,
                pr.nombre,
                SUM(dp.cantidad)::int AS unidades_vendidas,
                COALESCE(SUM(dp.cantidad * dp.precio_unitario), 0)::numeric AS importe_vendido,
                COUNT(DISTINCT dp.pedido_id)::int AS pedidos_incluyen_producto
             FROM detalle_pedido dp
             INNER JOIN productos pr
                 ON pr.id = dp.producto_id
             INNER JOIN pedidos ped
                 ON ped.id = dp.pedido_id
             WHERE LOWER(ped.estado) = 'pagado'
               AND ped.fecha >= $1::timestamptz
               AND ped.fecha <= $2::timestamptz
             GROUP BY pr.id, pr.nombre
             ORDER BY unidades_vendidas DESC, importe_vendido DESC
             LIMIT $3`,
            [desde, hasta, limite]
        );

        return rows.map((row) => ({
            id: Number(row.id),
            nombre: row.nombre,
            unidadesVendidas: Number(row.unidades_vendidas || 0),
            importeVendido: parseNumeric(row.importe_vendido),
            pedidosIncluyenProducto: Number(row.pedidos_incluyen_producto || 0)
        }));
    }

    async obtenerVentasPorPeriodo({ desde, hasta, agrupacion }) {
        const dateField = {
            diaria: "DATE(ped.fecha)",
            semanal: "DATE_TRUNC('week', ped.fecha)",
            mensual: "DATE_TRUNC('month', ped.fecha)"
        }[agrupacion] || "DATE(ped.fecha)";

        const labelField = {
            diaria: "to_char(DATE(ped.fecha), 'YYYY-MM-DD')",
            semanal: "to_char(DATE_TRUNC('week', ped.fecha), 'YYYY-MM-DD')",
            mensual: "to_char(DATE_TRUNC('month', ped.fecha), 'YYYY-MM')"
        }[agrupacion] || "to_char(DATE(ped.fecha), 'YYYY-MM-DD')";

        const { rows } = await pool.query(
            `SELECT
                ${labelField} AS periodo,
                COALESCE(SUM(ped.total), 0)::numeric AS importe
             FROM pedidos ped
             WHERE LOWER(ped.estado) = 'pagado'
               AND ped.fecha >= $1::timestamptz
               AND ped.fecha <= $2::timestamptz
             GROUP BY ${dateField}
             ORDER BY ${dateField} ASC`,
            [desde, hasta]
        );

        return rows.map((row) => ({
            periodo: row.periodo,
            importe: parseNumeric(row.importe)
        }));
    }

    async obtenerEstadosPedidos({ desde, hasta }) {
        const totalQuery = await pool.query(
            `SELECT COUNT(*)::int AS total_pedidos
             FROM pedidos
             WHERE fecha >= $1::timestamptz
               AND fecha <= $2::timestamptz`,
            [desde, hasta]
        );

        const totalPedidos = Number(totalQuery.rows[0]?.total_pedidos || 0);

        const { rows } = await pool.query(
            `SELECT
                ped.estado AS nombre,
                COUNT(*)::int AS cantidad
             FROM pedidos ped
             WHERE ped.fecha >= $1::timestamptz
               AND ped.fecha <= $2::timestamptz
             GROUP BY ped.estado
             ORDER BY cantidad DESC, ped.estado ASC`,
            [desde, hasta]
        );

        return rows.map((row) => ({
            nombre: row.nombre,
            cantidad: Number(row.cantidad || 0),
            porcentaje: totalPedidos > 0
                ? Number(((Number(row.cantidad || 0) * 100) / totalPedidos).toFixed(2))
                : 0
        }));
    }

    async obtenerTicketPromedio({ desde, hasta }) {
        const { rows } = await pool.query(
            `SELECT
                COALESCE(
                    (
                        SELECT AVG(total)::numeric
                        FROM pedidos
                        WHERE LOWER(estado) = 'pagado'
                          AND fecha >= $1::timestamptz
                          AND fecha <= $2::timestamptz
                    ),
                    0
                ) AS ticket_promedio_pagado,
                COALESCE(
                    (
                        SELECT AVG(total_pagado)::numeric
                        FROM (
                            SELECT usuario_id, SUM(total)::numeric AS total_pagado
                            FROM pedidos
                            WHERE LOWER(estado) = 'pagado'
                              AND fecha >= $1::timestamptz
                              AND fecha <= $2::timestamptz
                            GROUP BY usuario_id
                        ) AS compras_por_usuario
                    ),
                    0
                ) AS gasto_promedio_usuario`,
            [desde, hasta]
        );

        const row = rows[0] || {};

        return {
            ticketPromedioPagado: parseNumeric(row.ticket_promedio_pagado),
            gastoPromedioUsuario: parseNumeric(row.gasto_promedio_usuario)
        };
    }
}
