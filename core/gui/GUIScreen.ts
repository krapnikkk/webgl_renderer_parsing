import ControlRect from "./ControlRect";
import PlaybackControls from "./PlaybackControls";
import UI from "./UI";

export default class GUIScreen {
    init: boolean;
    ui: UI;
    bottom: number;
    left: number;
    height: number;
    width: number;
    clicked: boolean;
    mouseDown: boolean;
    playbackControls: PlaybackControls;
    imageSetNumber: number;
    constructor(ui: UI) {
        this.init = false;
        this.ui = ui;
        this.bottom = this.left = this.height = this.width = 0;
        this.clicked = this.mouseDown = false;
        let imageSetNumber = 1;
        window.devicePixelRatio && (2 < window.devicePixelRatio ? imageSetNumber = 4 : 1 < window.devicePixelRatio && (imageSetNumber = 2));
        this.imageSetNumber = imageSetNumber
    }
    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.left = -width;
        this.bottom = -height;
        this.playbackControls && this.playbackControls.resize(this)
    }
    setupActiveView(a: UI) {
        this.init || (this.init = true,
            this.ui = a,
            a.viewer.scene.sceneAnimator && (this.playbackControls = new PlaybackControls(this),
                this.playbackControls.resize(this)))
    }
    updateElement(control: ControlRect) {
        var c = control.linkedControl;
        if (c) {
            var b = this.left * (1 - control.getScreenXPercent())
                , d = this.bottom * (1 - control.getScreenYPercent())
                , e = this.width * control.getScreenWidthPercent();
            let height = this.height * control.getScreenHeightPercent();
            c.style.left = b + "px";
            c.style.bottom = d + "px";
            c.style.width = e + "px";
            c.style.height = height + "px"
        }
    }

}
