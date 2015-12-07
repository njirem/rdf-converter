/**
 * Note: Should rewrite to make use of Streams
 * Currently N3 supports streaming, JsonLD doesn't
 * The full JsonLD format may not be compatible with streaming, there is a gulp plugin to support this, but it doesn't support all JsonLD files.
 */
import * as through from 'through2';
import { PluginError } from 'gulp-util';
import * as path from 'path';

const PLUGIN_NAME = 'gulp-rdf-converter';

import { fromType } from './lib/parse';
import { toType, setDefaultGraphName } from './lib/convert';
import { Type, typeFromFile } from './lib/shared';
export { Type } from './lib/shared';

/**
 * destType is the destination file type
 * It has to be of the Type enum and not Unknown.
 *
 * srcType is the optional source file type
 * if not given it has to be read from the file extension it will throw if it's not recognised
 *
 * nameGraph is the graphName for triples that don't have a graphName yet. (TODO: not implemented yet!!)
 */
export default function Converter(destType: Type, overrideSrcType?: Type, nameGraph?: ((filename: string) => string) | string) {
    if (!destType) throw new PluginError(PLUGIN_NAME, 'Missing destination type in function call!')

    return through.obj(function(file, enc, cb) {
        let srcType = overrideSrcType || typeFromFile(file.path);

        // File is a folder
        if (!file.contents) return cb()
        if (!srcType) return (<any>cb)(new PluginError(PLUGIN_NAME, `Unrecognised file extension "${path.extname(file.path)}" in "${file.path}", please use srcType attribute`));
        if (file.isStream()) return (<any>cb)(new PluginError(PLUGIN_NAME, 'Streams are not supported!'));

        let name = '';
        if (typeof nameGraph === 'string') name = nameGraph
        else if (typeof nameGraph === 'function') name = nameGraph(file.path)

        fromType(file.contents.toString(), srcType)
            .then(doc => setDefaultGraphName(doc, name))
            .then(doc => toType(doc, destType))
            .then(str => {
                file.contents = new Buffer(str);
                let p = path.parse(file.path);
                let ext = `.${Type[destType].toLowerCase() }`;
                p.base = p.base.substr(0, p.base.length - (p.ext.length)) + ext;
                p.ext = ext;
                file.path = path.format(p);
                (<any>cb)(null, file)
            })
            .catch(err => (<any>cb)(err))
    })
}