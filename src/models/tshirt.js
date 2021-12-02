const mongoose = require('mongoose');
const {Schema} = mongoose;

const tshirtSchema = new Schema({
    modelo: String,
    descripcion: String,
    talla: String,
    cantidad: String,
    Usuario: String,
    bitacora: String,
});

module.exports = mongoose.model('Tshirt', tshirtSchema);