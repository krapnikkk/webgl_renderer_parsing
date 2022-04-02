import GUIScreen from "./GUIScreen";

export default class ControlRect {
    name: string;
    title: string;
    yPercent: number;
    xPercent: number;
    heightPercent: number;
    widthPercent: number;
    debugString: string;
    parentControlRect: ControlRect;
    childControlRects: any[];
    clicked: boolean;
    mouseDown: boolean;
    mouseOver: boolean;
    localMouseYPercent: number;
    localMouseXPercent: number;
    enabled: boolean;
    visible: boolean;
    opacity: number;
    guiScreen: GUIScreen;
    id: number;
    callBack: Function;
    linkedControl: HTMLDivElement;
    constructor(guiScreen:GUIScreen) {
        this.name = "none";
        this.title = "frame";
        this.yPercent = this.xPercent = 0;
        this.heightPercent = this.widthPercent = 1;
        this.debugString = "";
        this.childControlRects = [];
        this.clicked = this.mouseDown = this.mouseOver = false;
        this.localMouseYPercent = this.localMouseXPercent = 0;
        this.enabled = this.visible = true;
        this.opacity = 1;
        this.guiScreen = guiScreen;
    }

    getScreenWidth= () => {
        if (this.linkedControl)
            return this.guiScreen.width * this.getScreenWidthPercent()
    }
    getScreenHeight= () => {
        if (this.linkedControl)
            return this.guiScreen.height * this.getScreenHeightPercent()
    }
    updateElement= () => {
        var a = this.linkedControl;
        if (a) {
            var c = this.guiScreen.left * (1 - this.getScreenXPercent())
                , b = this.guiScreen.bottom * (1 - this.getScreenYPercent())
                , d = this.guiScreen.width * this.getScreenWidthPercent()
                , e = this.guiScreen.height * this.getScreenHeightPercent();
            a.style.left = c + "px";
            a.style.bottom = b + "px";
            a.style.width = d + "px";
            a.style.height = e + "px"
        }
    }
    updateChildElements= () => {
        this.updateElement();
        for (var a = 0; a < this.childControlRects.length; a++)
            this.childControlRects[a].updateChildElements()
    }
    set(a, c, b, d) {
        this.xPercent = a;
        this.yPercent = c;
        this.widthPercent = b;
        this.heightPercent = d
    }
    linkControl(a) {
        this.linkedControl = a;
        a.onmouseover= () => {
            this.mouseOver = true
        }
        a.onmouseout= () => {
            this.mouseOver = false
        }
        a.onmousedown= () => {
            this.mouseDown = true
        }
        a.onmouseup= () => {
            this.mouseDown = false
        }
        a.onclick= () => {
            this.callBack && this.callBack(this);
            this.clicked = true
        }
    }
    showControl(a) {
        this.visible = a;
        this.linkedControl && (this.linkedControl.style.display = a ? "block" : "none")
    }
    setOpacity(a) {
        this.opacity = a;
        this.linkedControl && (this.linkedControl.style.opacity = a)
    }
    hasChildControlRect(a) {
        for (var c = 0; c < this.childControlRects.length; c++)
            if (this.childControlRects[c] == a)
                return true;
        return false
    }
    registerChildControlRect(a) {
        this.hasChildControlRect(a) || (this.childControlRects.push(a),
            a.parentControlRect = this)
    }
    getScreenWidthPercent= () => {
        var a = this.widthPercent;
        this.parentControlRect && (a *= this.parentControlRect.getScreenWidthPercent());
        return a
    }
    getScreenHeightPercent= () => {
        var a = this.heightPercent;
        this.parentControlRect && (a *= this.parentControlRect.getScreenHeightPercent());
        return a
    }
    getScreenXPercent= () => {
        var a = this.xPercent;
        this.parentControlRect && (a *= this.parentControlRect.getScreenWidthPercent(),
            a += this.parentControlRect.getScreenXPercent());
        return a
    }
    getScreenYPercent= () => {
        var a = this.yPercent;
        this.parentControlRect && (a *= this.parentControlRect.getScreenHeightPercent(),
            a += this.parentControlRect.getScreenYPercent());
        return a
    }
}