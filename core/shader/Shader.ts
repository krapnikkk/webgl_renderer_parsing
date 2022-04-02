import { IShaderParams, IWebGLRenderingContext } from "../interface";

export default class Shader {
    gl: IWebGLRenderingContext;
    program: WebGLProgram;
    params: IShaderParams;
    samplers: {[key:string]:any};
    attribs: {[key:string]:number};
    constructor(gl: IWebGLRenderingContext) {
        this.gl = gl;
        this.program = null;
        this.params = {};
        this.samplers = {};
        this.attribs = {}
    }
    build(vShader: string, fShader: string) {
        this.program = this.gl.createProgram();
        this.params = {};
        this.samplers = {};
        this.attribs = {};

        this.createShader(vShader,this.gl.VERTEX_SHADER);
        this.createShader(fShader,this.gl.FRAGMENT_SHADER);
        
        this.gl.linkProgram(this.program);
        this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS) || console.log(this.gl.getProgramInfoLog(this.program));
        var parameter = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS),
            samplerIdx = 0;
        for (var idx = 0; idx < parameter; idx++) {
            var WebGLActiveInfo = this.gl.getActiveUniform(this.program, idx), name = WebGLActiveInfo.name, idx = name.indexOf("[");
            0 <= idx && (name = name.substring(0, idx));
            var location = this.gl.getUniformLocation(this.program, WebGLActiveInfo.name);
            if (WebGLActiveInfo.type == this.gl.SAMPLER_2D || WebGLActiveInfo.type == this.gl.SAMPLER_CUBE) {
                this.samplers[name] = {
                    location: location,
                    unit: samplerIdx++
                }
            } else {
                this.params[name] = location;
            }
        }
        parameter = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
        for (let idx = 0; idx < parameter; idx++) {
            var WebGLActiveInfo = this.gl.getActiveAttrib(this.program, idx);
            this.attribs[WebGLActiveInfo.name] = this.gl.getAttribLocation(this.program, WebGLActiveInfo.name);
        }
    }

    createShader(source:string,type:GLenum){
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS) || console.log(this.gl.getShaderInfoLog(shader) && this.logShaderInfo(source));
        this.gl.attachShader(this.program, shader);
    }

    logShaderInfo(info: string) {
        for (var msg = "", idx = info.indexOf("\n"), d = 0; -1 != idx;) {
            d++;
            msg += d + ": ";
            msg += info.substring(0, idx + 1);
            info = info.substring(idx + 1, info.length);
            idx = info.indexOf("\n");
        }
        console.log(msg)
    }

    bind(){
        this.gl.useProgram(this.program);
    }

    complete(){
        return !!this.program
    }

}