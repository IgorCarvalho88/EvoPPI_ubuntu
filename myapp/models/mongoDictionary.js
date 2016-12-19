var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var geneSchema = new Schema({
	locus_tag : String,
	gene : String,
	//mudar para array gene_synonym
	gene_synonym : [],
	geneID : String,
	uniProt : String,
});

var dictionarySchema = new Schema({
	species : String,
	genes : [geneSchema],
});

var Dictionary = mongoose.model('Dictionary', dictionarySchema);

module.exports = Dictionary;