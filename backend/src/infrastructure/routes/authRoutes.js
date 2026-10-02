import express from "express";

export function crearAuthRoutes(controller) {

    const router = express.Router();

    router.post("/login", controller.login);

    return router;
}
