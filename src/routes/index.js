const express = require('express');
const router = express.Router();
const passport = require('passport');
const Product = require('../models/products');
const Inventario = require('../models/inventario');
const Image = require('../models/image');
const Tshirt = require('../models/tshirt');
const User = require('../models/users');
const Venta = require('../models/venta');
const { unlink } = require('fs-extra');
const path = require('path');
const tshirt = require('../models/tshirt');
const bcrypt = require('bcrypt-nodejs');


router.get('/',(req,res, next)=>{
  res.render('index');
});

router.get('/signup',(req, res, next)=>{
  res.render('signup');
});

router.post('/signup', async(req, res, next)=>{
  const { name, puesto, email, password} = req.body;
  const emailUser = await User.findOne({ email: email });

  if (!emailUser) {
    if(name.length == 0){
    req.flash('signupMessage', 'Introduce tu nombre');
    res.redirect('/signup');
    }else if(!/^[a-zA-Z ]+$/g.test(name)){
      req.flash('signupMessage', 'Solo se permiten letras');
      res.redirect('/signup');
    }else if(name.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Introduce tu nombre');
      res.redirect('/signup');
    }else if(puesto.length == 0){
      req.flash('signupMessage', 'Introduce tu puesto');
      res.redirect('/signup');
    }else if(!/^[a-zA-Z ]+$/g.test(puesto)){
      req.flash('signupMessage', 'Solo se permiten letras');
      res.redirect('/signup');
    }else if(puesto.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Introduce tu puesto');
      res.redirect('/signup');
    }else if(email.length == 0){
      req.flash('signupMessage', 'Introduce tu correo');
      res.redirect('/signup');
    }else if(password.length == 0){
      req.flash('signupMessage', 'Introduce tu contraseña');
      res.redirect('/signup');
    }else if(password.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Introduce tu contraseña');
      res.redirect('/signup');
    }else if(password.length < 4){
      req.flash('signupMessage', 'Introduce una password de 4 caracteres minimo');
      res.redirect('/signup');
    }else {
      const newUser = new User({ name, puesto, email, password });
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      res.redirect("/");
    }
  }else{
    if (emailUser) {
      req.flash('signupMessage', 'El email ya esta en uso');
      res.redirect('/signup');
    } else if(name.length == 0){
      req.flash('signupMessage', 'Introduce tu nombre');
      res.redirect('/signup');
    }else if(!/^[a-zA-Z ]+$/g.test(name)){
      req.flash('signupMessage', 'Solo se permiten letras');
      res.redirect('/signup');
    }else if(name.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Introduce tu nombre');
      res.redirect('/signup');
    }else if(puesto.length == 0){
      req.flash('signupMessage', 'Introduce tu puesto');
      res.redirect('/signup');
    }else if(!/^[a-zA-Z ]+$/g.test(puesto)){
      req.flash('signupMessage', 'Solo se permiten letras');
      res.redirect('/signup');
    }else if(puesto.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Introduce tu puesto');
      res.redirect('/signup');
    }else if(email.length == 0){
      req.flash('signupMessage', 'Introduce tu correo');
      res.redirect('/signup');
    }else if(password.length == 0){
      req.flash('signupMessage', 'Introduce tu password');
      res.redirect('/signup');
    }else if(password.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Introduce tu contraseña');
      res.redirect('/signup');
    }else if(password.length < 4){
      req.flash('signupMessage', 'Introduce una password de 4 caracteres minimo');
      res.redirect('/signup');
    }else {
      const newUser = new User({ name, puesto, email, password });
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      res.redirect("/");
    }
  }
});

router.post('/registrarventas/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  const { cantidadv } = req.body;
  const inventario = await Inventario.findById(id);
  const cantidad = inventario.cantidad;
  const modelo = inventario.codigo;

  if(cantidadv == 0){
    req.flash('signupMessage', 'Ingrese una cantidad correcta');
    res.redirect('/venta/' + id);
  }else if(cantidadv < 0){
    req.flash('signupMessage', 'Ingrese una cantidad correcta');
    res.redirect('/venta/' + id);
  }else if(cantidadv.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Ingrese una cantidad correcta');
    res.redirect('/venta/' + id);
  }else if (cantidadv > cantidad) {
    req.flash('signupMessage', 'No hay suficiente inventario');
    res.redirect('/venta/' + id);
  }else if(cantidadv <= cantidad){
    nuevaC = cantidad - cantidadv;
    console.log(nuevaC)
    await Inventario.update({_id: id} ,{ $set: {cantidad: nuevaC}});

  	var hoy = new Date();
    var dd = hoy.getDate();
    var mm = hoy.getMonth()+1;
    var yyyy = hoy.getFullYear();
    const fecha = dd+'/'+mm+'/'+yyyy;

    const venta = new Venta();
    venta.CantidadV = cantidadv;
    venta.Modelo = modelo;
    venta.Fecha = fecha;
    venta.Usuario = req.user.id;
    await venta.save();
    req.flash('signupMessage', 'Venta efectuada con exito');
    res.redirect('/inventario');
  }
});

router.get('/venta/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  const inventario = await Inventario.findById(id);
  res.render('venta', { 
    inventario 
  });
});

router.get('/verventas',isAuthenticated, async(req, res, next) => {
  const verventas = await Venta.find({Usuario: req.user.id });
  const usuario = await User.find({_id: req.user.id});

  res.render('verventas',{
    verventas,
    usuario
  });
});

router.post('/index', passport.authenticate('local-signin', {
    successRedirect: '/catalogo',
    failureRedirect: '/',
    failureFlash: true
}));

router.get('/profile',isAuthenticated, (req, res, next) => {
  res.render('profile');
});

router.get('/inventario',isAuthenticated, async(req, res, next) => {
  const inventario = await Inventario.find();
  const images = await Image.find();

  res.render('inventario',{
    inventario,
    images
  });
});

router.get('/agregarinventario',isAuthenticated, async(req, res, next) => {
  const images = await Image.find();

  res.render('agregarinventario',{ 
    images 
  });
});

router.post('/addinventario',isAuthenticated, async(req, res, next) => {
  inventario = new Inventario();
  const titulo = req.body.codigo;
  const des = req.body.description;
  const can = req.body.cantidad;
  const inv = await Inventario.findOne({codigo: titulo});

  if(inv){
    req.flash('signupMessage', 'El código ya existe');
    res.redirect('agregarinventario');
  }else if(des.length == 0){
    req.flash('signupMessage', 'Agregue una descripción');
    res.redirect('agregarinventario');
  }else if(des.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Agregue una descripción');
    res.redirect('agregarinventario');
  }else if(can.length == 0){
    req.flash('signupMessage', 'Ingrese una cantidad');
    res.redirect('agregarinventario');
  }else if(can.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Ingrese una cantidad');
    res.redirect('agregarinventario');
  }else if(can < 0){
    req.flash('signupMessage', 'Ingrese una cantidad correcta');
    res.redirect('agregarinventario');
  }else if(titulo == 'Selecciona una opcion'){
    req.flash('signupMessage', 'Ingrese un código');
    res.redirect('agregarinventario');
  }
  else{
    inventario.codigo = req.body.codigo;
    inventario.descripcion = req.body.description;
    inventario.cantidad = req.body.cantidad;
    await inventario.save();
    req.flash('signupMessage', 'Producto Guardado');
    res.redirect('inventario');
  }
});

router.get('/editarinventario/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  const inventario = await Inventario.findById(id);
  const images = await Image.find();

  res.render('editarinventario', { 
    inventario,
    images
  });
});

router.post('/editarinventario/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  const codigo = req.body.codigo;
  const des = req.body.description;
  const can = req.body.cantidad;
  const inven = await Inventario.findOne({codigo: codigo});

    if(!inven){
      if(des.length == 0){
        req.flash('signupMessage', 'Ingrese una descripción');
        res.redirect('/editarinventario/' + id);
      }else if(des.charCodeAt(0) == 32){
        req.flash('signupMessage', 'Ingrese una descripción');
        res.redirect('/editarinventario/' + id);
      }else if(can.length == 0){
        req.flash('signupMessage', 'Ingrese una cantidad');
        res.redirect('/editarinventario/' + id);
      }else if(can == 0){
        req.flash('signupMessage', 'Ingrese una cantidad');
        res.redirect('/editarinventario/' + id);
      }else if(can.charCodeAt(0) == 32){
        req.flash('/editarinventario/' + id);
        res.redirect('agregarinventario');
      }else if(can < 0){
        req.flash('signupMessage', 'Ingrese una cantidad correcta');
        res.redirect('/editarinventario/' + id);
      }else if(can % 1 != 0){
        req.flash('signupMessage', 'Ingrese una cantidad correcta');
        res.redirect('/editarinventario/' + id);
      }else{
        await Inventario.update({_id: id},{ $set: {codigo: codigo , descripcion: des, cantidad: can}});
        req.flash('signupMessage', 'Editado correctamente');
        res.redirect('/inventario');
      }
    }else{
      const idb = inven._id;
      if(idb != id){
        req.flash('signupMessage', 'El código ya existe');
        res.redirect('/editarinventario/' + id);
      }else if(des.length == 0){
        req.flash('signupMessage', 'Ingrese una descripción');
        res.redirect('/editarinventario/' + id);
      }else if(des.charCodeAt(0) == 32){
        req.flash('signupMessage', 'Ingrese una descripción');
        res.redirect('/editarinventario/' + id);
      }else if(can.length == 0){
        req.flash('signupMessage', 'Ingrese una cantidad');
        res.redirect('/editarinventario/' + id);
      }else if(can.charCodeAt(0) == 32){
        req.flash('/editarinventario/' + id);
        res.redirect('agregarinventario');
      }else if(can < 0){
        req.flash('signupMessage', 'Ingrese una cantidad correcta');
        res.redirect('/editarinventario/' + id);
      }else if(can % 1 != 0){
        req.flash('signupMessage', 'Ingrese una cantidad correcta');
        res.redirect('/editarinventario/' + id);
      }else{
        await Inventario.update({_id: id},{ $set: {codigo: codigo , descripcion: des, cantidad: can}});
        req.flash('signupMessage', 'Editado correctamente');
        res.redirect('/inventario');
      }
    }
});

router.get('/eliminarinventario/:id', isAuthenticated,async (req, res, next) => {
  let { id } = req.params;
  await Inventario.remove({_id: id});

  req.flash('signupMessage', 'Eliminado con éxito');
  res.redirect('/inventario');
});

router.get('/dashboard',isAuthenticated, async(req, res, next) => {
    const products = await Product.find({Usuario: req.user.id})

    res.render('dashboard',{
      products
    });
});

router.get('/bitacora/:id',isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const tshirt = await Tshirt.find({bitacora: id});
  const idproducts = id;
  const images = await Image.find();

  res.render('bitacora',{
    tshirt,
    idproducts,
    images
  });
});

router.post('/addplayera/:id',isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const tshirt = new Tshirt (req.body);
  const modelo = req.body.modelo;
  const des = req.body.descripcion;
  const talla = req.body.talla;
  const can = req.body.cantidad;

  if(modelo == 0){
    req.flash('signupMessage', 'Ingrese un modelo');
    res.redirect('/bitacora/' + id);
  }else if(modelo.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Ingrese un modelo');
    res.redirect('/bitacora/' + id);
  }else if(modelo == 'Selecciona una opcion'){
    req.flash('signupMessage', 'Ingrese un modelo');
    res.redirect('/bitacora/' + id);
  }else if(des == 0){
    req.flash('signupMessage', 'Ingrese una descripción');
    res.redirect('/bitacora/' + id);
  }else if(des.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Ingresa una descripción');
    res.redirect('/bitacora/' + id);
  }else if(talla == 0){
    req.flash('signupMessage', 'Ingrese una talla');
    res.redirect('/bitacora/' + id);
  }else if(talla.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Ingrese una talla');
    res.redirect('/bitacora/' + id);
  }else if(talla == 'Selecciona una talla'){
    req.flash('signupMessage', 'Ingrese una talla');
    res.redirect('/bitacora/' + id);
  }else if(can == 0){
    req.flash('signupMessage', 'Ingrese una cantidad');
    res.redirect('/bitacora/' + id);
  }else if(can.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Ingrese una cantidad');
    res.redirect('/bitacora/' + id);
  }else if(!/^[0-9]+$/g.test(can)){
    req.flash('signupMessage', 'Solo números');
    res.redirect('/bitacora/' + id);
  }else{
    tshirt.bitacora = id;
    tshirt.Usuario = req.user.id;
    await tshirt.save();
    req.flash('signinMessage', 'Agragado correctamente');
    res.redirect('/bitacora/' + id);
  }
});

router.get('/ver/:id',isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const products = await Product.find({_id: id});
  const tshirt = await Tshirt.find({bitacora: id});

  res.render('verbitacora',{
    tshirt,
    products
  });
});

router.get('/catalogo',isAuthenticated, async(req, res, next) => {
  const images = await Image.find();

  res.render('catalogo', { 
    images 
  });
});

router.get('/upimg',isAuthenticated, async(req, res, next) => {
  res.render('upimg');
});

router.post('/upimg',isAuthenticated, async(req, res, next) => {
  const image = new Image();
  const titulo = req.body.title;
  const des = req.body.description;
  const ig = req.file.originalname;
  const image1 = await Image.findOne({title: titulo});

  if(titulo.length == 0){
    req.flash('signupMessage', 'Agregue un código');
    res.redirect('/upimg');
  }else if(titulo.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Agrega el código');
    res.redirect('/upimg');
  }else if(image1){
    req.flash('signupMessage', 'El código ya esta registrado');
    res.redirect('/upimg');
  }else if(des.length == 0){
    req.flash('signupMessage', 'Agregue una descripción');
    res.redirect('/upimg');
  }else if(des.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Agregue una descripción');
    res.redirect('/upimg');
  }else if(ig.length == 0){
    req.flash('signupMessage', 'Selecciona una imagen');
    res.redirect('/upimg');
  }else if(ig.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Selecciona una imagen');
    res.redirect('/upimg');
  }
  else{
    image.title = req.body.title;
    image.description = req.body.description;
    image.filename = req.file.filename;
    image.path = '/img/up/' + req.file.filename;
    image.originalname = req.file.originalname;
    image.mimetype = req.file.mimetype;
    image.size = req.file.size;
    await image.save();
    req.flash('signupMessage', 'Elemento guardado correctamente');
    res.redirect('catalogo');
  }
});

router.get('/image/:id',isAuthenticated, async(req, res, next) => {
  const { id } = req.params;
  const image = await Image.findById(id);

  res.render('image', { 
    image 
  });
});

router.get('/image/:id/delete',isAuthenticated, async(req, res, next) => {
  const { id } = req.params;
  const imageDeleted = await Image.findByIdAndDelete(id);
  await unlink(path.resolve('./src/public' + imageDeleted.path));

  req.flash('signupMessage', 'Eliminado correctamente');
  res.redirect('/catalogo');
});

router.get('/logout', (req, res, next) => {
    req.logOut();
    res.redirect('/');
});

router.post('/add',isAuthenticated, async(req, res, next) => {
    const product = new Product (req.body);
    const nombre = req.body.Nombre;
    const cliente = req.body.Cliente;
    const pedido = req.body.Pedido;
    const fecha = req.body.Fecha;
    const p = await Product.findOne({Pedido: pedido});

    if(p){
      req.flash('signupMessage', 'El número de pedido ya existe');
      res.redirect('dashboard');
    }else if(nombre == 0){
      req.flash('signupMessage', 'Ingrese un nombre');
      res.redirect('dashboard');
    }else if(nombre.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese un nombre');
      res.redirect('dashboard');
    }else if(!/^[a-zA-Z ]+$/g.test(nombre)){
      req.flash('signupMessage', 'Solo se permiten letras');
      res.redirect('dashboard');
    }else if(cliente == 0){
      req.flash('signupMessage', 'Ingrese el nombre del cliente');
      res.redirect('dashboard');
    }else if(cliente.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese el nombre del cliente');
      res.redirect('dashboard');
    }else if(!/^[a-zA-Z ]+$/g.test(cliente)){
      req.flash('signupMessage', 'Solo se permiten letras');
      res.redirect('dashboard');
    }else if(pedido == 0){
      req.flash('signupMessage', 'Ingrese el número de pedido');
      res.redirect('dashboard');
    }else if(pedido.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese el número de pedido');
      res.redirect('dashboard');
    }else if(!/^[0-9]+$/g.test(pedido)){
      req.flash('signupMessage', 'Solo se permiten números');
      res.redirect('dashboard');
    }else if(fecha == 0){
      req.flash('signupMessage', 'Ingrese una fecha');
      res.redirect('dashboard');
    }else if(fecha.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese una fecha');
      res.redirect('dashboard');
    }else{
      product.Usuario = req.user.id;
      await product.save();
      req.flash('signinMessage', 'Agregado Correctamente');
      res.redirect('dashboard');
    }
});

router.get('/edit/:id', isAuthenticated,async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  console.log(product)
  res.render('edit', { 
    product 
  });
});

router.get('/editusuario/:id', isAuthenticated,async (req, res, next) => {
  const usuario = await User.findById(req.params.id);
  res.render('editarusuario', { 
    usuario 
  });
});

router.post('/editusuario/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  const name = req.body.name;
  const puesto = req.body.puesto;
  const correo = req.body.email;
  const contr = req.body.password;

  if(correo == 0){
    req.flash('signupMessage', 'Ingrese un correo');
    res.redirect('/editusuario/' + id);
  }else if(correo.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Ingrese un correo');
    res.redirect('/editusuario/' + id);
  }else{
    const user = await User.findOne({email: correo});
    if(!user){
      if(name == 0){
        req.flash('signupMessage', 'Ingrese un nombre');
        res.redirect('/editusuario/' + id);
      }else if(name.charCodeAt(0) == 32){
        req.flash('signupMessage', 'Ingrese un nombre');
        res.redirect('/editusuario/' + id);
      }else if(!/^[a-zA-Z ]+$/g.test(name)){
        req.flash('signupMessage', 'Solo se perimiten letras');
        res.redirect('/editusuario/' + id);
      }else if(puesto == 0){
        req.flash('signupMessage', 'Ingrese un puesto');
        res.redirect('/editusuario/' + id);
      }else if(puesto.charCodeAt(0) == 32){
        req.flash('signupMessage', 'Ingrese un puesto');
        res.redirect('/editusuario/' + id);
      }else if(!/^[a-zA-Z ]+$/g.test(puesto)){
        req.flash('signupMessage', 'Solo se perimiten letras');
        res.redirect('/editusuario/' + id);
      }else if(contr.length < 4){
        req.flash('signupMessage', 'La contraseña debe de ser mayor a 4');
        res.redirect('/editusuario/' + id);
      }else if(contr == 0){
        req.flash('signupMessage', 'Ingrese una contraseña');
        res.redirect('/editusuario/' + id);
      }else if(contr.charCodeAt(0) == 32){
        req.flash('signupMessage', 'Ingrese un contraseña');
        res.redirect('/editusuario/' + id);
      }else{
        await User.update({_id: id}, { $set: {name: name , puesto: puesto, email: correo , password: user.encryptPassword(contr)}});
        req.flash('signupMessage', 'Editado con éxito');
        res.redirect('/profile');
      }
    }else{
      const idb = user._id;
      if(name == 0){
        req.flash('signupMessage', 'Ingrese un nombre');
        res.redirect('/editusuario/' + id);
      }else if(name.charCodeAt(0) == 32){
        req.flash('signupMessage', 'Ingrese un nombre');
        res.redirect('/editusuario/' + id);
      }else if(!/^[a-zA-Z ]+$/g.test(name)){
        req.flash('signupMessage', 'Solo se perimiten letras');
        res.redirect('/editusuario/' + id);
      }else if(idb != id){
        req.flash('signupMessage', 'El usuario ya existe');
        res.redirect('/editusuario/' + id);
      }else if(puesto == 0){
        req.flash('signupMessage', 'Ingrese un puesto');
        res.redirect('/editusuario/' + id);
      }else if(puesto.charCodeAt(0) == 32){
        req.flash('signupMessage', 'Ingrese un puesto');
        res.redirect('/editusuario/' + id);
      }else if(!/^[a-zA-Z ]+$/g.test(puesto)){
        req.flash('signupMessage', 'Solo se perimiten letras');
        res.redirect('/editusuario/' + id);
      }else if(contr.length < 4){
        req.flash('signupMessage', 'La contraseña debe de ser mayor a 4');
        res.redirect('/editusuario/' + id);
      }else if(contr == 0){
        req.flash('signupMessage', 'Ingrese una contraseña');
        res.redirect('/editusuario/' + id);
      }else if(contr.charCodeAt(0) == 32){
        req.flash('signupMessage', 'Ingrese una contraseña');
        res.redirect('/editusuario/' + id);
      }else{
        await User.update({_id: id}, { $set: {name: name , puesto: puesto, email: correo , password: user.encryptPassword(contr)}});
        req.flash('signupMessage', 'Editado con éxito');
        res.redirect('/profile');
      }
    }
  }
});

router.post('/editarcatalogo/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  const codigo = req.body.title;
  const des = req.body.description;

  if(codigo.length == 0){
    req.flash('signupMessage', 'Ingrese un código');
    res.redirect('/editarcatalogo/' + id);
  }else if(codigo.charCodeAt(0) == 32){
    req.flash('signupMessage', 'Ingrese un código');
    res.redirect('/editarcatalogo/' + id);
  }else{
    const imagen = await Image.findOne({title: codigo});
    if(!imagen){
      if(des.charCodeAt(0) == 32){
        req.flash('signupMessage', 'Ingrese una descripción');
        res.redirect('/editarcatalogo/' + id);
      }else if(des.length == 0){
        req.flash('signupMessage', 'Ingrese una descripción');
        res.redirect('/editarcatalogo/' + id);
      }else{
        await Image.update({_id: id}, req.body);
        req.flash('signupMessage', 'Editado correctamente');
        res.redirect('/catalogo');
      }
    }else{
      const idb = imagen._id;
      if(idb != id){
        req.flash('signupMessage', 'El código ya existe');
        res.redirect('/editarcatalogo/' + id);
      }else if(des.charCodeAt(0) == 32){
        req.flash('signupMessage', 'Ingrese una descripción');
        res.redirect('/editarcatalogo/' + id);
      }else if(des.length == 0){
        req.flash('signupMessage', 'Ingrese una descripción');
        res.redirect('/editarcatalogo/' + id);
      }else{
        await Image.update({_id: id}, req.body);
        req.flash('signupMessage', 'Editado correctamente');
        res.redirect('/catalogo');
      }
    }
  }
});

router.get('/deleteusuario/:id', isAuthenticated,async (req, res, next) => {
  let { id } = req.params;
  await tshirt.remove({Usuario: id});
  await Product.remove({Usuario: id});
  await Venta.remove({Usuario: id});
  await User.remove({_id: id});
  res.redirect('/');
});

router.get('/eliminarventa/:id', isAuthenticated,async (req, res, next) => {
  let { id } = req.params;
  await Venta.remove({_id: id});
  req.flash('signupMessage', 'Eliminado con éxito');
  res.redirect('/verventas');
});

router.get('/editplayera/:id', isAuthenticated,async (req, res, next) => {
  const tshirt = await Tshirt.findById(req.params.id);
  const images = await Image.find();
  console.log(tshirt)
  res.render('editplayera', { 
    tshirt, 
    images
  });
});

router.get('/editarcatalogo/:id', isAuthenticated,async (req, res, next) => {
  const image = await Image.findById(req.params.id);
  console.log(tshirt)
  res.render('editarcatalogo', { 
    image 
  });
});

router.get('/deleteplayera/:id', isAuthenticated,async (req, res, next) => {
  let { id } = req.params;
  await tshirt.remove({_id: id});
  req.flash('signinMessage', 'Eliminado correctamente');
  res.redirect('/dashboard');
});

router.post('/edit/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  const nombre = req.body.Nombre;
  const cliente = req.body.Cliente;
  const pedido = req.body.Pedido;
  const fecha = req.body.Fecha;
  const pe = await Product.findOne({Pedido: pedido});
  
  if(!pe){
    if(nombre == 0){
      req.flash('signupMessage', 'Ingrese un nombre');
      res.redirect('/edit/' + id);
    }else if(nombre.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese un nombre');
      res.redirect('/edit/' + id);
    }else if(!/^[a-zA-Z ]+$/g.test(nombre)){
      req.flash('signupMessage', 'Solo se permiten letras');
      res.redirect('/edit/' + id);
    }else if(cliente == 0){
      req.flash('signupMessage', 'Ingrese el nombre del cliente');
      res.redirect('/edit/' + id);
    }else if(cliente.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese el nombre del cliente');
      res.redirect('/edit/' + id);
    }else if(!/^[a-zA-Z ]+$/g.test(cliente)){
      req.flash('signupMessage', 'Solo se permiten letras');
      res.redirect('/edit/' + id);
    }else if(pedido == 0){
      req.flash('signupMessage', 'Ingrese el número de pedido');
      res.redirect('/edit/' + id);
    }else if(pedido.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese el número de pedido');
      res.redirect('/edit/' + id);
    }else if(!/^[0-9]+$/g.test(pedido)){
      req.flash('signupMessage', 'Solo se permiten números');
      res.redirect('/edit/' + id);
    }else if(fecha == 0){
      req.flash('signupMessage', 'Ingrese una fecha');
      res.redirect('/edit/' + id);
    }else if(fecha.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese una fecha');
      res.redirect('/edit/' + id);
    }else{
      await Product.update({_id: id}, req.body);
      req.flash('signinMessage', 'Editado correctamente');
      res.redirect('/dashboard');
    }
  }else{
    const idb = pe._id;
    if(idb != id){
      req.flash('signupMessage', 'El pedido ya existe');
      res.redirect('/edit/' + id);
    }else if(nombre == 0){
      req.flash('signupMessage', 'Ingrese un nombre');
      res.redirect('/edit/' + id);
    }else if(nombre.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese un nombre');
      res.redirect('/edit/' + id);
    }else if(!/^[a-zA-Z ]+$/g.test(nombre)){
      req.flash('signupMessage', 'Solo se permiten letras');
      res.redirect('/edit/' + id);
    }else if(cliente == 0){
      req.flash('signupMessage', 'Ingrese el nombre del cliente');
      res.redirect('/edit/' + id);
    }else if(cliente.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese el nombre del cliente');
      res.redirect('/edit/' + id);
    }else if(!/^[a-zA-Z ]+$/g.test(cliente)){
      req.flash('signupMessage', 'Solo se permiten letras');
      res.redirect('/edit/' + id);
    }else if(pedido == 0){
      req.flash('signupMessage', 'Ingrese el número de pedido');
      res.redirect('/edit/' + id);
    }else if(pedido.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese el número de pedido');
      res.redirect('/edit/' + id);
    }else if(!/^[0-9]+$/g.test(pedido)){
      req.flash('signupMessage', 'Solo se permiten números');
      res.redirect('/edit/' + id);
    }else if(fecha == 0){
      req.flash('signupMessage', 'Ingrese una fecha');
      res.redirect('/edit/' + id);
    }else if(fecha.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese una fecha');
      res.redirect('/edit/' + id);
    }else{
      await Product.update({_id: id}, req.body);
      req.flash('signinMessage', 'Editado correctamente');
      res.redirect('/dashboard');
    }
  }
});

router.get('/delete/:id', isAuthenticated,async (req, res, next) => {
  let { id } = req.params;
  await Product.remove({_id: id});
  await tshirt.remove({bitacora: id});
  req.flash('signinMessage', 'Eliminado correctamente');
  res.redirect('/dashboard');
});

router.post('/editplayera/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  const modelo = req.body.modelo;
  const des = req.body.descripcion;
  const talla = req.body.talla;
  const can = req.body.cantidad;
  if(modelo == 0){
      req.flash('signupMessage', 'Ingrese un código');
      res.redirect('/editplayera/' + id);
    }else if(modelo.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese un código');
      res.redirect('/dashboard');
    }else if(des == 0){
      req.flash('signupMessage', 'Ingrese una descripción');
      res.redirect('/editplayera/' + id);
    }else if(des.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese una descripción');
      res.redirect('/editplayera/' + id);
    }else if(talla == 0){
      req.flash('signupMessage', 'Ingrese una talla');
      res.redirect('/editplayera/' + id);
    }else if(talla.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese una talla');
      res.redirect('/editplayera/' + id);
    }else if(can == 0){
      req.flash('signupMessage', 'Ingrese una cantidad');
      res.redirect('/editplayera/' + id);
    }else if(can.charCodeAt(0) == 32){
      req.flash('signupMessage', 'Ingrese una cantidad');
      res.redirect('/editplayera/' + id);
    }else if(!/^[0-9]+$/g.test(can)){
      req.flash('signupMessage', 'Solo se permiten números');
      res.redirect('/editplayera/' + id);
    }else{
      await Tshirt.update({_id: id}, req.body);
      req.flash('signinMessage', 'Editado correctamente');
      res.redirect('/dashboard');
  }
});

function isAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
    res.redirect('/')
}  

module.exports = router;