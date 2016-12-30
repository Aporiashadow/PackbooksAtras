var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Registro
router.get('/crearCuenta', function (req, res) {
	res.send('aqui te registras')
});

// Login
router.get('/login', function (req, res) {res.send('Aqui ingresas');});

// Registro de usuarios
router.post('/crearCuenta', function (req, res) {
	if(req.body.password!=req.body.reppass){
		res.send('Contraseña no coinciden');
	}else{
		modeloUsuario.findOne({$or:[{'usuario': req.body.usuario},{'email':req.body.email},{'telefono':req.body.telefono}]},
		'usuario email telefono', function (err, resultado) {
			if (err) return handleError(err);
			if(resultado!=null){
				res.send('Uno o varios datos ya están siendo usados por otro usuario');
			}else{
						var newUser = new User({
						nombre:req.body.nombre,
						ape:req.body.ape,
						usuario:req.body.usuario,
						correo:req.body.email,
						telefono:req.body.telefono,
						password:req.body.password,
						foto:req.body.foto
				});
		User.createUser(newUser, function (err, user) {
			if (err) throw err;
			console.log(user);
		});
	res.send('Cuenta creada');
			}
		})

	}
});

router.get('/listaDeUsuarios',function(req,res){ 
    var listaDeUsuarios= new Array();
    User.find(function(err,usuarios){
        if(err)return handleError(err);
        for(var i=0; i<usuarios.length;i++){
            listaDeUsuarios[i]=new Array();
            listaDeUsuarios[i][0]=usuarios[i].usuario;
            listaDeUsuarios[i][1]=usuarios[i].correo;
            listaDeUsuarios[i][2]=usuarios[i].telefono;
        }
        res.send(listaDeUsuarios);
});});

passport.use(new LocalStrategy(
  function (username, password, done) {
		console.log(username, password);
		User.getUserByUsername(username, function (err, user) {
			console.log(user);
			if (err) throw err;
			if (!user) {
				return done(null, false, { message: 'usuario no encontrado' });
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Contraseña inválida' });
				}
			});
		});
  }));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login'}),
  function (req, res) {
    res.send('Acabas de entrar');
  });

router.get('/logout', function (req, res) {
	req.logout();
res.send('Adios');
});

module.exports = router;