var express = require('express');
var router = express.Router();

// Página principal
router.get('/', ensureAuthenticated, function(req, res){
	res.send('dentro del sistema')
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.send('No ha iniciado sesión')
	}
}

module.exports = router;