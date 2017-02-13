var express = require('express');
var router = express.Router();
var interactome = require('./models/interactome.js');
var dictionary = require('./models/dictionary.js');
var fasta = require('./models/fasta.js');
var wholeInteractome = require('./models/wholeInteractome.js');
var path = require('path');
var readline = require('readline');
var fs = require('fs');

var query = path.join(__dirname, 'database/fasta/query.txt');
var tempFile = path.join(__dirname, 'database/tempFiles/temp.xls');
var fileUploaded = path.join(__dirname, 'database/tempFiles/temp2.gbff');

var filePath = path.join(__dirname, 'config/config.txt');


var data = fs.readFileSync(filePath, 'utf8');
data = parseFile(data);

//console.log(data);

species2 = data[0][1];
species2 = species2.substr(0, species2.length - 4);
//console.log(species2);

species1 = data[0][0];
species1 = species1.substr(0, species1.length - 4);
//console.log(species1);

// execute blast for species2 database
fasta.execCMD(species2);

// read interactomes
var firstInteractome = interactome.readFile(data[1][0]);
var secondInteractome = interactome.readFile(data[1][1]);

/*console.log(firstInteractome);
console.log(secondInteractome);*/


// read gene
var gene = data[2][0];

// read values
var e_value = data[3][0];
var lengthAlignment = data[3][1];
var numberDescriptions = data[3][2];
var minimumIdentity = data[3][3];

console.log(e_value);
console.log(lengthAlignment);
console.log(numberDescriptions);
console.log(minimumIdentity);


/*new functionalities*/
	var locus_tag;
	locus_tag = dictionary.searchForGene(species1, gene);

//get gene interactions
var interactions1 = interactome.getGeneInteractions(locus_tag, firstInteractome.fileName);

filePath = fasta.createFilePath(species1);

if(interactions1.length == 0)
	{
		console.log("gene missing on interactome");
	}
	else
	{
		var genes = fasta.createArrayGenes(interactions1);
	}

	var cb =  function(arrayMatrix){
		var finalArray = dictionary.convertToGene(species1, species2, arrayMatrix);
		fasta.forDownload(finalArray);
		console.log(finalArray);
	}
fasta.createQuery(filePath, genes, interactions1, secondInteractome.fileName, e_value, lengthAlignment, numberDescriptions, minimumIdentity, cb);










function parseFile(data){
	var aux2;

	var dataInJson = {
			fileName:[]

		};

	// removing whitspaces
		var aux = data.split("\n");

		aux.forEach(function(item){
			aux2 = item.split("\t");
			aux2.forEach(function(part,index,theArray){
				theArray[index] = part.trim();
			});
			//var gene = toObject(aux2);
			dataInJson.fileName.push(aux2);
		});
		
		return dataInJson.fileName;

}

//console.log("teste");