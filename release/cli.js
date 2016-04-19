"use strict";
var minimist = require('minimist');
var shared_1 = require('./lib/shared');
var parse_1 = require('./lib/parse');
var convert_1 = require('./lib/convert');
// The first 2 arguments are fixed and not important
var args = minimist(process.argv.slice(2));
if (args.help || args.h)
    showHelpText();
if (!args.src)
    showHelpText('Need src attribute for conversion');
if (!args.dest)
    showHelpText('Need dest attribute for conversion');
var srcType = shared_1.typeFromString(args.src_type) || shared_1.typeFromFile(args.src);
if (!srcType)
    showHelpText("Can't determine source file type, need src_type attribute");
var destType = shared_1.typeFromString(args.dest_type) || shared_1.typeFromFile(args.dest);
if (!destType)
    showHelpText("Can't determine destination file type, need dest_type attribute");
shared_1.readFile(args.src)
    .then(function (file) { return parse_1.fromType(file, srcType); })
    .then(function (doc) { return convert_1.toType(doc, destType); })
    .then(function (out) { return shared_1.writeFile(args.dest, out); })
    .then(function () { return console.log('Done!'); })
    .catch(function (err) { return console.error('Error while converting file!\n', err); });
function showHelpText(reason) {
    console.log("\n" + (reason ? reason : '') + "\nttlConverter\n\nCommandline Options:\n- help/h    => show this help text\n- src       => set the source file\n- src_type  => set the source file type\n                Options:\n                    trig\n                    nquad\n                    jsonld\n- dest      => set the destination file\n- dest_type => set the source file type\n                Options:\n                    trig\n                    nquad\n                    jsonld\n\n");
    process.exit(reason ? 1 : 0);
}
