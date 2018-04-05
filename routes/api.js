const express=require('express');
const User=require('../models/User');
const passport=require('passport');
const LocalStrategy = require('passport-local').Strategy;
const exp_jwt     = require('express-jwt');
const jwt     = require('jsonwebtoken');
var IncompleteDataError = require('../errors/IncompleteDataError');

const config  = require('../config');

const router=express.Router();

// Validate access_token .. it will add req.user field if the jwt is valid
// header should be Authentication : Bearer <token>
// add secret in environmental variable instead of savinf it in a file like this
var jwtCheck = exp_jwt({
  secret: config.secret
});


function createIdToken(user) {
  return jwt.sign(user, config.secret, { expiresIn: 60*60*5 });
}



passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    console.log('email='+email+" ,pass="+password);
    User.authenticate(email, password, function (error, user) {
      if (error) { return done(error); }
      if (!user) {
        return done(null, false, {message: 'Wrong email or password.' });
      } else {
        return done(null, user);
      }
     });
  }
));

router.post("/register",function(req,res,next){
  console.log('register body='+JSON.stringify(req.body));
  if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {
      // confirm that user typed same password twice
      if (req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }
      var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
      }
      //use schema.create to insert data into the db
      User.create(userData, function (err, user) {
        if (err) {
          return next(err)
        } else {
          return res.send({
            _id:user._id,
            email:user.email,
            username:user.username
          });
        }
      });
  }else{
    return next(new IncompleteDataError('Enter all values'));
  }
});


//using custom callback
router.post('/login', function(req, res, next) {
  if(!req.body.email || !req.body.password){
    // in default callback .. the passport just send smple string in response when data is invalid
    return next(new IncompleteDataError('Enter all values'));
  }
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
        // in default callback .. the passport just send smple string in response when login is failed
        var err = new Error(info.message || 'default error' );
        err.status = 401;
        return next(err);
    }
    var token =createIdToken({
      _id:user._id,
      email:user.email,
      username:user.username
    });
    return res.send({
      user:{
        _id:user._id,
        email:user.email,
        username:user.username
      },
      token:token
    });
  }) (req, res, next);
});


//using default callbacks
router.post("/login2",passport.authenticate('local', { session: false }),function(req,res,next){
  //By default, if authentication fails, Passport will respond with a 401 Unauthorized status,
  // and any additional route handlers will not be invoked
  var user=req.user;
  console.log('login success user='+JSON.stringify(user));
  if(user!=null){
    var token =createIdToken({
      _id:user._id,
      email:user.email,
      username:user.username
    });
    return res.send({
      user:{
        _id:user._id,
        email:user.email,
        username:user.username
      },
      token:token
    });
  }else{
    next();
  }
});


router.post('/protected',jwtCheck,function(req,res,next){
  var user=req.user;
  if(user!=null){
    return res.send({
      user:{
        _id:user._id,
        email:user.email,
        username:user.username
      }
    });
  }else{
    next();
  }
});


module.exports=router;
