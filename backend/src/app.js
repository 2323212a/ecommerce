import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./infrastructure/database/database.js";

import { UsuarioRepository } from "./infrastructure/repositories/usuarioRepository.js";
import { UsuarioUseCases } from "./application/use-cases/usuarios/usuarioUseCases.js";
import { UsuarioController } from "./infrastructure/controllers/usuarioController.js";
import { crearUsuarioRoutes } from "./infrastructure/routes/usuarioRoutes.js";

import { ProductoRepository } from "./infrastructure/repositories/productoRepository.js";
import { ProductoUseCases } from "./application/use-cases/productos/productoUseCases.js";
import { ProductoController } from "./infrastructure/controllers/productoController.js";
import { crearProductoRoutes } from "./infrastructure/routes/productoRoutes.js";
import { autenticar, autorizarRoles } from "./infrastructure/middleware/authMiddleware.js";

import { PedidosUseCases } from "./application/use-cases/pedidosUseCases.js";
import { PedidoController } from "./infrastructure/controllers/pedidoController.js";
import { crearPedidoRoutes } from "./infrastructure/routes/pedidoRoutes.js";
import { NodeMailAdapter } from "./infrastructure/adapters/NodeMailAdapter.js";

import { AuthUseCases } from "./application/use-cases/authUseCases.js";
import { AuthController } from "./infrastructure/controllers/authController.js";
import { crearAuthRoutes } from "./infrastructure/routes/authRoutes.js";

import { AnalyticsRepositoryAdapter } from "./infrastructure/repositories/analyticsRepositoryAdapter.js";
import { AnalyticsService } from "./application/use-cases/analytics/analyticsService.js";
import { ReportesController } from "./infrastructure/controllers/reportesController.js";
import { crearReportesRoutes } from "./infrastructure/routes/reportesRoutes.js";

dotenv.config();

if (!process.env.AUTH_JWT_SECRET) {
    throw new Error("Define AUTH_JWT_SECRET en backend/.env antes de iniciar el servidor");
}

const app = express();

app.use(cors());
app.use(express.json());

// USUARIOS
const usuarioRepository = new UsuarioRepository();

const usuarioUseCases =
    new UsuarioUseCases(usuarioRepository);

const usuarioController =
    new UsuarioController(usuarioUseCases);

app.use(
    "/api/usuarios",
    crearUsuarioRoutes(usuarioController, autenticar, autorizarRoles("admin"))
);
// AUTENTICACIÓN

const authUseCases =
    new AuthUseCases(usuarioRepository);

const authController =
    new AuthController(authUseCases);

app.use(
    "/api/auth",
    crearAuthRoutes(authController)
);

// PRODUCTOS
const productoRepository = new ProductoRepository();

const productoUseCases =
    new ProductoUseCases(productoRepository);

const productoController =
    new ProductoController(productoUseCases);

app.use(
    "/api/productos",
    crearProductoRoutes(productoController, autenticar, autorizarRoles)
);

//pedidos

const emailService = new NodeMailAdapter();
const pedidoUseCases = new PedidosUseCases({
    emailService,
    usuarioRepository
});

const pedidoController =
    new PedidoController(pedidoUseCases);

app.use(
    "/api/pedidos",
    crearPedidoRoutes(pedidoController, autenticar, autorizarRoles)
);

// REPORTES
const analyticsRepository = new AnalyticsRepositoryAdapter();
const analyticsService = new AnalyticsService(analyticsRepository);
const reportesController = new ReportesController(analyticsService);

app.use(
    "/api/reportes",
    crearReportesRoutes(reportesController, autenticar, autorizarRoles)
);

// RUTA PRINCIPAL
app.get("/", (req, res) => {
    res.json({
        mensaje: "API Ecommerce funcionando"
    });
});

// PRUEBA DE BASE DE DATOS
app.get("/api/test-db", async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT 1 AS conectado"
        );

        res.json({
            mensaje: "Conexión a PostgreSQL exitosa",
            resultado: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error de conexión a PostgreSQL",
            error: error.message
        });
    }
});

// SERVIDOR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});
