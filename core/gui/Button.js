function Button(a) {
    this.name = "none";
    this.text = "default text";
    this.title = "none";
    this.debugString = this.imagePath = "";
    this.controlRect = new ControlRect(a);
    this.defaultAlpha = 0.5;
    this.focusAlpha = 1;
    this.updateAlphas = !0;
    this.linkedBackground = this.backgroundOffsetY = this.backgroundOffsetX = this.edgePixelsY = this.edgePixelsX = this.backgroundBottomMiddle = this.backgroundBottomRight = this.backgroundBottomLeft = this.backgroundMiddleMiddle = this.backgroundMiddleRight = this.backgroundMiddleLeft = this.backgroundTopMiddle = this.backgroundTopRight = this.backgroundTopLeft = this.backgroundMiddle = this.backgroundRight = this.backgroundLeft = 0
}
Button.prototype.setBackground3x1 = function (a, c, b, d, e, f, g) {
    this.backgroundOffsetX = c;
    this.backgroundOffsetY = b;
    this.edgePixelsX = g;
    this.backgroundLeft = a.addImage(d);
    this.backgroundMiddle = a.addImage(e);
    this.backgroundRight = a.addImage(f);
    this.backgroundLeft.linkedControl.style.zIndex = "0";
    this.backgroundMiddle.linkedControl.style.zIndex = "0";
    this.backgroundRight.linkedControl.style.zIndex = "0";
    this.setOpacity(this.defaultAlpha)
}
    ;
Button.prototype.setBackground3x3 = function (a, c, b, d, e, f, g, h, k, n, m, l, p, r) {
    this.backgroundOffsetX = c;
    this.backgroundOffsetY = b;
    this.edgePixelsX = p;
    this.edgePixelsY = r;
    this.backgroundTopLeft = a.addImage(d);
    this.backgroundMiddleLeft = a.addImage(g);
    this.backgroundBottomLeft = a.addImage(n);
    this.backgroundTopMiddle = a.addImage(e);
    this.backgroundMiddleMiddle = a.addImage(h);
    this.backgroundBottomMiddle = a.addImage(m);
    this.backgroundTopRight = a.addImage(f);
    this.backgroundMiddleRight = a.addImage(k);
    this.backgroundBottomRight = a.addImage(l);
    this.backgroundTopLeft.linkedControl.style.zIndex = "0";
    this.backgroundTopRight.linkedControl.style.zIndex = "0";
    this.backgroundTopMiddle.linkedControl.style.zIndex = "0";
    this.backgroundMiddleLeft.linkedControl.style.zIndex = "0";
    this.backgroundMiddleRight.linkedControl.style.zIndex = "0";
    this.backgroundMiddleMiddle.linkedControl.style.zIndex = "0";
    this.backgroundBottomLeft.linkedControl.style.zIndex = "0";
    this.backgroundBottomRight.linkedControl.style.zIndex = "0";
    this.backgroundBottomMiddle.linkedControl.style.zIndex = "0";
    this.setOpacity(this.defaultAlpha)
}
    ;
Button.prototype.alignBackground = function () {
    var a = this.controlRect
        , c = a.guiScreen
        , b = c.left * (1 - a.getScreenXPercent())
        , d = c.bottom * (1 - a.getScreenYPercent())
        , e = c.width * a.getScreenWidthPercent()
        , a = c.height * a.getScreenHeightPercent()
        , d = d + this.backgroundOffsetY
        , b = b + this.backgroundOffsetX;
    if (this.backgroundTopLeft && this.backgroundTopRight && this.backgroundTopMiddle && this.backgroundMiddleLeft && this.backgroundMiddleRight && this.backgroundMiddleMiddle && this.backgroundBottomLeft && this.backgroundBottomRight && this.backgroundBottomMiddle) {
        var c = e - 2 * this.edgePixelsX
            , f = a - 2 * this.edgePixelsY;
        this.backgroundTopLeft.linkedControl.style.height = this.edgePixelsY + "px";
        this.backgroundTopMiddle.linkedControl.style.height = this.edgePixelsY + "px";
        this.backgroundTopRight.linkedControl.style.height = this.edgePixelsY + "px";
        this.backgroundBottomLeft.linkedControl.style.height = this.edgePixelsY + "px";
        this.backgroundBottomMiddle.linkedControl.style.height = this.edgePixelsY + "px";
        this.backgroundBottomRight.linkedControl.style.height = this.edgePixelsY + "px";
        this.backgroundMiddleLeft.linkedControl.style.height = f + "px";
        this.backgroundMiddleMiddle.linkedControl.style.height = f + "px";
        this.backgroundMiddleRight.linkedControl.style.height = f + "px";
        this.backgroundTopLeft.linkedControl.style.width = this.edgePixelsX + "px";
        this.backgroundBottomLeft.linkedControl.style.width = this.edgePixelsX + "px";
        this.backgroundMiddleLeft.linkedControl.style.width = this.edgePixelsX + "px";
        this.backgroundTopRight.linkedControl.style.width = this.edgePixelsX + "px";
        this.backgroundBottomRight.linkedControl.style.width = this.edgePixelsX + "px";
        this.backgroundMiddleRight.linkedControl.style.width = this.edgePixelsX + "px";
        this.backgroundTopMiddle.linkedControl.style.width = c + "px";
        this.backgroundBottomMiddle.linkedControl.style.width = c + "px";
        this.backgroundMiddleMiddle.linkedControl.style.width = c + "px";
        this.backgroundTopLeft.linkedControl.style.left = b + "px";
        this.backgroundBottomLeft.linkedControl.style.left = b + "px";
        this.backgroundMiddleLeft.linkedControl.style.left = b + "px";
        b += this.edgePixelsX;
        this.backgroundTopMiddle.linkedControl.style.left = b + "px";
        this.backgroundBottomMiddle.linkedControl.style.left = b + "px";
        this.backgroundMiddleMiddle.linkedControl.style.left = b + "px";
        b += c;
        this.backgroundTopRight.linkedControl.style.left = b + "px";
        this.backgroundBottomRight.linkedControl.style.left = b + "px";
        this.backgroundMiddleRight.linkedControl.style.left = b + "px";
        this.backgroundBottomLeft.linkedControl.style.bottom = d + "px";
        this.backgroundBottomMiddle.linkedControl.style.bottom = d + "px";
        this.backgroundBottomRight.linkedControl.style.bottom = d + "px";
        d += this.edgePixelsY;
        this.backgroundMiddleLeft.linkedControl.style.bottom = d + "px";
        this.backgroundMiddleRight.linkedControl.style.bottom = d + "px";
        this.backgroundMiddleMiddle.linkedControl.style.bottom = d + "px";
        d += f;
        this.backgroundTopLeft.linkedControl.style.bottom = d + "px";
        this.backgroundTopMiddle.linkedControl.style.bottom = d + "px";
        this.backgroundTopRight.linkedControl.style.bottom = d + "px"
    }
    this.backgroundLeft && this.backgroundRight && this.backgroundMiddle && (e -= 2 * this.edgePixelsX,
        this.backgroundLeft.linkedControl.style.bottom = d + "px",
        this.backgroundMiddle.linkedControl.style.bottom = d + "px",
        this.backgroundRight.linkedControl.style.bottom = d + "px",
        this.backgroundLeft.linkedControl.style.height = a + "px",
        this.backgroundMiddle.linkedControl.style.height = a + "px",
        this.backgroundRight.linkedControl.style.height = a + "px",
        this.backgroundLeft.linkedControl.style.width = this.edgePixelsX + "px",
        this.backgroundMiddle.linkedControl.style.width = e + "px",
        this.backgroundRight.linkedControl.style.width = this.edgePixelsX + "px",
        this.backgroundLeft.linkedControl.style.left = b + "px",
        b += this.edgePixelsX,
        this.backgroundMiddle.linkedControl.style.left = b + "px",
        this.backgroundRight.linkedControl.style.left = b + e + "px")
}
    ;
Button.prototype.setOpacity = function (a) {
    this.controlRect.linkedControl.style.opacity = a;
    this.backgroundLeft && (this.backgroundLeft.linkedControl.style.opacity = a);
    this.backgroundRight && (this.backgroundRight.linkedControl.style.opacity = a);
    this.backgroundMiddle && (this.backgroundMiddle.linkedControl.style.opacity = a);
    this.backgroundTopLeft && (this.backgroundTopLeft.linkedControl.style.opacity = a);
    this.backgroundTopRight && (this.backgroundTopRight.linkedControl.style.opacity = a);
    this.backgroundTopMiddle && (this.backgroundTopMiddle.linkedControl.style.opacity = a);
    this.backgroundMiddleLeft && (this.backgroundMiddleLeft.linkedControl.style.opacity = a);
    this.backgroundMiddleRight && (this.backgroundMiddleRight.linkedControl.style.opacity = a);
    this.backgroundMiddleMiddle && (this.backgroundMiddleMiddle.linkedControl.style.opacity = a);
    this.backgroundBottomLeft && (this.backgroundBottomLeft.linkedControl.style.opacity = a);
    this.backgroundBottomRight && (this.backgroundBottomRight.linkedControl.style.opacity = a);
    this.backgroundBottomMiddle && (this.backgroundBottomMiddle.linkedControl.style.opacity = a)
}
    ;
Button.prototype.setBackgroundVisible = function (a) {
    this.backgroundLeft && this.backgroundLeft.showControl(a);
    this.backgroundRight && this.backgroundRight.showControl(a);
    this.backgroundMiddle && this.backgroundMiddle.showControl(a);
    this.backgroundTopLeft && this.backgroundTopLeft.showControl(a);
    this.backgroundTopRight && this.backgroundTopRight.showControl(a);
    this.backgroundTopMiddle && this.backgroundTopMiddle.showControl(a);
    this.backgroundMiddleLeft && this.backgroundMiddleLeft.showControl(a);
    this.backgroundMiddleRight && this.backgroundMiddleRight.showControl(a);
    this.backgroundMiddleMiddle && this.backgroundMiddleMiddle.showControl(a);
    this.backgroundBottomLeft && this.backgroundBottomLeft.showControl(a);
    this.backgroundBottomRight && this.backgroundBottomRight.showControl(a);
    this.backgroundBottomMiddle && this.backgroundBottomMiddle.showControl(a)
}
    ;
Button.prototype.setVisible = function (a) {
    this.controlRect.showControl(a);
    this.setBackgroundVisible(a)
}
    ;
Button.prototype.linkControl = function (a) {
    this.controlRect.linkedControl = a;
    a.onmouseover = function () {
        this.updateAlphas && (this.setOpacity(this.focusAlpha),
            this.controlRect.mouseOver = !0,
            this.linkedBackground && this.linkedBackground.setOpacity(this.focusAlpha))
    }
        .bind(this);
    a.onmouseout = function () {
        this.updateAlphas && (this.setOpacity(this.defaultAlpha),
            this.controlRect.mouseOver = !1,
            this.linkedBackground && this.linkedBackground.setOpacity(this.defaultAlpha))
    }
        .bind(this)
}
    ;