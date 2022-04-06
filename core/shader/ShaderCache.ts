import { IWebGLRenderingContext } from "../interface";
import Network from "../utils/Network";
import Shader from "./Shader";
import ShaderTable from "./ShaderTable";

export default class ShaderCache {
    gl: IWebGLRenderingContext;
    cache: {[key:string]:Shader};
    constructor(gl: IWebGLRenderingContext) {
        this.gl = gl;
        this.cache = {};
    }

    fromURLs(a:string, c:string, defines?:string[]):Shader {
        var d = "";
        if (defines)
            for (var e = 0; e < defines.length; ++e)
                d = defines[e] + "\n" + d;
        let defineStr = d + ":" + a + "|" + c;
        let temp = this.cache[defineStr];
        if (temp)
            return temp;
        var f = new Shader(this.gl)
            , g = null
            , h = null
            , k = function () {
                null != g && null != h && f.build(g, h)
            };
        this.fetch(a, function (a) {
            g = d + a;
            k()
        });
        this.fetch(c, function (a) {
            h = d + a;
            k()
        });
        this.cache[defineStr] = f
        return f
    }
    fetch(a, c) {
        "undefined" != typeof ShaderTable ? void 0 !== ShaderTable[a] ? this.resolveIncludes(new String(ShaderTable[a]), c) : c("") : Network.fetchText("src/shader/" + a, function (a) {
            this.resolveIncludes(a, c)
        }
            .bind(this), function () {
                c("")
            })
    }
    resolveIncludes(a, c) {
        for (var b = [], d = true, e = function (a, c, e, f, m) {
            d = true;
            b.push({
                offset: m,
                path: c.slice(1, c.length - 1)
            });
            return ""
        }; d;)
            d = false,
                a = a.replace(/#include\s((<[^>]+>)|("[^"]+"))/, e);
        if (0 < b.length)
            for (var f = b.length, idx = 0; idx < b.length; ++idx)
                this.fetch(b[idx].path, function (d) {
                    this.src = d;
                    if (0 >= --f) {
                        for (d = b.length - 1; 0 <= d; --d)
                            a = a.substring(0, b[d].offset) + b[d].src + a.substring(b[d].offset);
                        c(a)
                    }
                }.bind(b[idx]));
        else
            c(a)
    }
}