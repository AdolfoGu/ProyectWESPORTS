const passport = require('passport');
const localStrattegy = require('passport-local').Strategy;
const User = require('../models/users');

passport.serializeUser((user,done)=>{
    done(null, user.id);
});

passport.deserializeUser(async(id,done)=>{
    const user = await User.findById(id);
    done(null, user);
});

passport.use('local-signup', new localStrattegy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},async (req, email, password, done)=>{
    const user = await User.findOne({'email': email});
    if(user) {
        return done(null, false, req.flash('signupMessage', 'El email ya esta en uso'));
      } else {
        const newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
      console.log(newUser)
        await newUser.save();
        done(null, newUser);
      }
}));

passport.use('local-signin', new localStrattegy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const user = await User.findOne({email: email});
  if(!user) {
    return done(null, false, req.flash('signinMessage', 'Usuario no encontrado'));
  }
  if(!user.comparePassword(password)) {
    return done(null, false, req.flash('signinMessage', 'Contraseña incorrecta'));
  }
  return done(null, user);
}));
