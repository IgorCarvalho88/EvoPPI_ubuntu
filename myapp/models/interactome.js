//var express = require('express');
var fs = require('fs');
var path = require('path');

// creating path to database
var fileFolderPath = path.join(__dirname, '..', 'database/interactome');


exports.getAllInteractomes = function(fileName){


	//var filePath = path.join(__dirname, '..', 'database/dictionary', filename);

	var files = [];
	finalFiles = [];
	files = fs.readdirSync(fileFolderPath);


	files.forEach(function(file){

		
		if(file.startsWith(fileName))
		{
			finalFiles.push(file);
		}
		
		 });

		
	return finalFiles;
};



exports.readFile = function(fileName){
	console.log(fileName);
	//TODO
	//Receive interactome as parameter, to show on client too
	//var addExtension = fileName + ".txt";
	var data;
	var filePath = path.join(__dirname, '..', 'database/interactome', fileName);
	data = fs.readFileSync(filePath, 'utf8');

	// remove extensions

	var parsedFile = parseFile(data, fileName);
	return parsedFile;	

}

function parseFile(data, fileName){
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
		// remove duplicate elements
		b = uniqBy(dataInJson.fileName, JSON.stringify)
		//console.log(b);
		dataInJson.fileName = b;

		return dataInJson;

}

/*function constructJson(jsonKey, jsonValue){
   var jsonObj = {"key1": jsonValue};
   jsonObj[jsonKey] = "2";
   return jsonObj;
}*/

exports.getGeneInteractions = function(gene, interactome){
	var interactions = [];
	var interactionsOrdered;
	var control = 0;
	//console.log(gene);
	
		
		for (var i = 0; i < interactome.length; i++) { 
          for (var j = 0; j < interactome[i].length; j++) { 

          	if(interactome[i][j] == gene && control != 1)
          	{
          		//console.log(interactome[i]);
            	interactions.push(interactome[i]);
            	control = 1;
            }

          }
          control = 0;
        }

        interactionsOrdered = orderByGene(interactions, gene);
    
	return interactionsOrdered;
};


exports.compare = function(interactome1, interactome2){
	var tamanho;
	var biggestArray;
	var smallestArray;
	var arrayCompare = [];
	var found = false;


	for (var i = 0; i < interactome1.length; i++) { 
		for (var j = 0; j < interactome2.length; j++) {
			if(interactome1[i][1] == interactome2[j][1] && found == false)
			{
				found = true;
				arrayCompare.push(interactome1[i]);
				arrayCompare[arrayCompare.length-1].push("2");
				break;
			}
			
		}
		if(found == false)
		{
			arrayCompare.push(interactome1[i]);
			arrayCompare[arrayCompare.length-1].push("0");

		}
		found = false;

	}

	// from smallest to big
	var finalArray = addMissingGenes(interactome2, arrayCompare); 
    
	return finalArray;
};



// auxiliar functions

function addMissingGenes(interactome2, arrayCompare)
{
	var found = false;

	for (var i = 0; i < interactome2.length; i++) { 
		for (var j = 0; j < arrayCompare.length; j++) {
			if(interactome2[i][1] == arrayCompare[j][1] && found == false)
			{
				found = true;
				break;
			}
			
		}
		if(found == false)
		{
			arrayCompare.push(interactome2[i]);
			arrayCompare[arrayCompare.length-1].push("1");

		}
		found = false;

	}

	return arrayCompare;

}

function orderByGene(interactions ,gene)
{
	var finalInteractions = [];

	for (var i = 0; i < interactions.length; i++) { 

		if(interactions[i][1] == gene)
		{
			var aux = interactions[i][0];
			interactions[i][0] = interactions[i][1];
			interactions[i][1] = aux;
		}

		finalInteractions.push(interactions[i]);
   
    }
    return finalInteractions;

}

function toObject(array){
	var gene = {};
	for (var i = 0; i < array.length; i++) { // from 1 to 10
    	gene["name" + i] = array[i];
	}
	return gene;
}

function uniqBy(a, key) {
    var seen = {};
    return a.filter(function(item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}