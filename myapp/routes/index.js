var express = require('express');
var router = express.Router();
var interactome = require('./../models/interactome.js');
var dictionary = require('./../models/dictionary.js');
var fasta = require('./../models/fasta.js');
var wholeInteractome = require('./../models/wholeInteractome.js');
var level = require('./../models/level.js');
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
/*router.get('/upload', function(req, res, next) {

	res.render('upload',{
			title: 'Express'

		});

});*/

/* GET upload page */
/*router.post('/upload', function(req, res, next) {

	//req.pipe(res);
	var newFile = fs.createWriteStream(fileUploaded);
	req.pipe(newFile);

	req.on('end', function(){
		res.end('uploaded');
	});

});*/

/*Route called by ajax function for different species page only*/
/*jsdefault --> jquery function  --> #fasta*/
router.get('/differentSpecies/:fileName/:fileName2', function(req, res, next){

		
	var gene = req.query.gene;
	var firstInteractome = interactome.readFile(req.query.interactome1);
	var secondInteractome = interactome.readFile(req.query.interactome2);
	var e_value = req.query.e_value;
	var lengthAlignment = req.query.lengthAlignment;
	var numberDescriptions = req.query.numberDescriptions;
	var minimumIdentity = req.query.minimumIdentity;


	var especieName = req.params.fileName.replace(" ", "_");
	var speciesName2 = req.params.fileName2.replace(" ", "_");
	// filepath to read from file fasta from species1 and write on a query file(fasta->query)
	filePath = fasta.createFilePath(especieName);

/*new functionalities*/
	var locus_tag;
	locus_tag = dictionary.searchForGene(especieName, gene);
	//console.log('LOCUS: ' + locus_tag);

	
	// condition if gene is empty or not- if is empty predict interactome for species 2
	if (gene)
	{
		
		var interactions1 = interactome.getGeneInteractions(locus_tag, firstInteractome.fileName);
		interactome.saveInteractions1(interactions1);
		var interactions2 = interactome.getGeneInteractions(locus_tag, secondInteractome.fileName);

		/*If gene is not on interactome1*/
		if(interactions1.length == 0)
		{
			res.send("Missing gene on interactome");
			//res.redirect('/differentSpecies');
		}
		else
		{
			// this will create an array with gene selected and all gene's interactions example: [x1,x2,x3,x4...] -> query.txt
			genes = fasta.createArrayGenes(interactions1);

			var cb =  function(arrayMatrix){
				/*new functionalities*/
				// convert locus_tag to gene names
				var finalArray = dictionary.convertToGene(especieName, speciesName2, arrayMatrix);
				res.send(finalArray);
			}

			fasta.createQuery(filePath, genes, interactions1, secondInteractome.fileName, e_value, lengthAlignment, numberDescriptions, minimumIdentity, cb);
		}

		
	}
	else
	{
		var cb =  function(arrayMatrix){
			var finalArray = dictionary.convertToGene(especieName, speciesName2, arrayMatrix);
					res.send(finalArray);
			}
			// this will create an array with all genes for -> query.txt
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
	//var speciesName = req.params.fileName.replace(" ", "_");

	/*new functionalities*/
	/*var locus_tag;
	locus_tag = dictionary.searchForGene(speciesName, gene);*/
	
	firstInteractome = interactome.readFile(req.query.interactome1);
	secondInteractome = interactome.readFile(req.query.interactome2);

	interactions1 = interactome.getGeneInteractions(gene, firstInteractome.fileName);
	interactions2 = interactome.getGeneInteractions(gene, secondInteractome.fileName);

	
	finalResult = interactome.compare(interactions1, interactions2);
	console.log(finalResult);
	//var finalArray = dictionary.convertToGene(speciesName, speciesName2, arrayMatrix);
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

router.get('/level/:fileName/:fileName2', function(req, res, next){
	console.log(" Rota : entro");
	var gene = req.query.gene;
	var firstInteractome = interactome.readFile(req.query.interactome1);
	var secondInteractome = interactome.readFile(req.query.interactome2);
	var e_value = req.query.e_value;
	var lengthAlignment = req.query.lengthAlignment;
	var numberDescriptions = req.query.numberDescriptions;
	var minimumIdentity = req.query.minimumIdentity;
	//var finalResult = req.body;

	var especieName = req.params.fileName.replace(" ", "_");
	var speciesName2 = req.params.fileName2.replace(" ", "_");

	// filepath to read from file fasta from species1 and write on a query file(fasta->query)
	filePath = fasta.createFilePath(especieName);

	var interactions1 = interactome.loadInteractions1();
	console.log(interactions1);
	var interactomeLevel = [];
	var flag = false;
	// this will create an array with all genes from second level and respective interactions
	for (var i = 0; i < interactions1.length; i++) {
		if(interactions1[i][0]!= interactions1[i][1])
		{
			var interactions = interactome.getGeneInteractions(interactions1[i][1], firstInteractome.fileName);
			console.log(interactions);
			for(j = 0; j < interactions.length; j++)
			{
				// this for is only to remove the interaction that exists in the previous level
				for (var k = 0; k < interactions1.length; k++) {
						if(interactions[j][0] == interactions1[k][1] && interactions[j][1] == interactions1[k][0])
						{
							flag = true;
						}
				}
				if(!flag)
				{
					interactomeLevel.push(interactions[j]);
				}
				flag = false;
			}
		}
			

	}
	//console.log(interactomeLevel);

	var cb =  function(arrayMatrix){
		var finalArray = dictionary.convertToGene(especieName, speciesName2, arrayMatrix);
		res.send(finalArray);
		//console.log(finalArray)
	}
	// this will create an array with all genes for -> query.txt
	interactome.saveInteractions1(interactomeLevel);
	genes = level.createArrayGenes(interactomeLevel);
	level.createQuery(filePath, genes, interactions1, interactomeLevel, secondInteractome.fileName, e_value, lengthAlignment, numberDescriptions, minimumIdentity, cb);
	

	//fasta.forDownload(finalResult);
	 //res.download(tempFile);
	//console.log(finalResult.query2);
	
	//res.send("done");
});


module.exports = router;
