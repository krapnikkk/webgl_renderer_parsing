function ListBox(a) {
    this.name = "none";
    this.text = "default text";
    this.title = "none";
    this.debugString = this.imagePath = "";
    this.controlRect = new ControlRect(a);
    this.textEntries = [];
    this.textOffsetsX = [];
    this.textOffsetsY = [];
    this.buttons = [];
    this.listBoxEntryHeight = 20;
    this.selectedItemText = "";
    this.selectedIndex = -1;
    this.localPixelsY = 0;
    this.localPixelsX = 100;
    this.labelPixelDrop = 0;
    this.labelPixelInset = 10;
    this.labelTextHeight = 16;
    this.closed = !1;
    this.defaultButtonText = this.spacerMiddle = this.spacerRight = this.spacerLeft = this.spacerControl = 0;
    this.listBoxButtons = [];
    this.listBoxRegion = new GUIRegion(a);
    this.guiScreen = a;
    this.lastMouseOverIndex = -1;
    this.selectionChangedCallback = 0;
    this.debugString = ""
}
ListBox.prototype.linkControl = function (a) {
    this.controlRect.linkControl(a)
}
    ;
ListBox.prototype.spawnControl = function (a, c, b, d, e, f) {
    var g = this.guiScreen.imageSetNumber
        , h = "backgroundTopLE" + g + "x.png"
        , k = "backgroundTopM" + g + "x.png"
        , n = "backgroundTopRE" + g + "x.png"
        , m = "backgroundMiddleLE" + g + "x.png"
        , l = "backgroundMiddleM" + g + "x.png"
        , p = "backgroundMiddleRE" + g + "x.png"
        , r = "backgroundBottomLE" + g + "x.png"
        , s = "backgroundBottomM" + g + "x.png"
        , u = "backgroundBottomRE" + g + "x.png"
        , q = 3 * g
        , x = "backgroundLE" + g + "x.png"
        , w = "backgroundM" + g + "x.png"
        , v = "backgroundRE" + g + "x.png"
        , t = 2 * g
        , y = "spacerLE" + g + "x.png"
        , E = "spacerM" + g + "x.png"
        , F = "spacerRE" + g + "x.png"
        , g = 2 * g
        , A = this.controlRect.guiScreen.width
        , B = this.controlRect.guiScreen.height;
    if (e) {
        e = this.textEntries.length;
        var z = b;
        for (b = 0; b < e; b++) {
            var C = 8 * (this.textEntries[b] ? this.textEntries[b].length : 0);
            z < C && (z = C)
        }
        b = z + f
    }
    e = this.textEntries.length + 1;
    f = 1 / e;
    this.localPixelsX = b;
    this.listBoxEntryHeight = d;
    this.localPixelsY = (this.textEntries.length + 1) * this.listBoxEntryHeight;
    b = 8 / this.localPixelsY;
    d = 6 / this.localPixelsX;
    z = 4 / this.localPixelsX;
    C = f - b / 4;
    this.labelTextHeight = marmoset.largeUI ? 20 : 16;
    this.labelPixelDrop = (this.listBoxEntryHeight - this.labelTextHeight) / 2;
    this.listBoxRegion.controlRect.widthPercent = this.localPixelsX / A;
    this.listBoxRegion.controlRect.heightPercent = this.localPixelsY / B;
    this.listBoxRegion.controlRect.xPercent = a / A;
    this.listBoxRegion.controlRect.yPercent = c / B;
    this.openBackground = this.listBoxRegion.addTextButton("", 0, 0, 1, 1 + b, 1);
    this.openBackground.setBackground3x3(this.listBoxRegion, 0, 0, h, k, n, m, l, p, r, s, u, q, q);
    this.closedBackground = this.listBoxRegion.addTextButton("", 0, 0, 1, f, 1);
    this.closedBackground.setBackground3x1(this.listBoxRegion, 0, 0, x, w, v, t);
    a = this.labelPixelInset + this.textOffsetsX[0];
    c = this.labelPixelDrop + this.textOffsetsY[0];
    c /= this.localPixelsY;
    a /= this.localPixelsX;
    this.defaultButton = this.listBoxRegion.addTextButton("Selected", a, -c, 1, f, 0.5);
    this.selectedIndex = 0;
    this.defaultButton.controlRect.linkedControl.innerHTML = this.textEntries[this.selectedIndex];
    this.defaultButton.linkedBackground = this.closedBackground;
    this.spacerControl = this.listBoxRegion.addTextButton("", d, C, 1 - (d + z), b, 1);
    this.spacerControl.defaultAlpha = 1;
    this.spacerControl.setBackground3x1(this.listBoxRegion, 0, 0, y, E, F, g);
    this.spacerControl.setVisible(!1);
    this.spacerControl.linkedBackground = this.openBackground;
    for (b = 1; b < e; b++)
        a = this.labelPixelInset + this.textOffsetsX[b - 1],
            c = this.labelPixelDrop + this.textOffsetsY[b - 1] - 4,
            a /= this.localPixelsX,
            c /= this.localPixelsY,
            y = this.listBoxRegion.addTextButton(this.textEntries[b - 1], a, f * b - c, 1 - a, f, 0.5),
            this.listBoxButtons.push(y),
            y.linkedBackground = this.openBackground;
    this.showList(!1);
    this.setupCallbacks()
}
    ;
ListBox.prototype.setControl = function (a, c, b, d, e, f) {
    var g = this.controlRect.guiScreen.width
        , h = this.controlRect.guiScreen.height;
    if (e) {
        e = this.textEntries.length;
        for (var k = 0; k < e; k++) {
            var n = 8 * (this.textEntries[k] ? this.textEntries[k].length : 0);
            b < n && (b = n)
        }
        b += f
    }
    this.localPixelsX = b;
    this.listBoxEntryHeight = d;
    this.localPixelsY = (this.textEntries.length + 1) * this.listBoxEntryHeight;
    this.listBoxRegion.controlRect.widthPercent = this.localPixelsX / g;
    this.listBoxRegion.controlRect.heightPercent = this.localPixelsY / h;
    this.listBoxRegion.controlRect.xPercent = a / g;
    this.listBoxRegion.controlRect.yPercent = c / h;
    this.listBoxRegion.controlRect.updateChildElements();
    this.spacerControl.alignBackground();
    this.openBackground.alignBackground();
    this.closedBackground.alignBackground()
}
    ;
ListBox.prototype.addItem = function (a, c, b) {
    this.textEntries.push(a);
    this.textOffsetsX.push(c);
    this.textOffsetsY.push(b)
}
    ;
ListBox.prototype.showList = function (a) {
    for (var c = this.listBoxButtons.length, b = 0; b < c; b++)
        this.listBoxButtons[b].setVisible(a);
    this.closed = !a;
    this.spacerControl && this.spacerControl.setVisible(a);
    this.openBackground && this.openBackground.setVisible(a);
    this.closedBackground && this.closedBackground.setVisible(!a);
    a ? (this.defaultButton.linkedBackground = this.openBackground,
        this.openBackground.setOpacity(1),
        this.closedBackground.setOpacity(0.5)) : this.defaultButton.linkedBackground = this.closedBackground
}
    ;
ListBox.prototype.selectItem = function (a) {
    this.selectedItemText = this.textEntries[a];
    this.selectedIndex = a;
    this.defaultButton.controlRect.linkedControl.innerHTML = this.textEntries[this.selectedIndex];
    a = (this.labelTextHeight - this.listBoxEntryHeight + 3) / this.localPixelsY;
    this.defaultButton.controlRect.xPercent = (this.labelPixelInset + this.textOffsetsX[this.selectedIndex]) / this.localPixelsX;
    this.defaultButton.controlRect.yPercent = a;
    this.defaultButton.controlRect.updateElement()
}
    ;
ListBox.prototype.setupCallbacks = function () {
    var a = function (a) {
        if (this.closed) {
            var b = this.closedBackground.controlRect.linkedControl
                , b = b.getBoundingClientRect()
                , c = a.clientX - b.left;
            a = a.clientY - b.top;
            c /= b.width;
            b = a / b.height;
            0 <= c && 1 >= c && 0 <= b && 1 >= b ? this.closedBackground.setOpacity(1) : this.closedBackground.setOpacity(0.5)
        } else
            b = this.openBackground.controlRect.linkedControl,
                b = b.getBoundingClientRect(),
                c = a.clientX - b.left,
                a = a.clientY - b.top,
                c /= b.width,
                b = a / b.height,
                0 <= c && 1 >= c && 0 <= b && 1 >= b ? this.openBackground.setOpacity(1) : this.openBackground.setOpacity(0.5)
    }
        .bind(this);
    this.defaultButton.controlRect.linkedControl.onclick = function () {
        this.closed ? this.showList(!0) : (this.showList(this.closed),
            this.closedBackground.setOpacity(1),
            this.defaultButton.setOpacity(1))
    }
        .bind(this);
    for (var c = function (a) {
        this.selectItem(a.id);
        this.showList(!1);
        this.defaultButton.setOpacity(0.5);
        this.selectionChangedCallback && this.selectionChangedCallback(this)
    }
        .bind(this), b = function (a) {
            a = this.listBoxButtons.length;
            for (var b = 0; b < a; b++)
                this.listBoxButtons[b].controlRect.mouseOver && (this.selectItem(b),
                    b = a,
                    this.selectionChangedCallback && this.selectionChangedCallback(this));
            this.showList(!1)
        }
            .bind(this), d = this.listBoxButtons.length, e = 0; e < d; e++)
        this.listBoxButtons[e].controlRect.callBack = c,
            this.listBoxButtons[e].controlRect.id = e,
            this.listBoxButtons[e].controlRect.linkedControl.addEventListener("mousemove", a);
    this.guiScreen.ui.viewer.input.element.addEventListener("mousemove", a);
    this.openBackground.controlRect.linkedControl.addEventListener("mousemove", a);
    this.closedBackground.controlRect.linkedControl.addEventListener("mousemove", a);
    this.guiScreen.ui.viewer.input.element.addEventListener("mousedown", b)
}
    ;