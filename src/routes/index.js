
const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const axios = require("axios").default;
const { Country, Activity } = require("../db");


const router = Router();

// Configurar los routers
//Ejemplo: router.use('/auth', authRouter);

const getApiInfo = async () =>{
    try{ 
        
        const apiUrl = await axios.get(
         `https://restcountries.com/v3/all`);
        const apiInfo = await apiUrl.data.map((e) =>{
        const inDb ={
            id: e.cca3,
            name: e.name.common,
            img: e.flags[0],
            continent: e.region,
            capital: e.capital ? e.capital[0] : "No tiene capital",
            subregion: e.subregion,
            area: e.area,
            population: e.population,
            lenguage : e.languages && Object.values(e.languages)

        }
        Country.findOrCreate({
          where: { id: e.cca3 },
          defaults: inDb
      });
      return inDb;
    })
    //console.log(apiInfo);
    return apiInfo
  
}catch(err){
    console.log(err)
}
}


const getDbInfo = async () => {
    return await Activity.findAll({
      includes: {
        model: Country,
        attributes: ["name", "id"],
        through: {
          attributes: [],
        },
      },
    });
  };

  const getAllInfo = async () => {
  
    const apiInfo = await getApiInfo();
    const dbInfo = await getDbInfo();
    const totalInfo = apiInfo.concat(dbInfo)
    return totalInfo;
    
  };
  
  router.get("/countries", async (req,res) =>{
      const {name} = req.query
      let countriesTotal = await getAllInfo(); //modifique el getAllInfo por getApiInfo

      if(name){
        let countrieName = await countriesTotal.filter((e) => e.name.toLowerCase().includes(name.toLowerCase()))
        
        countrieName.length?
        res.status(200).json(countrieName):
        res.status(404).send("Countrie not Found");

      }else{
          res.status(200).send(countriesTotal);
      }
  })

  router.get("/countries/:id", async (req, res) =>{
      const { id } = req.params;
      const totalCountries = await getAllInfo()

      if(id){
        // let countriesId = await totalCountries.filter( e => e.id == id)
        let countriesId = await totalCountries.filter( e => e.id == id) && await Country.findAll({
          include:{
            model:Country,
            attributes:["name","id"],
            through:{
              attributes:[]
            }
           }
        })
        console.log(id)
        
        countriesId.length
        ?res.status(200).json(countriesId)
        :res.status(404).send("Match not Found")
      }
  })

  router.post("/activity", async (req, res) =>{
    let {name, duration, season, difficulty, country} = req.body //recibe los datos por body mediante formulario
    try {
        let newActivity = await Activity.create({
            name : name,
            difficulty : difficulty,
            duration : duration,
            season : season, 
            
           })
           
           let findNewCountry = await Country.findAll({
            where: {name : country},    //aca busco el pais en la DB  cuando ingreso un valor :pais en el form
        })
        
        newActivity.addCountry(findNewCountry); //agrego la propiedad pais que encontre a la actividad que estoy creando
        res.send("Activity successfully created")
       
    } catch (error) {
        console.log("information missing",error);
    }
    });

router.get("/activity", async (req, res) =>{
  const activityenDb = await Activity.findAll({
   include:{
     model:Country,
     attributes:["name","id"],
     through:{
       attributes:[]
     }
    }
  })
  console.log(activityenDb)
  res.json(activityenDb)
})




module.exports = router;
