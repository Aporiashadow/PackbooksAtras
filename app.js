//Dependencias_________________________________________________________________________________________________________________________
var express = require('express'),
    mongoose=require('mongoose'),
    bodyParser=require('body-parser'),
    bcrypt=require('bcryptjs'),
    passport = require('passport'),
    cookieParser=require('cookie-parser'),
    session = require('express-session'),
    expressValidator = require('express-validator')
    LocalStrategy = require('passport-local').Strategy;

//Conexión con la base de datos________________________________________________________________________________________________________
mongoose.connect('mongodb://Admin:abc123.....@ds013956.mlab.com:13956/packbooks', { server: { reconnectTries: Number.MAX_VALUE } });

//Modelo de la base de datos de los usuarios___________________________________________________________________________________________
var modeloUsuario= module.exports= mongoose.model('modeloUsuario', {
    nombre:{type:String},ape:{type:String},usuario:{type:String, index:true, id:true},
    email:{type:String},telefono:{type:String},pass:{type:String},foto:{type:String}
});

//Funciones____________________________________________________________________________________________________________________________
//Verifica que este logeado
function estaLogeado(req,res,next){if(req.isAuthenticated()){return next();}else{res.send('no está logeado');}};
//Crea la cuenta
function crearCuenta(req,res){
    //Asigna propiedades de encriptación
    bcrypt.genSalt(10,function(err, salt){
        //Encripta la contraseña
        bcrypt.hash(req.body.pass,salt,function(err,hash){
            //Busca errores en la encryptación
            if(err) return console.log(err);
            //Usa el modelo para crear al usuario
            var datos=new modeloUsuario({
                nombre:req.body.nombre,
                ape:req.body.ape,
                usuario:req.body.usuario,
                email:req.body.email,
                telefono:req.body.telefono,
                pass:hash,
                foto:req.body.foto
            }); 
            //Crea al usuario a partir del modelo
            datos.save(function(err){
                //Busca un error en el registro
                if (err) return handleError(err);
                console.log(datos);
                 res.send('Registrado con éxito');                   
});});});};

//Genera una Conexión con la dependencia express_______________________________________________________________________________________
var app=express();

// Middleware__________________________________________________________________________________________________________________________
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Sessión_____________________________________________________________________________________________________________________________
app.use(session({secret: 'secret', saveUninitialized: true, resave: true}));

//Inicia passport______________________________________________________________________________________________________________________
app.use(passport.initialize());
app.use(passport.session());

//Obtiene indice, página principal_____________________________________________________________________________________________________
app.get('/',estaLogeado,function(req,res){res.send('Esta logeado e ingresado')});

//Obtiene los usuarios registrados_____________________________________________________________________________________________________
app.get('/listaDeUsuarios',function(req,res){ 
    var listaDeUsuarios= new Array();
    modeloUsuario.find(function(err,usuarios){
        if(err)return handleError(err);
        for(var i=0; i<usuarios.length;i++){
            listaDeUsuarios[i]=new Array();
            listaDeUsuarios[i][0]=usuarios[i].usuario;
            listaDeUsuarios[i][1]=usuarios[i].email;
            listaDeUsuarios[i][2]=usuarios[i].telefono;
        }
        res.send(listaDeUsuarios);
});});

//Obtiene la página del login__________________________________________________________________________________________________________
app.get('/login',function(req,res){
    res.send('Iniciar sesión');
});

//Permite crear al usuario_____________________________________________________________________________________________________________
app.post('/crearCuenta',function(req,res){
    if(req.body.pass!=req.body.reppass){res.send('Contraseña no coinciden');
    }else{modeloUsuario.findOne({$or:[{'usuario': req.body.usuario},{'email':req.body.email},{'telefono':req.body.telefono}]},
    'usuario email telefono', function (err, resultado) {
        if (err) return handleError(err);
        if(resultado!=null){
            if(resultado.usuario!=req.body.usuario && resultado.email!=req.body.email && resultado.telefono!=req.body.telefono){crearCuenta(req,res);}
            else{res.send('Uno o varios datos ya están siendo usados por otro usuario');}
        }else{crearCuenta(req,res);}          
    });}
});

//Se ingresa para iniciar sesión________________________________________________________________________________________________________________________________
app.post('/login',function(req,res){
    modeloUsuario.findOne({usuario:req.body.usuario},'usuario pass',function(err,resultado){
        bcrypt.compare(req.body.pass, resultado.pass, function(err, isMatch) {
            if(err) throw err;
            if(isMatch){res.send('Bienvenido')}else{res.send('Usuario o contraseña incorrecta')}
        });
    });
});

//Serializa al usuario_________________________________________________________________________________________________________________
passport.serializeUser(function (user, done) {done(null, user.id);});

//Deserealiza al usuario_______________________________________________________________________________________________________________
passport.deserializeUser(function (id, done) {modeloUsuario.getUserById(id, function (err, user) {done(err, user);});});

//Establece un puerto para generar la conexión y uso___________________________________________________________________________________
app.set('port', (process.env.PORT || 3000));

//Le dice a la aplicación que debe iniciar en el puerto siteado________________________________________________________________________
app.listen(app.get('port'), function(){console.log('La aplicacion está lista en el puerto  '+app.get('port'));});