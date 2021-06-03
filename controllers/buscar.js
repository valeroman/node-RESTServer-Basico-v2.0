const { response } = require('express');
const { ObjectId } = require('mongoose').Types;

const { Categoria, Producto, Usuario } = require('../models')

const coleccionesPermitidas = [
    'usuarios',
    'categorias',
    'productos',
    'roles'
];

const buscarUsuarios = async(termino = '', res = response) => {

    const esMongoId = ObjectId.isValid(termino);

    if (esMongoId) {
        const usuario = await Usuario.findById(termino);
        return res.json({
            results: (usuario) ? [usuario] : []
        });
    }

    const regex = new RegExp(termino, 'i');
    const query = {
        $or: [{ nombre: regex }, { correo: regex }],
        $and: [{ estado: true }]
    };
    // const usuarios = await Usuario.find({
    //     $or: [{ nombre: regex }, { correo: regex }],
    //     $and: [{ estado: true }]
    // });

    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
    ]);

    res.json({

        results: {
            total,
            usuarios
        }
    });
}

const buscarCategorias = async(termino = '', res = response) => {

    const esMongoId = ObjectId.isValid(termino);

    if (esMongoId) {
        const categoria = await Categoria.findById(termino);
        return res.json({
            results: (categoria) ? [categoria] : []
        });
    }

    const regex = new RegExp(termino, 'i');
    const query = { $or: [{ nombre: regex }], $and: [{ estado: true }] };

    const [total, categorias] = await Promise.all([
        Categoria.countDocuments(query),
        Categoria.find(query)
    ]);

    res.json({

        results: {
            total,
            categorias
        }
    });

}

const buscarProductos = async(termino = '', res = response) => {

    const esMongoId = ObjectId.isValid(termino);

    if (esMongoId) {
        const producto = await Producto.findById(termino)
        c.populate('categoria', 'nombre');
        return res.json({
            results: (producto) ? [producto] : []
        });
    }

    const regex = new RegExp(termino, 'i');
    const query = {
        $or: [{ nombre: regex }, { descripcion: regex }],
        $and: [{ estado: true }]
    };

    const [total, productos] = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query)
        .populate('categoria', 'nombre')
    ]);

    res.json({

        results: {
            total,
            productos
        }
    });
}


const buscar = (req, res = response) => {

    const { coleccion, termino } = req.params;

    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            msg: `Las colecciones permitidas son: ${ coleccionesPermitidas }`
        });
    }

    switch (coleccion) {
        case 'usuarios':
            buscarUsuarios(termino, res);
            break;
        case 'categorias':
            buscarCategorias(termino, res);
            break;

        case 'productos':
            buscarProductos(termino, res);
            break;

        default:
            res.status(500).json({
                msg: 'Se le olvido hacer la busqueda'
            });
    }
}

module.exports = {
    buscar
}