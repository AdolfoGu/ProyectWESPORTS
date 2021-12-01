const express = require('express');
const router = express.Router();
const passport = require('passport');
const Product = require('../models/products');
const Image = require('../models/image');
const Tshirt = require('../models/tshirt');
const { unlink } = require('fs-extra');
const path = require('path');


router.get('/',(req,res, next)=>{
    res.render('index');
});

router.get('/signup',(req, res, next)=>{
    res.render('signup');
});

router.post('/signup',passport.authenticate('local-signup',{
    successRedirect: '/index',
    failureRedirect: '/signup',
    passReqToCallback: true
}));

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
  await tshirt.save();
  res.redirect('/bitacora/' + id);
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

router.get('/delete/:id', isAuthenticated,async (req, res, next) => {
  let { id } = req.params;
  await Product.remove({_id: id});
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