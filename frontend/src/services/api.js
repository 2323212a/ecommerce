const API = "http://18.209.101.171:3000/api";

export async function login(email, password) {

    const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || "Error al iniciar sesión");
    }

    return data;
}

export async function obtenerProductos() {

    const response = await fetch(`${API}/productos`);

    if (!response.ok) {
        throw new Error("Error al obtener productos");
    }

    return await response.json();
}

export async function crearPedido(usuarioId, productos) {

    const response = await fetch(`${API}/pedidos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuarioId,
            productos
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || "Error al crear pedido");
    }

    return data;
}
