//var express = require('express');
var fs = require('fs');
var path = require('path');
var readline = require('readline');

// creating path to database
var fileFolderPath = path.join(__dirname, '..', 'database/dictionary');
var tempFile2 = path.join(__dirname, '..', 'database/tempFiles/temp2.gbff');


exports.createDictionary = function(/*Dictionary*/){
	var lineReader = readline.createInterface({
		input: fs.createReadStream(tempFile2)
	});

	var createDictionaryPath;
	//var dictionary = new Dictionary();

	lineReader.on('line', function (line) {
		if(line.startsWith('  ORGANISM'))
		{
			console.log("entro no dictionary");
			var name = line.substr(12, line.length -12);
			name = name.replace(" ", "_");
			name  = name + ".txt";
			//dictionary.species = name;
			//console.log(dictionary);
			createDictionaryPath = path.join(__dirname, '..', 'database/dictionary/', name);
			//console.log(createFastaPath);
			lineReader.close();
		}
		
	});

	

	lineReader.on('close', () => {
		var wstream = fs.createWriteStream(createDictionaryPath);
		//console.log(createFastaPath);
		createDictionaryAux(wstream);
		wstream.on('finish', function () {
	  	console.log('file has been written');
		});
  		 
		});
}

// function createDictionaryAux(wstream){
// 	var lineReader = readline.createInterface({
//  		input: fs.createReadStream(tempFile2)
// 	});
// 	var bigArray = [];
// 	var gene;
// 	var encontrou = false;
// 	var flag = false;
// 	var geneSynonym = false;

	

// 	/*var dataInJson = {
// 			locus_tag : String,
// 			gene : String,
// 			gene_synonym : [],
// 			geneID : String,
// 			uniProt : String,
// 		};*/

// 	lineReader.on('line', function (line) {

// 		line = line.trim();
// 		if(line.startsWith("CDS"))
// 		{
// 			var smallArray = [];
// 			var contador = 0;
// 			flag = true;
// 		}
// 			// bloco dentro do CDS
// 		if(flag)
// 		{
			
// 			if(line.startsWith("/gene="))
// 			{
				
// 				line = line.substr(6, line.length -6);
// 				line = line.replace(/"/g, '');
// 				gene = line;

// 			}

// 			if(line.startsWith("/locus_tag"))
// 			{
				
// 				line = line.substr(11, line.length -11);
// 				line = line.replace(/"/g, '');
// 				wstream.write(line);
// 				wstream.write("\t");
// 				wstream.write(gene);
// 				wstream.write("\t");

// 				/*smallArray.push(line);
// 				smallArray.push(gene);*/

// 				encontrou = true;
// 			}



			
// 			if(geneSynonym)
// 			{
// 				if(line.endsWith('"'))
// 				{
// 					var removeQuotation = line.replace(/"/g, ''); 
// 					var splitByComma = removeQuotation.split(";");
// 					splitByComma = trimArray(splitByComma);

// 					/*if(line.startsWith("Dmel\\CG40494"))
// 					{
// 						console.log(splitByComma);
// 					}*/
					

// 					for (var i = 0; i < splitByComma.length; i++) {
// 						wstream.write(splitByComma[i]);
// 						wstream.write("\t");
// 					}
// 					//wstream.write("\n");
// 					geneSynonym = false;
// 				}
// 				else
// 				{
// 					var splitByComma = line.split(";");
// 					splitByComma = trimArray(splitByComma);
// 					splitByComma.clean();

// 					for (var i = 0; i < splitByComma.length; i++) {
// 						wstream.write(splitByComma[i]);
// 						wstream.write("\t");
// 					}
				
// 				}

// 			}
			
// 			if(line.startsWith("/gene_synonym="))
// 			{
// 				if(!encontrou)
// 				{

// 					wstream.write(gene);
// 					wstream.write("\t");
// 					wstream.write(gene);
// 					wstream.write("\t");
// 					encontrou = true;
// 				}
				
// 				geneSynonym = true;
// 				var removeWord = line.substr(14, line.length -14);
// 				var removeQuotation = removeWord.replace(/"/g, '');
// 				var splitByComma = removeQuotation.split(";");

// 				splitByComma = trimArray(splitByComma);

// 				//console.log(splitByComma);
// 				splitByComma.clean();
// 				/*if(line.startsWith('/gene_synonym="BCR'))
// 					{
// 						console.log(splitByComma);
// 					}*/

// 				for (var i = 0; i < splitByComma.length; i++) {
// 					wstream.write(splitByComma[i]);
// 					wstream.write("\t");
// 				}
				

// 				if(line.endsWith('"'))
// 				{
					
// 					geneSynonym = false;
// 				}
// 			}



// 			if(line.startsWith('/db_xref="GeneID:'))
// 			{

// 				if(!encontrou)
// 				{

// 					wstream.write(gene);
// 					wstream.write("\t");
// 					wstream.write(gene);
// 					wstream.write("\t");
// 					//encontrou = true;
// 				}

// 				line = line.substr(17, line.length -17);
// 				line = line.replace(/"/g, '');
// 				wstream.write(line);
// 				wstream.write("\n");
				
// 				flag = false;
// 				encontrou = false;
				
// 			}

// 	     }
		
// 	});

// 	lineReader.on('close', () => {
// 		wstream.end();
// 	});

// }*/



function createDictionaryAux(wstream){
	var lineReader = readline.createInterface({
 		input: fs.createReadStream(tempFile2)
	});
	var bigArray = [];
	var gene;
	var encontrou = false;
	var flag = false;
	var geneSynonym = false;
	var geneSynonym_structure = [];

	

	/*var dataInJson = {
			locus_tag : String,
			gene : String,
			gene_synonym : [],
			geneID : String,
			uniProt : String,
		};*/

	lineReader.on('line', function (line) {

		line = line.trim();
		if(line.startsWith("CDS"))
		{
			var smallArray = [];
			var contador = 0;
			flag = true;
		}
			// bloco dentro do CDS
		if(flag)
		{
			
			if(line.startsWith("/gene="))
			{
				
				line = line.substr(6, line.length -6);
				line = line.replace(/"/g, '');
				gene = line;

			}

			/*if(line.startsWith("/locus_tag"))
			{
				
				line = line.substr(11, line.length -11);
				line = line.replace(/"/g, '');
				wstream.write(line);
				wstream.write("\t");
				wstream.write(gene);
				wstream.write("\t");

				smallArray.push(line);
				smallArray.push(gene);

				encontrou = true;
			}*/



			
			if(geneSynonym)
			{
				if(line.endsWith('"'))
				{
					var removeQuotation = line.replace(/"/g, ''); 
					var splitByComma = removeQuotation.split(";");
					splitByComma = trimArray(splitByComma);

					/*if(line.startsWith("Dmel\\CG40494"))
					{
						console.log(splitByComma);
					}*/
					

					for (var i = 0; i < splitByComma.length; i++) {
						//wstream.write(splitByComma[i]);
						//wstream.write("\t");
						geneSynonym_structure.push(splitByComma[i]);
					}
					//wstream.write("\n");
					geneSynonym = false;
				}
				else
				{
					var splitByComma = line.split(";");
					splitByComma = trimArray(splitByComma);
					splitByComma.clean();

					for (var i = 0; i < splitByComma.length; i++) {
						/*wstream.write(splitByComma[i]);
						wstream.write("\t");*/
						geneSynonym_structure.push(splitByComma[i]);
					}
				
				}

			}
			
			if(line.startsWith("/gene_synonym="))
			{
				/*if(!encontrou)
				{

					wstream.write(gene);
					wstream.write("\t");
					wstream.write(gene);
					wstream.write("\t");
					encontrou = true;
				}*/
				
				geneSynonym = true;
				var removeWord = line.substr(14, line.length -14);
				var removeQuotation = removeWord.replace(/"/g, '');
				var splitByComma = removeQuotation.split(";");

				splitByComma = trimArray(splitByComma);

				//console.log(splitByComma);
				splitByComma.clean();
				/*if(line.startsWith('/gene_synonym="BCR'))
					{
						console.log(splitByComma);
					}*/

				for (var i = 0; i < splitByComma.length; i++) {
					/*wstream.write(splitByComma[i]);
					wstream.write("\t");*/
					geneSynonym_structure.push(splitByComma[i]);
				}
				

				if(line.endsWith('"'))
				{
					
					geneSynonym = false;
				}
			}



			if(line.startsWith('/db_xref="GeneID:'))
			{

				/*if(!encontrou)
				{

					wstream.write(gene);
					wstream.write("\t");
					wstream.write(gene);
					wstream.write("\t");
					//encontrou = true;
				}*/

				line = line.substr(17, line.length -17);
				line = line.replace(/"/g, '');
				wstream.write(line);
				wstream.write("\t");
				wstream.write(gene);
				wstream.write("\t");

				// writing synonyms
				if(geneSynonym_structure.length > 0)
				{
					for (var i = 0; i < geneSynonym_structure.length; i++) {
						wstream.write(geneSynonym_structure[i]);
						wstream.write("\t");
					}
				}

				wstream.write("\n");
				geneSynonym_structure = [];
				flag = false;
				encontrou = false;
				
			}

	     }
		
	});

	lineReader.on('close', () => {
		wstream.end();
	});

}



exports.getAllSpecies = function(){
	var files = [];
	finalFiles = [];
	files = fs.readdirSync(fileFolderPath);

	files.forEach(function(file){

		// In case that we hava a txt extension
		if(file.endsWith('txt'))
		{
			var aux;
			aux = file.substring(0, file.length-4);
			// remove underscores
			var name = aux.replace(/_/g, " ")
			console.log(name);
			finalFiles.push(name);
			// In case we have word ending with dictionary word
		}else{
			var aux2;
			aux2 = file.substring(0, file.length-11);
			// remove underscores
			var name2 = aux2.replace(/_/g, " ")
			//console.log(name2);
			finalFiles.push(name2);
		}
		 });
		
	return finalFiles;
};


exports.readFile = function(fileName){

	//TODO
	//Receive interactome as parameter, to show on client too
	var addExtension = fileName + ".txt";
	var data;
	var filePath = path.join(__dirname, '..', 'database/dictionary', addExtension);
	data = fs.readFileSync(filePath, 'utf8');

	var parsedFile = parseFile(data, fileName);
	return parsedFile;	

}

exports.convertToGene = function (species1Name, species2Name, finalArray){
	/*Species1*/
	var addExtension1 = species1Name + ".txt";
	var dictionary1;
	var filePath1 = path.join(__dirname, '..', 'database/dictionary', addExtension1);
	dictionary1 = fs.readFileSync(filePath1, 'utf8');
	// array with dictionary1
	var parsedFile1 = parseFile(dictionary1, species1Name);

	/*Species2*/
	var addExtension2 = species2Name + ".txt";
	var dictionary2;
	var filePath2 = path.join(__dirname, '..', 'database/dictionary', addExtension2);
	dictionary2 = fs.readFileSync(filePath2, 'utf8');
	// array with dictionary2
	var parsedFile2 = parseFile(dictionary2, species2Name);

	var newArray = convertToNewArray(parsedFile1.fileName, parsedFile2.fileName, finalArray);

	return newArray;

}

function convertToNewArray(parsedFile1, parsedFile2, finalArray)
{
	
	var newArray = [];
	for (var i = 0; i < finalArray.length; i++) {
		var array = [];
		// this is a test for the case that second species has an interaction that first species dont have
		if(finalArray[i].length > 3)
		{
			for (var j = 0; j < finalArray[i].length; j+=2) {

				// search dictionary1
				for (var k = 0; k < parsedFile1.length; k++) {
					if(finalArray[i][j] == parsedFile1[k][0])
					{
						//console.log("entro");
						array.push(parsedFile1[k][1]);
						// break
					}
					
				}
				// search dictionary2
				for (var m = 0; m < parsedFile2.length; m++) {
					if(finalArray[i][j+1] == parsedFile2[m][0])
					{
						//console.log("entro2");
						array.push(parsedFile2[m][1]);
						// break
					}
				}

			}
			array.push(finalArray[i][4]);
			
		}
		else
		{
		
				// search dictionary1
				for (var k = 0; k < parsedFile1.length; k++) {
					if(finalArray[i][0] == parsedFile1[k][0])
					{
						//console.log("entro");
						array.push("-");
						array.push(parsedFile1[k][1]);
						// break
					}
					// this is a test for the case that second species has an interaction that first species dont have
				}
				// search dictionary2
				for (var m = 0; m < parsedFile2.length; m++) {
					if(finalArray[i][1] == parsedFile2[m][0])
					{
						//console.log("entro2");
						array.push("-");
						array.push(parsedFile2[m][1]);
						// break
					}
				}
				array.push("species2")
		}
		if(array.length == 5)
		{
			newArray.push(array);
		}
	}
	//console.log(newArray);
	return newArray;
}

exports.convertToGeneSameSpecies = function (species1Name, finalArray){
	/*Species1*/
	console.log(finalArray);
	var addExtension1 = species1Name + ".txt";
	var dictionary1;
	var filePath1 = path.join(__dirname, '..', 'database/dictionary', addExtension1);
	dictionary1 = fs.readFileSync(filePath1, 'utf8');
	// array with dictionary1
	var parsedFile = parseFile(dictionary1, species1Name);
	var parsedFile1 = parsedFile.fileName;
	
	var newArray = [];
	for (var i = 0; i < finalArray.length; i++) {
		var array = [];
		
		for (var j = 0; j < parsedFile1.length; j++) {
			if(finalArray[i][0] == parsedFile1[j][0])
			{
				array.push(parsedFile1[j][1]);
			}

		}

		for (var k = 0; k < parsedFile1.length; k++) {
			if(finalArray[i][1] == parsedFile1[k][0])
			{
				array.push(parsedFile1[k][1]);
			}

		}

		array.push(finalArray[i][2]);
		
		if(array.length == 3)
		{
			newArray.push(array);
		}
		
	}

	return newArray;

}



exports.searchForGene = function (fileName, gene)
{
	//TODO
	//Receive interactome as parameter, to show on client too
	//console.log("entro");
	var addExtension = fileName + ".txt";
	var data;
	var filePath = path.join(__dirname, '..', 'database/dictionary', addExtension);
	data = fs.readFileSync(filePath, 'utf8');

	var teste = parseFile(data, fileName);
	var dictionary = teste.fileName;

	//console.log(dictionary);

	var locus_tag;

	for (var i = 0; i < dictionary.length; i++) {
		for (var j = 1; j < dictionary[i].length; j++) {
				if(dictionary[i][j] == gene)
				{
					locus_tag = dictionary[i][0];
				}
		}
			
	}
	return locus_tag;	

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
		//console.log(dataInJson);
		
		return dataInJson;

}

/*function constructJson(jsonKey, jsonValue){
   var jsonObj = {"key1": jsonValue};
   jsonObj[jsonKey] = "2";
   return jsonObj;
}*/

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

function trimArray(genes)
{
	var arrayAux = [];
	for (var i = 0; i < genes.length; i++) {
		var aux;
		aux = genes[i].trim();
		arrayAux.push(aux);
	}
	return arrayAux;

}

/*Clean empty elements from array*/
Array.prototype.clean = function() {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == '') {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};


