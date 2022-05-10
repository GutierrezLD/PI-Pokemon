const { Pokemon, Types } = require('../db')
const axios = require('axios');

//CARGA LA TABLA DE POKEMONS

// const getPoke =  () => {
//     const pokemons = fetch('https://pokeapi.co/api/v2/pokemon?offset=0&limit=100')
//         .then(res=>json())
//         .then(json=>json.results)
//     console.log(pokemons,"THIS IS POKEMONS")
//     const mapUrl = pokemons.map(e => {return fetch(e.url)})
//     const finallyPokemons=Promise.all(mapUrl)
//     var arrayPokemones = [];
//     for (var i = 0; i < mapUrl.length; i++) {
//         const url = await axios(mapUrl[i])
//         arrayPokemones.push({
//             idPoke: url.data.id,
//             name: url.data.name,
//             height: url.data.height,
//             weight: url.data.weight,
//             hp: url.data.stats.find(e => e.stat.name === 'hp').base_stat,
//             attack: url.data.stats.find(e => e.stat.name === 'attack').base_stat,
//             defense: url.data.stats.find(e => e.stat.name === 'defense').base_stat,
//             speed: url.data.stats.find(e => e.stat.name === 'speed').base_stat,
//             types: url.data.types.map(e => e = { name: e.type.name }),
//             // img: url.data.sprites.versions['generation-v']['black-white'].animated.front_default,
//             img: url.data.sprites.other["official-artwork"].front_default,
//         }
//         );
//     }
//     return arrayPokemones;
// }
const getPoke = async () => {
    const pokemons = await fetch('https://pokeapi.co/api/v2/pokemon?offset=0&limit=100');
    const mapUrl = await pokemons.data.results.map(e => { return e.url })
    var arrayPokemones = [];
    for (var i = 0; i < mapUrl.length; i++) {
        const url = await axios(mapUrl[i])
        arrayPokemones.push({
            idPoke: url.data.id,
            name: url.data.name,
            height: url.data.height,
            weight: url.data.weight,
            hp: url.data.stats.find(e => e.stat.name === 'hp').base_stat,
            attack: url.data.stats.find(e => e.stat.name === 'attack').base_stat,
            defense: url.data.stats.find(e => e.stat.name === 'defense').base_stat,
            speed: url.data.stats.find(e => e.stat.name === 'speed').base_stat,
            types: url.data.types.map(e => e = { name: e.type.name }),
            // img: url.data.sprites.versions['generation-v']['black-white'].animated.front_default,
            img: url.data.sprites.other["official-artwork"].front_default,
        }
        );
    }
    return arrayPokemones;
}

const createFromApi = async function () {
    const pokemonsInDb = await Pokemon.findAll({ where: { createdDb: true } }) //agarro todos los creados por usuario
    const count = await Pokemon.count(); //cuento cuantos hay en la base de datos
    if (pokemonsInDb.length === count) { // comparo, si son iguales, quiere decir que en la base de datos solo hay pokemones creados por el usuario
        const apiPoke = await getPoke();
        // console.log("ACA ESTA EL POKE", apiPoke[apiPoke.length - 1]);
        for (var i = 0; i < apiPoke.length; i++) {
            let newPoke = await Pokemon.create({
                idPoke: apiPoke[i].idPoke,
                name: apiPoke[i].name,
                height: apiPoke[i].height,
                weight: apiPoke[i].weight,
                hp: apiPoke[i].hp,
                attack: apiPoke[i].attack,
                defense: apiPoke[i].defense,
                speed: apiPoke[i].speed,
                img: apiPoke[i].img
            })
            let typeDb = await Types.findAll({ where: { name: apiPoke[i].types[0].name } })
            newPoke.addType(typeDb);
            // console.log(typeDb, i);
            if (apiPoke[i].types[1]) {
                let typeDb2 = await Types.findAll({ where: { name: apiPoke[i].types[1].name } })
                newPoke.addType(typeDb2);
                // console.log(typeDb2, i, 'ACA ESTA INDEX');
            }
        }

    }
}

const getPokeDb = async function () {
    return await Pokemon.findAll({
        include: {
            model: Types,
            attributes: ['name'],
            through: {
                attributes: [],
            }
        }
    });
}

const getAllPoke = async () => {
    const createAll = await createFromApi()
    const dbPoke = await getPokeDb();
    return dbPoke;
}
// BORRA POKEMON

const deletePokemon = async function (id) {
    const deleting = await Pokemon.findOne({ where: { createdDb: true, idPoke: id } })
    if (deleting) {
        if (deleting.dataValues.createdDb) return deleting;
    }
    else throw new Error(`The Pokemon ID:"${id}" could not be found or the pokemon can not be deleted`);
}




module.exports = {
    deletePokemon,
    getAllPoke
};

