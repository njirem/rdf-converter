import { Type, DocumentData } from './shared';
export declare function toJson(file: DocumentData): Promise<string>;
export declare function toTriG(file: DocumentData): Promise<string>;
export declare function toNQuads(file: DocumentData): Promise<string>;
export declare function toJS(file: DocumentData, jsTemplate?: string): Promise<string>;
export declare function toType(file: DocumentData, type: Type, jsTemplate?: string): Promise<string>;
export declare function setDefaultGraphName(file: DocumentData, graphName: string): DocumentData;
