import express from "express";

export function crearUsuarioRoutes(usuarioController, autenticar, autorizarRoles) {

    const router = express.Router();

    router.use(autenticar, autorizarRoles("admin"));

    router.get("/", usuarioController.obtenerTodos);

    router.get("/:id", usuarioController.obtenerPorId);

    router.post("/", usuarioController.crear);

    router.put("/:id", usuarioController.actualizar);

    router.delete("/:id", usuarioController.eliminar);

    return router;
}
