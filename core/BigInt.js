function BigInt(a) {
    this.digits = new Uint16Array(a || 0)
}
BigInt.prototype.setBytes = function (a, c) {
    var b = (a.length + 1) / 2 | 0;
    this.digits = new Uint16Array(b);
    if (c)
        for (var d = 0, b = a.length - 1; 0 <= b; b -= 2)
            this.digits[d++] = a[b] + (0 < b ? 256 * a[b - 1] : 0);
    else
        for (d = 0; d < b; ++d)
            this.digits[d] = a[2 * d] + 256 * a[2 * d + 1];
    this.trim()
}
    ;
BigInt.prototype.toInt32 = function () {
    var a = 0;
    0 < this.digits.length && (a = this.digits[0],
        1 < this.digits.length && (a |= this.digits[1] << 16));
    return a
}
    ;
BigInt.prototype.lessThan = function (a) {
    if (this.digits.length == a.digits.length)
        for (var c = this.digits.length - 1; 0 <= c; --c) {
            var b = this.digits[c]
                , d = a.digits[c];
            if (b != d)
                return b < d
        }
    return this.digits.length < a.digits.length
}
    ;
BigInt.prototype.shiftRight = function () {
    for (var a = 0, c = this.digits, b = c.length - 1; 0 <= b; --b) {
        var d = c[b];
        c[b] = d >> 1 | a << 15;
        a = d
    }
    this.trim()
}
    ;
BigInt.prototype.shiftLeft = function (a) {
    if (0 < a) {
        var c = a / 16 | 0;
        a %= 16;
        for (var b = 16 - a, d = this.digits.length + c + 1, e = new BigInt(d), f = 0; f < d; ++f)
            e.digits[f] = ((f < c || f >= this.digits.length + c ? 0 : this.digits[f - c]) << a | (f < c + 1 ? 0 : this.digits[f - c - 1]) >>> b) & 65535;
        e.trim();
        return e
    }
    return new BigInt(this)
}
    ;
BigInt.prototype.bitCount = function () {
    var a = 0;
    if (0 < this.digits.length)
        for (var a = 16 * (this.digits.length - 1), c = this.digits[this.digits.length - 1]; c;)
            c >>>= 1,
                ++a;
    return a
}
    ;
BigInt.prototype.sub = function (a) {
    var c = this.digits
        , b = a.digits
        , d = this.digits.length;
    a = a.digits.length;
    for (var e = 0, f = 0; f < d; ++f) {
        var g = c[f]
            , h = f < a ? b[f] : 0
            , h = h + e
            , e = h > g ? 1 : 0
            , g = g + (e << 16);
        c[f] = g - h & 65535
    }
    this.trim()
}
    ;
BigInt.prototype.mul = function (a) {
    for (var c = new BigInt(this.digits.length + a.digits.length), b = c.digits, d = 0; d < this.digits.length; ++d)
        for (var e = this.digits[d], f = 0; f < a.digits.length; ++f)
            for (var g = e * a.digits[f], h = d + f; g;) {
                var k = (g & 65535) + b[h];
                b[h] = k & 65535;
                g >>>= 16;
                g += k >>> 16;
                ++h
            }
    c.trim();
    return c
}
    ;
BigInt.prototype.mod = function (a) {
    if (0 >= this.digits.length || 0 >= a.digits.length)
        return new BigInt(0);
    var c = new BigInt(this.digits);
    if (!this.lessThan(a)) {
        for (var b = new BigInt(a.digits), b = b.shiftLeft(c.bitCount() - b.bitCount()); !c.lessThan(a);)
            b.lessThan(c) && c.sub(b),
                b.shiftRight();
        c.trim()
    }
    return c
}
    ;
BigInt.prototype.powmod = function (a, c) {
    for (var b = new BigInt([1]), d = this.mod(c); a;)
        a & 1 && (b = b.mul(d).mod(c)),
            a >>>= 1,
            d = d.mul(d).mod(c);
    return b
}
    ;
BigInt.prototype.trim = function () {
    for (var a = this.digits.length; 0 < a && 0 == this.digits[a - 1];)
        --a;
    a != this.digits.length && (this.digits = this.digits.subarray(0, a))
}
    ;