import { useEffect, useState } from "react";
import {
    login,
    obtenerProductos,
    crearPedido
} from "./services/api";

import "./App.css";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [usuario, setUsuario] = useState(null);
    const [productos, setProductos] = useState([]);

    const [mensaje, setMensaje] = useState("");
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        if (usuario) {
            cargarProductos();
        }
    }, [usuario]);

    async function cargarProductos() {
        try {
            const data = await obtenerProductos();
            setProductos(data);
        } catch (error) {
            setMensaje(error.message);
        }
    }

    async function iniciarSesion(e) {
        e.preventDefault();

        try {
            const data = await login(email, password);

            setUsuario(data.usuario);
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
                ]
            );

            setMensaje(
                `Pedido #${pedido.id} creado correctamente. Total: $${pedido.total}`
            );

            cargarProductos();

        } catch (error) {
            setMensaje(error.message);
        }
    }

    function cerrarSesion() {
        setUsuario(null);
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
                        <a className="active">Inicio</a>
                        <a>Productos</a>
                        <a>Mis pedidos</a>
                    </div>

                    <div className="user-menu">

                        <div className="user-avatar">
                            {usuario.nombre?.charAt(0).toUpperCase()}
                        </div>

                        <div className="user-info">
                            <strong>{usuario.nombre}</strong>
                            <span>Cliente</span>
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

            {/* CONTENIDO */}

            <main className="main-content" id="catalogo">

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
                    <div className="success-message">
                        <span>✓</span>
                        {mensaje}

                        <button
                            onClick={() => setMensaje("")}
                        >
                            ×
                        </button>
                    </div>
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