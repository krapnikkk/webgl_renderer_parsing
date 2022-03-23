var Network = {
    fetchImage: function (a, c, b) {
        var d = new Image;
        d.crossOrigin = "Anonymous";
        d.onload = function () {
            0 < d.width && 0 < d.height ? c(d) : b && b()
        }
            ;
        b && (req.onerror = function () {
            b()
        }
        );
        d.src = a
    },
    fetchText: function (a, c, b, d) {
        var e = new XMLHttpRequest;
        e.open("GET", a, !0);
        e.onload = function () {
            200 == e.status ? c(e.responseText) : b && b()
        }
            ;
        b && (e.onerror = function () {
            b()
        }
        );
        d && (e.onprogress = function (a) {
            d(a.loaded, a.total)
        }
        );
        e.send()
    },
    fetchBinary: function (a, c, b, d) {
        var e = new XMLHttpRequest;
        e.open("GET", a, !0);
        e.responseType = "arraybuffer";
        e.onload = function () {
            200 == e.status ? c(e.response) : b && b()
        }
            ;
        b && (e.onerror = function () {
            b()
        }
        );
        d && (e.onprogress = function (a) {
            d(a.loaded, a.total)
        }
        );
        e.send()
    },
    fetchBinaryIncremental: function (a, c, b, d) {
        var e = new XMLHttpRequest;
        e.open("HEAD", a, !0);
        e.onload = function () {
            if (200 == e.status) {
                var f = e.getResponseHeader("Accept-Ranges");
                if (f && "none" != f) {
                    var g = e.getResponseHeader("Content-Length") | 0
                        , h = function (b, e) {
                            var f = new XMLHttpRequest;
                            f.open("GET", a, !0);
                            f.setRequestHeader("Range", "bytes=" + b + "-" + e);
                            f.responseType = "arraybuffer";
                            f.onload = function () {
                                (206 == f.status || 200 == f.status) && c(f.response) && e < g && (b += d,
                                    e += d,
                                    e = e < g - 1 ? e : g - 1,
                                    h(b, e))
                            }
                                ;
                            f.send()
                        };
                    h(0, d - 1)
                } else
                    b && b()
            } else
                b && b()
        }
            ;
        b && (e.onerror = function () {
            b()
        }
        );
        e.send()
    }
};