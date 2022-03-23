marmoset = {};
(function (marmoset) {
    'use strict';
    var prepareEmbedParams = function (a) {
        a = a || {};
        if (document.location.search)
            for (var c = document.location.search.substring(1).split("&"), b = 0; b < c.length; ++b) {
                var d = c[b].split("=");
                a[d[0]] = d[1]
            }
        c = function (a) {
            if (a | 0)
                return !0;
            for (var b = "true True TRUE yes Yes YES".split(" "), c = 0; c < b.length; ++c)
                if (a === b[c])
                    return !0;
            return !1
        }
            ;
        a.width = a.width || 800;
        a.height = a.height || 600;
        a.autoStart = c(a.autoStart);
        a.pagePreset = c(a.pagePreset);
        a.fullFrame = c(a.fullFrame) || c(a.bare);
        a.fullFrame = !a.pagePreset && a.fullFrame;
        return a
    }, embed = function (a, c) {
            var b;
            c = prepareEmbedParams(c);
            var d = c.thumbnailURL;
            if (c.pagePreset) {
                b = new WebViewer(c.width, c.height, a, !!d);
                document.body.style.backgroundColor = "#d7e4da";
                var e = document.createElement("div");
                e.style.position = "relative";
                e.style.backgroundColor = "#e4e7e4";
                e.style.width = c.width + 12 + "px";
                e.style.height = c.height + 6 + 16 + "px";
                e.style.margin = "auto";
                e.style.boxShadow = "3px 5px 12px 0px grey";
                document.body.appendChild(e);
                var f = document.createElement("div");
                f.style.position = "relative";
                f.style.left = "6px";
                f.style.top = "6px";
                e.appendChild(f);
                f.appendChild(b.domRoot);
                if (!b.mobile) {
                    e.style.resize = "both";
                    e.style.overflow = "hidden";
                    var g = [e.style.width, e.style.height]
                        , h = function () {
                            if (FullScreen.active())
                                e.style.resize = "none";
                            else if (e.style.resize = "both",
                                g[0] != e.style.width || g[1] != e.style.height)
                                g[0] = e.style.width,
                                    g[1] = e.style.height,
                                    b.resize(e.clientWidth - 12, e.clientHeight - 6 - 16);
                            window.setTimeout(h, 100)
                        };
                    h()
                }
            } else
                b = new WebViewer(c.fullFrame ? window.innerWidth : c.width, c.fullFrame ? window.innerHeight : c.height, a, !!d),
                    document.body.appendChild(b.domRoot),
                    c.fullFrame && (b.domRoot.style.position = "absolute",
                        b.domRoot.style.left = b.domRoot.style.top = 0,
                        window.addEventListener("resize", function () {
                            FullScreen.active() || b.resize(window.innerWidth, window.innerHeight)
                        }));
            b.ui.setThumbnailURL(d);
            c.autoStart && b.loadScene();
            return b
        }, fetchThumbnail = function (a, c, b, d) {
            var e = !1
                , f = a + (-1 == a.indexOf("?") ? "?" : "&") + "thumb=1"
                , g = function (a) {
                    (a = (new Archive(a)).extract("thumbnail.jpg")) ? TextureCache.parseFile(a, c, d) : e ? b && b() : (e = !0,
                        Network.fetchBinaryIncremental(f, g, b, 394240));
                    return 0
                };
            Network.fetchBinaryIncremental(f, g, b, 65536)
        }, marmoset = "undefined" == typeof marmoset ? {} : marmoset;
    var FullScreen = {
        support: function () {
            return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled)
        },
        begin: function (a, c) {
            var b = a.requestFullscreen || a.webkitRequestFullScreen || a.mozRequestFullScreen || a.msRequestFullscreen;
            if (b) {
                var d = function () {
                    FullScreen.active() || (document.removeEventListener("fullscreenchange", d),
                        document.removeEventListener("webkitfullscreenchange", d),
                        document.removeEventListener("mozfullscreenchange", d),
                        document.removeEventListener("MSFullscreenChange", d));
                    c && c()
                };
                document.addEventListener("fullscreenchange", d);
                document.addEventListener("webkitfullscreenchange", d);
                document.addEventListener("mozfullscreenchange", d);
                document.addEventListener("MSFullscreenChange", d);
                b.bind(a)()
            }
        },
        end: function () {
            var a = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
            a && a.bind(document)()
        },
        active: function () {
            return !!(document.fullscreenElement || document.webkitIsFullScreen || document.mozFullScreenElement || document.msFullscreenElement)
        }
    }, marmoset = "undefined" == typeof marmoset ? {} : marmoset;

    marmoset.embed = embed;
    marmoset.fetchThumbnail = fetchThumbnail;
    marmoset.FullScreen = FullScreen;
    marmoset = "undefined" == typeof marmoset ? {} : marmoset;
    marmoset.WebViewer = WebViewer;
    marmoset.dataLocale = (0 == window.location.protocol.indexOf("https") ? "https:" : "http:") + "//viewer.marmoset.co/main/data/";
}
)(marmoset);
