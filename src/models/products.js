const mongoose = require('mongoose');
const {Schema} = mongoose;

const productSchema = new Schema({
        Nombre: String,
        Cliente: String,
        Pedido: String,
        Fecha: String,
        Usuario: String,
});
  
module.exports = mongoose.model('product', productSchema);