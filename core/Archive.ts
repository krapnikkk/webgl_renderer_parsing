import BigInt from "./BigInt";
import ByteStream from "./ByteStream";
import { IArchiveFileData } from "./interface";

export default class Archive {
    files: { [key: string]: IArchiveFileData };
    constructor(a) {
        this.files = {};
        for (a = new ByteStream(a); !a.empty();) {
            var c: IArchiveFileData;
            c.name = a.readCString();
            c.type = a.readCString();
            var b = a.readUint32()
                , d = a.readUint32()
                , e = a.readUint32();
            c.data = a.readBytes(d);
            if (!(c.data.length < d)) {
                if (b & 1 && (c.data = this.decompress(c.data, e),
                    null === c.data))
                    continue;
                this.files[c.name] = c
            }
        }
    }
    get(a) {
        return this.files[a]
    }
    ;
    extract(a:string) {
        var file = this.files[a];
        delete this.files[a];
        return file
    }
    ;
    checkSignature(a) {
        if (!a)
            return false;
        var c = this.get(a.name + ".sig");
        if (!c)
            return false;
        c = JSON.parse(String.fromCharCode.apply(null, c.data));
        if (!c)
            return false;
        for (var b = 5381, i = 0; i < a.data.length; ++i)
            b = 33 * b + a.data[i] & 4294967295;
        let bigInt = new BigInt();
        bigInt.setBytes([0, 233, 33, 170, 116, 86, 29, 195, 228, 46, 189, 3, 185, 31, 245, 19, 159, 105, 73, 190, 158, 80, 175, 38, 210, 116, 221, 229, 171, 134, 104, 144, 140, 5, 99, 255, 208, 78, 248, 215, 172, 44, 79, 83, 5, 244, 152, 19, 92, 137, 112, 10, 101, 142, 209, 100, 244, 92, 190, 125, 28, 0, 185, 54, 143, 247, 49, 37, 15, 254, 142, 180, 185, 232, 50, 219, 11, 186, 106, 116, 78, 212, 10, 105, 53, 26, 14, 181, 80, 47, 87, 213, 182, 19, 126, 151, 86, 109, 182, 224, 37, 135, 80, 59, 22, 93, 125, 68, 214, 106, 209, 152, 235, 157, 249, 245, 48, 76, 203, 0, 0, 95, 200, 246, 243, 229, 85, 79, 169], true);
        let d = new BigInt();
        d.setBytes(c[0]);
        return d.powmod(65537, bigInt).toInt32() != b ? false : true
    }
    ;
    decompress(a:number[], c) {
        var b = new Uint8Array(c)
            , d = 0
            , e = new Uint32Array(4096)
            , f = new Uint32Array(4096)
            , g = 256
            , h = a.length
            , k = 0
            , n = 1
            // , m = 0
            , l = 1;
        b[d++] = a[0];
        for (var p = 1; ; p++) {
            l = p + (p >> 1);
            if (l + 1 >= h)
                break;
            var m = a[l + 1], l = a[l]
                , r = p & 1 ? m << 4 | l >> 4 : (m & 15) << 8 | l;
            if (r < g)
                if (256 > r)
                    m = d,
                        l = 1,
                        b[d++] = r;
                else
                    for (var m = d, l = f[r], r = e[r], s = r + l; r < s;)
                        b[d++] = b[r++];
            else if (r == g) {
                m = d;
                l = n + 1;
                r = k;
                for (s = k + n; r < s;)
                    b[d++] = b[r++];
                b[d++] = b[k]
            } else
                break;
            e[g] = k;
            f[g++] = n + 1;
            k = m;
            n = l;
            g = 4096 <= g ? 256 : g
        }
        return d == c ? b : null
    }
    ;
}
