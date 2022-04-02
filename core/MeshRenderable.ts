import Mesh from "./Mesh";

export default class MeshRenderable {
    mesh: any;
    gl: any;
    indexOffset: number;
    indexCount: any;
    wireIndexOffset: number;
    wireIndexCount: any;
    material: any;
    visible: boolean;
    constructor(a:Mesh, c, b) {
        this.mesh = a;
        this.gl = this.mesh.gl;
        this.indexOffset = c.firstIndex * a.indexTypeSize;
        this.indexCount = c.indexCount;
        this.wireIndexOffset = c.firstWireIndex * a.indexTypeSize;
        this.wireIndexCount = c.wireIndexCount;
        this.material = b;
        this.visible = true
    }

    draw(a) {
        var c = this.gl;
        if (this.material.bind(a, this)) {
            a = this.material.shader.attribs;
            var b = this.mesh.stride;
            this.mesh.desc.cullBackFaces ? (c.enable(c.CULL_FACE),
                c.cullFace(c.BACK)) : c.disable(c.CULL_FACE);
            c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
            c.bindBuffer(c.ARRAY_BUFFER, this.mesh.vertexBuffer);
            c.enableVertexAttribArray(a.vPosition);
            c.enableVertexAttribArray(a.vTexCoord);
            c.enableVertexAttribArray(a.vTangent);
            c.enableVertexAttribArray(a.vBitangent);
            c.enableVertexAttribArray(a.vNormal);
            var d = this.mesh.vertexColor && void 0 !== a.vColor;
            d && c.enableVertexAttribArray(a.vColor);
            var e = this.mesh.secondaryTexCoord && void 0 !== a.vTexCoord2;
            e && c.enableVertexAttribArray(a.vTexCoord2);
            var f = 0;
            c.vertexAttribPointer(a.vPosition, 3, c.FLOAT, false, b, f);
            f += 12;
            c.vertexAttribPointer(a.vTexCoord, 2, c.FLOAT, false, b, f);
            f += 8;
            this.mesh.secondaryTexCoord && (e && c.vertexAttribPointer(a.vTexCoord2, 2, c.FLOAT, false, b, f),
                f += 8);
            c.vertexAttribPointer(a.vTangent, 2, c.UNSIGNED_SHORT, true, b, f);
            f += 4;
            c.vertexAttribPointer(a.vBitangent, 2, c.UNSIGNED_SHORT, true, b, f);
            f += 4;
            c.vertexAttribPointer(a.vNormal, 2, c.UNSIGNED_SHORT, true, b, f);
            d && c.vertexAttribPointer(a.vColor, 4, c.UNSIGNED_BYTE, true, b, f + 4);
            c.drawElements(c.TRIANGLES, this.indexCount, this.mesh.indexType, this.indexOffset);
            c.disableVertexAttribArray(a.vPosition);
            c.disableVertexAttribArray(a.vTexCoord);
            c.disableVertexAttribArray(a.vTangent);
            c.disableVertexAttribArray(a.vBitangent);
            c.disableVertexAttribArray(a.vNormal);
            d && c.disableVertexAttribArray(a.vColor);
            e && c.disableVertexAttribArray(a.vTexCoord2)
        }
    }
    drawShadow(a) {
        var c = this.gl;
        this.mesh.desc.cullBackFaces ? (c.enable(c.CULL_FACE),
            c.cullFace(c.BACK)) : c.disable(c.CULL_FACE);
        c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
        c.bindBuffer(c.ARRAY_BUFFER, this.mesh.vertexBuffer);
        c.enableVertexAttribArray(a);
        c.vertexAttribPointer(a, 3, c.FLOAT, false, this.mesh.stride, 0);
        c.drawElements(c.TRIANGLES, this.indexCount, this.mesh.indexType, this.indexOffset);
        c.disableVertexAttribArray(a)
    }
    drawAlphaShadow(a, c) {
        var b = this.gl;
        this.mesh.desc.cullBackFaces ? (b.enable(b.CULL_FACE),
            b.cullFace(b.BACK)) : b.disable(b.CULL_FACE);
        b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
        b.bindBuffer(b.ARRAY_BUFFER, this.mesh.vertexBuffer);
        b.enableVertexAttribArray(a);
        b.enableVertexAttribArray(c);
        b.vertexAttribPointer(a, 3, b.FLOAT, false, this.mesh.stride, 0);
        b.vertexAttribPointer(c, 2, b.FLOAT, false, this.mesh.stride, 12);
        b.drawElements(b.TRIANGLES, this.indexCount, this.mesh.indexType, this.indexOffset);
        b.disableVertexAttribArray(a);
        b.disableVertexAttribArray(c)
    }
    drawAlphaPrepass(a) {
        var c = this.gl;
        if (this.material.bindAlphaPrepass(a, this)) {
            a = this.material.prepassShader.attribs;
            var b = this.mesh.stride;
            this.mesh.desc.cullBackFaces ? (c.enable(c.CULL_FACE),
                c.cullFace(c.BACK)) : c.disable(c.CULL_FACE);
            c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
            c.bindBuffer(c.ARRAY_BUFFER, this.mesh.vertexBuffer);
            c.enableVertexAttribArray(a.vPosition);
            c.enableVertexAttribArray(a.vTexCoord);
            c.vertexAttribPointer(a.vPosition, 3, c.FLOAT, false, b, 0);
            c.vertexAttribPointer(a.vTexCoord, 2, c.FLOAT, false, b, 12);
            c.drawElements(c.TRIANGLES, this.indexCount, this.mesh.indexType, this.indexOffset);
            c.disableVertexAttribArray(a.vPosition);
            c.disableVertexAttribArray(a.vTexCoord)
        }
    }
    drawWire(a) {
        var c = this.material.wireShader.attribs
            , b = this.gl;
        this.material.bindWire(a, this) && (b.enableVertexAttribArray(c.vPosition),
            b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, this.mesh.wireBuffer),
            b.bindBuffer(b.ARRAY_BUFFER, this.mesh.vertexBuffer),
            b.vertexAttribPointer(c.vPosition, 3, b.FLOAT, false, this.mesh.stride, 0),
            b.drawElements(b.LINES, this.wireIndexCount, this.mesh.indexType, this.wireIndexOffset),
            b.disableVertexAttribArray(c.vPosition))
    }
    complete() {
        return this.material.complete()
    }
}