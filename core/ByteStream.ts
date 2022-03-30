export default class ByteStream {
    bytes: Uint8Array;
    constructor(array: ArrayLike<number>) {
        this.bytes = new Uint8Array(array)
    }
    empty() {
        return 0 >= this.bytes.length
    }
    readCString() {
        for (var a = this.bytes, c = a.length, b = 0; b < c; ++b)
            if (0 == a[b])
                return a = String.fromCharCode.apply(null, this.bytes.subarray(0, b)),
                    this.bytes = this.bytes.subarray(b + 1),
                    a;
        return null
    }
    asString() {
        for (var a = "", c = 0; c < this.bytes.length; ++c)
            a += String.fromCharCode(this.bytes[c]);
        return a
    }
    readBytes(a: number) {
        var c = this.bytes.subarray(0, a);
        this.bytes = this.bytes.subarray(a);
        return c
    }
    readUint32() {
        var a = this.bytes
            , c = a[0] | a[1] << 8 | a[2] << 16 | a[3] << 24;
        this.bytes = a.subarray(4);
        return c
    }
    readUint8() {
        var a = this.bytes
            , c = a[0];
        this.bytes = a.subarray(1);
        return c
    }
    readUint16() {
        var a = this.bytes
            , c = a[0] | a[1] << 8;
        this.bytes = a.subarray(2);
        return c
    }
    readFloat32() {
        var a = new Uint8Array(this.bytes);
        var b = new Float32Array(a.buffer);
        this.bytes = this.bytes.subarray(4);
        return b[0]
    }
    seekUint32(a:number) {
        let b = this.bytes.subarray(4 * a);
        return b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24
    }
    seekFloat32(a:number) {
        let b = new Uint8Array(this.bytes.subarray(4 * a));
        return (new Float32Array(b.buffer))[0]
    }
    getMatrix(a:number) {
        return new Float32Array(this.bytes.buffer, 64 * a, 16)
    }

}
