export default class Skin {
    numVertices: number;
    vertices: Float32Array;
    constructor(a:MeshDesc){
        this.numVertices = a.vertexCount;
        this.vertices = new Float32Array(a.vertexCount);
        // a.vertexBuffer || (this.numVertices = 0)
        // if (a.vertexBuffer) {
        //     this.numVertices = 0
        // }
    }
}