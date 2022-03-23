function StripData() {
    this.STRIP_NONE = -2;
    this.STRIP_MENU = -1;
    this.stripCount = 5;
    this.strips = [0, 0, 0, 0, 0];
    this.labels = ["Normals", "Albedo", "Reflectivity", "Gloss", "Topology"];
    this.stripSlant = 0.25;
    this.selectedStrip = this.STRIP_NONE;
    this.animationActive = !1;
    this.timestamp = Date.now();
    this.update(!0)
}
StripData.expDecay = function (a, c) {
    return Math.exp(-0.69314718 / a * c)
}
    ;
StripData.prototype.update = function (a) {
    var c = 0.001 * (Date.now() - this.timestamp);
    this.timestamp = Date.now();
    for (var b = !1, d = 0; d < this.stripCount; ++d) {
        var e = 0
            , e = this.selectedStrip == this.STRIP_MENU ? -0.9 + 0.3 * (d + 1) : 0 > this.selectedStrip || d < this.selectedStrip ? -2 : 2;
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
    ;
StripData.prototype.active = function () {
    return this.selectedStrip >= this.STRIP_MENU
}
    ;
StripData.prototype.activeFade = function () {
    var a = (this.strips[this.stripCount - 1] - -2) / (-0.9 + 0.3 * this.stripCount - -2)
        , a = 1 < a ? 1 : a;
    return 0 > a ? 0 : a
}
    ;
StripData.prototype.activeWireframe = function () {
    return this.active() && 0.01 < Math.abs(this.strips[4] - this.strips[3])
}
    ;
StripData.prototype.toggleMenu = function () {
    this.selectedStrip = this.selectedStrip == this.STRIP_MENU ? this.STRIP_NONE : this.STRIP_MENU
}
    ;
StripData.prototype.selectStrip = function (a, c) {
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
    ;