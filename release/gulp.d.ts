import { Type } from './lib/shared';
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
export default function Converter(destType: Type, overrideSrcType?: Type, nameGraph?: ((filename: string) => string) | string): NodeJS.ReadWriteStream;
