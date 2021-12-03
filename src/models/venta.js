const mongoose = require('mongoose');
const {Schema} = mongoose;

const ventaSchema = new Schema({
    CantidadV: Number,
    Modelo: String,
    Fecha: String,
    Usuario: String,
});

module.exports = mongoose.model('Venta', ventaSchema);