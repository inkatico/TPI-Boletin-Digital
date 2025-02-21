const Sequelize = require('sequelize'); 
const config = require('../config'); 

const sequelize = new Sequelize(
  'boletin',
  'root',
  null,
  {
    host: config.host,
    dialect: 'mysql',
  }
);

const db = {};

// Importar los modelos
db.Persona = require('./Persona')(sequelize, Sequelize.DataTypes);
db.Curso = require('./Curso')(sequelize, Sequelize.DataTypes);
db.Materia = require('./Materia')(sequelize, Sequelize.DataTypes);
db.CursoMateria = require('./CursoMateria')(sequelize, Sequelize.DataTypes);
db.Nota = require('./Nota')(sequelize, Sequelize.DataTypes);
db.TipoUsuario = require('./TipoUsuarios')(sequelize, Sequelize.DataTypes);

// Asociaciones
// Persona y Curso
db.Persona.belongsTo(db.Curso, { as: 'curso', foreignKey: 'curso_id' });
db.Curso.hasMany(db.Persona, { as: 'Personas', foreignKey: 'curso_id' });

// CursoMateria para la relación muchos a muchos entre Curso y Materia
db.Curso.belongsToMany(db.Materia, { through: db.CursoMateria, as: 'materias', foreignKey: 'curso_id' });
db.Materia.belongsToMany(db.Curso, { through: db.CursoMateria, as: 'cursos', foreignKey: 'materia_id' });

// Persona y TipoUsuario
db.Persona.belongsTo(db.TipoUsuario, { as: 'tipoUsuario', foreignKey: 'tipo_usuario_id' });
db.TipoUsuario.hasMany(db.Persona, { as: 'personas', foreignKey: 'tipo_usuario_id' });

// Notas con Persona, Materia y Curso
db.Nota.belongsTo(db.Persona, { as: 'persona', foreignKey: 'persona_id' });
db.Persona.hasMany(db.Nota, { as: 'notas', foreignKey: 'persona_id' });

db.Nota.belongsTo(db.Materia, { as: 'materia', foreignKey: 'materia_id' });
db.Materia.hasMany(db.Nota, { as: 'notas', foreignKey: 'materia_id' });

db.Nota.belongsTo(db.Curso, { as: 'curso', foreignKey: 'curso_id' });
db.Curso.hasMany(db.Nota, { as: 'notas', foreignKey: 'curso_id' });

// Sincronizar los modelos con la base de datos
sequelize.sync()
  .then(() => {
    console.log('Modelos sincronizados con la base de datos.');
  })
  .catch(error => {
    console.error('Error al sincronizar los modelos:', error);
  });

module.exports = db;
