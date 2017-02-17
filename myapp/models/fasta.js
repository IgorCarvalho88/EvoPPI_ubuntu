var fs = require('fs');
var path = require('path');
var readline = require('readline');
var child_process = require('child_process');

// creating path to database
var fileFolderPath = path.join(__dirname, '..', 'database/fasta');
var blastPath = path.join(__dirname, '..', 'ncbi-blast-2.5.0+/bin/makeblastdb');
var blastPathOut = path.join(__dirname, '..', 'ncbi-blast-2.5.0+/bin/dbtemp1');
var blastPathResult = path.join(__dirname, '..', 'ncbi-blast-2.5.0+/bin/tempresult');
var blast = path.join(__dirname, '..', 'ncbi-blast-2.5.0+/bin/blastp');
var query = path.join(__dirname, '..', 'database/fasta/query.txt');
var tempFile2 = path.join(__dirname, '..', 'database/tempFiles/temp2.gbff');
// for download
var tempFile = path.join(__dirname, '..', 'database/tempFiles/temp.xls');
// sameSpeciesforDownload
var tempFastaDownload = path.join(__dirname, '..', 'database/tempFiles/Samespecies_fasta');
var tempFastaDownloadWithGeneNames = path.join(__dirname, '..', 'database/tempFiles/Samespecies2_fasta');

// differentSpeciesforDownload
var differentSpeciesTempFastaDownload = path.join(__dirname, '..', 'database/tempFiles/Differentspecies_fasta');
var differentSpeciesTempFastaDownloadGeneNames = path.join(__dirname, '..', 'database/tempFiles/Differentspecies2_fasta');


exports.createFasta = function(){
	var lineReader = readline.createInterface({
		input: fs.createReadStream(tempFile2)
	});

	var createFastaPath;

	lineReader.on('line', function (line) {
		if(line.startsWith('  ORGANISM'))
		{
			
			var name = line.substr(12, line.length -12);
			name = name.replace(" ", "_");
			name  = name + "_fasta";
			createFastaPath = path.join(__dirname, '..', 'database/fasta/', name);
			//console.log(createFastaPath);
			lineReader.close();
		}
		
	});

	

	lineReader.on('close', () => {
		var wstream = fs.createWriteStream(createFastaPath);
		//console.log(createFastaPath);
		createFastaAux(wstream);
		wstream.on('finish', function () {
	  	console.log('file has been written');
		});
  		 
		});


}

/*function createFastaAux(wstream){
	var lineReader = readline.createInterface({
 		input: fs.createReadStream(tempFile2)
	});

	var gene;
	var encontrou = false;
	var flag = false;
	var translation = false;
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
				wstream.write(">");
				wstream.write(line);
				wstream.write("\n");
				encontrou = true;
			}

			if(translation)
			{
				if(line.endsWith('"'))
				{
					line = line.replace(/"/g, '');
					wstream.write(line);
					wstream.write("\n");
					flag = false;
					encontrou = false;
					translation = false;
				}
				else
				{
					wstream.write(line);
					wstream.write("\n");
				
				}

			}

			if(line.startsWith("/translation"))
			{
				if(!encontrou)
				{
					wstream.write(">");
					wstream.write(gene);
					wstream.write("\n");

				}
				var aux = line.substr(13, line.length -13);
				aux = aux.replace(/"/g, '');
				wstream.write(aux);
				wstream.write("\n");
				translation = true;

				if(line.endsWith('"'))
				{
					flag = false;
					encontrou = false;
					translation = false;
				}
					

			}
			
		}
		
	});

lineReader.on('close', () => {
		wstream.end();
	});
  		 
	
	

}*/


function createFastaAux(wstream){
	var lineReader = readline.createInterface({
 		input: fs.createReadStream(tempFile2)
	});

	var gene;
	var encontrou = false;
	var flag = false;
	var translation = false;
	lineReader.on('line', function (line) {
		line = line.trim();
		if(line.startsWith("CDS"))
		{
			var translation_structure = [];
			flag = true;
		}
			// bloco dentro do CDS
		if(flag)
		{
			if(line.startsWith('/db_xref="GeneID:'))
			{
				line = line.substr(17, line.length -17);
				line = line.replace(/"/g, '');
				wstream.write(">");
				wstream.write(line);
				wstream.write("\n");



			}

			if(translation)
			{
				if(line.endsWith('"'))
				{
					line = line.replace(/"/g, '');
					wstream.write(line);
					wstream.write("\n");
					
					flag = false;
					encontrou = false;
					translation = false;
				}
				else
				{
					wstream.write(line);
					wstream.write("\n");
					
				}

			}


			if(line.startsWith("/translation"))
			{
				
				var aux = line.substr(13, line.length -13);
				aux = aux.replace(/"/g, '');
				wstream.write(aux);
				wstream.write("\n");
				translation = true;


				if(line.endsWith('"'))
				{
					flag = false;
					encontrou = false;
					translation = false;
				}
					

			}
			
			
		}
		
	});

lineReader.on('close', () => {
		wstream.end();
	});
  		 
	
	

}



exports.execCMD = function(especiesName){
	var fullName = especiesName + "_fasta";
	var blastPathIn = path.join(__dirname, '..', 'database/fasta/', fullName);

	child_process.execFileSync(blastPath, ['-in', blastPathIn, '-dbtype', 'prot', '-out', blastPathOut]);
	/*child_process.execFile(blastPath, ['-in', blastPathIn, '-dbtype', 'prot', '-out', blastPathOut], function(error, stdout, stderr){
		console.log(stdout);
		console.log(stderr);
	});*/
};

//blastp.exe -query query.txt -db dbtemp -evalue 0.05 -max_target_seqs 20 -outfmt 6 -out tempresult



exports.createFilePath = function(Name){
	console.log("Entro file path");
	var fileName;
	var files = [];
	var genes = [];
	//var filePath2 = path.join(__dirname, '..', 'database/fasta', "query.txt");

	//genes = createArrayGenes(interactions);
	
	files = fs.readdirSync(fileFolderPath);

	files.forEach(function(file){
		if(file.startsWith(Name))
		{
			fileName = file;
		}

		 });

	var filePath = path.join(__dirname, '..', 'database/fasta', fileName);
	
	//results = createQuery(filePath, genes);
	//console.log(results);

	return filePath;

}



exports.createQuery = function(filePath, genes, interactions1, interactome2, e_value, lengthAlignment, numberDescriptions, minimumIdentity, cb){

	var lineReader = readline.createInterface({
		input: fs.createReadStream(filePath)
	});

	var wstream = fs.createWriteStream(query);
/*This will create query.txt file with gene and gene´s interactions from species1*/
	var flag =  false;
	lineReader.on('line', function (line) {
		if(line.startsWith('>'))
		{
			flag = false;
			for (var i = 0; i < genes.length; i++) {
				if(genes[i] == line.substr(1, line.length -1)){
					flag = true;
				}
			}
		}
		if(flag)
		{
			wstream.write(line);
			wstream.write('\n');
		}
	});


	lineReader.on('close', () => {
  		 wstream.end();
		});

	wstream.on('finish', function () {
	  console.log('file has been written');

	  function callback(arrayMatrix){
	  	 /*create an associative array of genes
	  	 gene selected [x1, y1, y2, y3]
	  	 interacts with [x2, y5, y4, y6 ]*/
	  	var array = interaction1TmpResult (interactions1, arrayMatrix, lengthAlignment, minimumIdentity);
	  	// create interactions on interactome2 of the gene selected, for example: x1
	  	var interactions2 = createInteractions2(array, interactome2);
	  	//console.log(interactions2);
	  	// create array with [mainGene, sinonimo, interage, sinonimo, codigo ]
	  	// missing the code 1, this menas that exists an interaction that doesn't exist in spcecies1
	  	var halfArray = compareInt2(interactome2, array);
	  	//console.log(halfArray);
	  	// complete the array with code1
	  	var finalArray = compareFinal(interactions2, halfArray);
	  	//console.log(finalArray);
	  	// remove duplicates
	  	finalArray = uniqBy(finalArray, JSON.stringify)
	  	//console.log(finalArray);
	  	//interaction1TmpResult (interactions2, arrayMatrix);
	  	cb(finalArray);
	  } 
	  execCMD2(e_value, numberDescriptions, callback);
	});

};


function createInteractions2(array, interactome2)
{
	var interactions2 = [];
	for (var i = 1; i < array[0].length; i++) {
		for (var j = 0; j < interactome2.length; j++) {
			if(array[0][i] == interactome2[j][0] || array[0][i] == interactome2[j][1])
			{
				interactions2.push(interactome2[j]);
			}
		}
	}
	//console.log("isto:" + interactions2);
	return interactions2;
}


function compareFinal(interactions2, halfArray)
{
	found = false;

	for (var i = 0; i < interactions2.length; i++) {
		array = [];
		for (var j = 0; j < halfArray.length; j++) {
			if((interactions2[i][0] == halfArray[j][1] && interactions2[i][1] == halfArray[j][3]) || 
				interactions2[i][1] == halfArray[j][1] && interactions2[i][0] == halfArray[j][3])
			{
				found = true;
				break;
			}

		}
		if(found == false)
		{
			array.push(interactions2[i][0]);
			array.push(interactions2[i][1]);
			array.push("species2");
			halfArray.push(array);

		}
		
		found = false;
	}

	return halfArray;
}


function compareInt2(interactome2, array)
{
	// TODO verificar para genes que não existem na base de dados devolvida pelo blast
	
	var bigArray = [];
	found = false;
	//console.log(array);
	//console.log(interactome2);
	for (var i = 1; i < array[0].length; i++) {
		for (var j = 1; j < array.length; j++) {
			for (var k = 1; k < array[j].length; k++) {
				var smallArray = [];
				for (var m = 0; m < interactome2.length; m++) {
					if((array[0][i] == interactome2[m][0] && array[j][k] == interactome2[m][1]) ||
						(array[0][i] == interactome2[m][1] && array[j][k] == interactome2[m][0]))
						{
							found = true;
							smallArray.push(array[0][0]);
							smallArray.push(array[0][i]);
							smallArray.push(array[j][0]);
							smallArray.push(array[j][k]);
							smallArray.push("species1 and species2");
							
						}
				}
				if(found == false)
					{
						smallArray.push(array[0][0]);
						smallArray.push(array[0][i]);
						smallArray.push(array[j][0]);
						smallArray.push(array[j][k]);
						smallArray.push("species1");

					}
					bigArray.push(smallArray);
					found = false;
			}
		}
	}

	//console.log(bigArray);

	return bigArray;

}


function execCMD2 (e_value, numberDescriptions, callback){

	// passar para sincrono

	
	child = child_process.execFileSync(blast, ['-query', query, '-db', blastPathOut, '-evalue', e_value, '-max_target_seqs', numberDescriptions, '-outfmt',  6, '-out', blastPathResult]);
	
	var results = [];
	var lineReader = readline.createInterface({
		input: fs.createReadStream(blastPathResult)
		});

		lineReader.on('line', function (line) {
			var lineStr = line.split("\t");
			results.push(lineStr);
	});
		
		lineReader.on('close', () => {
  			 callback(results);
		});
		
};


function interaction1TmpResult (interactions1, tmpResult, lengthAlignment, minimumIdentity){
	
	var auxiliarArray = [];
	console.log(interactions1);
	for (var i = 0; i < interactions1.length; i++) {
		if(i==0)
		{
			var mainGene = [];
			mainGene.push(interactions1[0][0]);
			for (var j = 0; j < tmpResult.length; j++) {
				if(interactions1[0][0] == tmpResult[j][0] && Number(tmpResult[j][2]) >= minimumIdentity && Number(tmpResult[j][3]) >= lengthAlignment){
					mainGene.push(tmpResult[j][1]);
					
				}
			}
			auxiliarArray.push(mainGene);
		}

		var interactGene = [];
		interactGene.push(interactions1[i][1]);
		for (var j = 0; j < tmpResult.length; j++) {
			if(interactions1[i][1] == tmpResult[j][0] && Number(tmpResult[j][2]) >= minimumIdentity && Number(tmpResult[j][3]) >= lengthAlignment){
				//console.log(tmpResult[j][1]);
				interactGene.push(tmpResult[j][1]);
			}
		}
		auxiliarArray.push(interactGene);
	}

	//console.log(auxiliarArray);
 	
	return auxiliarArray;
};


function createAuxiliarArray(interactome1)
{
	var auxiliarArray = [];
	for (var i = 0; i < interactome1.length; i++) {
		auxiliarArray.push(interactome1[i]);
	}

	return auxiliarArray;
}

function auxiliar(element, tmpResult)
{

	for (var i = 0; i < tmpResult.length; i++) {
		 if(element == tmpResult[i][0])
		 {
		 	return true;
		 }
	}
	return false;
}

/*utility functions*/


exports.createArrayGenes = function(interactions){
	var genes = [];

	for (var i = 0; i < interactions.length; i++) {
		if (i == 0)
		{
			genes.push(interactions[i][0]);
		}
		genes.push(interactions[i][1]);
		
	}

	return genes;

}


/*Route /download for xls file */
exports.forDownload = function(finalResult){
	//console.log(finalResult);
	var row;
		var writeStream = fs.createWriteStream(tempFile);
		for (var i = 0; i < finalResult.length; i++) {
			console.log(finalResult[i]);
			row = finalResult[i][0] + "\t" + finalResult[i][1] + "\t" + finalResult[i][2] + "\t" + finalResult[i][3] + "\t" + finalResult[i][4] + "\n";
			console.log(row);
			writeStream.write(row);
		}
		writeStream.end();
}

/*Route /download for fasta file */
exports.createFastaDownload = function(genes, filePath, callback){
	console.log("entrei na funcao");
	var lineReader = readline.createInterface({
		input: fs.createReadStream(filePath)
	});

	var wstream = fs.createWriteStream(tempFastaDownload);
/*This will create query.txt file with gene and gene´s interactions from species1*/
	var flag =  false;
	lineReader.on('line', function (line) {
		if(line.startsWith('>'))
		{
			flag = false;
			for (var i = 0; i < genes.length; i++) {
				if(genes[i] == line.substr(1, line.length -1)){
					flag = true;
				}
			}
		}
		if(flag)
		{
			wstream.write(line);
			wstream.write('\n');
		}
	});


	lineReader.on('close', () => {
  		 wstream.end();
		});

	wstream.on('finish', function () {
	  console.log('file has been written');
	  callback();
	});

	
};




exports.createFastaDownloadWithGeneNames = function(speciesName, callback){
	console.log("Entrei na cuncao");
	var addExtension = speciesName + ".txt";
	var filePath = path.join(__dirname, '..', 'database/dictionary', addExtension);
	var parseFile1 = fs.readFileSync(filePath, 'utf8');
	//console.log(dictionary_aux);
	

	var parsedFile = parseFile(parseFile1, "teste");
	var dictionary = parsedFile.fileName;
	console.log(dictionary);

	var lineReader = readline.createInterface({
		input: fs.createReadStream(tempFastaDownload)
	});

	var wstream = fs.createWriteStream(tempFastaDownloadWithGeneNames);

	var flag =  false;
	lineReader.on('line', function (line) {
	if(line.startsWith('>'))
	{
		flag = false;
		for (var i = 0; i < dictionary.length; i++) {
			if((line.substr(1, line.length -1)) == dictionary[i][0])
			{
				wstream.write('>');
				wstream.write(dictionary[i][1]);
				wstream.write('\n');
			}
		}
		
	}
	if(flag)
		{
			wstream.write(line);
			wstream.write('\n');
		}
		flag = true;
});

	lineReader.on('close', () => {
  		 wstream.end();
		});

	wstream.on('finish', function () {
	  console.log('file has been written 2');
	  callback();
	});

}

exports.createFastaDownloadDifferentSpecies = function(genes, filePath, callback){
	console.log("entrei na funcao");
	var lineReader = readline.createInterface({
		input: fs.createReadStream(filePath)
	});

	var wstream = fs.createWriteStream(differentSpeciesTempFastaDownload);
/*This will create query.txt file with gene and gene´s interactions from species1*/
	var flag =  false;
	lineReader.on('line', function (line) {
		if(line.startsWith('>'))
		{
			flag = false;
			for (var i = 0; i < genes.length; i++) {
				if(genes[i] == line.substr(1, line.length -1)){
					flag = true;
				}
			}
		}
		if(flag)
		{
			wstream.write(line);
			wstream.write('\n');
		}
	});


	lineReader.on('close', () => {
  		 wstream.end();
		});

	wstream.on('finish', function () {
	  console.log('file has been written');
	  callback();
	});

	
};



exports.createFastaDownloadDifferentSpeciesWithGeneNames = function(speciesName, callback){
	console.log("Entrei na cuncao");
	var addExtension = speciesName + ".txt";
	var filePath = path.join(__dirname, '..', 'database/dictionary', addExtension);
	var parseFile1 = fs.readFileSync(filePath, 'utf8');
	//console.log(dictionary_aux);
	

	var parsedFile = parseFile(parseFile1, "teste");
	var dictionary = parsedFile.fileName;
	console.log(dictionary);

	var lineReader = readline.createInterface({
		input: fs.createReadStream(differentSpeciesTempFastaDownload)
	});

	var wstream = fs.createWriteStream(differentSpeciesTempFastaDownloadGeneNames);

	var flag =  false;
	lineReader.on('line', function (line) {
	if(line.startsWith('>'))
	{
		flag = false;
		for (var i = 0; i < dictionary.length; i++) {
			if((line.substr(1, line.length -1)) == dictionary[i][0])
			{
				wstream.write('>');
				wstream.write(dictionary[i][1]);
				wstream.write('\n');
			}
		}
		
	}
	if(flag)
		{
			wstream.write(line);
			wstream.write('\n');
		}
		flag = true;
});

	lineReader.on('close', () => {
  		 wstream.end();
		});

	wstream.on('finish', function () {
	  console.log('file has been written 2');
	  callback();
	});

}





exports.genesDifferenteSpeciesDownload = function(finalResult){

	var bigArray = [];
	//var genes = [];
	
	for (var i = 1; i < finalResult.length; i++) {

		  bigArray.push(finalResult[i][1]);
	}

	for (var j = 1; j < finalResult.length; j++) {
		
		  bigArray.push(finalResult[j][3]);
	}

	bigArray = uniqBy(bigArray, JSON.stringify);

	//console.log(bigArray);

	return bigArray;

}

exports.convertoToGeneIDs = function(genes, speciesName){

	var genesIDs = [];
	var addExtension = speciesName + ".txt";
	var filePath = path.join(__dirname, '..', 'database/dictionary', addExtension);
	var parseFile1 = fs.readFileSync(filePath, 'utf8');
	//console.log(dictionary_aux);
	

	var parsedFile = parseFile(parseFile1, "teste");
	var dictionary = parsedFile.fileName;

	//console.log(dictionary);
	console.log(genes);

	for (var i = 0; i < genes.length; i++) {

		for (var j = 0; j < dictionary.length; j++) {
			if(genes[i] == dictionary[j][1])
			{
				genesIDs.push(dictionary[j][0]);
			}
		}
		
	}

	return genesIDs;

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


