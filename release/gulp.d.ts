import { Type } from './lib/shared';
export { Type } from './lib/shared';
/**
 * This function will convert from a supported RDF format to another (or directly to JS array)
 *
 * destType is the destination file type
 * It has to be of the Type enum and not Unknown.
 */
export declare function convert(outType: Type, options?: Options): NodeJS.ReadWriteStream;
/**
 * The Options object for the convert task
 */
export interface Options {
    /**
     * The type of RDF data in the source, if one can't be found from the extension
     */
    srcType?: Type;
    /**
     * Only applicable when srcType is filled
     * Will override the extension found with srcType
     */
    overrideSrcType?: boolean;
    /**
     * Set the graphName for triples without a graphName in the source
     * Can be a plain string or a function of the filename, returning the graphName
     */
    defaultGraphName?: ((filename: string) => string) | string;
    /**
     * If outputType is Type.JS, this will override the default ES6 export statement template.
     * Fills ${quadArray} with the JavaScript quad array
     * Default is: 'const quads = ${quadArray};\nexport default quads;'
     */
    jsTemplate?: string;
}
