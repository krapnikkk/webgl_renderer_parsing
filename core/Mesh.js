function Mesh(a, c, b) {
    this.gl = a;
    this.desc = c;
    var d = c.isDynamicMesh;
    this.numSubMeshes = this.dynamicVertexData = 0;
    this.displayMatrix = Matrix.identity();
    this.name = c.name;
    this.modelMatrix = Matrix.identity();
    this.origin = c.transform ? Vect.create(c.transform[12], c.transform[13], c.transform[14], 1) : Vect.create(0, 5, 0, 1);
    this.stride = 32;
    if (this.vertexColor = c.vertexColor)
        this.stride += 4;
    if (this.secondaryTexCoord = c.secondaryTexCoord)
        this.stride += 8;
    b = new ByteStream(b.data);
    this.indexCount = c.indexCount;
    this.indexTypeSize = c.indexTypeSize;
    this.indexType = 4 == this.indexTypeSize ? a.UNSIGNED_INT : a.UNSIGNED_SHORT;
    this.indexBuffer = a.createBuffer();
    a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    var e = b.readBytes(this.indexCount * this.indexTypeSize);
    a.bufferData(a.ELEMENT_ARRAY_BUFFER, e, a.STATIC_DRAW);
    this.wireCount = c.wireCount;
    this.wireBuffer = a.createBuffer();
    a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.wireBuffer);
    e = b.readBytes(this.wireCount * this.indexTypeSize);
    a.bufferData(a.ELEMENT_ARRAY_BUFFER, e, a.STATIC_DRAW);
    a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, null);
    this.vertexCount = c.vertexCount;
    this.vertexBuffer = a.createBuffer();
    a.bindBuffer(a.ARRAY_BUFFER, this.vertexBuffer);
    b = b.readBytes(this.vertexCount * this.stride);
    d ? (this.dynamicVertexData = new Uint8Array(b),
        a.bufferData(a.ARRAY_BUFFER, b, a.DYNAMIC_DRAW)) : a.bufferData(a.ARRAY_BUFFER, b, a.STATIC_DRAW);
    a.bindBuffer(a.ARRAY_BUFFER, null);
    this.bounds = void 0 === c.minBound || void 0 === c.maxBound ? {
        min: Vect.create(-10, -10, -10, 1),
        max: Vect.create(10, 10, -0, 1)
    } : {
        min: Vect.create(c.minBound[0], c.minBound[1], c.minBound[2], 1),
        max: Vect.create(c.maxBound[0], c.maxBound[1], c.maxBound[2], 1)
    };
    this.bounds.maxExtent = Math.max(Math.max(c.maxBound[0] - c.minBound[0], c.maxBound[1] - c.minBound[1]), c.maxBound[2] - c.minBound[2]);
    this.bounds.averageExtent = (c.maxBound[0] - c.minBound[0] + (c.maxBound[1] - c.minBound[1]) + (c.maxBound[2] - c.minBound[2])) / 3
}
;