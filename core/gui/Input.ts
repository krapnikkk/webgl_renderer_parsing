export default class Input {
    constructor(a) {
        this.onTap = [];
        this.onSingleTap = [];
        this.onDoubleTap = [];
        this.onDrag = [];
        this.onZoom = [];
        this.onPan = [];
        this.onPan2 = [];
        this.onAnything = [];
        this.mouseDownCount = 0;
        this.macHax = 0 <= navigator.platform.toUpperCase().indexOf("MAC");
        a && this.attach(a)
    }
    attach(a) {
        this.element = a;
        var c = function (a) {
            for (var c = 0; c < this.onAnything.length; ++c)
                this.onAnything[c]();
            a.preventDefault()
        }
            .bind(this);
        this.mouseStates = [{
            pressed: false,
            position: [0, 0],
            downPosition: [0, 0]
        }, {
            pressed: false,
            position: [0, 0],
            downPosition: [0, 0]
        }, {
            pressed: false,
            position: [0, 0],
            downPosition: [0, 0]
        }];
        this.lastTapPos = [0, 0];
        a = function (a) {
            if (a.target === this.element) {
                this.mouseDownCount++;
                var d = this.mouseStates[a.button];
                if (d) {
                    d.pressed = true;
                    var e = this.element.getBoundingClientRect();
                    d.position[0] = d.downPosition[0] = a.clientX - e.left;
                    d.position[1] = d.downPosition[1] = a.clientY - e.top;
                    c(a)
                }
            }
        }
            .bind(this);
        this.element.addEventListener("mousedown", a);
        a = function (a) {
            var d = this.mouseStates[a.button];
            if (d) {
                var e = this.element.getBoundingClientRect()
                    , f = a.clientX - e.left
                    , e = a.clientY - e.top;
                d.pressed = false;
                d.position[0] = f;
                d.position[1] = e;
                if (0 == a.button && a.target == this.element && 10 > Math.abs(d.position[0] - d.downPosition[0]) + Math.abs(d.position[1] - d.downPosition[1])) {
                    for (var g = 0; g < this.onTap.length; ++g)
                        this.onTap[g](f, e);
                    this.needSingleClick = true;
                    window.setTimeout(function (a, b) {
                        if (this.needSingleClick) {
                            for (var c = 0; c < this.onSingleTap.length; ++c)
                                this.onSingleTap[c](a, b);
                            this.needSingleClick = false
                        }
                    }
                        .bind(this, f, e), 301);
                    d = false;
                    if (void 0 !== this.doubleClickTimer && (g = 8 > Math.abs(f - this.lastTapPos[0]) + Math.abs(e - this.lastTapPos[1]),
                        300 > Date.now() - this.doubleClickTimer && g))
                        for (d = true,
                            this.needSingleClick = false,
                            g = 0; g < this.onDoubleTap.length; ++g)
                            this.onDoubleTap[g](f, e);
                    this.doubleClickTimer = Date.now();
                    d && (this.doubleClickTimer = -1E9);
                    this.lastTapPos[0] = f;
                    this.lastTapPos[1] = e
                }
            }
            c(a)
        }
            .bind(this);
        this.element.addEventListener("mouseup", a);
        a = function (a) {
            for (var d = false, e = this.element.getBoundingClientRect(), f = 0; 3 > f; ++f) {
                var g = this.mouseStates[f];
                if (g.pressed) {
                    var d = a.clientX - e.left
                        , h = a.clientY - e.top
                        , k = d - g.position[0]
                        , n = h - g.position[1];
                    g.position[0] = d;
                    g.position[1] = h;
                    if (2 == f && a.altKey)
                        for (g = 0; g < this.onZoom.length; ++g)
                            this.onZoom[g](2 * n);
                    else if (1 <= f || a.ctrlKey)
                        for (g = 0; g < this.onPan.length; ++g)
                            this.onPan[g](k, n);
                    else if (0 == f)
                        if (a.shiftKey)
                            for (g = 0; g < this.onPan2.length; ++g)
                                this.onPan2[g](k, n);
                        else
                            for (g = 0; g < this.onDrag.length; ++g)
                                this.onDrag[g](d, h, k, n);
                    d = true
                }
            }
            d && c(a)
        }
            .bind(this);
        this.element.addEventListener("mousemove", a);
        a = function (a) {
            var d = 0;
            a.deltaY ? (d = -0.4 * a.deltaY,
                1 == a.deltaMode ? d *= 16 : 2 == a.deltaMode && (d *= this.element.clientHeight)) : a.wheelDelta ? d = this.macHax && 120 == Math.abs(a.wheelDelta) ? 0.08 * a.wheelDelta : 0.4 * a.wheelDelta : a.detail && (d = -10 * a.detail);
            for (var e = 0; e < this.onZoom.length; ++e)
                this.onZoom[e](d);
            c(a)
        }
            .bind(this);
        this.element.addEventListener("mousewheel", a);
        this.element.addEventListener("DOMMouseScroll", a);
        this.element.addEventListener("wheel", a);
        a = function (a) {
            for (var c = 0; c < this.mouseStates.length; ++c)
                this.mouseStates[c].pressed = false;
            a.preventDefault()
        }
            .bind(this);
        this.element.addEventListener("mouseleave", a);
        this.element.addEventListener("contextmenu", function (a) {
            a.preventDefault()
        });
        this.touches = {};
        this.tapPossible = false;
        this.touchCountFloor = 0;
        a = function (a) {
            for (var d = this.element.getBoundingClientRect(), e = false, f = 0; f < a.changedTouches.length; ++f)
                if (a.target === this.element) {
                    var g = a.changedTouches[f]
                        , e = {
                            x: g.clientX - d.left,
                            y: g.clientY - d.top
                        };
                    e.startX = e.x;
                    e.startY = e.y;
                    this.touches[g.identifier] = e;
                    e = true
                }
            this.tapPossible = 1 == a.touches.length;
            for (g = d = 0; g < this.touches.length; ++g)
                d++;
            d > this.touchCountFloor && (this.touchCountFloor = d);
            e && c(a)
        }
            .bind(this);
        this.element.addEventListener("touchstart", a);
        a = function (a) {
            for (var d = false, e = 0; e < a.changedTouches.length; ++e) {
                var f = a.changedTouches[e]
                    , g = this.touches[f.identifier];
                if (g) {
                    if (this.tapPossible) {
                        var h = this.element.getBoundingClientRect()
                            , d = f.clientX - h.left
                            , h = f.clientY - h.top;
                        if (24 > Math.max(Math.abs(d - g.startX), Math.abs(h - g.startY))) {
                            for (e = 0; e < this.onTap.length; ++e)
                                this.onTap[e](d, h);
                            this.needSingleTap = true;
                            window.setTimeout(function (a, b) {
                                if (this.needSingleTap) {
                                    for (var c = 0; c < this.onSingleTap.length; ++c)
                                        this.onSingleTap[c](a, b);
                                    this.needSingleTap = false
                                }
                            }
                                .bind(this, d, h), 501);
                            g = false;
                            if (void 0 !== this.doubleTapTimer) {
                                var k = 24 > Math.max(Math.abs(d - this.lastTapPos[0]), Math.abs(h - this.lastTapPos[1]))
                                    , n = 500 > Date.now() - this.doubleTapTimer;
                                if (k && n)
                                    for (g = true,
                                        e = 0; e < this.onDoubleTap.length; ++e)
                                        this.onDoubleTap[e](d, h)
                            }
                            this.doubleTapTimer = Date.now();
                            g && (this.doubleTapTimer = -1E9);
                            this.lastTapPos[0] = d;
                            this.lastTapPos[1] = h
                        }
                        this.tapPossible = false
                    }
                    delete this.touches[f.identifier];
                    d = true
                }
            }
            for (f = e = 0; f < this.touches.length; ++f)
                e++;
            0 >= e && (this.touchCountFloor = 0);
            d && c(a)
        }
            .bind(this);
        this.element.addEventListener("touchend", a);
        this.element.addEventListener("touchcancel", a);
        this.element.addEventListener("touchleave", a);
        a = function (a) {
            for (var d = [], e = 0; e < a.touches.length; ++e)
                a.touches[e].target === this.element && d.push(a.touches[e]);
            var f = this.element.getBoundingClientRect();
            if (1 == d.length && 1 >= this.touchCountFloor) {
                var g = d[0]
                    , h = this.touches[g.identifier];
                if (h) {
                    var k = g.clientX - f.left
                        , g = g.clientY - f.top
                        , f = k - h.x
                        , n = g - h.y;
                    h.x = k;
                    h.y = g;
                    for (e = 0; e < this.onDrag.length; ++e)
                        this.onDrag[e](k, g, f, n, a.shiftKey)
                }
            } else if (2 == d.length && 2 >= this.touchCountFloor) {
                if (n = d[0],
                    e = this.touches[n.identifier],
                    g = d[1],
                    h = this.touches[g.identifier],
                    e && h) {
                    var k = n.clientX - f.left
                        , n = n.clientY - f.top
                        , m = g.clientX - f.left
                        , l = g.clientY - f.top
                        , p = Math.sqrt((k - m) * (k - m) + (n - l) * (n - l))
                        , r = Math.sqrt((e.x - h.x) * (e.x - h.x) + (e.y - h.y) * (e.y - h.y))
                        , s = Math.abs(p - r)
                        , f = (k - e.x + m - h.x) / 2
                        , g = (n - e.y + l - h.y) / 2
                        , u = Math.sqrt(f * f + g * g);
                    e.x = k;
                    e.y = n;
                    h.x = m;
                    h.y = l;
                    if (0 < s)
                        for (h = s / (s + u),
                            e = 0; e < this.onZoom.length; ++e)
                            this.onZoom[e](2 * (p - r) * h);
                    if (0 < u)
                        for (h = u / (s + u),
                            e = 0; e < this.onDrag.length; ++e)
                            this.onPan[e](f * h, g * h)
                }
            } else if (3 <= d.length) {
                for (e = r = p = m = n = 0; e < d.length; ++e)
                    g = d[e],
                        h = this.touches[g.identifier],
                        k = g.clientX - f.left,
                        g = g.clientY - f.top,
                        p += k,
                        r += g,
                        h && (n += h.x,
                            m += h.y,
                            h.x = k,
                            h.y = g);
                n /= d.length;
                m /= d.length;
                p /= d.length;
                r /= d.length;
                for (e = 0; e < this.onPan2.length; ++e)
                    this.onPan2[e](p - n, r - m)
            }
            0 < d.length && c(a)
        }
            .bind(this);
        this.element.addEventListener("touchmove", a)
    }
}
