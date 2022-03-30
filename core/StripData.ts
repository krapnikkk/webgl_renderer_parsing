export default class StripData {
    STRIP_NONE: number;
    STRIP_MENU: number;
    stripCount: number;
    strips: number[];
    labels: string[];
    stripSlant: number;
    selectedStrip: number;
    animationActive: boolean;
    timestamp: number;
    static expDecay(a: number, c: number) {
        return Math.exp(-0.69314718 / a * c)
    }
    constructor() {
        this.STRIP_NONE = -2;
        this.STRIP_MENU = -1;
        this.stripCount = 5;
        this.strips = [0, 0, 0, 0, 0];
        this.labels = ["Normals", "Albedo", "Reflectivity", "Gloss", "Topology"];
        this.stripSlant = 0.25;
        this.selectedStrip = this.STRIP_NONE;
        this.animationActive = false;
        this.timestamp = Date.now();
        this.update(true)
    }
    active() {
        return this.selectedStrip >= this.STRIP_MENU;
    }
    activeFade() {
        var a = (this.strips[this.stripCount - 1] - -2) / (-0.9 + 0.3 * this.stripCount - -2)
            , a = 1 < a ? 1 : a;
        return 0 > a ? 0 : a
    }
    activeWireframe() {
        return this.active() && 0.01 < Math.abs(this.strips[4] - this.strips[3])
    }

    toggleMenu() {
        this.selectedStrip = this.selectedStrip == this.STRIP_MENU ? this.STRIP_NONE : this.STRIP_MENU
    }

    selectStrip(a: number, c: number) {
        if (this.selectedStrip == this.STRIP_MENU) {
            var b = a + c * this.stripSlant;
            this.selectedStrip = this.STRIP_NONE;
            for (var d = 0; d < this.stripCount; ++d)
                if (b < this.strips[d]) {
                    this.selectedStrip = d;
                    break
                }
        } else
            this.selectedStrip = this.STRIP_MENU
    }

    update(a: boolean) {
        var c = 0.001 * (Date.now() - this.timestamp);
        this.timestamp = Date.now();
        for (var b = false, d = 0; d < this.stripCount; ++d) {
            var e = 0, e = this.selectedStrip == this.STRIP_MENU ? -0.9 + 0.3 * (d + 1) : 0 > this.selectedStrip || d < this.selectedStrip ? -2 : 2;
            if (a)
                this.strips[d] = e;
            else {
                var f = e - this.strips[d]
                    , f = f * StripData.expDecay(0.05, c);
                this.animationActive && (this.strips[d] = e - f);
                b = b || 0.001 < Math.abs(f)
            }
        }
        this.animationActive = b
    }
}