module.exports = (sequelize, DataTypes) => {
    return sequelize.define('TipoUsuario', {
        tipo_usuario_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName:   
 'tipo_usuario',
        timestamps: false
    });
};