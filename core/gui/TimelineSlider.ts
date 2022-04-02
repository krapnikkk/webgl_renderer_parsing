import ControlRect from "./ControlRect";
import GUIScreen from "./GUIScreen";

export default class TimelineSlider {
    name: string;
    debugString: string;
    knobControlRect: ControlRect;
    controlRect: ControlRect;
    backgroundControl: number;
    sliderPercent: number;
    pixelsY: number;
    pixelsX: number;
    draggingSlider: boolean;
    guiScreen: any;
    knobWidthPercent: number;
    constructor(guiScreen:GUIScreen, c:HTMLDivElement) {
        this.name = "none";
        this.debugString = "";
        this.knobControlRect = new ControlRect(guiScreen);
        this.controlRect = new ControlRect(guiScreen);
        var b = document.createElement("div");
        b.id = "sliderUI";
        b.style.position = "absolute";
        b.style.overflow = "hidden";
        b.style["-moz-user-select"] = "none";
        b.style["-khtml-user-select"] = "none";
        b.style["-webkit-user-select"] = "none";
        b.style["-ms-user-select"] = "none";
        this.controlRect.linkedControl = b;
        // this.backgroundControl = 0;
        this.controlRect.registerChildControlRect(this.knobControlRect);
        this.knobControlRect.setOpacity(0.65);
        this.sliderPercent = this.pixelsY = this.pixelsX = 0;
        this.draggingSlider = false;
        this.guiScreen = guiScreen;
        c.addImageElement(this.knobControlRect, "animationknob" + guiScreen.imageSetNumber + "x.png")
    }
    setBackground3x1(a, c, b, d) {
        var e = 8 / this.controlRect.getScreenHeight();
        this.backgroundControl = a.addTextButton("", 0, (1 - e) / 2, 1, e, 1);
        this.backgroundControl.defaultAlpha = 1;
        this.backgroundControl.setBackground3x1(a, 0, 0, c, b, d, 4);
        this.backgroundControl.controlRect.xPercent = this.controlRect.xPercent;
        this.backgroundControl.controlRect.widthPercent = this.controlRect.widthPercent;
        this.controlRect.linkedControl.style.zIndex = "3";
        this.setupCallbacks()
    }
    setSize(a, c) {
        this.pixelsX = a;
        this.pixelsY = c;
        var b = 24 / c;
        this.knobWidthPercent = 24 / a;
        this.knobControlRect.xPercent = 0.5 - this.knobWidthPercent / 2;
        this.knobControlRect.yPercent = (1 - b) / 2 + -1 / c;
        this.knobControlRect.widthPercent = this.knobWidthPercent;
        this.knobControlRect.heightPercent = b;
        this.controlRect.updateElement();
        this.backgroundControl.controlRect.xPercent = this.controlRect.xPercent;
        this.backgroundControl.controlRect.widthPercent = this.controlRect.widthPercent;
        this.backgroundControl.controlRect.updateElement()
    }
    setSliderPercent(a) {
        0 > a && (a = 0);
        1 < a && (a = 1);
        this.sliderPercent = a;
        this.knobControlRect.xPercent = a - this.knobWidthPercent / 2;
        this.knobControlRect.updateElement()
    }
    setupCallbacks() {
        var a = function (a) {
            if (this.draggingSlider) {
                var b = this.backgroundControl.controlRect.linkedControl.getBoundingClientRect();
                this.setSliderPercent((a.clientX - b.left) / b.width);
                this.guiScreen.ui.viewer.scene.sceneAnimator.setAnimationProgress(this.sliderPercent, true);
                this.guiScreen.ui.viewer.scene.sceneAnimator.paused && (this.guiScreen.ui.viewer.scene.postRender.discardAAHistory(),
                    this.guiScreen.ui.viewer.reDrawScene())
            }
        }
            .bind(this)
            , c = function (a) {
                this.draggingSlider = true;
                var b = this.backgroundControl.controlRect.linkedControl.getBoundingClientRect();
                this.setSliderPercent((a.clientX - b.left) / b.width);
                this.guiScreen.ui.viewer.scene.sceneAnimator.setAnimationProgress(this.sliderPercent, true);
                this.guiScreen.ui.viewer.scene.sceneAnimator.lockPlayback = true;
                this.guiScreen.ui.viewer.scene.sceneAnimator.paused && (this.guiScreen.ui.viewer.scene.postRender.discardAAHistory(),
                    this.guiScreen.ui.viewer.reDrawScene())
            }
                .bind(this)
            , b = function (a) {
                this.draggingSlider = false;
                this.guiScreen.ui.viewer.scene.sceneAnimator.lockPlayback = false
            }
                .bind(this);
        this.guiScreen.ui.viewer.input.element.addEventListener("mousemove", a);
        this.guiScreen.ui.viewer.input.element.addEventListener("mouseup", b);
        this.backgroundControl.controlRect.linkedControl.addEventListener("mousemove", a);
        this.backgroundControl.controlRect.linkedControl.addEventListener("mousedown", c);
        this.backgroundControl.controlRect.linkedControl.addEventListener("mouseup", b);
        this.controlRect.linkedControl.addEventListener("mouseup", b)
    }
}