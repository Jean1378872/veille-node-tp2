"use strict";

const tableau = require('./tableaux.js');

const maximum = tableau.length;

console.log('max = ' + maximum);


const peupler_json = () => {

	let position;
	let tabVille = [];

	for (let k=0 ; k<10 ; k++){
		position = Math.floor(Math.random()*maximum);
		tabVille.push(tableau[position]);
	}

	return(tabVille);
}
