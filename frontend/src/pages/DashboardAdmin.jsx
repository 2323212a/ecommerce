import { useEffect, useMemo, useState } from "react";
import FiltrosFecha from "../components/dashboard/FiltrosFecha.jsx";
import GraficaEstados from "../components/dashboard/GraficaEstados.jsx";
import GraficaIngresos from "../components/dashboard/GraficaIngresos.jsx";
import TablaProductosTop from "../components/dashboard/TablaProductosTop.jsx";
import TarjetasResumen from "../components/dashboard/TarjetasResumen.jsx";
import {
    obtenerEstadosPedidos,
    obtenerProductosMasVendidos,
    obtenerResumenReportes,
    obtenerTicketPromedio,
    obtenerVentasTiempo
} from "../services/reportesApi.js";

function formatearFecha(date) {
    return new Date(date).toISOString().slice(0, 10);
}

export default function DashboardAdmin({ token }) {
    const [filtros, setFiltros] = useState(() => {
        const hoy = new Date();
        const desde = new Date(hoy);
        desde.setDate(hoy.getDate() - 29);

        return {
            preset: "30d",
            desde: formatearFecha(desde),
            hasta: formatearFecha(hoy)
        };
    });

    const [resumen, setResumen] = useState({
        ingresosTotales: 0,
        pedidosPagados: 0,
        ticketPromedio: 0,
        usuariosCompradores: 0
    });
    const [comparacion, setComparacion] = useState({
        ingresosTotales: 0,
        pedidosPagados: 0,
        ticketPromedio: 0,
        usuariosCompradores: 0
    });
    const [ventas, setVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [ticket, setTicket] = useState({
        ticketPromedioPagado: 0,
        gastoPromedioUsuario: 0
    });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            if (!token) {
                setCargando(false);
                return;
            }

            try {
                setCargando(true);
                setError("");

                const [resumenData, ventasData, productosData, estadosData, ticketData] =
                    await Promise.all([
                        obtenerResumenReportes(token, filtros),
                        obtenerVentasTiempo(token, {
                            ...filtros,
                            agrupacion: "diaria"
                        }),
                        obtenerProductosMasVendidos(token, filtros),
                        obtenerEstadosPedidos(token, filtros),
                        obtenerTicketPromedio(token, filtros)
                    ]);

                setResumen(resumenData.resumen || resumenData);
                setComparacion(resumenData.diferencia || {});
                setVentas(Array.isArray(ventasData) ? ventasData : []);
                setProductos(Array.isArray(productosData) ? productosData : []);
                setEstados(Array.isArray(estadosData) ? estadosData : []);
                setTicket(ticketData || {});
            } catch (err) {
                setError(err.message || "No se pudo cargar el dashboard");
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [filtros, token]);

    const ventasChart = useMemo(
        () =>
            ventas.map((item) => ({
                periodo: item.periodo,
                importe: Number(item.importe || 0)
            })),
        [ventas]
    );

    return (
        <main className="dashboard-admin main-content">
            <div className="dashboard-header">
                <div>
                    <span className="section-label">ADMINISTRACIÓN</span>
                    <h2>Dashboard de ventas</h2>
                    <p>Control de ingresos, pedidos y productos más vendidos.</p>
                </div>
            </div>

            <FiltrosFecha filtros={filtros} onChange={setFiltros} />

            {error && <div className="error-message page-error">⚠ {error}</div>}

            {cargando ? (
                <div className="empty-state">
                    <p>Cargando métricas...</p>
                </div>
            ) : (
                <>
                    <TarjetasResumen
                        resumen={resumen}
                        comparacion={comparacion}
                    />

                    <div className="dashboard-metricas-extra">
                        <div className="dashboard-card metric-card">
                            <span>Ticket promedio pagado</span>
                            <strong>
                                {new Intl.NumberFormat("es-MX", {
                                    style: "currency",
                                    currency: "MXN",
                                    maximumFractionDigits: 2
                                }).format(Number(ticket.ticketPromedioPagado || 0))}
                            </strong>
                        </div>

                        <div className="dashboard-card metric-card">
                            <span>Gasto promedio por usuario</span>
                            <strong>
                                {new Intl.NumberFormat("es-MX", {
                                    style: "currency",
                                    currency: "MXN",
                                    maximumFractionDigits: 2
                                }).format(Number(ticket.gastoPromedioUsuario || 0))}
                            </strong>
                        </div>
                    </div>

                    <div className="dashboard-grid-two">
                        <GraficaIngresos datos={ventasChart} />
                        <GraficaEstados datos={estados} />
                    </div>

                    <TablaProductosTop productos={productos} />
                </>
            )}
        </main>
    );
}
