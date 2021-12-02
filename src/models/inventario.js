const mongoose = require('mongoose');
const {Schema} = mongoose;

const inventarioSchema = new Schema({
    title: String,
    description: String,
    cantidad: Number,
    filename: {type: String},
    path: {type: String},
});

module.exports = mongoose.model('Inventario', inventarioSchema);