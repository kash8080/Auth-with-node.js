const express=require('express');
const bodyparser=require('body-parser');
const mongoose=require('mongoose');
const path = require('path');
const passport=require('passport');
const helmet = require('helmet');


//set up express app
const app=express();

//connect to mongoose db
mongoose.connect('mongodb://localhost/loginSystem');
///default Promise of mongoose library is deprecated ,global is es6 promise
mongoose.Promise=global.Promise;

//Helmet helps you secure your Express apps by setting various HTTP headers
app.use(helmet())


//add middle ware to get post request body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(passport.initialize());





//intialise api route
app.use('/api',require('./routes/api'));

//intialise home page .. for testing only
app.get('/',function(req,res,next){
    res.send('home');
});














// catch 404 and forwarding to error handler , if none of the above routes match the request
// if any of the above routes called next(err) then this will not be called as
// this route does not use function with err as first param like in the following error handlers
app.use(function(req, res, next) {
    console.log('catch 404 and forward middleware');
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


/// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log('development error middleware');
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error_detail_debug: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log('production error middleware');
    res.status(err.status || 500);
    res.send({
        message: err.message
    });
});

//listen for requests
app.listen(process.env.port || 4000,function(){
    console.log('listening for requests');
});
