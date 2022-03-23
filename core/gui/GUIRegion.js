function GUIRegion(a) {
    this.debugString = "GUIRegion";
    this.name = "Default";
    this.controlRect = new ControlRect(a);
    this.yPercent = this.xPercent = 0;
    this.heightPercent = this.widthPercent = 1;
    this.guiScreen = a
}
GUIRegion.prototype.addImageElement = function (a, c) {
    var b = this.guiScreen.ui.menuCluster.contents
        , d = document.createElement("input");
    a.linkControl(d);
    this.guiScreen.updateElement(a);
    d.type = "image";
    d.src = marmoset.dataLocale + c;
    d.style.position = "absolute";
    d.style.border = "none";
    d.style.outline = "0px";
    d.style.zIndex = "1";
    d.title = c;
    d.style.opacity = a.opacity;
    var e = new XMLHttpRequest;
    e.open("HEAD", d.src, !0);
    e.onload = function (a) {
        a.appendChild(this)
    }
        .bind(d, b);
    e.send();
    return d
}
    ;
GUIRegion.prototype.addImage = function (a) {
    var c = new ControlRect(this.guiScreen);
    this.addImageElement(c, a);
    return c
}
    ;
GUIRegion.prototype.addTextButton = function (a, c, b, d, e, f) {
    var g = new Button(this.guiScreen);
    g.name = "none";
    g.text = a;
    g.controlRect.set(c, b, d, e);
    g.controlRect.opacity = f;
    this.controlRect.registerChildControlRect(g.controlRect);
    c = this.guiScreen.ui.menuCluster.contents;
    b = document.createElement("text");
    b.style.color = "white";
    b.style.fontFamily = "Arial";
    b.style.fontSize = marmoset.largeUI ? "14px" : "12px";
    b.style.textShadow = "2px 2px 3px #000000";
    c.appendChild(b);
    g.controlRect.linkControl(b);
    this.guiScreen.updateElement(g.controlRect);
    b.type = "text";
    b.name = "text";
    b.style.position = "absolute";
    b.style.border = "none";
    b.style.outline = "0px";
    b.style.zIndex = "2";
    b.innerHTML = a;
    b.style.opacity = g.controlRect.opacity;
    g.linkControl(b);
    return g
}
    ;