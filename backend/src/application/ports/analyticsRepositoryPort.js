export class AnalyticsRepositoryPort {
    async obtenerResumen() {
        throw new Error("obtenerResumen debe ser implementado");
    }

    async obtenerProductosMasVendidos() {
        throw new Error("obtenerProductosMasVendidos debe ser implementado");
    }

    async obtenerVentasPorPeriodo() {
        throw new Error("obtenerVentasPorPeriodo debe ser implementado");
    }

    async obtenerEstadosPedidos() {
        throw new Error("obtenerEstadosPedidos debe ser implementado");
    }

    async obtenerTicketPromedio() {
        throw new Error("obtenerTicketPromedio debe ser implementado");
    }
}
