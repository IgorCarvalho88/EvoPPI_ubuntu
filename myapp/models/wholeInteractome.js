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
var tempFile = path.join(__dirname, '..', 'database/tempFiles/temp.xls');



exports.createQuery2 = function(filePath, genes, firstInteractome, interactome2, e_value, lengthAlignment, numberDescriptions, minimumIdentity, cb){

	var lineReader = readline.createInterface({
		input: fs.createReadStream(filePath)
	});

	var wstream = fs.createWriteStream(query);

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
	  	var array = interaction1TmpResult2 (firstInteractome, arrayMatrix, lengthAlignment, minimumIdentity);
	  	// create interactions on interactome2 of the gene selected, for example: x1
	  	var interactions2 = createInteractions2(array, interactome2);
	  	//console.log(interactions2);
	  	// create array with [mainGene, sinonimo, interage, sinonimo, codigo ]
	  	// missing the code 1, this menas that exists an interaction that doesn't exist in spcecies1
	  	var halfArray = compareInt22(interactome2, array);
	  	//console.log(halfArray);
	  	// complete the array with code1
	  	var finalArray = compareFinal2(interactome2, halfArray);
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

function compareFinal2(interactome2, halfArray)
{
	found = false;

	for (var i = 0; i < interactome2.length; i++) {
		array = [];
		for (var j = 0; j < halfArray.length; j++) {
			if((interactome2[i][0] == halfArray[j][1] && interactome2[i][1] == halfArray[j][3]) || 
				interactome2[i][1] == halfArray[j][1] && interactome2[i][0] == halfArray[j][3])
			{
				found = true;
				break;
			}

		}
		if(found == false)
		{
			array.push(interactome2[i][0]);
			array.push(interactome2[i][1]);
			array.push("1");
			halfArray.push(array);

		}
		
		found = false;
	}

	return halfArray;
}


function compareInt22(interactome2, array)
{
	// TODO verificar para genes que não existem na base de dados devolvida pelo blast
	
	var bigArray = [];
	found = false;
	//console.log(array);
	//console.log(interactome2);
	for (var i = 0; i < array.length; i+=2) {
		/*console.log(array[i]);
		console.log(array[i+1]);*/
		for (var j = 1; j < array[i].length; j++) {
			for (var k = 1; k < array[i+1].length; k++) {
				var smallArray = [];
				for (var m = 0; m < interactome2.length; m++) {
					if((array[i][j] == interactome2[m][0] && array[i+1][k] == interactome2[m][1]) ||
						(array[i][j] == interactome2[m][1] && array[i+1][k] == interactome2[m][0]))
						{
							found = true;
							smallArray.push(array[i][0]);
							smallArray.push(array[i][j]);
							smallArray.push(array[i+1][0]);
							smallArray.push(array[i+1][k]);
							smallArray.push("2");
							
						}
				}
				if(found == false)
					{
						smallArray.push(array[i][0]);
						smallArray.push(array[i][j]);
						smallArray.push(array[i+1][0]);
						smallArray.push(array[i+1][k]);
						smallArray.push("0");

					}
					bigArray.push(smallArray);
					found = false;
			}
		}
	}

	console.log("BIG ARRAY: " + bigArray);

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


function interaction1TmpResult2 (firstInteractome, tmpResult, lengthAlignment, minimumIdentity){
	
	var auxiliarArray = [];
	//console.log(firstInteractome);
	for (var i = 0; i < firstInteractome.length; i++) {
		for(var j = 0; j<firstInteractome[i].length; j++){
			var interactGene = [];
			interactGene.push(firstInteractome[i][j]);
			for (var k = 0; k < tmpResult.length; k++) {
				if(firstInteractome[i][j] == tmpResult[k][0] && Number(tmpResult[k][2]) >= minimumIdentity && Number(tmpResult[k][3]) >= lengthAlignment){
					//console.log(tmpResult[j][1]);
					interactGene.push(tmpResult[k][1]);
				}
			}
			auxiliarArray.push(interactGene);
		}
	}

	console.log(auxiliarArray);
 	
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


exports.createArrayGenes2 = function(interactome1){
	var genes = [];

	for (var i = 0; i < interactome1.length; i++) {
		for (var j = 0; j < interactome1[i].length; j++) {
			genes.push(interactome1[i][j]);
		}
	}
	genes = uniqBy(genes, JSON.stringify)

	console.log("GENES: " + genes);
	return genes;

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


