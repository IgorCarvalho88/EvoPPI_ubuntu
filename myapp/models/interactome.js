//var express = require('express');
var fs = require('fs');
var path = require('path');

// creating path to database
var fileFolderPath = path.join(__dirname, '..', 'database/interactome');

// path for temp interactions when user asks for next level
var tempFile = path.join(__dirname, '..', 'database/tempFiles/tempState.txt');
var tempFileSameSpecies = path.join(__dirname, '..', 'database/tempFiles/tempStateSameSpecies.txt');
var tempSameSpeciesDown = path.join(__dirname, '..', 'database/tempFiles/tempSameSpecies.xls');


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
				arrayCompare[arrayCompare.length-1].push("interactome1 and interactome2");
				break;
			}
			
		}
		if(found == false)
		{
			arrayCompare.push(interactome1[i]);
			arrayCompare[arrayCompare.length-1].push("interactome1");

		}
		found = false;

	}

	// from smallest to big
	var finalArray = addMissingGenes(interactome2, arrayCompare); 
    
	return finalArray;
};

exports.saveInteractions1 = function(interactions1)
{
	var row;
		var writeStream = fs.createWriteStream(tempFile);
		for (var i = 0; i < interactions1.length; i++) {
			//console.log(interactions1[i]);
			// this if is because to not write /n on last line
			if(i != (interactions1.length-1))
			{
				row = interactions1[i][0] + "\t" + interactions1[i][1] + "\n";

			}
			else
			{
				row = interactions1[i][0] + "\t" + interactions1[i][1];
			}
			
			writeStream.write(row);
		}
		writeStream.end();
}

exports.saveInteractionsSameSpecies = function(interactions1)
{
	var row;
		var writeStream = fs.createWriteStream(tempFileSameSpecies);
		for (var i = 0; i < interactions1.length; i++) {
			//console.log(interactions1[i]);
			// this if is because to not write /n on last line
			if(i != (interactions1.length-1))
			{
				row = interactions1[i][0] + "\t" + interactions1[i][1] + "\n";

			}
			else
			{
				row = interactions1[i][0] + "\t" + interactions1[i][1];
			}
			
			writeStream.write(row);
		}
		writeStream.end();
}

/*exports.saveInteractionsSameSpeciesLevel = function(interactomeLevel)
{
	var row;
		var writeStream = fs.createWriteStream(tempFileSameSpecies);
		for (var i = 0; i < interactomeLevel.length; i++) {
			//console.log(interactions1[i]);
			// this if is because to not write /n on last line
			if(i != (interactomeLevel.length-1))
			{
				row = interactomeLevel[i][0] + "\t" + interactomeLevel[i][1] + "\n";

			}
			else
			{
				row = interactomeLevel[i][0] + "\t" + interactomeLevel[i][1];
			}
			
			writeStream.write(row);
		}
		writeStream.end();
}*/

exports.saveSameSpeciesInteractionsDownload = function(finalArray)
{
	//tempSameSpeciesDown
	var row;
		var writeStream = fs.createWriteStream(tempSameSpeciesDown);
		for (var i = 0; i < finalArray.length; i++) {
			//console.log(interactions1[i]);
			// this if is because to not write /n on last line
			if(i != (finalArray.length-1))
			{
				row = finalArray[i][0] + "\t" + finalArray[i][1] + "\t" + finalArray[i][2] + "\n";

			}
			else
			{
				//ultima linha
				row = finalArray[i][0] + "\t" + finalArray[i][1] + "\t" + finalArray[i][2];
			}
			
			writeStream.write(row);
		}
		writeStream.end();
}

exports.loadInteractions1 =  function()
{
	//console.log("Load entro");
	var data;
	data = fs.readFileSync(tempFile, 'utf8');
	var parsedFile = parseFile(data, "teste");
	return parsedFile.fileName;

}

exports.loadInteractionsSameSpecies =  function()
{
	//console.log("Load entro");
	var data;
	data = fs.readFileSync(tempFileSameSpecies, 'utf8');
	var parsedFile = parseFile(data, "teste");
	return parsedFile.fileName;

}



// auxiliar functions

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
			arrayCompare[arrayCompare.length-1].push("interactome2");

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