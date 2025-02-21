module.exports = (sequelize, DataTypes) => {
    let alias = 'Curso';

    let cols = {
        curso_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre_curso: {
            type: DataTypes.STRING
        },
        orientacion: {
            type: DataTypes.STRING
        }
    };

    let config = {
        tableName: 'curso',
        timestamps: false
    };

    const Curso = sequelize.define(alias, cols, config);

    Curso.associate = (models) => {
        Curso.hasMany(models.Persona, {
            as: 'personas',
            foreignKey: 'curso_id'
        });
        Curso.belongsToMany(models.Materia, {
            through: models.CursoMateria,
            as: 'materias'
        });
    };

    return Curso;
};