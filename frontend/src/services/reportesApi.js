const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function solicitar(url, opciones, mensajeError) {
    const response = await fetch(url, opciones);

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("El servidor devolvió una respuesta inválida");
    }

    if (!response.ok) {
        throw new Error(data.mensaje || mensajeError);
    }

    return data;
}

export async function obtenerResumenReportes(token, filtros = {}) {
    const params = new URLSearchParams();

    if (filtros.desde) params.set("desde", filtros.desde);
    if (filtros.hasta) params.set("hasta", filtros.hasta);

    return solicitar(
        `${API}/reportes/resumen?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        "Error al obtener el resumen del negocio"
    );
}

export async function obtenerVentasTiempo(token, filtros = {}) {
    const params = new URLSearchParams();

    if (filtros.desde) params.set("desde", filtros.desde);
    if (filtros.hasta) params.set("hasta", filtros.hasta);
    if (filtros.agrupacion) params.set("agrupacion", filtros.agrupacion);

    return solicitar(
        `${API}/reportes/ventas-tiempo?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        "Error al obtener las ventas por período"
    );
}

export async function obtenerProductosMasVendidos(token, filtros = {}) {
    const params = new URLSearchParams();

    if (filtros.desde) params.set("desde", filtros.desde);
    if (filtros.hasta) params.set("hasta", filtros.hasta);
    if (filtros.limite) params.set("limite", String(filtros.limite));

    return solicitar(
        `${API}/reportes/productos-mas-vendidos?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        "Error al obtener el ranking de productos"
    );
}

export async function obtenerEstadosPedidos(token, filtros = {}) {
    const params = new URLSearchParams();

    if (filtros.desde) params.set("desde", filtros.desde);
    if (filtros.hasta) params.set("hasta", filtros.hasta);

    return solicitar(
        `${API}/reportes/estados-pedidos?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        "Error al obtener los estados de pedidos"
    );
}

export async function obtenerTicketPromedio(token, filtros = {}) {
    const params = new URLSearchParams();

    if (filtros.desde) params.set("desde", filtros.desde);
    if (filtros.hasta) params.set("hasta", filtros.hasta);

    return solicitar(
        `${API}/reportes/ticket-promedio?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        "Error al obtener el ticket promedio"
    );
}
