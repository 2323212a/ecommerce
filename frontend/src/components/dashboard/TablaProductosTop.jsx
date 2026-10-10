const formatearMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2
    }).format(Number(valor || 0));

export default function TablaProductosTop({ productos }) {
    return (
        <div className="dashboard-card table-card">
            <div className="dashboard-card-header">
                <h3>Productos más vendidos</h3>
            </div>

            <div className="dashboard-table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Producto</th>
                            <th>Unidades</th>
                            <th>Importe</th>
                            <th>Pedidos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-table">Sin ventas registradas</td>
                            </tr>
                        ) : (
                            productos.map((producto, index) => (
                                <tr key={producto.id || index}>
                                    <td>{index + 1}</td>
                                    <td>{producto.nombre}</td>
                                    <td>{Number(producto.unidadesVendidas || 0).toLocaleString("es-MX")}</td>
                                    <td>{formatearMoneda(producto.importeVendido)}</td>
                                    <td>{Number(producto.pedidosIncluyenProducto || 0).toLocaleString("es-MX")}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
