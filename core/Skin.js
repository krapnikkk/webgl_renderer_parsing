function Skin(a) {
    this.numVertices = a.vertexCount;
    this.vertices = new Float32Array(a.vertexCount);
    a.vertexBuffer || (this.numVertices = 0)
}
; 