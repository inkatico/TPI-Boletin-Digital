const mainController = {};
mainController.setLocals = (req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
};
const mysql = require("mysql");
const bcrypt = require("bcrypt"); // Usaremos bcrypt para cifrar/verificar contraseñas
const { log } = require("console");
let conexion = mysql.createConnection({
  host: "127.0.0.1",
  database: "boletin",
  user: "root",
  password: null
})

mainController.index = async (req, res) => {
  return res.render("index.ejs");
};
mainController.login = async (req, res) => {
  return res.render("login.ejs");
};
mainController.dep = async (req, res) => {
  return res.render("dep.ejs");
};
mainController.alumno = async (req, res) => {
  return res.render("alumno.ejs");
};
mainController.info = async (req, res) => {
  return res.render("info.ejs");
};
mainController.carga = async (req, res) => {
  return res.render("carga.ejs");
};
mainController.vista = async (req, res) => {
  let buscarMaterias = `SELECT m.nombre_materia FROM curso_materia cm JOIN materia m ON cm.materia_id = m.materia_id WHERE cm.curso_id = ${req.session.usuario.curso_id}`;

  conexion.query(buscarMaterias, (error, results) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res.status(500).send("Error en el servidor");
    }
    console.log("Materias encontradas:", results); // Verifica los datos en consola

    return res.render("vista.ejs", { materias: results });
  });
};
mainController.regis = async (req, res) => {
  return res.render("regis.ejs");
};
mainController.admin = async (req, res) => {
  return res.render("admin.ejs");
};

mainController.processLogin = async (req, res) => { 
  const { usuario, contrasena } = req.body;

  // Consulta para buscar el usuario en la base de datos
  let buscarUsuario = `SELECT * FROM persona WHERE correo = '${usuario}'`;

  conexion.query(buscarUsuario, async (error, rows) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res.render("login.ejs", { alerta: "Error en el servidor." });
    }

    if (rows.length === 0) {
      return res.render("login.ejs", { alerta: "Usuario no encontrado." });
    }

    const usuarioData = rows[0];

    // Verifica la contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuarioData.contrasena);
    if (!contrasenaValida) {
      return res.render("login.ejs", { alerta: "Contraseña incorrecta." });
    }

    // Autenticación exitosa
    console.log("Inicio de sesión exitoso:", usuarioData.nombre);
    // Guardar datos del usuario en la sesión
    req.session.usuario = {
      id: usuarioData.persona_id,
      nombre: usuarioData.nombre,
      apellido: usuarioData.apellido,
      correo: usuarioData.correo,
      tipo_usuario: usuarioData.tipo_usuario_id,
      curso_id: usuarioData.curso_id,
    };
    // Redirige según el tipo de usuario
    switch (usuarioData.tipo_usuario_id) {
      case 1: // Tipo de usuario: Administrador
        return res.redirect("/alumno");
      case 2: // Tipo de usuario: Alumno
        return res.redirect("/admin");
      case 3: // Tipo de usuario: Docente
        return res.redirect("/dep");
      default:
        return res.redirect("/"); // Página por defecto para tipos no reconocidos
    }
  });
};



mainController.funcionregis = async (req, res) => {
  const datos = req.body;
  const contrasena = await bcrypt.hash(datos.dni, 10); // Cifrar contraseña
  let dni = datos.dni;
  let nombre = datos.nombre;
  let curso = datos.curso;
  let apellido = datos.apellido;
  let email = datos.email;
  let tipo_usuario_id = "1";

  let buscar = `SELECT * FROM persona WHERE persona_id = ${dni}`;
  conexion.query(buscar, function (error, row) {
    if (error) {
      throw error;
    } else {
      if (row.length > 0) {
        res.redirect("/regis?alerta=Usuario ya existente.");
      } else {
        let registrar = `
          INSERT INTO persona (persona_id, nombre, apellido, correo, contrasena, tipo_usuario_id, curso_id)
          VALUES ('${dni}', '${nombre}', '${apellido}', '${email}', '${contrasena}', '${tipo_usuario_id}', '${curso}')
        `;
        conexion.query(registrar, function (error) {
          if (error) {
            throw error;
          } else {
            console.log("Datos almacenados correctamente");
            res.redirect("/regis");
          }
        });
      }
    }
  });
};

module.exports = mainController;
