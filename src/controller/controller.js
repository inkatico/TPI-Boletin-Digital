const mainController = {};
mainController.setLocals = (req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
};
const mysql = require("mysql");
const bcrypt = require("bcrypt"); // Usaremos bcrypt para cifrar/verificar contraseñas
const { log } = require("console");
const { statfsSync } = require("fs");
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
mainController.dep = (req, res) => {
  let buscarCurso = `SELECT * FROM curso`;

  conexion.query(buscarCurso, (error, rows) => {
    if (error) {
      console.error("Error al obtener los cursos:", error);
      return res.render("dep.ejs", { alerta: "Error en el servidor.", cursos: [] });
    }

    res.render("dep.ejs", { cursos: rows });
  });
};

mainController.alumno = async (req, res) => {
  return res.render("alumno.ejs");
};
mainController.info = async (req, res) => {
  return res.render("info.ejs");
};

mainController.carga = async (req, res) => {
  try {
    const dni = req.query.personaId || ""; // Obtiene el DNI de la URL si existe
    const cursoId = req.params.id; // Extrae el ID del curso
    // Consulta para obtener los usuarios del curso
    const buscarUsuarios = `SELECT * FROM persona WHERE curso_id = ?`;
    conexion.query(buscarUsuarios, [cursoId], (error, usuarios) => {
      if (error) {
        console.error("Error en la consulta de usuarios:", error);
        return res.render("carga.ejs", { alerta: "Error en el servidor.", usuarios: [], dni });
      }

      // Consulta para obtener las materias del curso
      const buscarMaterias = `SELECT m.materia_id, m.nombre_materia FROM curso_materia cm JOIN materia m ON cm.materia_id = m.materia_id WHERE cm.curso_id = ?`;
      conexion.query(buscarMaterias, [cursoId], (error, materias) => {
        if (error) {
          console.error("Error en la consulta de materias:", error);
          return res.render("carga.ejs", { alerta: "Error en el servidor.", usuarios, dni });
        }

        // Consulta para obtener las notas del alumno
        const buscarNotas = `SELECT materia_id, nota, cuatrimestre, informe FROM nota WHERE persona_id = ? AND curso_id = ?`;
        conexion.query(buscarNotas, [dni, cursoId], (error, notas) => {
          if (error) {
            console.error("Error en la consulta de notas:", error);
            return res.render("carga.ejs", { alerta: "Error en el servidor.", usuarios, dni, materias });
          }

          // Renderizamos la vista pasando los usuarios, materias, notas y el DNI
          res.render("carga.ejs", {
            usuarios,
            dni,
            materias,
            notas,
            alerta: null // Para no mostrar el mensaje de error si todo salió bien
          });
        });
      });
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    res.render("carga.ejs", { alerta: "Error en el servidor.", usuarios: [], dni });
  }
};
;
mainController.cargaNotas = async (req, res) => {
  const regex = /nota(?:([\d])Cuat)?(\d*)?(1NP|2NP|NC|Final|Anual|RecuperatorioDic|RecuperatorioFeb|NotaFinal)_(\d+)/;

  const notasFiltradas = [];
  // Obtener persona_id y curso_id desde la URL
  const dni = req.body.persona_id[1];
  const curso_id = req.body.curso_id[1]; // Asegúrate de que 'curso' está en los parámetros
  // Filtrar notas válidas
  const notas = Object.entries(req.body).filter(([key, value]) => {
    return !isNaN(value) && value.trim() !== '';
  });

  notas.forEach(([key, value]) => {
    const match = key.match(regex);
    if (match) {
      const [, cuatrimestre, informeNum, tipo, materia_id] = match;

      const cuatrimestreNum = cuatrimestre ? parseInt(cuatrimestre) : 0;
      const tipoCorregido = tipo.replace("1NP", "1NP").replace("2NP", "2NP");

      const informeMap = {
        "1NP": { "1": 1, "2": 1 },
        "2NP": { "1": 2, "2": 2 },
        "NC": { "1": 3, "2": 3 },
        "Final": { "1": 3, "2": 3, "0": 7 },
        "Anual": { "0": 4 },
        "RecuperatorioDic": { "0": 5 },
        "RecuperatorioFeb": { "0": 6 },
        "NotaFinal": { "0": 7 },
      };

      let informe = informeMap[tipoCorregido]?.[cuatrimestreNum] || informeMap[tipoCorregido]?.["0"];

      notasFiltradas.push({
        materia_id: parseInt(materia_id),
        cuatrimestre: cuatrimestreNum,
        informe: parseInt(informe),
        nota: parseFloat(value)
      });

      console.log(`Materia_id: ${materia_id}, Cuatrimestre: ${cuatrimestreNum}, Informe: ${informe}, Nota: ${value}`);
    } else {
      console.log(`No coincidió: ${key}`);
    }
  });

  // Si hay notas, insertarlas en la base de datos
  if (notasFiltradas.length > 0) {
    let condicionesDelete = notasFiltradas.map(nota =>
      `(materia_id = '${nota.materia_id}' AND cuatrimestre = '${nota.cuatrimestre}' AND informe = '${nota.informe}' AND persona_id = '${dni}' AND curso_id = '${curso_id}')`
    ).join(" OR ");

    let eliminarNotas = `DELETE FROM nota WHERE ${condicionesDelete}`;

    conexion.query(eliminarNotas, function (error) {
      if (error) {
        console.error("Error al eliminar notas existentes:", error);
        return res.redirect("/cargahola?error=Error al actualizar las notas");
      } else {
        console.log("Notas existentes eliminadas correctamente");

        // Insertar las nuevas notas después de eliminar las antiguas
        let valoresInsert = notasFiltradas.map(nota =>
          `('${nota.materia_id}', '${nota.cuatrimestre}', '${nota.informe}', '${nota.nota}', '${dni}', '${curso_id}')`
        ).join(",");

        let insertarNotas = `
          INSERT INTO nota (materia_id, cuatrimestre, informe, nota, persona_id, curso_id) 
          VALUES ${valoresInsert}
        `;

        conexion.query(insertarNotas, function (error) {
          if (error) {
            console.error("Error al insertar notas:", error);
            return res.redirect("/cargahola?error=Error al guardar las notas");
          } else {
            console.log("Datos almacenados correctamente");
            return res.redirect(`/carga/${curso_id}/1`);
          }
        });
      }
    });
  }
};
// Buscar alumno por ID y traer sus materias y notas
mainController.vista = async (req, res) => {
  console.log(req.session.usuario);

  let buscarMaterias = `
    SELECT m.materia_id, m.nombre_materia 
    FROM curso_materia cm 
    JOIN materia m ON cm.materia_id = m.materia_id 
    WHERE cm.curso_id = ${req.session.usuario.curso_id}`;

  let mostrarNota = `
    SELECT materia_id, nota, cuatrimestre, 
      CASE 
        WHEN informe = 1 THEN '1 NP'
        WHEN informe = 2 THEN '2 NP'
        WHEN informe = 3 THEN 'Final'
        WHEN informe = 4 THEN 'Anual'
        WHEN informe = 5 THEN 'Recuperatorio Dic'
        WHEN informe = 6 THEN 'Recuperatorio Feb'
        WHEN informe = 7 THEN 'Nota Final'
      END AS informe
    FROM nota 
    WHERE persona_id = ${req.session.usuario.id} 
    AND curso_id = ${req.session.usuario.curso_id}`;

  conexion.query(buscarMaterias, (error, materias) => {
    if (error) {
      console.error("Error en la consulta de materias:", error);
      return res.status(500).send("Error en el servidor");
    }

    conexion.query(mostrarNota, (error, notas) => {
      if (error) {
        console.error("Error en la consulta de notas:", error);
        return res.status(500).send("Error en el servidor");
      }
      console.log("Materias encontradas:", materias);
      console.log("Notas encontradas:", notas);

      return res.render("vista.ejs", { materias, notas });
    });
  });
};



mainController.regis = async (req, res) => {
  return res.render("regis.ejs");
};
mainController.gestion = async (req, res) => {
  const datos = req.body;
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
  return res.render("gestion.ejs");
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