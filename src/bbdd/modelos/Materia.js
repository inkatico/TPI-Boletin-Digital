module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Materia', {
        materia_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre_materia: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'materia',
        timestamps: false
    });
};