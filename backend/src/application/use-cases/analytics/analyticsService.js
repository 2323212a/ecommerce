import { AnalyticsRepositoryPort } from "../../ports/analyticsRepositoryPort.js";

const DIA_MS = 24 * 60 * 60 * 1000;

function obtenerFechaISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function obtenerFechaFinDelDia(date) {
    const next = new Date(date);
    next.setUTCHours(23, 59, 59, 999);
    return next;
}

function normalizarNumero(valor) {
    const number = Number(valor ?? 0);
    return Number.isFinite(number) ? number : 0;
}

export class AnalyticsService {
    constructor(repository) {
        if (!(repository instanceof AnalyticsRepositoryPort)) {
            throw new Error("Se requiere un repositorio de analítica válido");
        }

        this.repository = repository;
    }

    validarRango({ desde, hasta }) {
        const fechaInicial = parseDate(desde);
        const fechaFinal = parseDate(hasta);

        if (!fechaInicial || !fechaFinal) {
            throw new Error("Las fechas deben tener el formato YYYY-MM-DD");
        }

        if (fechaInicial > fechaFinal) {
            throw new Error("La fecha inicial no puede ser posterior a la final");
        }

        return {
            desde: fechaInicial,
            hasta: obtenerFechaFinDelDia(fechaFinal)
        };
    }

    calcularPeriodoAnterior({ desde, hasta }) {
        const diferenciaDias = Math.max(
            1,
            Math.ceil((hasta.getTime() - desde.getTime()) / DIA_MS) + 1
        );

        const nuevaFechaInicio = new Date(desde.getTime() - diferenciaDias * DIA_MS);
        const nuevaFechaFin = new Date(desde.getTime() - DIA_MS);

        return {
            desde: obtenerFechaISO(nuevaFechaInicio),
            hasta: obtenerFechaISO(nuevaFechaFin)
        };
    }

    async obtenerResumen(filtros = {}) {
        const fechaInicial = filtros.desde || obtenerFechaISO(new Date(Date.now() - 30 * DIA_MS));
        const fechaFinal = filtros.hasta || obtenerFechaISO(new Date());
        const { desde, hasta } = this.validarRango({ desde: fechaInicial, hasta: fechaFinal });

        const periodoAnterior = this.calcularPeriodoAnterior({ desde, hasta });

        const [resumenActual, resumenAnterior] = await Promise.all([
            this.repository.obtenerResumen({
                desde: desde.toISOString(),
                hasta: hasta.toISOString()
            }),
            this.repository.obtenerResumen({
                desde: periodoAnterior.desde,
                hasta: periodoAnterior.hasta
            })
        ]);

        const diferencia = {
            ingresosTotales: normalizarNumero(resumenActual.ingresosTotales) - normalizarNumero(resumenAnterior.ingresosTotales),
            totalPedidos: Number(resumenActual.totalPedidos || 0) - Number(resumenAnterior.totalPedidos || 0),
            pedidosPagados: Number(resumenActual.pedidosPagados || 0) - Number(resumenAnterior.pedidosPagados || 0),
            ticketPromedio: normalizarNumero(resumenActual.ticketPromedio) - normalizarNumero(resumenAnterior.ticketPromedio),
            usuariosCompradores: Number(resumenActual.usuariosCompradores || 0) - Number(resumenAnterior.usuariosCompradores || 0)
        };

        return {
            desde: obtenerFechaISO(desde),
            hasta: obtenerFechaISO(hasta),
            resumen: {
                ingresosTotales: normalizarNumero(resumenActual.ingresosTotales),
                totalPedidos: Number(resumenActual.totalPedidos || 0),
                pedidosPagados: Number(resumenActual.pedidosPagados || 0),
                ticketPromedio: normalizarNumero(resumenActual.ticketPromedio),
                usuariosCompradores: Number(resumenActual.usuariosCompradores || 0)
            },
            comparacionAnterior: {
                desde: periodoAnterior.desde,
                hasta: periodoAnterior.hasta,
                ingresosTotales: normalizarNumero(resumenAnterior.ingresosTotales),
                totalPedidos: Number(resumenAnterior.totalPedidos || 0),
                pedidosPagados: Number(resumenAnterior.pedidosPagados || 0),
                ticketPromedio: normalizarNumero(resumenAnterior.ticketPromedio),
                usuariosCompradores: Number(resumenAnterior.usuariosCompradores || 0)
            },
            diferencia
        };
    }

    async obtenerProductosMasVendidos(filtros = {}) {
        const fechaInicial = filtros.desde || obtenerFechaISO(new Date(Date.now() - 30 * DIA_MS));
        const fechaFinal = filtros.hasta || obtenerFechaISO(new Date());
        const { desde, hasta } = this.validarRango({ desde: fechaInicial, hasta: fechaFinal });

        const limite = Math.min(Math.max(Number(filtros.limite) || 5, 1), 10);

        return this.repository.obtenerProductosMasVendidos({
            desde: desde.toISOString(),
            hasta: hasta.toISOString(),
            limite
        });
    }

    async obtenerVentasTiempo(filtros = {}) {
        const fechaInicial = filtros.desde || obtenerFechaISO(new Date(Date.now() - 30 * DIA_MS));
        const fechaFinal = filtros.hasta || obtenerFechaISO(new Date());
        const { desde, hasta } = this.validarRango({ desde: fechaInicial, hasta: fechaFinal });

        const agrupacion = ["diaria", "semanal", "mensual"].includes(filtros.agrupacion)
            ? filtros.agrupacion
            : "diaria";

        return this.repository.obtenerVentasPorPeriodo({
            desde: desde.toISOString(),
            hasta: hasta.toISOString(),
            agrupacion
        });
    }

    async obtenerEstadosPedidos(filtros = {}) {
        const fechaInicial = filtros.desde || obtenerFechaISO(new Date(Date.now() - 30 * DIA_MS));
        const fechaFinal = filtros.hasta || obtenerFechaISO(new Date());
        const { desde, hasta } = this.validarRango({ desde: fechaInicial, hasta: fechaFinal });

        return this.repository.obtenerEstadosPedidos({
            desde: desde.toISOString(),
            hasta: hasta.toISOString()
        });
    }

    async obtenerTicketPromedio(filtros = {}) {
        const fechaInicial = filtros.desde || obtenerFechaISO(new Date(Date.now() - 30 * DIA_MS));
        const fechaFinal = filtros.hasta || obtenerFechaISO(new Date());
        const { desde, hasta } = this.validarRango({ desde: fechaInicial, hasta: fechaFinal });

        return this.repository.obtenerTicketPromedio({
            desde: desde.toISOString(),
            hasta: hasta.toISOString()
        });
    }
}

export const AnalytecService = AnalyticsService;
