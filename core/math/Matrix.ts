import Vect from "./Vector";

export default class Matrix {
    static type: Float32Array;
    static create(a: number, c: number, b: number, d: number, e: number, f: number, g: number, h: number, k: number, n: number, m: number, l: number, p: number, r: number, s: number, u: number) {
        var q = new Float32Array(16);
        q[0] = a;
        q[4] = c;
        q[8] = b;
        q[12] = d;
        q[1] = e;
        q[5] = f;
        q[9] = g;
        q[13] = h;
        q[2] = k;
        q[6] = n;
        q[10] = m;
        q[14] = l;
        q[3] = p;
        q[7] = r;
        q[11] = s;
        q[15] = u;
        return q
    }
    static empty() {
        return new Float32Array(16)
    }
    static identity() {
        var a = new Float32Array(16);
        a[0] = 1;
        a[4] = 0;
        a[8] = 0;
        a[12] = 0;
        a[1] = 0;
        a[5] = 1;
        a[9] = 0;
        a[13] = 0;
        a[2] = 0;
        a[6] = 0;
        a[10] = 1;
        a[14] = 0;
        a[3] = 0;
        a[7] = 0;
        a[11] = 0;
        a[15] = 1;
        return a
    }
    static set(a: Uint8Array, c: number, b: number, d: number, e: number, f: number, g: number, h: number, k: number, n: number, m: number, l: number, p: number, r: number, s: number, u: number, q: number) {
        a[0] = c;
        a[4] = b;
        a[8] = d;
        a[12] = e;
        a[1] = f;
        a[5] = g;
        a[9] = h;
        a[13] = k;
        a[2] = n;
        a[6] = m;
        a[10] = l;
        a[14] = p;
        a[3] = r;
        a[7] = s;
        a[11] = u;
        a[15] = q
    }
    static translation(a: any, c: any, b: any, d: any) {
        Matrix.set(a, 1, 0, 0, c, 0, 1, 0, b, 0, 0, 1, d, 0, 0, 0, 1);
        return a
    }
    static rotation(a: number[], c: number, b: any) {
        a[0] = 1;
        a[4] = 0;
        a[8] = 0;
        a[12] = 0;
        a[1] = 0;
        a[5] = 1;
        a[9] = 0;
        a[13] = 0;
        a[2] = 0;
        a[6] = 0;
        a[10] = 1;
        a[14] = 0;
        a[3] = 0;
        a[7] = 0;
        a[11] = 0;
        a[15] = 1;
        var d = 0.0174532925 * c;
        c = Math.sin(d);
        d = Math.cos(d);
        switch (b) {
            case 0:
                a[5] = d;
                a[9] = -c;
                a[6] = c;
                a[10] = d;
                break;
            case 1:
                a[0] = d;
                a[8] = c;
                a[2] = -c;
                a[10] = d;
                break;
            case 2:
                a[0] = d,
                    a[4] = -c,
                    a[1] = c,
                    a[5] = d
        }
        return a
    }
    mul(a: number[], c: number, b: number) {
        var d = c[0]
            , e = c[1]
            , f = c[2]
            , g = c[3]
            , h = c[4]
            , k = c[5]
            , n = c[6]
            , m = c[7]
            , l = c[8]
            , p = c[9]
            , r = c[10]
            , s = c[11]
            , u = c[12]
            , q = c[13]
            , x = c[14];
        c = c[15];
        var w = b[0]
            , v = b[1]
            , t = b[2]
            , y = b[3];
        a[0] = w * d + v * h + t * l + y * u;
        a[1] = w * e + v * k + t * p + y * q;
        a[2] = w * f + v * n + t * r + y * x;
        a[3] = w * g + v * m + t * s + y * c;
        w = b[4];
        v = b[5];
        t = b[6];
        y = b[7];
        a[4] = w * d + v * h + t * l + y * u;
        a[5] = w * e + v * k + t * p + y * q;
        a[6] = w * f + v * n + t * r + y * x;
        a[7] = w * g + v * m + t * s + y * c;
        w = b[8];
        v = b[9];
        t = b[10];
        y = b[11];
        a[8] = w * d + v * h + t * l + y * u;
        a[9] = w * e + v * k + t * p + y * q;
        a[10] = w * f + v * n + t * r + y * x;
        a[11] = w * g + v * m + t * s + y * c;
        w = b[12];
        v = b[13];
        t = b[14];
        y = b[15];
        a[12] = w * d + v * h + t * l + y * u;
        a[13] = w * e + v * k + t * p + y * q;
        a[14] = w * f + v * n + t * r + y * x;
        a[15] = w * g + v * m + t * s + y * c;
        return a
    }
    invert(a: number[], c: number) {
        var b = c[0]
            , d = c[1]
            , e = c[2]
            , f = c[3]
            , g = c[4]
            , h = c[5]
            , k = c[6]
            , n = c[7]
            , m = c[8]
            , l = c[9]
            , p = c[10]
            , r = c[11]
            , s = c[12]
            , u = c[13]
            , q = c[14]
            , x = c[15]
            , w = b * h - d * g
            , v = b * k - e * g
            , t = b * n - f * g
            , y = d * k - e * h
            , E = d * n - f * h
            , F = e * n - f * k
            , A = m * u - l * s
            , B = m * q - p * s
            , z = m * x - r * s
            , C = l * q - p * u
            , G = l * x - r * u
            , H = p * x - r * q
            , D = w * H - v * G + t * C + y * z - E * B + F * A;
        if (!D)
            return null;
        D = 1 / D;
        a[0] = (h * H - k * G + n * C) * D;
        a[1] = (e * G - d * H - f * C) * D;
        a[2] = (u * F - q * E + x * y) * D;
        a[3] = (p * E - l * F - r * y) * D;
        a[4] = (k * z - g * H - n * B) * D;
        a[5] = (b * H - e * z + f * B) * D;
        a[6] = (q * t - s * F - x * v) * D;
        a[7] = (m * F - p * t + r * v) * D;
        a[8] = (g * G - h * z + n * A) * D;
        a[9] = (d * z - b * G - f * A) * D;
        a[10] = (s * E - u * t + x * w) * D;
        a[11] = (l * t - m * E - r * w) * D;
        a[12] = (h * B - g * C - k * A) * D;
        a[13] = (b * C - d * B + e * A) * D;
        a[14] = (u * v - s * y - q * w) * D;
        a[15] = (m * y - l * v + p * w) * D;
        return a
    }
    transpose(a: number, c: number) {
        a[0] = c[0];
        a[4] = c[1];
        a[8] = c[2];
        a[12] = c[3];
        a[1] = c[4];
        a[5] = c[5];
        a[9] = c[6];
        a[13] = c[7];
        a[2] = c[8];
        a[6] = c[9];
        a[10] = c[10];
        a[14] = c[11];
        a[3] = c[12];
        a[7] = c[13];
        a[11] = c[14];
        a[15] = c[15];
        return a
    }
    mul4(a: number[], c: number[], b: number, d: number, e: number, f: number) {
        a[0] = c[0] * b + c[4] * d + c[8] * e + c[12] * f;
        a[1] = c[1] * b + c[5] * d + c[9] * e + c[13] * f;
        a[2] = c[2] * b + c[6] * d + c[10] * e + c[14] * f;
        a[3] = c[3] * b + c[7] * d + c[11] * e + c[15] * f;
        return a
    }
    mulPoint(a: number, c: number[], b: number, d: number, e: number) {
        a[0] = c[0] * b + c[4] * d + c[8] * e + c[12];
        a[1] = c[1] * b + c[5] * d + c[9] * e + c[13];
        a[2] = c[2] * b + c[6] * d + c[10] * e + c[14];
        return a
    }
    mulVec(a: number[], c: number[], b: number, d: number, e: number) {
        a[0] = c[0] * b + c[4] * d + c[8] * e;
        a[1] = c[1] * b + c[5] * d + c[9] * e;
        a[2] = c[2] * b + c[6] * d + c[10] * e;
        return a
    }
    perspective(a: number[], c: number, b: number, d: number, e: number, f: number) {
        f = f || 0;
        c = 1 / Math.tan(0.00872664625 * c);
        a[0] = c / b;
        a[1] = a[2] = a[3] = 0;
        a[5] = c;
        a[4] = a[6] = a[7] = 0;
        a[8] = a[9] = 0;
        a[10] = (e + d) / (d - e) - 3.0518044E-5 * f;
        a[11] = -1;
        a[14] = 2 * e * d / (d - e);
        a[12] = a[13] = a[15] = 0;
        return a
    }
    perspectiveInfinite(a: number[], c: number, b: number, d: number, e: number) {
        e = e || 0;
        c = 1 / Math.tan(0.00872664625 * c);
        a[0] = c / b;
        a[1] = a[2] = a[3] = 0;
        a[5] = c;
        a[4] = a[6] = a[7] = 0;
        a[8] = a[9] = 0;
        a[10] = a[11] = -1 - 3.0518044E-5 * e;
        a[14] = -2 * d;
        a[12] = a[13] = a[15] = 0;
        return a
    }
    ortho(a: number[], c: number, b: number, d: number, e: number, f: number, g: number, h: any) {
        var k = 1 / (b - c)
            , n = 1 / (e - d)
            , m = 1 / (g - f);
        a[0] = k + k;
        a[1] = a[2] = a[3] = 0;
        a[5] = n + n;
        a[4] = a[6] = a[7] = 0;
        a[12] = -(b + c) * k;
        a[13] = -(e + d) * n;
        a[10] = -(m + m) - 3.0518044E-5 * (h || 0);
        a[14] = -(g + f) * m;
        a[8] = a[9] = a[11] = 0;
        a[15] = 1;
        return a
    }
    lookAt(a: Uint8Array, c: any, b: any, d: any) {
        var e = a.subarray(0, 3)
            , f = a.subarray(4, 7)
            , g = a.subarray(8, 11);
        Vect.sub(g, c, b);
        Vect.cross(e, d, g);
        Vect.normalize(g, g);
        Vect.normalize(e, e);
        Vect.cross(f, g, e);
        Matrix.set(a, e[0], e[1], e[2], -Vect.dot(e, c), f[0], f[1], f[2], -Vect.dot(f, c), g[0], g[1], g[2], -Vect.dot(g, c), 0, 0, 0, 1)
    }
    copy(a: number, c: number) {
        for (var b = 0; 16 > b; ++b)
            a[b] = c[b]
    }
    copyToBuffer(a: { [x: string]: any; }, c: number, b: number) {
        for (var d = 0; 16 > d; ++d)
            a[c + d] = b[d]
    }
};