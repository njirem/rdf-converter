export interface DocumentData {
    context?: JsonLD.Context;
    document: JsonLD.Document;
}
export declare function n3ToJsonldTriple(n3: N3.Triple): JsonLD.Triple;
export declare function jsonldToN3Quads(json: JsonLD.Document): N3.Triple[];
export declare function writeFile(filename: string, data: any): Promise<string>;
export declare function readFile(path: string): Promise<string>;
export declare function readFiles(...paths: string[]): Promise<string[]>;
export declare enum Type {
    Unknown = 0,
    TriG = 1,
    NQuads = 2,
    Json = 3,
    JS = 4,
}
export declare function typeFromFile(filename: string): Type;
export declare function typeFromString(str: string): Type;
export declare function logPromise(annotation: string): (val: any) => any;
