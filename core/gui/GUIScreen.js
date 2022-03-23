function GUIScreen(a) {
    this.init = !1;
    this.ui = a;
    this.bottom = this.left = this.height = this.width = 0;
    this.clicked = this.mouseDown = !1;
    this.playbackControls = 0;
    a = 1;
    window.devicePixelRatio && (2 < window.devicePixelRatio ? a = 4 : 1 < window.devicePixelRatio && (a = 2));
    this.imageSetNumber = a
}
GUIScreen.prototype.setSize = function (a, c) {
    this.width = a;
    this.height = c;
    this.left = -a;
    this.bottom = -c;
    this.playbackControls && this.playbackControls.resize(this)
}
    ;
GUIScreen.prototype.setupActiveView = function (a) {
    this.init || (this.init = !0,
        this.ui = a,
        a.viewer.scene.sceneAnimator && (this.playbackControls = new PlaybackControls(this),
            this.playbackControls.resize(this)))
}
    ;
GUIScreen.prototype.updateElement = function (a) {
    var c = a.linkedControl;
    if (c) {
        var b = this.left * (1 - a.getScreenXPercent())
            , d = this.bottom * (1 - a.getScreenYPercent())
            , e = this.width * a.getScreenWidthPercent();
        a = this.height * a.getScreenHeightPercent();
        c.style.left = b + "px";
        c.style.bottom = d + "px";
        c.style.width = e + "px";
        c.style.height = a + "px"
    }
}
    ;