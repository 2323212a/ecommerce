import express from "express";

export function crearUsuarioRoutes(usuarioController) {

    const router = express.Router();

    router.get("/", usuarioController.obtenerTodos);

    router.get("/:id", usuarioController.obtenerPorId);

    router.post("/", usuarioController.crear);

    router.put("/:id", usuarioController.actualizar);

    router.delete("/:id", usuarioController.eliminar);

    return router;
}
