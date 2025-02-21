// LLamadas de Librerias
const express = require("express");
// Crear la aplicación de Express
const app = express();
const path = require("path");
const session = require("express-session");

// Configura sesiones en tu app principal
app.use(
  session({
    secret: "tu_secreto_segurisimo",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Cambiar a true si usas HTTPS
  })
);


const port = process.env.port || 2025;
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null; // Si no hay usuario logueado, será `null`
  next();
});
// Configurar la carpeta pública para servir archivos estáticos
const publico = path.resolve(__dirname, "../public");
app.use(express.static(publico));

// Configurar el motor de vistas a usar
app.set("view engine", "ejs"); // usar EJS como motor de vistas
app.set("views", path.resolve(__dirname, "vistas")); // establecer la carpeta de vistas en ./views

// Middlewares
app.use(express.urlencoded({ extended:false })); //para analizar datos de formularios (application/x-www-form-urlencoded)
// Middleware para analizar datos JSON (application/json)

app.use(express.json());

// Levantar servidor
app.listen(port, () => console.log("Corriendo servidor en: http://localhost:2025/index"));
// rutas para el inicio de la aplicación
app.use("/", require("./router/routes"));   
