function PlaybackControls(a) {
    this.debugString = "";
    this.init = !1;
    this.speedList = this.cameraList = this.animationList = this.playButton = this.timelineSlider = this.playbackRegion = this.previousFrameButton = this.nextFrameButton = this.pauseButton = this.playButton = 0;
    this.visible = !1;
    this.backgroundRegion = this.screenButton = 0;
    this.guiScreen = a;
    this.playbackRegion = new GUIRegion(a);
    this.idealSliderWidth = 650;
    this.totalListBoxPixelsX = 0;
    this.minWidth = 500;
    this.compactMode = !1;
    this.ui = a.ui;
    var c = "animationpause" + a.imageSetNumber + "x.png"
        , b = "animationplay" + a.imageSetNumber + "x.png"
        , d = "timelineLE" + a.imageSetNumber + "x.png"
        , e = "timelineM" + a.imageSetNumber + "x.png"
        , f = "timelineRE" + a.imageSetNumber + "x.png"
        , g = a.ui.viewer.scene.sceneAnimator.animations.length;
    if (0 != g) {
        var h = this.idealSliderWidth;
        this.bottomOffset = 85;
        this.centerOffset = 60;
        var k = a.width / 2 + this.centerOffset
            , n = k - h / 2
            , k = k + h / 2
            , m = n - 14 - 32
            , l = k - m
            , p = 32 / a.height
            , r = this.bottomOffset / a.height
            , s = this.playbackRegion;
        s.controlRect.widthPercent = l / a.width;
        s.controlRect.heightPercent = p;
        s.controlRect.xPercent = m / a.width;
        s.controlRect.yPercent = r;
        p = 32 / l;
        this.pauseButton = new Button(this.guiScreen);
        this.pauseButton.controlRect.set(0, 0.125, p, 0.75);
        this.pauseButton.controlRect.opacity = 0.5;
        s.controlRect.registerChildControlRect(this.pauseButton.controlRect);
        this.pauseButton.linkControl(s.addImageElement(this.pauseButton.controlRect, c));
        this.playButton = new Button(this.guiScreen);
        this.playButton.controlRect.set(0, 0.125, p, 0.75);
        this.playButton.controlRect.opacity = 0.5;
        s.controlRect.registerChildControlRect(this.playButton.controlRect);
        this.playButton.linkControl(s.addImageElement(this.playButton.controlRect, b));
        c = h / l;
        l = (n - m) / l;
        this.timelineSlider = new TimelineSlider(this.guiScreen, s);
        this.timelineSlider.controlRect.set(l, 0.03125, c, 1);
        s.controlRect.registerChildControlRect(this.timelineSlider.controlRect);
        this.timelineSlider.setBackground3x1(s, d, e, f);
        this.pauseButton.controlRect.showControl(!a.ui.viewer.scene.sceneAnimator.paused);
        this.playButton.controlRect.showControl(a.ui.viewer.scene.sceneAnimator.paused);
        d = k + 14;
        e = this.bottomOffset + 4;
        f = a.ui.viewer.scene.sceneAnimator.animations[0].cameraObjects.length;
        a.ui.viewer.scene.sceneAnimator.selectDefaultCamera();
        a.ui.viewer.scene.sceneAnimator.setViewFromSelectedCamera();
        this.maxListPixelsX = 0;
        if (1 < f) {
            this.cameraList = new ListBox(a);
            for (l = 0; l < f; l++)
                this.cameraList.addItem(a.ui.viewer.scene.sceneAnimator.animations[0].cameraObjects[l].name, 0, 0);
            this.cameraList.spawnControl(d, e, 10, 24, !0, 8);
            this.cameraList.selectItem(a.ui.viewer.scene.sceneAnimator.selectedCameraIndex);
            this.maxListPixelsX = this.cameraList.localPixelsX;
            this.totalListBoxPixelsX += this.cameraList.localPixelsX + 14
        }
        if (1 < g) {
            this.animationList = new ListBox(a);
            for (l = 0; l < g; l++)
                this.animationList.addItem(a.ui.viewer.scene.sceneAnimator.animations[l].name, 0, 0);
            this.animationList.spawnControl(d, e, 10, 24, !0, 8);
            this.maxListPixelsX < this.animationList.localPixelsX && (this.maxListPixelsX = this.animationList.localPixelsX);
            this.totalListBoxPixelsX += this.animationList.localPixelsX + 14;
            this.animationList.selectItem(a.ui.viewer.scene.sceneAnimator.selectedAnimationIndex)
        }
        d = m - 44 - 14;
        l = k - d + this.totalListBoxPixelsX;
        this.speedList = new ListBox(a);
        this.speedList.addItem("4.0x", 4, 0);
        this.speedList.addItem("2.0x", 4, 0);
        this.speedList.addItem("1.0x", 4, 0);
        this.speedList.addItem("0.5x", 4, 0);
        this.speedList.addItem("0.25x", -2, 0);
        this.speedList.spawnControl(d, e, 44, 24, !1, 0);
        this.speedList.selectItem(2);
        l > a.width && (this.idealSliderWidth = a.width - (118 + (this.totalListBoxPixelsX + 14)) - this.centerOffset,
            a = 0,
            this.cameraList && a++,
            this.animationList && a++,
            1 == a && (this.idealSliderWidth += 56,
                this.centerOffset -= 14),
            2 == a && (this.idealSliderWidth += 63,
                this.centerOffset -= 63));
        this.setupCallbacks()
    }
}
PlaybackControls.prototype.resize = function (a) {
    a.ui.viewer.scene.sceneAnimator.showPlayControls || (a.width = 1,
        a.height = 1);
    this.compactMode = a.width < this.minWidth;
    var c = this.bottomOffset
        , b = this.bottomOffset + 4
        , d = 0;
    this.cameraList && this.animationList ? d += 42 + this.cameraList.localPixelsX + this.animationList.localPixelsX : this.cameraList ? d += 28 + this.cameraList.localPixelsX : this.animationList && (d += 28 + this.animationList.localPixelsX);
    var e = a.width - d - 72;
    0 == d && (e -= 14);
    var f = 116
        , g = f + e + 14;
    this.compactMode && (f = 58,
        e += 44 + d,
        0 < d && (c += 32),
        !d && (b += 32));
    var d = 32 / e
        , h = d + 14 / e
        , k = 1 - h
        , n = this.playbackRegion;
    n.controlRect.widthPercent = e / a.width;
    n.controlRect.heightPercent = 32 / a.height;
    n.controlRect.xPercent = f / a.width;
    n.controlRect.yPercent = c / a.height;
    this.pauseButton.controlRect.set(0, 0.125, d, 0.75);
    this.playButton.controlRect.set(0, 0.125, d, 0.75);
    this.timelineSlider.controlRect.set(h, 0.03125, k, 1);
    this.timelineSlider.setSize(e - 46, 32);
    n.controlRect.updateElement();
    n.controlRect.updateChildElements();
    this.speedList.setControl(58, b, 44, 24, !1);
    this.cameraList && (this.cameraList.setControl(g, b, 10, 24, !0, 8),
        g += this.cameraList.localPixelsX + 14);
    this.animationList && this.animationList.setControl(g, b, 10, 24, !0, 8);
    this.timelineSlider.backgroundControl.alignBackground()
}
    ;
PlaybackControls.prototype.setupCallbacks = function () {
    var a = function (a) {
        "0.01x" == this.speedList.selectedItemText && this.ui.viewer.scene.sceneAnimator.setPlaybackSpeed(0.01);
        "0.05x" == this.speedList.selectedItemText && this.ui.viewer.scene.sceneAnimator.setPlaybackSpeed(0.05);
        "0.25x" == this.speedList.selectedItemText && this.ui.viewer.scene.sceneAnimator.setPlaybackSpeed(0.25);
        "0.5x" == this.speedList.selectedItemText && this.ui.viewer.scene.sceneAnimator.setPlaybackSpeed(0.5);
        "1.0x" == this.speedList.selectedItemText && this.ui.viewer.scene.sceneAnimator.setPlaybackSpeed(1);
        "2.0x" == this.speedList.selectedItemText && this.ui.viewer.scene.sceneAnimator.setPlaybackSpeed(2);
        "4.0x" == this.speedList.selectedItemText && this.ui.viewer.scene.sceneAnimator.setPlaybackSpeed(4)
    }
        .bind(this)
        , c = function (a) {
            this.ui.viewer.scene.sceneAnimator.selectCamera(this.cameraList.selectedIndex);
            this.ui.viewer.wake()
        }
            .bind(this)
        , b = function (a) {
            this.ui.viewer.scene.sceneAnimator.selectAnimation(this.animationList.selectedIndex);
            this.ui.viewer.wake()
        }
            .bind(this);
    this.speedList && (this.speedList.selectionChangedCallback = a);
    this.cameraList && (this.cameraList.selectionChangedCallback = c);
    this.animationList && (this.animationList.selectionChangedCallback = b);
    this.playButton.controlRect.linkedControl.onclick = function () {
        this.ui.viewer.scene.sceneAnimator.pause(!1);
        this.playButton.controlRect.showControl(!1);
        this.pauseButton.controlRect.showControl(!0);
        this.ui.viewer.wake()
    }
        .bind(this);
    this.pauseButton.controlRect.linkedControl.onclick = function () {
        this.ui.viewer.scene.sceneAnimator.pause(!0);
        this.playButton.controlRect.showControl(!0);
        this.pauseButton.controlRect.showControl(!1)
    }
        .bind(this)
}
    ;