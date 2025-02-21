const { type } = require("os");

module.exports = (sequelize, DataTypes) => {
  let alias = "Persona";

  let cols = {
    persona_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
    },
    apellido: {
      type: DataTypes.STRING,
    },
    correo: {
      type: DataTypes.STRING,
    },
    contrasena: {
      type: DataTypes.STRING,
    },
    tipo_usuario_id: {
      type: DataTypes.INTEGER,
    },
    curso_id: {
      type: DataTypes.INTEGER,
    },
  };

  let config = {
    tableName: "persona",
    timestamps: false,
  };

  const Persona = sequelize.define(alias, cols, config);

  Persona.associate = (models) => {
    Persona.belongsTo(models.TipoUsuario, {
      as: "tipoUsuario",
      foreignKey: "tipo_usuario_id",
    });
    Persona.belongsTo(models.Curso, {
      as: "curso",
      foreignKey: "curso_id",
    });
  };

  return Persona;
};
