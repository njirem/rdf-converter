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
 * This function will convert from a supported RDF format to another (or directly to JS array)
 *
 * destType is the destination file type
 * It has to be of the Type enum and not Unknown.
 */
export function convert(outType: Type, options: Options = {}) {
    if (!outType) throw new PluginError(PLUGIN_NAME, 'Missing destination type in function call!')

    return through.obj(function(file, enc, cb) {
        let srcType: Type;
        if (options.overrideSrcType) srcType = options.srcType || typeFromFile(file.path);
        else srcType = typeFromFile(file.path) || options.srcType;

        // File is a folder
        if (!file.contents) return cb()
        if (!srcType) return (<any>cb)(new PluginError(PLUGIN_NAME, `Unrecognised file extension "${path.extname(file.path) }" in "${file.path}", please use srcType attribute`));
        if (file.isStream()) return (<any>cb)(new PluginError(PLUGIN_NAME, 'Streams are not supported!'));

        let name = '';
        let defaultGraphName = options.defaultGraphName; // TypeScript won't typecast inside an object
        if (typeof defaultGraphName === 'string') name = defaultGraphName
        else if (typeof defaultGraphName === 'function') name = defaultGraphName(file.path)

        fromType(file.contents.toString(), srcType)
            .then(doc => setDefaultGraphName(doc, name))
            .then(doc => toType(doc, outType, options))
            .then(str => {
                file.contents = new Buffer(str);
                let p = path.parse(file.path);
                let ext = `.${Type[outType].toLowerCase() }`;
                p.base = p.base.substr(0, p.base.length - (p.ext.length)) + ext;
                p.ext = ext;
                file.path = path.format(p);
                (<any>cb)(null, file)
            })
            .catch(err => (<any>cb)(err))
    })
}

/**
 * The Options object for the convert task
 */
export interface Options {
    /**
     * The type of RDF data in the source, if one can't be found from the extension
     */
    srcType?: Type,

    /**
     * Only applicable when srcType is filled
     * Will override the extension found with srcType
     */

    overrideSrcType?: boolean,

    /**
     * Set the graphName for triples without a graphName in the source
     * Can be a plain string or a function of the filename, returning the graphName
     */
    defaultGraphName?: ((filename: string) => string) | string,

    /**
     * If outputType is Type.JS, this will override the default ES6 export statement template.
     * Fills ${quadArray} with the JavaScript quad array
     * Default is: 'const quads = ${quadArray};\nexport default quads;'
     */
    jsTemplate?: string,

    /**
     * If outputType is Type.JS, this attribute can set the literal output to compact mode
     * In this mode it will output the compact literal output according to: http://www.w3.org/TR/turtle/#literals
     */
    compact?: boolean,
}