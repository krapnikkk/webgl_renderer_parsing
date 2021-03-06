export default class KeyFrame{
    frameIndex: number;
    value: number;
    interpolation: number;
    weighIn: number;
    weighOut: number;
    constructor(a, c) {
        a && c ? (
            this.frameIndex = c.frameIndex,
            this.value = c.value,
            this.interpolation = c.interpolation,
            this.weighIn = c.weighIn,
            this.weighOut = c.weighOut) : (
                this.interpolation = this.value = this.frameIndex = 0,
                this.weighOut = this.weighIn = 1)
    }
}