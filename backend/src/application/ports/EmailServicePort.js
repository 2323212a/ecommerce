export class EmailServicePort {
    async enviarComprobanteCliente({ pedido, cliente }) {
        throw new Error("enviarComprobanteCliente debe ser implementado");
    }

    async enviarNotificacionAdministrador({ pedido, cliente }) {
        throw new Error("enviarNotificacionAdministrador debe ser implementado");
    }
}
