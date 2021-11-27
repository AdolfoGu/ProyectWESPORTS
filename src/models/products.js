const mongoose = require('mongoose');
const {Schema} = mongoose;

const productSchema = new Schema({
        Nombre: String,
        Cantidad: String,
        Marca: String,
        Descripcion: String,
        Precio: String,
});
  
module.exports = mongoose.model('product', productSchema);