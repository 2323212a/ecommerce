import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

const formatearMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2
    }).format(Number(valor || 0));

export default function GraficaIngresos({ datos }) {
    return (
        <div className="dashboard-card chart-card">
            <div className="dashboard-card-header">
                <h3>Ingresos por período</h3>
            </div>

            <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                    <LineChart data={datos}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8f0" />
                        <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                        <Tooltip formatter={(value) => formatearMoneda(value)} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="importe"
                            name="Ingresos"
                            stroke="#635bff"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
