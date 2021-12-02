const express = require('express');
const router = express.Router();
const passport = require('passport');
const Product = require('../models/products');
const Inventario = require('../models/inventario');
const Image = require('../models/image');
const Tshirt = require('../models/tshirt');
const User = require('../models/users');
const { unlink } = require('fs-extra');
const path = require('path');
const tshirt = require('../models/tshirt');


router.get('/',(req,res, next)=>{
    res.render('index');
});

router.get('/signup',(req, res, next)=>{
    res.render('signup');
});

router.post('/signup', async(req, res, next)=>{
  const { name,puesto, email, password} = req.body;

  const emailUser = await User.findOne({ email: email });
  if (emailUser) {
    req.flash('signupMessage', 'El email ya esta en uso');
    res.redirect('/signup');
  } else {
    // Saving a New User
    const newUser = new User({ name, puesto, email, password });
    newUser.password = await newUser.encryptPassword(password);
    await newUser.save();
    res.redirect("/index");
  }
});

router.get('/index',(req, res, next)=>{
    res.render('index');
});

router.post('/index', passport.authenticate('local-signin', {
    successRedirect: '/catalogo',
    failureRedirect: '/index',
    failureFlash: true
}));

router.get('/profile',isAuthenticated, (req, res, next) => {
  res.render('profile');
});

router.get('/inventario',isAuthenticated, async(req, res, next) => {
  const inventario = await Inventario.find();
  res.render('inventario',{
    inventario
  });
});

router.get('/agregarinventario',isAuthenticated, async(req, res, next) => {
  res.render('agregarinventario');
});

router.post('/addinventario',isAuthenticated, async(req, res, next) => {
  const inventario = new Inventario();
  inventario.title = req.body.title;
  inventario.description = req.body.description;
  inventario.cantidad = req.body.cantidad;
  inventario.path = '/img/up/' + req.file.filename;

    await inventario.save();
    res.redirect('inventario');
});

router.get('/editarinventario/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  const inventario = await Inventario.findById(id);
  res.render('editarinventario', { inventario });
});

router.post('/editarinventario/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  await Inventario.update({_id: id}, req.body);
  res.redirect('/inventario');
});

router.get('/eliminarinventario/:id', isAuthenticated,async (req, res, next) => {
  let { id } = req.params;
  await Inventario.remove({_id: id});
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
  res.render('bitacora',{
    tshirt,
    idproducts
  });
});

router.post('/addplayera/:id',isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const tshirt = new Tshirt (req.body);
  tshirt.bitacora = id;
  tshirt.Usuario = req.user.id;
  await tshirt.save();
  res.redirect('/bitacora/' + id);
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
  res.render('catalogo', { images });
});

router.get('/upimg',isAuthenticated, async(req, res, next) => {
  res.render('upimg');
});

router.post('/upimg',isAuthenticated, async(req, res, next) => {
  const image = new Image();
    image.title = req.body.title;
    image.description = req.body.description;
    image.filename = req.file.filename;
    image.path = '/img/up/' + req.file.filename;
    image.originalname = req.file.originalname;
    image.mimetype = req.file.mimetype;
    image.size = req.file.size;

    await image.save();
    res.redirect('catalogo');
});


router.get('/image/:id',isAuthenticated, async(req, res, next) => {
  const { id } = req.params;
  const image = await Image.findById(id);
  res.render('image', { image });
});

router.get('/image/:id/delete',isAuthenticated, async(req, res, next) => {
  const { id } = req.params;
  const imageDeleted = await Image.findByIdAndDelete(id);
  await unlink(path.resolve('./src/public' + imageDeleted.path));
  res.redirect('/catalogo');
});

router.get('/logout', (req, res, next) => {
    req.logOut();
    res.redirect('/');
});

router.post('/add',isAuthenticated, async (req, res, next) => {
    const product = new Product (req.body);
    product.Usuario = req.user.id;
    await product.save();
    res.redirect('dashboard');
});

router.get('/edit/:id', isAuthenticated,async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  console.log(product)
  res.render('edit', { product });
});

router.get('/editusuario/:id', isAuthenticated,async (req, res, next) => {
  const usuario = await User.findById(req.params.id);
  res.render('editarusuario', { usuario });
});

router.post('/editusuario/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  await User.update({_id: id}, req.body);
  res.redirect('/profile');
});

router.get('/deleteusuario/:id', isAuthenticated,async (req, res, next) => {
  let { id } = req.params;
  await tshirt.remove({Usuario: id});
  await Product.remove({Usuario: id});
  await User.remove({_id: id});
  res.redirect('/index');
});

router.get('/editplayera/:id', isAuthenticated,async (req, res, next) => {
  const tshirt = await Tshirt.findById(req.params.id);
  console.log(tshirt)
  res.render('editplayera', { tshirt });
});

router.get('/deleteplayera/:id', isAuthenticated,async (req, res, next) => {
  let { id } = req.params;
  await tshirt.remove({_id: id});
  res.redirect('/dashboard');
});


router.post('/edit/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  await Tshirt.update({_id: id}, req.body);
  res.redirect('/dashboard');
});

router.get('/delete/:id', isAuthenticated,async (req, res, next) => {
  let { id } = req.params;
  await Product.remove({_id: id});
  await tshirt.remove({bitacora: id});
  res.redirect('/dashboard');
});

router.post('/edit/:id', isAuthenticated,async (req, res, next) => {
  const { id } = req.params;
  await Product.update({_id: id}, req.body);
  res.redirect('/dashboard');
});

function isAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
    res.redirect('/')
}  


module.exports = router;