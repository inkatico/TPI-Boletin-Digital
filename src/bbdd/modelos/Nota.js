module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Nota', {
        nota_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nota: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        alumno_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Persona',
                key: 'persona_id'
            }
        },
        materia_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Materia',
                key: 'materia_id'
            }
        },
        cuatrimestre: { 
            type: DataTypes.INTEGER,
            allowNull: false
        },
        informe: { 
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'nota',
        timestamps: false
    });
};