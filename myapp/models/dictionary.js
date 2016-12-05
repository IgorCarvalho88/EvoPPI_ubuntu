//var express = require('express');
var fs = require('fs');
var path = require('path');
var readline = require('readline');

// creating path to database
var fileFolderPath = path.join(__dirname, '..', 'database/dictionary');
var tempFile2 = path.join(__dirname, '..', 'database/tempFiles/temp2.gbff');


exports.createDictionary = function(){
	var lineReader = readline.createInterface({
		input: fs.createReadStream(tempFile2)
	});

	var createDictionaryPath;

	lineReader.on('line', function (line) {
		if(line.startsWith('  ORGANISM'))
		{
			console.log("entro2");
			var name = line.substr(12, line.length -12);
			name = name.replace(" ", "_");
			name  = name + ".txt";
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

function createDictionaryAux(wstream){
	var lineReader = readline.createInterface({
 		input: fs.createReadStream(tempFile2)
	});

	var gene;
	var encontrou = false;
	var flag = false;
	var geneSynonym = false;
	lineReader.on('line', function (line) {

		line = line.trim();
		if(line.startsWith("CDS"))
		{
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

			if(line.startsWith("/locus_tag"))
			{
				
				line = line.substr(11, line.length -11);
				line = line.replace(/"/g, '');
				wstream.write(line);
				wstream.write("\t");
				wstream.write(gene);
				wstream.write("\t");

				encontrou = true;
			}

			
			if(geneSynonym)
			{
				if(line.endsWith('"'))
				{
					var removeQuotation = line.replace(/"/g, ''); 
					var splitByComma = removeQuotation.split(";");
					splitByComma = trimArray(splitByComma);

					if(line.startsWith("Dmel\\CG40494"))
					{
						console.log(splitByComma);
					}
					

					for (var i = 0; i < splitByComma.length; i++) {
						wstream.write(splitByComma[i]);
						wstream.write("\t");
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
						wstream.write(splitByComma[i]);
						wstream.write("\t");
					}
				
				}

			}
			
			if(line.startsWith("/gene_synonym="))
			{
				
				geneSynonym = true;
				var removeWord = line.substr(14, line.length -14);
				var removeQuotation = removeWord.replace(/"/g, '');
				var splitByComma = removeQuotation.split(";");

				splitByComma = trimArray(splitByComma);

				//console.log(splitByComma);
				splitByComma.clean();
				if(line.startsWith('/gene_synonym="BCR'))
					{
						console.log(splitByComma);
					}

				for (var i = 0; i < splitByComma.length; i++) {
					wstream.write(splitByComma[i]);
					wstream.write("\t");
				}
				

				if(line.endsWith('"'))
				{
					
					geneSynonym = false;
				}
			}



			if(line.startsWith('/db_xref="GeneID:'))
			{

				if(!encontrou)
				{

					wstream.write(gene);
					wstream.write("\t");
					wstream.write(gene);
					wstream.write("\t");
					//encontrou = true;
				}

				line = line.substr(17, line.length -17);
				line = line.replace(/"/g, '');
				wstream.write(line);
				wstream.write("\n");
				
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


