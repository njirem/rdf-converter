import { Type, DocumentData } from './shared';
export declare function fromTriG(trig: string): Promise<DocumentData>;
export declare function fromNQuads(nquads: string): Promise<DocumentData>;
export declare function fromJson(json: string): Promise<DocumentData>;
export declare function fromType(file: string, type: Type): Promise<DocumentData>;
