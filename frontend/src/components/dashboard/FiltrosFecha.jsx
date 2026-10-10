function formatearFecha(date) {
    if (!date) return "";
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return "";
    return value.toISOString().slice(0, 10);
}

export default function FiltrosFecha({ filtros, onChange }) {
    const presets = [
        { key: "7d", label: "Últimos 7 días" },
        { key: "30d", label: "Últimos 30 días" },
        { key: "mes", label: "Mes actual" },
        { key: "custom", label: "Personalizado" }
    ];

    function cambiarPreset(preset) {
        const hoy = new Date();
        const fechaHoy = formatearFecha(hoy);

        let desde = filtros.desde;

        if (preset === "7d") {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - 6);
            desde = formatearFecha(fecha);
        }

        if (preset === "30d") {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - 29);
            desde = formatearFecha(fecha);
        }

        if (preset === "mes") {
            const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            desde = formatearFecha(fecha);
        }

        onChange({
            ...filtros,
            preset,
            desde,
            hasta: preset === "custom" ? filtros.hasta : fechaHoy
        });
    }

    return (
        <div className="dashboard-filtros">
            <div className="dashboard-preset-group">
                {presets.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        className={
                            filtros.preset === key
                                ? "dashboard-preset active"
                                : "dashboard-preset"
                        }
                        onClick={() => cambiarPreset(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="dashboard-rango-personalizado">
                <label>
                    Desde
                    <input
                        type="date"
                        value={filtros.desde}
                        onChange={(event) =>
                            onChange({
                                ...filtros,
                                preset: "custom",
                                desde: event.target.value
                            })
                        }
                    />
                </label>

                <label>
                    Hasta
                    <input
                        type="date"
                        value={filtros.hasta}
                        onChange={(event) =>
                            onChange({
                                ...filtros,
                                preset: "custom",
                                hasta: event.target.value
                            })
                        }
                    />
                </label>
            </div>
        </div>
    );
}
