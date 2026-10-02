import bcrypt from "bcrypt";
import { Usuario } from "../../../domain/entities/Usuario.js";

export class UsuarioUseCases {

    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async obtenerTodos() {
        return await this.usuarioRepository.obtenerTodos();
    }

    async obtenerPorId(id) {
        return await this.usuarioRepository.obtenerPorId(id);
    }

    async crear(datos) {

        if (!datos.nombre || !datos.email || !datos.password) {
            throw new Error("Nombre, email y contraseña son obligatorios");
        }

        const usuarioExistente =
            await this.usuarioRepository.obtenerPorEmail(datos.email);

        if (usuarioExistente) {
            throw new Error("El email ya está registrado");
        }

        const passwordHash = await bcrypt.hash(datos.password, 10);

        const usuario = new Usuario({
            nombre: datos.nombre,
            email: datos.email,
            passwordHash,
            rol: datos.rol || "cliente"
        });

        return await this.usuarioRepository.crear(usuario);
    }

    async actualizar(id, datos) {

        const usuarioExistente =
            await this.usuarioRepository.obtenerPorId(id);

        if (!usuarioExistente) {
            throw new Error("Usuario no encontrado");
        }

        return await this.usuarioRepository.actualizar(id, {
            nombre: datos.nombre,
            email: datos.email,
            rol: datos.rol
        });
    }

    async eliminar(id) {

        const eliminado =
            await this.usuarioRepository.eliminar(id);

        if (!eliminado) {
            throw new Error("Usuario no encontrado");
        }

        return true;
    }
}
