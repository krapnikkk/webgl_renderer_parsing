import ByteStream from "./ByteStream";
import Matrix from "./math/Matrix";
import SkinningCluster from "./SkinningCluster";

export default class SkinningRig{
    debugString: string;
    skinningClusters: any[];
    srcVFile: any;
    rigByteStream: any;
    expectedNumClusters: any;
    expectedNumVertices: any;
    numClusterLinks: any;
    originalObjectIndex: any;
    isRigidSkin: any;
    tangentMethod: any;
    linkMapCount: Uint8Array;
    linkMapClusterIndices: Uint16Array;
    linkMapWeights: Float32Array;
    unTransformedVertices: any;
    unTransformedNormals: Float32Array;
    unTransformedTangents: Float32Array;
    unTransformedBiTangents: Float32Array;
    skinVertexWeights: Float32Array;
    skinVertexTransform4x3: Float32Array;
    constructor(a, c, b) {
        this.debugString = "";
        this.skinningClusters = [];
        this.srcVFile = c.file;
        if (a = a.get(this.srcVFile))
            if (a.data) {
                this.rigByteStream = new ByteStream(a.data);
                a = new Uint32Array(this.rigByteStream.bytes.buffer, 0, this.rigByteStream.bytes.length / 4);
                this.expectedNumClusters = a[0];
                this.expectedNumVertices = a[1];
                this.numClusterLinks = a[2];
                this.originalObjectIndex = a[3];
                this.isRigidSkin = a[4];
                this.tangentMethod = a[5];
                c = 6 + 7 * this.expectedNumClusters;
                for (var d = 0; d < this.expectedNumClusters; d++) {
                    var e = new SkinningCluster();
                    this.skinningClusters.push(e);
                    var f = 6 + 7 * d;
                    e.linkMode = a[f + 1];
                    e.linkObjectIndex = a[f + 2];
                    e.associateObjectIndex = a[f + 3];
                    var g = a[f + 5];
                    e.defaultClusterWorldTransform = b.getMatrix(a[f + 4]);
                    e.defaultClusterBaseTransform = b.getMatrix(g);
                    Matrix.invert(e.defaultClusterWorldTransformInvert, e.defaultClusterWorldTransform);
                    1 == e.linkMode && (e.defaultAssociateWorldTransform = b.getMatrix(a[f + 6]),
                        Matrix.invert(e.defaultAssociateWorldTransformInvert, e.defaultAssociateWorldTransform))
                }
                b = 4 * c;
                c = b + this.expectedNumVertices;
                a = c + 2 * this.numClusterLinks;
                c = new Uint8Array(this.rigByteStream.bytes.subarray(c));
                a = new Uint8Array(this.rigByteStream.bytes.subarray(a));
                this.linkMapCount = new Uint8Array(this.rigByteStream.bytes.buffer, b, this.expectedNumVertices);
                this.linkMapClusterIndices = new Uint16Array(c.buffer);
                this.linkMapWeights = new Float32Array(a.buffer)
            } else
                this.debugString += "<br>No data in " + this.srcVFile;
        else
            this.debugString += "<br>Error loading buffer for skinning rig " + this.srcVFile
    }
    unpackUnitVectors(a, c, b, d) {
        for (var e = 0; e < b; e++) {
            var f = c[d * e]
                , g = c[d * e + 1]
                , h = 32768 <= g;
            h && (g -= 32768);
            var f = f / 32767.4 * 2 - 1
                , g = g / 32767.4 * 2 - 1
                , k = 1 - (f * f + g * g)
                , k = Math.sqrt(k)
                , k = isNaN(k) ? 0 : k;
            h && (k = -k);
            a[3 * e] = f;
            a[3 * e + 1] = g;
            a[3 * e + 2] = k
        }
    }
    copyOriginalVertices(a) {
        if (!this.unTransformedVertices)
            if (this.unTransformedVertices = new Float32Array(3 * a.vertexCount),
                this.unTransformedNormals = new Float32Array(3 * a.vertexCount),
                this.unTransformedTangents = new Float32Array(3 * a.vertexCount),
                this.unTransformedBiTangents = new Float32Array(3 * a.vertexCount),
                this.skinVertexWeights = new Float32Array(a.vertexCount),
                this.skinVertexTransform4x3 = new Float32Array(12),
                a.dynamicVertexData) {
                var c = new Float32Array(a.dynamicVertexData.buffer);
                new Uint8Array(a.dynamicVertexData.buffer);
                var b = 0
                    , d = b
                    , b = b + 12 + 8;
                a.secondaryTexCoord && (b += 8);
                var e = b
                    , f = b += 4
                    , b = b + 4
                    , g = a.stride / 2
                    , b = new Uint8Array(a.dynamicVertexData.subarray(b))
                    , b = new Uint16Array(b.buffer)
                    , e = new Uint8Array(a.dynamicVertexData.subarray(e))
                    , e = new Uint16Array(e.buffer)
                    , f = new Uint8Array(a.dynamicVertexData.subarray(f))
                    , f = new Uint16Array(f.buffer);
                this.unpackUnitVectors(this.unTransformedNormals, b, a.vertexCount, g);
                this.unpackUnitVectors(this.unTransformedTangents, e, a.vertexCount, g);
                this.unpackUnitVectors(this.unTransformedBiTangents, f, a.vertexCount, g);
                for (g = 0; g < a.vertexCount; g++)
                    f = (a.stride * g + d) / 4,
                        this.unTransformedVertices[3 * g] = c[f],
                        this.unTransformedVertices[3 * g + 1] = c[f + 1],
                        this.unTransformedVertices[3 * g + 2] = c[f + 2]
            } else
                this.debugString += "<br>Can't init skinning rig - mesh buffer is not dynamic - rigid is " + this.isRigidSkin
    }
    useOriginalMeshVertices(a) {
        this.isRigidSkin ? this.debugString += "<br>useOriginalMeshVertices for rigid skin?" : this.copyOriginalVertices(a)
    }
    deformMeshVertices(a, c) {
        if (0 != this.skinningClusters.length && this.unTransformedVertices) {
            var b = a.stride / 4
                , d = new Float32Array(a.dynamicVertexData.buffer)
                , e = new Uint16Array(a.dynamicVertexData.buffer);
            new Uint8Array(a.dynamicVertexData.buffer);
            var f;
            f = 20;
            a.secondaryTexCoord && (f += 8);
            var g = f
                , h = f += 4;
            f += 4;
            for (var k = this.unTransformedVertices.length / 3, n = 0, m = 0; m < k; ++m) {
                var l = m
                    , p = (l * a.stride + g) / 2
                    , r = (l * a.stride + h) / 2
                    , s = (l * a.stride + f) / 2
                    , u = this.linkMapCount[l]
                    , q = this.skinVertexTransform4x3;
                this.skinVertexWeights[l] = 0;
                q[0] = 0;
                q[1] = 0;
                q[2] = 0;
                q[3] = 0;
                q[4] = 0;
                q[5] = 0;
                q[6] = 0;
                q[7] = 0;
                q[8] = 0;
                q[9] = 0;
                q[10] = 0;
                q[11] = 0;
                var x = this.linkMapWeights[n];
                if (1 == u && 1 == x) {
                    var w = this.linkMapClusterIndices[n]
                        , w = this.skinningClusters[w]
                        , v = w.matrix;
                    q[0] = v[0];
                    q[1] = v[1];
                    q[2] = v[2];
                    q[3] = v[4];
                    q[4] = v[5];
                    q[5] = v[6];
                    q[6] = v[8];
                    q[7] = v[9];
                    q[8] = v[10];
                    q[9] = v[12];
                    q[10] = v[13];
                    q[11] = v[14];
                    this.skinVertexWeights[l] = 1
                } else
                    for (var t = this.skinVertexWeights[l] = 0; t < u; t++)
                        x = this.linkMapWeights[n + t],
                            w = this.linkMapClusterIndices[n + t],
                            w < this.skinningClusters.length && (w = this.skinningClusters[w],
                                v = w.matrix,
                                q[0] += x * v[0],
                                q[1] += x * v[1],
                                q[2] += x * v[2],
                                q[3] += x * v[4],
                                q[4] += x * v[5],
                                q[5] += x * v[6],
                                q[6] += x * v[8],
                                q[7] += x * v[9],
                                q[8] += x * v[10],
                                q[9] += x * v[12],
                                q[10] += x * v[13],
                                q[11] += x * v[14],
                                this.skinVertexWeights[l] += x,
                                1 == w.linkMode && (this.skinVertexWeights[l] = 1));
                n += this.linkMapCount[m];
                if (0 < this.skinVertexWeights[l]) {
                    var y = this.unTransformedVertices[3 * m + 0]
                        , E = this.unTransformedVertices[3 * m + 1]
                        , F = this.unTransformedVertices[3 * m + 2]
                        , A = this.unTransformedNormals[3 * m + 0]
                        , B = this.unTransformedNormals[3 * m + 1]
                        , z = this.unTransformedNormals[3 * m + 2]
                        , w = this.unTransformedTangents[3 * m + 0]
                        , v = this.unTransformedTangents[3 * m + 1]
                        , C = this.unTransformedTangents[3 * m + 2]
                        , u = this.unTransformedBiTangents[3 * m + 0]
                        , q = this.unTransformedBiTangents[3 * m + 1]
                        , x = this.unTransformedBiTangents[3 * m + 2]
                        , t = this.skinVertexTransform4x3
                        , G = 1;
                    0 < this.skinVertexWeights[l] && (G = 1 / this.skinVertexWeights[l]);
                    d[b * m] = G * (y * t[0] + E * t[3] + F * t[6] + t[9]) * c;
                    d[b * m + 1] = G * (y * t[1] + E * t[4] + F * t[7] + t[10]) * c;
                    d[b * m + 2] = G * (y * t[2] + E * t[5] + F * t[8] + t[11]) * c;
                    y = A * t[0] + B * t[3] + z * t[6];
                    l = A * t[1] + B * t[4] + z * t[7];
                    A = A * t[2] + B * t[5] + z * t[8];
                    B = w * t[0] + v * t[3] + C * t[6];
                    z = w * t[1] + v * t[4] + C * t[7];
                    w = w * t[2] + v * t[5] + C * t[8];
                    v = u * t[0] + q * t[3] + x * t[6];
                    C = u * t[1] + q * t[4] + x * t[7];
                    u = u * t[2] + q * t[5] + x * t[8];
                    q = Math.sqrt(y * y + l * l + A * A);
                    y /= q;
                    l /= q;
                    A /= q;
                    q = 32767.4 * (y / 2 + 0.5);
                    x = 32767.4 * (l / 2 + 0.5);
                    0 > A && (x += 32768);
                    e[s] = Math.floor(q);
                    e[s + 1] = Math.floor(x);
                    q = Math.sqrt(B * B + z * z + w * w);
                    B /= q;
                    z /= q;
                    w /= q;
                    q = 32767.4 * (B / 2 + 0.5);
                    x = 32767.4 * (z / 2 + 0.5);
                    0 > w && (x += 32768);
                    e[p] = Math.floor(q);
                    e[p + 1] = Math.floor(x);
                    q = Math.sqrt(v * v + C * C + u * u);
                    v /= q;
                    C /= q;
                    u /= q;
                    q = 32767.4 * (v / 2 + 0.5);
                    x = 32767.4 * (C / 2 + 0.5);
                    0 > u && (x += 32768);
                    e[r] = Math.floor(q);
                    e[r + 1] = Math.floor(x)
                } else
                    y = this.unTransformedVertices[3 * m + 0],
                        E = this.unTransformedVertices[3 * m + 1],
                        F = this.unTransformedVertices[3 * m + 2],
                        d[b * m] = y * c,
                        d[b * m + 1] = E * c,
                        d[b * m + 2] = F * c
            }
        }
    }
    deformMesh(a, c) {
        if (0 != this.skinningClusters.length && !this.isRigidSkin) {
            this.deformMeshVertices(a, c);
            var b = a.gl;
            b.bindBuffer(b.ARRAY_BUFFER, a.vertexBuffer);
            b.bufferData(b.ARRAY_BUFFER, a.dynamicVertexData, b.DYNAMIC_DRAW);
            b.bindBuffer(b.ARRAY_BUFFER, null)
        }
    }

}