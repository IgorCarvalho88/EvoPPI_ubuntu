var express = require('express');
var router = express.Router();
var interactome = require('./../models/interactome.js');
var dictionary = require('./../models/dictionary.js');
var fasta = require('./../models/fasta.js');
var wholeInteractome = require('./../models/wholeInteractome.js');
var path = require('path');
var readline = require('readline');
var fs = require('fs');

var query = path.join(__dirname, '..', 'database/fasta/query.txt');
var tempFile = path.join(__dirname, '..', 'database/tempFiles/temp.xls');
var fileUploaded = path.join(__dirname, '..', 'database/tempFiles/temp2.gbff');



/* GET home page. */
router.get('/', function(req, res, next) {
	var species;
	species = dictionary.getAllSpecies();

	res.render('index',{
			title: 'Express',
			species:species

		});

});

/* GET different species page */
router.get('/differentSpecies', function(req, res, next) {
	var species;
	species = dictionary.getAllSpecies();

	res.render('teste',{
			title: 'Express',
			species:species

		});

});

/* GET upload page */
router.get('/upload', function(req, res, next) {

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

/*Route called by ajax function for different species page only*/
/*jsdefault --> jquery function  --> #fasta*/
router.get('/differentSpecies/:fileName', function(req, res, next){

		
	var gene = req.query.gene;
	var firstInteractome = interactome.readFile(req.query.interactome1);
	var secondInteractome = interactome.readFile(req.query.interactome2);
	var e_value = req.query.e_value;
	var lengthAlignment = req.query.lengthAlignment;
	var numberDescriptions = req.query.numberDescriptions;
	var minimumIdentity = req.query.minimumIdentity;

	var especieName = req.params.fileName.replace(" ", "_");
	filePath = fasta.createFilePath(especieName);
	
	if (gene)
	{
		
		var interactions1 = interactome.getGeneInteractions(gene, firstInteractome.fileName);
		var interactions2 = interactome.getGeneInteractions(gene, secondInteractome.fileName);

		/*If gene is not on interactome1*/
		if(interactions1.length == 0)
		{
			res.send("Missing gene on interactome");
			//res.redirect('/differentSpecies');
		}
		else
		{
			
			genes = fasta.createArrayGenes(interactions1);

			var cb =  function(arrayMatrix){
					res.send(arrayMatrix);
			}

			fasta.createQuery(filePath, genes, interactions1, secondInteractome.fileName, e_value, lengthAlignment, numberDescriptions, minimumIdentity, cb);
		}

		
	}
	else
	{
		var cb =  function(arrayMatrix){
					res.send(arrayMatrix);
			}
		genes = wholeInteractome.createArrayGenes2(firstInteractome.fileName);
		wholeInteractome.createQuery2(filePath, genes, firstInteractome.fileName, secondInteractome.fileName, e_value, lengthAlignment, numberDescriptions, minimumIdentity, cb);
	}

});

/*Route called by ajax function for different species page only*/
/*jsdefault --> jquery function  --> myfunction2*/
router.get('/createDbTemp/:fileName', function(req, res, next){
	var especieName = req.params.fileName.replace(" ", "_");
	//var especieName = req.params.fileName;
	/*Runs Command creating the DB blast Referring to the second species */
	fasta.execCMD(especieName);
	res.send("database created");

});


/*Routes called by ajax functions for species and different species page*/
router.get('/genes/:fileName', function(req, res, next){
	//res.send(req.params.fileName);
	var especieName = req.params.fileName.replace(" ", "_");
	var genes;
	genes = dictionary.readFile(especieName);
	res.send(genes.fileName);
	//res.send(genes);

});


router.get('/interactome/:fileName', function(req, res, next){
	var interactomes;
	var especieName = req.params.fileName.replace(" ", "_");
	interactomes = interactome.getAllInteractomes(especieName);
	res.send(interactomes);
});

/*Route called by ajax function for same species page only*/
/*jsdefault --> jquery function  --> #sameSpecies*/
router.get('/interactome/', function(req, res, next){
	var firstInteractome;
	var secondInteractome;

	var interactions1;
	var interactions2;

	var finalResult;

	var gene = req.query.gene;
	
	firstInteractome = interactome.readFile(req.query.interactome1);
	secondInteractome = interactome.readFile(req.query.interactome2);

	interactions1 = interactome.getGeneInteractions(gene, firstInteractome.fileName);
	interactions2 = interactome.getGeneInteractions(gene, secondInteractome.fileName);

	
	finalResult = interactome.compare(interactions1, interactions2);
	res.send(finalResult);


	/*res.render('teste',{
			title: 'Express',
			finalResult:finalResult

		});*/
});

router.post('/download/', function(req, res, next){
	console.log(tempFile);
	var finalResult = req.body;
	fasta.forDownload(finalResult);
	 res.download(tempFile);
	//console.log(finalResult);
	//res.send("done");
});

router.get('/download2/', function(req, res, next){
	 res.download(tempFile);
});


module.exports = router;
