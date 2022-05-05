 const Vect = {
    create: function (a, c, b, d) {
        var e = new Float32Array(4);
        e[0] = a;
        e[1] = c;
        e[2] = b;
        e[3] = d;
        return e
    },
    empty: function () {
        return new Float32Array(4)
    },
    set: function (a, c, b, d, e?) {
        a[0] = c;
        a[1] = b;
        a[2] = d;
        a[3] = e
    },
    copy: function (a, c) {
        a[0] = c[0];
        a[1] = c[1];
        a[2] = c[2];
        a[3] = c[3]
    },
    add: function (a, c, b) {
        a[0] = c[0] + b[0];
        a[1] = c[1] + b[1];
        a[2] = c[2] + b[2];
        a[3] = c[3] + b[3];
        return a
    },
    sub: function (a, c, b) {
        a[0] = c[0] - b[0];
        a[1] = c[1] - b[1];
        a[2] = c[2] - b[2];
        a[3] = c[3] - b[3];
        return a
    },
    scale: function (a, c, b) {
        a[0] = b[0] * c;
        a[1] = b[1] * c;
        a[2] = b[2] * c;
        a[3] = b[3] * c;
        return a
    },
    mul: function (a, c, b) {
        a[0] = c[0] * b[0];
        a[1] = c[1] * b[1];
        a[2] = c[2] * b[2];
        a[3] = c[3] * b[3];
        return a
    },
    mad: function (a, c, b, d) {
        a[0] = c[0] * b[0] + d[0];
        a[1] = c[1] * b[1] + d[1];
        a[2] = c[2] * b[2] + d[2];
        a[3] = c[3] * b[3] + d[3];
        return a
    },
    smad: function (a, c, b, d) {
        a[0] = c * b[0] + d[0];
        a[1] = c * b[1] + d[1];
        a[2] = c * b[2] + d[2];
        a[3] = c * b[3] + d[3];
        return a
    },
    negate: function (a, c) {
        a[0] = -c[0];
        a[1] = -c[1];
        a[2] = -c[2];
        return a
    },
    negate4: function (a, c) {
        a[0] = -c[0];
        a[1] = -c[1];
        a[2] = -c[2];
        a[3] = -c[3];
        return a
    },
    length: function (a) {
        var c = a[0]
            , b = a[1];
        a = a[2];
        return Math.sqrt(c * c + b * b + a * a)
    },
    distance: function (a, c) {
        var b = a[0] - c[0]
            , d = a[1] - c[1]
            , e = a[2] - c[2];
        return Math.sqrt(b * b + d * d + e * e)
    },
    dot: function (a, c) {
        return a[0] * c[0] + a[1] * c[1] + a[2] * c[2]
    },
    dot4: function (a, c) {
        return a[0] * c[0] + a[1] * c[1] + a[2] * c[2] + a[3] * c[3]
    },
    normalize: function (a, c) {
        var b = c[0]
            , d = c[1]
            , e = c[2]
            , f = Math.sqrt(b * b + d * d + e * e);
        if (0 == f)
            return Vect.set(a, 0, 0, 0, 0);
        f = 1 / f;
        a[0] = b * f;
        a[1] = d * f;
        a[2] = e * f;
        return a
    },
    cross: function (a, c, b) {
        a[0] = c[1] * b[2];
        a[0] += -c[2] * b[1];
        a[1] = c[2] * b[0] - c[0] * b[2];
        a[2] = c[0] * b[1] - c[1] * b[0];
        return a
    },
    lerp: function (a, c, b, d) {
        var e = 1 - d;
        a[0] = c[0] * e + b[0] * d;
        a[1] = c[1] * e + b[1] * d;
        a[2] = c[2] * e + b[2] * d;
        return a
    },
    lerp4: function (a, c, b, d) {
        var e = 1 - d;
        a[0] = c[0] * e + b[0] * d;
        a[1] = c[1] * e + b[1] * d;
        a[2] = c[2] * e + b[2] * d;
        a[3] = c[3] * e + b[3] * d;
        return a
    },
    min: function (a, c, b) {
        a[0] = Math.min(c[0], b[0]);
        a[1] = Math.min(c[1], b[1]);
        a[2] = Math.min(c[2], b[2]);
        a[3] = Math.min(c[3], b[3]);
        return a
    },
    max: function (a, c, b) {
        a[0] = Math.max(c[0], b[0]);
        a[1] = Math.max(c[1], b[1]);
        a[2] = Math.max(c[2], b[2]);
        a[3] = Math.max(c[3], b[3]);
        return a
    },
    
    // unfinished
    // projectOnPlane: function (a, c, b, d) {
    //     var e = Vect.empty();
    //     Vect.sub(e, c, b);
    //     b = Vect.dot(e, d);
    //     smad(a, -b, normal, c);
    //     return a
    // }
};

export default Vect;