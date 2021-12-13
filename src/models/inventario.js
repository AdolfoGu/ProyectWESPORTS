const mongoose = require('mongoose');
const {Schema} = mongoose;

const inventarioSchema = new Schema({
    codigo: String,
    descripcion: String,
    cantidad: Number,
});

module.exports = mongoose.model('Inventario', inventarioSchema);