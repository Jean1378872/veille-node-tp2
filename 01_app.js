const express = require('express');
const fs = require('fs');
const util = require("util");
const app = express();


const server = require('http').createServer(app);
const io = require('./mes_modules/chat_socket').listen(server);


const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient; // le pilote MongoDB
const ObjectID = require('mongodb').ObjectID;
app.use(bodyParser.urlencoded({extended: true}));
/* on associe le moteur de vue au module «ejs» */
const cookieParser = require('cookie-parser');
app.use(cookieParser())


 
 ///*****SOCKET.IO*******/////
/*const express = require('express')
var app = express();*/

//io.on('connection', function(){ /* … */ });
//server.listen(3000);

//app.use(express.static('public')) // pour utiliser le dossier public app.set('view engine', 'ejs'); ;

//app.use(express.static('public'));

//app.get('/chat', [interface_chat])
///////////////////////////////////

app.use(express.static(__dirname + '/public'))




const i18n = require("i18n");

i18n.configure({ 
   locales : ['fr', 'en'],
   cookie : 'langueChoisie', 
   directory : __dirname + '/locales' 
 });

/* Ajouter l'objet i18n à l'objet global «res» */
app.use(i18n.init);


let db // variable qui contiendra le lien sur la BD

MongoClient.connect('mongodb://127.0.0.1:27017', (err, database) => {
 if (err) return console.log(err)
 db = database.db('adresse')
console.log('connexion à la BD')
// lancement du serveur Express sur le port 8081
 server.listen(8081, (err) => {
 	if (err) console.log(err)
 console.log('connexion à la BD et on écoute sur le port 8081')
 })
})


/*
Les routes
*/

////////////////////////////////////////// Route /
app.set('view engine', 'ejs'); // générateur de template

app.get('/:lang(en|fr)', (req, res) =>{
  res.cookie('langueChoisie' , req.params.lang);
  res.setLocale(req.params.lang);
  console.log('langueChoisie: ', req.params.lang);
  console.log(res.__('bonjour'));
  console.log(res.__('vitesse'));
  console.log(res.__('Accueil'));
  res.redirect(req.headers.referer);
});

//////////////////////////////////////////
app.get('/', function (req, res) {

 res.render('accueil.ejs')  
 
  });


//////////////////////////////////////////  Route Adresse
app.get('/adresse', function (req, res) {
   var cursor = db.collection('adresse')
                .find().toArray(function(err, resultat){
 if (err) return console.log(err)        
 res.render('adresse.ejs', {adresses: resultat})   
  });
})
//////////////////////////////////////////  Route Rechercher
app.post('/rechercher',  (req, res) => {

})
////////////////////////////////////////// Route /ajouter
app.post('/ajouter', (req, res) => {
console.log('route /ajouter')	
 db.collection('adresse').save(req.body, (err, result) => {
 if (err) return console.log(err)
 // console.log(req.body)	
 console.log('sauvegarder dans la BD')
 res.redirect('/adresse')
 })
})

////////////////////////////////////////  Route /modifier
app.post('/modifier', (req, res) => {
console.log('route /modifier')
// console.log('util = ' + util.inspect(req.body));
req.body._id = 	ObjectID(req.body._id)
 db.collection('adresse').save(req.body, (err, result) => {
	 if (err) return console.log(err)
	 console.log('sauvegarder dans la BD')
	 res.redirect('/adresse')
	 })
})


////////////////////////////////////////  Route /detruire
app.get('/detruire/:id', (req, res) => {
 console.log('route /detruire')
 // console.log('util = ' + util.inspect(req.params));	
 var id = req.params.id
 console.log(id)
 db.collection('adresse')
 .findOneAndDelete({"_id": ObjectID(req.params.id)}, (err, resultat) => {

if (err) return console.log(err)
 res.redirect('/adresse')  // redirige vers la route qui affiche la collection
 })
})


///////////////////////////////////////////////////////////   Route /trier
app.get('/trier/:cle/:ordre', (req, res) => {

 let cle = req.params.cle
 let ordre = (req.params.ordre == 'asc' ? 1 : -1)
 let cursor = db.collection('adresse').find().sort(cle,ordre).toArray(function(err, resultat){

  ordre = (req.params.ordre == 'asc' ? 'desc' : 'asc')  
 res.render('adresse.ejs', {adresses: resultat, cle, ordre })	
})

}) 


/////////////////////////////////////////////////////////  Route /peupler
app.get('/vider', (req, res) => {

	let cursor = db.collection('adresse').drop((err, res)=>{
		if(err) console.error(err)
			console.log('ok')
			
		})
	res.redirect('/adresse')
})

///////////************SOCKET.IO***************///////////////
app.get('/chat', (req, res) => {

  res.render('socket_vue.ejs')
})



//////******AJAX*************/////////////

app.post('/ajax_modifier', (req,res) => {
  req.body._id = ObjectID(req.body._id)
  console.log("req.body._id = " + req.body._id)

  db.collection('adresse').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('Modifié dans la BD')
    res.send(JSON.stringify(req.body));
  })
})

app.post('/ajax_detruire', (req,res) => {
  db.collection('adresse').findOneAndDelete({"_id": ObjectID(req.body._id)}, (err, resultat) => {
  if (err) return console.log(err)
    res.send(JSON.stringify(req.body))  // redirige vers la route qui affiche la collection
  })
})

app.post('/ajax_ajouter', (req, res) => {
  console.log('route /ajax_ajouter') 
  db.collection('adresse').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('sauvegardé dans la BD')
    res.send(JSON.stringify(req.body))
  })
})


/* Est exécuté une seule fois */
/*io.on('connection', function(socket){
console.log(socket.id)
socket.on('setUser', function(data){
   console.log('setUser')
   console.log(data.user)
   socket.emit('ackUser', data)
   })
}); // une connexion socket
let message = "Chat socket"
res.render('vue_socket.ejs', {message : message})
}

io.on('connection', function(socket){ // l'écouteur général
     socket.on('disconnect', function(){ }); 
     socket.on('setUser', function(data){})
});

socket.emit('user_valide', data) // émettre vers le socket actif

io.sockets.emit('message_diffuse', data) // émettre vers l'ensemble

io.to(socket.id).emit('message_prive', data)// émettre vers un spécifique*/
//////////////////////////////////////////////////////

