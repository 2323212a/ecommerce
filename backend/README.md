# Backend NovaShop

El backend usa PostgreSQL. Configura `backend/.env` a partir de `.env.example`
con la conexión de PostgreSQL y un valor aleatorio y privado para
`AUTH_JWT_SECRET` (por ejemplo, genera uno con `node -e
"console.log(require('node:crypto').randomBytes(32).toString('hex'))"`).
No reutilices ni publiques ese secreto.

1. Instala dependencias desde `backend`: `npm install`.
2. Crea la base indicada por `DB_NAME` en PostgreSQL y ejecuta
   `src/infrastructure/database/schema.sql` en esa base.
3. Inicia el API: `npm run dev`.
4. Promueve a administrador un usuario existente con
   `UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@ejemplo.com';`.
   Para el primer administrador, genera un hash bcrypt con
   `node --input-type=module -e "import bcrypt from 'bcrypt'; console.log(await bcrypt.hash(process.argv[1], 10))" "CONTRASENA"`
   y úsalo como `password_hash` al ejecutar:
   `INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ('Administrador', 'admin@ejemplo.com', '<HASH_BCRYPT>', 'admin');`.

El login devuelve un token de sesión firmado por `AUTH_JWT_SECRET`. Admin y
empleado pueden agregar productos; solo admin puede editarlos, eliminarlos,
administrar usuarios y administrar todos los pedidos. Las operaciones de
lectura del catálogo permanecen públicas. Los usuarios autenticados pueden
crear pedidos y consultar únicamente sus propios pedidos; admin también puede
consultar todos los pedidos.

El esquema crea una base PostgreSQL nueva; no copia automáticamente datos
que pudieran existir en otra base.
