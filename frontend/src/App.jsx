import { useEffect, useState } from "react";
import {
    login,
    obtenerProductos,
    crearProducto,
    crearPedido,
    obtenerPedidos
} from "./services/api";

import "./App.css";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState("");
    const [productos, setProductos] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [vista, setVista] = useState("inicio");
    const [pedidoCreado, setPedidoCreado] = useState(null);
    const [cargandoPedidos, setCargandoPedidos] = useState(false);

    const [mensaje, setMensaje] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [productoForm, setProductoForm] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: ""
    });
    const puedeAgregarProductos =
        usuario && ["admin", "empleado"].includes(usuario.rol);

    useEffect(() => {
        if (usuario) {
            cargarProductos();
        }
    }, [usuario, token]);

    async function cargarProductos() {
        try {
            const data = await obtenerProductos();
            setProductos(data);
        } catch (error) {
            setMensaje(error.message);
        }
    }

    function irAInicio() {
        setVista("inicio");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function verProductos() {
        setVista("productos");
        window.setTimeout(() => {
            document.getElementById("catalogo")?.scrollIntoView({
                behavior: "smooth"
            });
        }, 0);
    }

    async function verMisPedidos() {
        setVista("pedidos");
        setMensaje("");
        setCargandoPedidos(true);

        try {
            setPedidos(await obtenerPedidos(usuario.id, token));
        } catch (error) {
            setMensaje(error.message);
        } finally {
            setCargandoPedidos(false);
        }
    }

    async function iniciarSesion(e) {
        e.preventDefault();

        try {
            const data = await login(email, password);

            setUsuario(data.usuario);
            setToken(data.token);
            setMensaje("");
        } catch (error) {
            setMensaje(error.message);
        }
    }

    async function comprar(producto) {
        try {
            const pedido = await crearPedido(
                usuario.id,
                [
                    {
                        productoId: producto.id,
                        cantidad: 1
                    }
                ],
                token
            );

            setPedidoCreado(pedido);
            setMensaje("");
            cargarProductos();

        } catch (error) {
            setMensaje(error.message);
        }
    }

    async function agregarProducto(e) {
        e.preventDefault();
        setMensaje("");

        try {
            await crearProducto(
                {
                    ...productoForm,
                    precio: Number(productoForm.precio),
                    stock: Number(productoForm.stock)
                },
                token
            );
            setProductoForm({
                nombre: "",
                descripcion: "",
                precio: "",
                stock: ""
            });
            setMensaje("Producto agregado correctamente.");
            await cargarProductos();
        } catch (error) {
            setMensaje(error.message);
        }
    }

    function cerrarSesion() {
        setUsuario(null);
        setToken("");
        setPedidos([]);
        setPedidoCreado(null);
        setVista("inicio");
        setEmail("");
        setPassword("");
        setMensaje("");
    }

    const productosFiltrados = productos.filter((producto) =>
        producto.nombre
            .toLowerCase()
            .includes(busqueda.toLowerCase())
    );

    /* =========================
       PANTALLA DE LOGIN
    ========================= */

    if (!usuario) {
        return (
            <div className="login-page">

                <div className="login-decoration">
                    <div className="circle circle-one"></div>
                    <div className="circle circle-two"></div>
                </div>

                <div className="login-container">

                    <div className="login-brand">
                        <div className="brand-icon">🛒</div>

                        <div>
                            <h1>NovaShop</h1>
                            <span>Tu tienda en línea</span>
                        </div>
                    </div>

                    <div className="login-card">

                        <div className="login-header">
                            <p className="login-label">BIENVENIDO</p>

                            <h2>Inicia sesión</h2>

                            <p>
                                Accede a tu cuenta para explorar nuestros productos.
                            </p>
                        </div>

                        <form onSubmit={iniciarSesion}>

                            <div className="input-group">
                                <label>Correo electrónico</label>

                                <div className="input-wrapper">
                                    <span>✉</span>

                                    <input
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Contraseña</label>

                                <div className="input-wrapper">
                                    <span>🔒</span>

                                    <input
                                        type="password"
                                        placeholder="Ingresa tu contraseña"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                className="login-button"
                                type="submit"
                            >
                                Iniciar sesión
                                <span>→</span>
                            </button>

                        </form>

                        {mensaje && (
                            <div className="error-message">
                                ⚠ {mensaje}
                            </div>
                        )}

                        <div className="login-footer">
                            <span>Plataforma de comercio electrónico</span>
                        </div>

                    </div>

                </div>
            </div>
        );
    }

    /* =========================
       TIENDA
    ========================= */

    return (
        <div className="store">

            {/* NAVBAR */}

            <nav className="navbar">

                <div className="navbar-content">

                    <div className="logo">
                        <div className="logo-icon">🛒</div>

                        <div>
                            <strong>NovaShop</strong>
                            <small>E-Commerce</small>
                        </div>
                    </div>

                    <div className="nav-links">
                        <button
                            className={vista === "inicio" ? "active" : ""}
                            onClick={irAInicio}
                        >
                            Inicio
                        </button>
                        <button
                            className={vista === "productos" ? "active" : ""}
                            onClick={verProductos}
                        >
                            Productos
                        </button>
                        <button
                            className={vista === "pedidos" ? "active" : ""}
                            onClick={verMisPedidos}
                        >
                            Mis pedidos
                        </button>
                    </div>

                    <div className="user-menu">

                        <div className="user-avatar">
                            {usuario.nombre?.charAt(0).toUpperCase()}
                        </div>

                        <div className="user-info">
                            <strong>{usuario.nombre}</strong>
                            <span>
                                {{
                                    admin: "Administrador",
                                    empleado: "Empleado",
                                    cliente: "Cliente"
                                }[usuario.rol] || usuario.rol}
                            </span>
                        </div>

                        <button
                            className="logout-button"
                            onClick={cerrarSesion}
                        >
                            Salir
                        </button>

                    </div>

                </div>

            </nav>

            {/* HERO */}

            {vista === "inicio" && (
                <section className="hero">

                <div className="hero-content">

                    <div className="hero-text">

                        <span className="hero-badge">
                            ✦ TIENDA ONLINE
                        </span>

                        <h1>
                            Todo lo que necesitas,
                            <span> en un solo lugar.</span>
                        </h1>

                        <p>
                            Explora nuestro catálogo y encuentra productos
                            pensados para ti.
                        </p>

                        <button
                            className="hero-button"
                            onClick={() =>
                                document
                                    .getElementById("catalogo")
                                    ?.scrollIntoView({
                                        behavior: "smooth"
                                    })
                            }
                        >
                            Explorar productos
                            <span>↓</span>
                        </button>

                    </div>

                    <div className="hero-visual">
                        <div className="hero-circle">
                            🛍️
                        </div>

                        <div className="floating-card card-top">
                            ✓ Compra segura
                        </div>

                        <div className="floating-card card-bottom">
                            ⚡ Compra rápida
                        </div>
                    </div>

                </div>

                </section>
            )}

            {/* CONTENIDO */}

            {vista !== "pedidos" ? (
                <main className="main-content" id="catalogo">

                {puedeAgregarProductos && (
                    <form className="product-admin-form" onSubmit={agregarProducto}>
                        <div className="product-admin-heading">
                            <span className="section-label">INVENTARIO</span>
                            <h2>Agregar producto</h2>
                            <p>Registra un producto nuevo en el catálogo.</p>
                        </div>
                        <div className="product-admin-fields">
                            <label>
                                Nombre
                                <input
                                    value={productoForm.nombre}
                                    onChange={(e) => setProductoForm({
                                        ...productoForm,
                                        nombre: e.target.value
                                    })}
                                    required
                                />
                            </label>
                            <label>
                                Descripción
                                <input
                                    value={productoForm.descripcion}
                                    onChange={(e) => setProductoForm({
                                        ...productoForm,
                                        descripcion: e.target.value
                                    })}
                                />
                            </label>
                            <label>
                                Precio
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={productoForm.precio}
                                    onChange={(e) => setProductoForm({
                                        ...productoForm,
                                        precio: e.target.value
                                    })}
                                    required
                                />
                            </label>
                            <label>
                                Stock
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={productoForm.stock}
                                    onChange={(e) => setProductoForm({
                                        ...productoForm,
                                        stock: e.target.value
                                    })}
                                    required
                                />
                            </label>
                        </div>
                        <button className="login-button product-submit-button" type="submit">
                            Guardar producto
                            <span>→</span>
                        </button>
                    </form>
                )}

                <div className="section-header">

                    <div>
                        <span className="section-label">
                            CATÁLOGO
                        </span>

                        <h2>
                            Nuestros productos
                        </h2>

                        <p>
                            Encuentra lo que estás buscando.
                        </p>
                    </div>

                    <div className="search-box">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={(e) =>
                                setBusqueda(e.target.value)
                            }
                        />

                    </div>

                </div>

                {/* MENSAJE */}

                {mensaje && (
                    <div
                        className={
                            mensaje === "Producto agregado correctamente."
                                ? "success-message page-error"
                                : "error-message page-error"
                        }
                        role={
                            mensaje === "Producto agregado correctamente."
                                ? "status"
                                : "alert"
                        }
                    >
                        {mensaje === "Producto agregado correctamente." ? "✓" : "⚠"} {mensaje}
                    </div>
                )}

                {pedidoCreado && (
                    <section className="checkout-confirmation" role="status">
                        <h2>Pedido creado correctamente.</h2>
                        <p><strong>Pedido #{pedidoCreado.id}</strong></p>
                        <p>
                            Estado: <span className="order-status">Pendiente de Pago</span>
                        </p>
                        {pedidoCreado.notificaciones?.cliente ? (
                            <>
                                <p>Se ha enviado un comprobante a:</p>
                                <strong>{usuario.email}</strong>
                                <p>Revisa tu correo para consultar las instrucciones de pago.</p>
                            </>
                        ) : (
                            <p className="email-warning">
                                No se pudo enviar el comprobante a {usuario.email}. El pedido quedó guardado; revisa la configuración SMTP.
                            </p>
                        )}
                        <p className="checkout-total">
                            Total: ${Number(pedidoCreado.total).toFixed(2)}
                        </p>
                    </section>
                )}

                {/* PRODUCTOS */}

                {productosFiltrados.length === 0 ? (

                    <div className="empty-state">

                        <div>📦</div>

                        <h3>
                            No encontramos productos
                        </h3>

                        <p>
                            Intenta con otro término de búsqueda.
                        </p>

                    </div>

                ) : (

                    <div className="products-grid">

                        {productosFiltrados.map((producto) => {

                            const disponible = producto.stock > 0;

                            return (
                                <article
                                    className="product-card"
                                    key={producto.id}
                                >

                                    <div className="product-image">

                                        <span className="product-category">
                                            PRODUCTO
                                        </span>

                                        <div className="product-icon">
                                            📦
                                        </div>

                                        {!disponible && (
                                            <span className="sold-out">
                                                AGOTADO
                                            </span>
                                        )}

                                    </div>

                                    <div className="product-body">

                                        <h3>
                                            {producto.nombre}
                                        </h3>

                                        <p className="product-description">
                                            {producto.descripcion ||
                                                "Producto disponible en nuestro catálogo."}
                                        </p>

                                        <div className="product-info">

                                            <div>
                                                <span className="price-label">
                                                    Precio
                                                </span>

                                                <strong className="price">
                                                    ${Number(producto.precio).toFixed(2)}
                                                </strong>
                                            </div>

                                            <div className="stock">

                                                <span
                                                    className={
                                                        disponible
                                                            ? "stock-dot"
                                                            : "stock-dot out"
                                                    }
                                                ></span>

                                                {disponible
                                                    ? `${producto.stock} disponibles`
                                                    : "Sin existencias"}

                                            </div>

                                        </div>

                                        <button
                                            className="buy-button"
                                            disabled={!disponible}
                                            onClick={() =>
                                                comprar(producto)
                                            }
                                        >
                                            {disponible
                                                ? "Comprar ahora"
                                                : "Producto agotado"}

                                            {disponible && <span>→</span>}
                                        </button>

                                    </div>

                                </article>
                            );
                        })}

                    </div>

                )}

                </main>
            ) : (
                <main className="main-content orders-view">
                    <div className="section-header">
                        <div>
                            <span className="section-label">TU CUENTA</span>
                            <h2>Mis pedidos</h2>
                            <p>Consulta el estado y los detalles de tus compras.</p>
                        </div>
                    </div>

                    {mensaje && (
                        <div className="error-message page-error">
                            ⚠ {mensaje}
                        </div>
                    )}

                    {cargandoPedidos ? (
                        <div className="empty-state"><p>Cargando tus pedidos...</p></div>
                    ) : pedidos.length === 0 && !mensaje ? (
                        <div className="empty-state">
                            <div>📦</div>
                            <h3>No tienes pedidos todavía.</h3>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {pedidos.map((pedido) => (
                                <article className="order-card" key={pedido.id}>
                                    <div className="order-card-header">
                                        <div>
                                            <span className="section-label">PEDIDO</span>
                                            <h3>#{pedido.id}</h3>
                                        </div>
                                        <span className="order-status">
                                            {pedido.estado}
                                        </span>
                                    </div>
                                    <p className="order-date">
                                        Fecha: {pedido.fecha
                                            ? new Date(pedido.fecha).toLocaleString("es-MX")
                                            : "No disponible"}
                                    </p>
                                    <div className="order-products">
                                        {pedido.detalles?.map((detalle, index) => (
                                            <div
                                                className="order-product"
                                                key={detalle.id || `${detalle.producto_id}-${index}`}
                                            >
                                                <span>{detalle.producto || detalle.nombre}</span>
                                                <span>
                                                    {detalle.cantidad} × ${Number(
                                                        detalle.precio_unitario ?? detalle.precioUnitario
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="order-total">
                                        Total: ${Number(pedido.total).toFixed(2)}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </main>
            )}

            {/* FOOTER */}

            <footer className="footer">

                <div className="footer-content">

                    <div className="footer-brand">
                        <div className="logo-icon">🛒</div>

                        <div>
                            <strong>NovaShop</strong>
                            <span>Tu tienda en línea</span>
                        </div>
                    </div>

                    <p>
                        © 2026 NovaShop. Plataforma de comercio electrónico.
                    </p>

                </div>

            </footer>

        </div>
    );
}

export default App;