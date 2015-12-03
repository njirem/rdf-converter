import * as minimist from 'minimist';

import { readFile, writeFile, typeFromFile, typeFromString, Type} from './lib/shared';

import { fromType } from './lib/parse';
import { toType }from './lib/convert';

// The first 2 arguments are fixed and not important
const args: {
    help?: boolean;
    h?: boolean;
    src: string;
    src_type: string;
    dest: string;
    dest_type: string
} = <any>minimist(process.argv.slice(2));

if (args.help || args.h) showHelpText();

if (!args.src) showHelpText('Need src attribute for conversion')
if (!args.dest) showHelpText('Need dest attribute for conversion')

let srcType = typeFromString(args.src_type) || typeFromFile(args.src)
if (!srcType) showHelpText("Can't determine source file type, need src_type attribute");

let destType = typeFromString(args.dest_type) || typeFromFile(args.dest)
if (!destType) showHelpText("Can't determine destination file type, need dest_type attribute");

readFile(args.src)
    .then(file => fromType(file, srcType))
    .then(doc => toType(doc, destType))
    .then(out => writeFile(args.dest, out))
    .then(() => console.log('Done!'))
    .catch(err => console.error('Error while converting file!\n', err))

function showHelpText(reason?: string) {
    console.log(`
${reason ? reason : ''}
ttlConverter

Commandline Options:
- help/h    => show this help text
- src       => set the source file
- src_type  => set the source file type
                Options:
                    trig
                    nquad
                    jsonld
- dest      => set the destination file
- dest_type => set the source file type
                Options:
                    trig
                    nquad
                    jsonld

`)
    process.exit(reason ? 1 : 0)
}