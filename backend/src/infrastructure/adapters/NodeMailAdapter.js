import nodemailer from "nodemailer";
import { EmailServicePort } from "../../application/ports/EmailServicePort.js";

function escaparHtml(valor = "") {
    return String(valor).replace(/[&<>"']/g, (caracter) => {
        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entidades[caracter];
    });
}

function formatoMoneda(valor) {
    return `$${Number(valor).toFixed(2)}`;
}

function formatoFecha(valor) {
    return new Date(valor).toLocaleString("es-MX");
}

function filasProductos(pedido) {
    return pedido.detalles.map((detalle) => `
        <tr>
            <td>${escaparHtml(detalle.producto || detalle.nombre)}</td>
            <td>${Number(detalle.cantidad)}</td>
            <td>${formatoMoneda(detalle.precioUnitario ?? detalle.precio_unitario)}</td>
            <td>${formatoMoneda(detalle.subtotal ?? Number(detalle.cantidad) * Number(detalle.precioUnitario ?? detalle.precio_unitario))}</td>
        </tr>
    `).join("");
}

function tablaProductos(pedido) {
    return `
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
                <tr style="background:#f0efff;text-align:left">
                    <th style="padding:10px">Producto</th>
                    <th style="padding:10px">Cantidad</th>
                    <th style="padding:10px">Precio unitario</th>
                    <th style="padding:10px">Subtotal</th>
                </tr>
            </thead>
            <tbody>${filasProductos(pedido)}</tbody>
        </table>
    `;
}

export class NodeMailAdapter extends EmailServicePort {
    constructor(configuracion = process.env) {
        super();

        this.smtpHost = configuracion.SMTP_HOST;
        this.smtpFrom = configuracion.SMTP_FROM;
        this.adminEmail = configuracion.ADMIN_EMAIL;

        const port = Number(configuracion.SMTP_PORT || 587);
        const opciones = {
            host: this.smtpHost,
            port,
            secure: port === 465
        };

        if (configuracion.SMTP_USER || configuracion.SMTP_PASSWORD) {
            opciones.auth = {
                user: configuracion.SMTP_USER,
                pass: configuracion.SMTP_PASSWORD
            };
        }

        this.transporter = this.smtpHost
            ? nodemailer.createTransport(opciones)
            : null;
    }

    async enviarComprobanteCliente({ pedido, cliente }) {
        const productos = tablaProductos(pedido);
        const referencia = `PEDIDO-${pedido.id}`;

        await this.enviar({
            to: cliente.email,
            subject: `Comprobante de compra - Pedido #${pedido.id}`,
            html: `
                <div style="font-family:Arial,sans-serif;color:#252538;max-width:700px;margin:auto">
                    <h1 style="color:#635bff">Gracias por tu compra, ${escaparHtml(cliente.nombre)}</h1>
                    <p>Recibimos tu pedido <strong>#${escaparHtml(pedido.id)}</strong>.</p>
                    <p><strong>Fecha:</strong> ${escaparHtml(formatoFecha(pedido.fecha))}</p>
                    <p><strong>Estado:</strong> Pendiente de Pago</p>
                    ${productos}
                    <p style="text-align:right;font-size:18px"><strong>Total: ${formatoMoneda(pedido.total)}</strong></p>
                    <h2>Instrucciones de pago</h2>
                    <p>Los siguientes datos son exclusivamente de prueba. No realices transferencias:</p>
                    <ul>
                        <li>Banco: Banco de Prueba (datos ficticios)</li>
                        <li>Titular: NovaShop (dato de prueba)</li>
                        <li>Cuenta: XXXXXXXX</li>
                        <li>CLABE: XXXXXXXXXXXXXXXXXX</li>
                        <li>Referencia: ${escaparHtml(referencia)}</li>
                    </ul>
                </div>
            `
        });
    }

    async enviarNotificacionAdministrador({ pedido, cliente }) {
        await this.enviar({
            to: this.adminEmail,
            subject: `Nuevo pedido pendiente de pago - #${pedido.id}`,
            html: `
                <div style="font-family:Arial,sans-serif;color:#252538;max-width:700px;margin:auto">
                    <h1 style="color:#635bff">Se recibió un nuevo pedido pendiente de pago</h1>
                    <p><strong>Pedido:</strong> #${escaparHtml(pedido.id)}</p>
                    <p><strong>Cliente:</strong> ${escaparHtml(cliente.nombre || "No disponible")}</p>
                    <p><strong>Correo:</strong> ${escaparHtml(cliente.email || "No disponible")}</p>
                    <p><strong>Fecha:</strong> ${escaparHtml(formatoFecha(pedido.fecha))}</p>
                    <p><strong>Estado:</strong> Pendiente de Pago</p>
                    ${tablaProductos(pedido)}
                    <p style="text-align:right;font-size:18px"><strong>Total: ${formatoMoneda(pedido.total)}</strong></p>
                </div>
            `
        });
    }

    async enviar(mensaje) {
        if (!this.transporter || !this.smtpFrom) {
            throw new Error("Configura SMTP_HOST y SMTP_FROM para habilitar el envío de correos");
        }

        if (!mensaje.to) {
            throw new Error("No se configuró el destinatario del correo");
        }

        await this.transporter.sendMail({
            from: this.smtpFrom,
            ...mensaje
        });
    }
}
