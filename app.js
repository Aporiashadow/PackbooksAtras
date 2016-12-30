var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
mongoose.connect('mongodb://Admin:abc123.....@ds013956.mlab.com:13956/packbooks', { server: { reconnectTries: Number.MAX_VALUE } });

var routes = require('./routes/index');
var users = require('./routes/users');

// Inicializa 
var app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Sessión
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//Inicia Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);

// Elije un puerto de conexion
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Inicia la aplicacion en el puerto  '+app.get('port'));
});

//, failureFlash: true 