import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";

const COLORS = ["#635bff", "#19a974", "#f5a623", "#e5484d", "#6c757d", "#2d9cdb"];

export default function GraficaEstados({ datos }) {
    const chartData = datos.map((item, index) => ({
        name: item.nombre,
        value: item.cantidad,
        fill: COLORS[index % COLORS.length]
    }));

    return (
        <div className="dashboard-card chart-card">
            <div className="dashboard-card-header">
                <h3>Estados de pedidos</h3>
            </div>

            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                            {chartData.map((entry, index) => (
                                <Cell key={`${entry.name}-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} pedidos`, "Cantidad"]} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
