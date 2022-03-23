function ByteStream(a) {
    this.bytes = new Uint8Array(a)
}
ByteStream.prototype.empty = function () {
    return 0 >= this.bytes.length
}
    ;
ByteStream.prototype.readCString = function () {
    for (var a = this.bytes, c = a.length, b = 0; b < c; ++b)
        if (0 == a[b])
            return a = String.fromCharCode.apply(null, this.bytes.subarray(0, b)),
                this.bytes = this.bytes.subarray(b + 1),
                a;
    return null
}
    ;
ByteStream.prototype.asString = function () {
    for (var a = "", c = 0; c < this.bytes.length; ++c)
        a += String.fromCharCode(this.bytes[c]);
    return a
}
    ;
ByteStream.prototype.readBytes = function (a) {
    var c = this.bytes.subarray(0, a);
    this.bytes = this.bytes.subarray(a);
    return c
}
    ;
ByteStream.prototype.readUint32 = function () {
    var a = this.bytes
        , c = a[0] | a[1] << 8 | a[2] << 16 | a[3] << 24;
    this.bytes = a.subarray(4);
    return c
}
    ;
ByteStream.prototype.readUint8 = function () {
    var a = this.bytes
        , c = a[0];
    this.bytes = a.subarray(1);
    return c
}
    ;
ByteStream.prototype.readUint16 = function () {
    var a = this.bytes
        , c = a[0] | a[1] << 8;
    this.bytes = a.subarray(2);
    return c
}
    ;
ByteStream.prototype.readFloat32 = function () {
    var a = new Uint8Array(this.bytes)
        , a = new Float32Array(a.buffer);
    this.bytes = this.bytes.subarray(4);
    return a[0]
}
    ;
ByteStream.prototype.seekUint32 = function (a) {
    a = this.bytes.subarray(4 * a);
    return a[0] | a[1] << 8 | a[2] << 16 | a[3] << 24
}
    ;
ByteStream.prototype.seekFloat32 = function (a) {
    a = new Uint8Array(this.bytes.subarray(4 * a));
    return (new Float32Array(a.buffer))[0]
}
    ;
ByteStream.prototype.getMatrix = function (a) {
    return new Float32Array(this.bytes.buffer, 64 * a, 16)
}
    ;