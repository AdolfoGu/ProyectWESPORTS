const express = require('express');
const router = express.Router();
const passport = require('passport');
const Product = require('../models/products');


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
    successRedirect: '/dashboard',
    failureRedirect: '/index',
    failureFlash: true
  }));

router.get('/profile',isAuthenticated, (req, res, next) => {
    res.render('profile');
  });

  router.get('/dashboard',isAuthenticated, async(req, res, next) => {
    const products = await Product.find()
    res.render('dashboard',{
      products
    });
  });

router.get('/logout', (req, res, next) => {
    req.logOut();
    res.redirect('/');
});

router.post('/add',isAuthenticated, async (req, res, next) => {
    const product = new Product (req.body);
    await product.save();
    res.redirect('dashboard');
});

router.get('/edit/:id', async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  console.log(product)
  res.render('edit', { product });
});

router.get('/delete/:id', async (req, res, next) => {
  let { id } = req.params;
  await Product.remove({_id: id});
  res.redirect('/dashboard');
});

router.post('/edit/:id', async (req, res, next) => {
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