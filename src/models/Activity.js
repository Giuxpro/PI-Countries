const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('activity', {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
   
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dificultad:{
      validate: (value)=>{
        if(value < 1 || value > 5){
          throw new Error("Difficulty cannot be zero or greater than 5");
        }
      },
      type: DataTypes.INTEGER,
    },
    duracion: {
      type: DataTypes.INTEGER,
    },
    temporada:{
        type: DataTypes.STRING,
    }
    
  });
};
