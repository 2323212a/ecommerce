import express from "express";

export function crearProductoRoutes(
    productoController,
    autenticar,
    autorizarRoles
) {

    const router = express.Router();

    router.get("/", productoController.obtenerTodos);

    router.get("/:id", productoController.obtenerPorId);

    router.post(
        "/",
        autenticar,
        autorizarRoles("admin", "empleado"),
        productoController.crear
    );

    router.put(
        "/:id",
        autenticar,
        autorizarRoles("admin"),
        productoController.actualizar
    );

    router.delete(
        "/:id",
        autenticar,
        autorizarRoles("admin"),
        productoController.eliminar
    );

    return router;
}
