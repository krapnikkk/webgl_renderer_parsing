function ControlRect(a) {
    this.name = "none";
    this.title = "frame";
    this.yPercent = this.xPercent = 0;
    this.heightPercent = this.widthPercent = 1;
    this.debugString = "";
    this.parentControlRect = 0;
    this.childControlRects = [];
    this.clicked = this.mouseDown = this.mouseOver = !1;
    this.localMouseYPercent = this.localMouseXPercent = 0;
    this.enabled = this.visible = !0;
    this.opacity = 1;
    this.guiScreen = a;
    this.id = this.callBack = this.linkedControl = 0
}
ControlRect.prototype.getScreenWidth = function () {
    if (this.linkedControl)
        return this.guiScreen.width * this.getScreenWidthPercent()
}
    ;
ControlRect.prototype.getScreenHeight = function () {
    if (this.linkedControl)
        return this.guiScreen.height * this.getScreenHeightPercent()
}
    ;
ControlRect.prototype.updateElement = function () {
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
    ;
ControlRect.prototype.updateElement = function () {
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
    ;
ControlRect.prototype.updateChildElements = function () {
    this.updateElement();
    for (var a = 0; a < this.childControlRects.length; a++)
        this.childControlRects[a].updateChildElements()
}
    ;
ControlRect.prototype.set = function (a, c, b, d) {
    this.xPercent = a;
    this.yPercent = c;
    this.widthPercent = b;
    this.heightPercent = d
}
    ;
ControlRect.prototype.linkControl = function (a) {
    this.linkedControl = a;
    a.onmouseover = function () {
        this.mouseOver = !0
    }
        .bind(this);
    a.onmouseout = function () {
        this.mouseOver = !1
    }
        .bind(this);
    a.onmousedown = function () {
        this.mouseDown = !0
    }
        .bind(this);
    a.onmouseup = function () {
        this.mouseDown = !1
    }
        .bind(this);
    a.onclick = function () {
        this.callBack && this.callBack(this);
        this.clicked = !0
    }
        .bind(this)
}
    ;
ControlRect.prototype.showControl = function (a) {
    this.visible = a;
    this.linkedControl && (this.linkedControl.style.display = a ? "block" : "none")
}
    ;
ControlRect.prototype.setOpacity = function (a) {
    this.opacity = a;
    this.linkedControl && (this.linkedControl.style.opacity = a)
}
    ;
ControlRect.prototype.hasChildControlRect = function (a) {
    for (var c = 0; c < this.childControlRects.length; c++)
        if (this.childControlRects[c] == a)
            return !0;
    return !1
}
    ;
ControlRect.prototype.registerChildControlRect = function (a) {
    this.hasChildControlRect(a) || (this.childControlRects.push(a),
        a.parentControlRect = this)
}
    ;
ControlRect.prototype.getScreenWidthPercent = function () {
    var a = this.widthPercent;
    this.parentControlRect && (a *= this.parentControlRect.getScreenWidthPercent());
    return a
}
    ;
ControlRect.prototype.getScreenHeightPercent = function () {
    var a = this.heightPercent;
    this.parentControlRect && (a *= this.parentControlRect.getScreenHeightPercent());
    return a
}
    ;
ControlRect.prototype.getScreenXPercent = function () {
    var a = this.xPercent;
    this.parentControlRect && (a *= this.parentControlRect.getScreenWidthPercent(),
        a += this.parentControlRect.getScreenXPercent());
    return a
}
    ;
ControlRect.prototype.getScreenYPercent = function () {
    var a = this.yPercent;
    this.parentControlRect && (a *= this.parentControlRect.getScreenHeightPercent(),
        a += this.parentControlRect.getScreenYPercent());
    return a
}
    ;