export class Usuario {
    constructor({
        id = null,
        nombre,
        email,
        passwordHash,
        rol = "cliente",
        createdAt = null
    }) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.passwordHash = passwordHash;
        this.rol = rol;
        this.createdAt = createdAt;
    }
}
