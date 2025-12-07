'use strict';

const Adquire = require('../model/acquire');

async function guardarDatos(datosKunna) {
    try {
        const acquire = new Adquire(datosKunna);
        return await acquire.save();
    } catch (err) {
        throw new Error(`Error al guardar los datos de KUNNA: ${err}`);
    }
}

module.exports = {
    guardarDatos
};