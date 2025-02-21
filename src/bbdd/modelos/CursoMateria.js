module.exports = (sequelize, DataTypes) => {
    let alias = 'CursoMateria';
  
    let cols = {
      curso_materia_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      curso_id: {
        type: DataTypes.INTEGER
      },
      materia_id: {
        type: DataTypes.INTEGER
      }
    };
  
    let config = {
      tableName: 'curso_materia',
      timestamps: false
    };
  
    const CursoMateria = sequelize.define(alias, cols, config);
  
    CursoMateria.associate = (models) => {
      CursoMateria.belongsTo(models.Curso, {
        as: 'curso',
        foreignKey: 'curso_id'
      });
      CursoMateria.belongsTo(models.Materia, {
        as: 'materia',
        foreignKey: 'materia_id'
      });
    };
  
    return CursoMateria;
  };