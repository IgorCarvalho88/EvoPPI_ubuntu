var express = require('express');
var router = express.Router();
var interactome = require('./../models/interactome.js');
var dictionary = require('./../models/dictionary.js');
var fasta = require('./../models/fasta.js');
var wholeInteractome = require('./../models/wholeInteractome.js');
var path = require('path');
var readline = require('readline');
var fs = require('fs');
var bodyParser = require('body-parser');

var fileUploaded = path.join(__dirname, '..', 'database/tempFiles/temp2.gbff');

/* GET upload page */
router.get('/upload', function(req, res, next) {
	console.log("entro");

	res.render('upload',{
			title: 'Express'

		});

});

/* GET upload page */
router.post('/upload', function(req, res, next) {

	//req.pipe(res);
	var newFile = fs.createWriteStream(fileUploaded);
	req.pipe(newFile);

	req.on('end', function(){
		res.end('uploaded');
	});

});

/* GET upload page */
router.post('/createFastaFile', function(req, res, next) {
	fasta.createFasta();

});

router.post('/createDictionaryFile', function(req, res, next) {
	console.log("entro");
	dictionary.createDictionary();

});

module.exports = router;
