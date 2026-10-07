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

export async function login(email, password) {
    return solicitar(`${API}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    }, "Error al iniciar sesión");
}

export async function obtenerProductos() {
    return solicitar(`${API}/productos`, undefined, "Error al obtener productos");
}

export async function crearProducto(producto, token) {
    return solicitar(`${API}/productos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(producto)
    }, "Error al agregar el producto");
}

export async function crearPedido(usuarioId, productos, token) {
    return solicitar(`${API}/pedidos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            usuarioId,
            productos
        })
    }, "Error al crear pedido");
}

export async function obtenerPedidos(usuarioId, token) {
    return solicitar(
        `${API}/pedidos/usuario/${encodeURIComponent(usuarioId)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        "Error al obtener tus pedidos"
    );
}
