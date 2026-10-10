const formatearMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2
    }).format(Number(valor || 0));

export default function TarjetasResumen({ resumen, comparacion }) {
    const tarjetas = [
        {
            titulo: "Ingresos totales",
            valor: formatearMoneda(resumen.ingresosTotales),
            cambio: comparacion?.ingresosTotales ?? 0,
            tipo: "moneda"
        },
        {
            titulo: "Pedidos pagados",
            valor: Number(resumen.pedidosPagados || 0).toLocaleString("es-MX"),
            cambio: comparacion?.pedidosPagados ?? 0,
            tipo: "numero"
        },
        {
            titulo: "Ticket promedio",
            valor: formatearMoneda(resumen.ticketPromedio),
            cambio: comparacion?.ticketPromedio ?? 0,
            tipo: "moneda"
        },
        {
            titulo: "Usuarios compradores",
            valor: Number(resumen.usuariosCompradores || 0).toLocaleString("es-MX"),
            cambio: comparacion?.usuariosCompradores ?? 0,
            tipo: "numero"
        }
    ];

    return (
        <div className="dashboard-grid-cards">
            {tarjetas.map((tarjeta) => (
                <article key={tarjeta.titulo} className="dashboard-card resumen-card">
                    <div className="dashboard-card-header">
                        <span>{tarjeta.titulo}</span>
                    </div>
                    <strong>{tarjeta.valor}</strong>
                    <small className={tarjeta.cambio >= 0 ? "positivo" : "negativo"}>
                        {tarjeta.cambio >= 0 ? "+" : ""}
                        {tarjeta.tipo === "moneda"
                            ? formatearMoneda(tarjeta.cambio)
                            : Number(tarjeta.cambio).toLocaleString("es-MX")}
                        {" "}vs periodo anterior
                    </small>
                </article>
            ))}
        </div>
    );
}
