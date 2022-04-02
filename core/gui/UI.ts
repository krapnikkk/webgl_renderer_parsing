import { dataLocale, fetchThumbnail, FullScreen } from "../constant";
import Network from "../utils/Network";
import Button from "./Button";
import GUIScreen from "./GUIScreen";
import WebViewer from "./WebViewer";

export default class UI {
    viewer: WebViewer;
    stripData: any;
    container: HTMLDivElement;
    guiScreen: GUIScreen;
    progressBar: any;
    thumbnail: HTMLCanvasElement | HTMLImageElement;
    fadeThumbnail: any;
    playButton: HTMLButtonElement;
    helpOverlay: any;
    loadingImageURL: any;
    stripText: any[];
    sigCluster: HTMLDivElement;
    logo: HTMLDivElement;
    style: any;
    sceneTitle: any;
    line: any;
    active: any;
    hideSigOnHelp: boolean;
    hideSigOnStrips: boolean;
    targetOpacity: number;
    menuCluster: HTMLDivElement;
    hostLogo: string;
    sceneStats: HTMLElement;
    frameTimer: HTMLElement;
    frameCount: number;
    fadeThumbnailTimer: any;
    frameTime: any;
    constructor(viewer: WebViewer) {
        this.viewer = viewer;
        this.stripData = viewer.stripData;
        this.container = document.createElement("div");
        this.container.id = "marmosetUI";
        this.container.style.position = "absolute";
        this.container.style.overflow = "hidden";
        this.container.style["-moz-user-select"] = "none";
        this.container.style["-khtml-user-select"] = "none";
        this.container.style["-webkit-user-select"] = "none";
        this.container.style["-ms-user-select"] = "none";
        this.viewer.domRoot.appendChild(this.container);
        this.guiScreen = new GUIScreen(this)
    }
    setSize(width: number, height: number) {
        // HTMLDivElement doesn't have this property
        this.container['width'] = width | 0;
        this.container['height'] = height | 0;
        this.container.style.width = width + "px";
        this.container.style.height = height + "px";
        this.guiScreen.setSize(this.container['width'], this.container['height'])
    }
    clearView() {
        for (; this.container.hasChildNodes();)
            this.container.removeChild(this.container.childNodes[0]);
        delete this.progressBar;
        delete this.thumbnail;
        delete this.fadeThumbnail;
        delete this.playButton;
        delete this.helpOverlay
    }
    bindInput(a) {
        a.onSingleTap.push(function (c, b) {
            this.stripData.selectedStrip != this.stripData.STRIP_NONE && (c = 2 / a.element.clientWidth * c - 1,
                b = 1 - 2 / a.element.clientHeight * b,
                this.stripData.selectStrip(c, b),
                this.stripData.selectedStrip == this.stripData.STRIP_MENU && this.helpOverlay.active && this.helpOverlay.toggle(),
                this.refreshUI(),
                this.viewer.wake())
        }
            .bind(this))
    }

    static sanitize(a) {
        return a ? a.replace(/<|>|\(|\)|$|%|=/g, "") : a
    }
    static sanitizeURL(a) {
        return a ? 0 == a.indexOf("http://") || 0 == a.indexOf("https://") || 0 == a.indexOf("ftp://") ? encodeURI(a) : "http://" + encodeURI(a) : a
    }
    showFailure(a) {
        this.container.innerHTML = '<br><br><br><p style="text-align:center;color:#aaaaaa"><b>Marmoset Viewer could not initialize.</b><br><i>' + (a || "") + "</i>"
    }
    showPreview(url?: string) {
        this.clearView();
        this.thumbnail = document.createElement("canvas");
        let c = this.container['width'] / this.container['height'];
        this.thumbnail.height = this.viewer.mobile ? 200 : 300;
        this.thumbnail.width = this.thumbnail.height * c | 0;
        this.thumbnail.style.width = this.thumbnail.style.height = "100%";
        let context = this.thumbnail.getContext("2d"),
            b = context.fillStyle = context.createRadialGradient(this.thumbnail.width / 2, this.thumbnail.height / 2, (this.thumbnail.width + this.thumbnail.height) / 2, this.thumbnail.width / 2, 0, 0);
        b.addColorStop(0, "rgb(0,0,0)");
        b.addColorStop(1, "rgb(150,150,150)");
        context.fillStyle = b;
        context.fillRect(0, 0, this.thumbnail.width, this.thumbnail.height);
        this.container.appendChild(this.thumbnail);
        this.playButton = document.createElement("input");
        this.playButton.type = "image";
        this.playButton['src'] = dataLocale + "play.png";
        this.playButton.style.position = "absolute";
        this.playButton.style.left = "50%";
        this.playButton.style.top = "50%";
        this.playButton.style["-webkit-transform"] = this.playButton.style.transform = "translate(-50%,-50%) scale(0.5,0.5)";
        this.playButton.style.opacity = "0.5";
        this.playButton.style.outline = "0px";
        this.playButton.onclick = () => {
            this.viewer.loadScene(this.viewer.sceneURL);
            this.container.removeChild(this.playButton);
            delete this.playButton
        };
        this.container.appendChild(this.playButton);
        url || fetchThumbnail(this.viewer.sceneURL, (url) => {
            this.loadingImageURL || this.setThumbnail(url)
        })
    }
    setThumbnailURL(url: string) {
        (this.loadingImageURL = url) && Network.fetchImage(this.loadingImageURL, this.setThumbnail.bind(this))
    }
    setThumbnail(thumb: HTMLImageElement) {
        if (this.thumbnail)
            if (thumb.height >= this.container['height']) {
                let ratio = this.container['height'] / thumb.height;
                thumb.style.position = "absolute";
                thumb.style.outline = "0px";
                thumb.style.left = "50%";
                thumb.style.top = "50%";
                thumb.style["-webkit-transform"] = thumb.style.transform = "translate(-50%,-50%) scale(" + ratio + "," + ratio + ")";
                this.container.replaceChild(thumb, this.thumbnail);
                this.thumbnail = thumb;
            } else {
                let context = (this.thumbnail as HTMLCanvasElement).getContext("2d")
                    , width = this.thumbnail.width
                    , height = this.thumbnail.height
                    , ratio = height / thumb.height;
                context.drawImage(thumb, (width - thumb.width * ratio) / 2, 0, thumb.width * ratio, height);
                let tempImgData: ImageData;
                try {
                    tempImgData = context.getImageData(0, 0, width, height)
                } catch (g) {
                    console.warn(g);
                    return
                }
                let imgData = context.createImageData(width, height);
                for (let h = 0; 2 > h; ++h) {
                    for (let c = tempImgData.data, k = imgData.data, n = 0, m = 0; m < height; ++m) {
                        for (let l = 0; l < width; ++l) {
                            for (let p = 0, r = 0, s = 0, u = -2; 2 >= u; ++u) {
                                for (let q = m + u, q = 0 > q ? 0 : q >= height ? height - 1 : q, x = -2; 2 >= x; ++x) {
                                    let w = l + x
                                        , w = 0 > w ? 0 : w >= width ? width - 1 : w
                                        , w = 4 * (q * width + w)
                                        , p = p + c[w]
                                        , r = r + c[w + 1]
                                        , s = s + c[w + 2];

                                }
                                k[n++] = p / 25;
                                k[n++] = r / 25;
                                k[n++] = s / 25;
                                k[n++] = 255
                            }
                        }
                        let temp = tempImgData;
                        tempImgData = imgData;
                        imgData = temp;
                    }
                }
                context.putImageData(imgData, 0, 0)
            }
    }
    showActiveView() {
        let a = this.thumbnail;
        this.clearView();
        a && (this.fadeThumbnail = a,
            this.fadeThumbnail.style.opacity = 1,
            this.container.appendChild(this.fadeThumbnail));
        if (!marmoset.noUserInterface) {
            void 0 === marmoset.largeUI && (marmoset.largeUI = this.viewer.mobile);
            450 > this.container['width'] && (marmoset.largeUI = false);
            a = 1;
            window.devicePixelRatio && (2 < window.devicePixelRatio ? a = 4 : 1 < window.devicePixelRatio && (a = 2));
            marmoset.largeUI && 4 > a && (a *= 2);
            let c = marmoset.largeUI ? 0.3 : 0.5;
            this.stripText = [];
            for (let b = 0; b < this.stripData.labels.length; ++b) {
                this.stripText[b] = document.createElement("div");
                this.stripText[b].style.position = "absolute";
                this.stripText[b].style.cursor = "pointer";
                this.stripText[b].style.pointerEvents = "none";
                this.container.appendChild(this.stripText[b]);
                let d = document.createElement("div");
                d.style.color = "white";
                d.style.opacity = "0.5";
                d.style.fontFamily = "Arial";
                d.style.textShadow = "2px 2px 3px #000000";
                d.innerHTML = this.stripData.labels[b];
                this.stripText[b].appendChild(d);
                this.stripText[b].txt = d;
                d = document.createElement("div");
                d.style.width = "10000px";
                d.style.height = "2px";
                d.style.backgroundColor = "#AAAAAA";
                d.style.opacity = "1";
                d.style.position = "absolute";
                d.style.left = d.style.top = "-1px";
                this.stripText[b].appendChild(d);
                this.stripText[b].line = d
            }
            this.sigCluster = document.createElement("div");
            this.sigCluster.style.position = "absolute";
            this.sigCluster.style.right = marmoset.largeUI ? "12px" : "9px";
            this.sigCluster.style.left = "0px";
            this.sigCluster.style.top = "6px";
            this.sigCluster.style.height = marmoset.largeUI ? "64px" : "32px";
            this.logo = document.createElement("div");
            this.logo.style.position = "absolute";
            this.logo.style.right = marmoset.largeUI ? "-4px" : "1px";
            this.logo.style.top = marmoset.largeUI ? "0px" : "4px";
            this.logo.title = "Made with Marmoset Toolbag";
            let e = document.createElement("input");
            e.type = "image";
            e.src = marmoset.dataLocale + "logo" + a + "x.png";
            e.style.border = "none";
            e.style.width = e.style.height = marmoset.largeUI ? "72px" : "36px";
            e.style.border = "0px";
            e.style.outline = "0px";
            e.style.opacity = c + "";
            e.onmouseover = function () {
                this.style.opacity = 1
            }.bind(e);
            e.onmouseout = function () {
                this.style.opacity = c
            }.bind(e);
            e.onmouseover = function () {
                this.style.opacity = 1
            }.bind(e);
            e.onmouseout = function () {
                this.style.opacity = c
            }.bind(e);
            e.onclick = function (a) {
                window.open("http://www.marmoset.co/viewer?utm_source=inapp&utm_medium=menu&utm_campaign=viewer", "_blank");
                this.style.opacity = c
            }.bind(e, this);
            b = new XMLHttpRequest;
            b.open("HEAD", e.src, true);
            b.onload = function (a) {
                this.logo.appendChild(a)
            }.bind(this, e);
            b.send();
            this.sigCluster.appendChild(this.logo);
            b = this.viewer.scene.metaData;
            b.title = UI.sanitize(b.title);
            b.subtitle = UI.sanitize(b.subtitle);
            b.author = UI.sanitize(b.author);
            b.link = UI.sanitizeURL(b.link);
            let f = b.title && 0 < b.title.length
                , d = b.subtitle && 0 < b.subtitle.length
                , e = b.author && 0 < b.author.length
                , g = b.link && 0 < b.link.length;
            if (f || d || e) {
                f || (b.title = "Art");
                let h = !f && !d
                    , k = document.createElement("div");
                k.style.position = "absolute";
                k.style.right = marmoset.largeUI ? "74px" : "46px";
                k.style.top = "5px";
                k.style.width = "1px";
                k.style.height = marmoset.largeUI ? h ? "21px" : "35px" : h ? "18px" : "31px";
                k.style.opacity = 0.25;
                k.style.backgroundColor = "white";
                this.sigCluster.appendChild(k);
                this.sigCluster.line = k;
                h = document.createElement("a");
                g && (h.href = b.link);
                h.style.position = "absolute";
                h.style.right = marmoset.largeUI ? "86px" : "58px";
                h.style.top = "6px";
                h.style.textAlign = "right";
                h.style.color = "white";
                h.style.fontFamily = "Arial";
                h.style.fontSize = marmoset.largeUI ? "14px" : "12px";
                h.style.textDecoration = "none";
                h.target = "_blank";
                k = document.createElement("font");
                k.style.color = "#FFFFFF";
                k.style.opacity = 0.5;
                k.style.textDecoration = "none";
                k.style.textShadow = "1px 1px 2px rgba(0,0,0,0.7)";
                k.innerHTML = b.title;
                e && (k.innerHTML = f && !d ? k.innerHTML + "<br>by " : k.innerHTML + " by ");
                h.appendChild(k);
                f = document.createElement("font");
                f.style.color = "#FF0044";
                f.style.opacity = 1;
                f.style.textShadow = "1px 1px 2px rgba(0,0,0,0.35)";
                f.innerHTML = b.author;
                h.appendChild(f);
                e = document.createElement("font");
                e.style.color = "#FFFFFF";
                e.style.opacity = 0.5;
                e.style.textShadow = "1px 1px 2px rgba(0,0,0,0.7)";
                d && (e.innerHTML = "<br>",
                    e.innerHTML += b.subtitle);
                h.appendChild(e);
                g && (h.onmouseover = function (a, b, c) {
                    a.style.opacity = c.style.opacity = 1;
                    b.style.textDecoration = "underline"
                }.bind(h, k, f, e),
                    h.onmouseout = function (a, b, c) {
                        a.style.opacity = c.style.opacity = 0.5;
                        b.style.textDecoration = "none"
                    }.bind(h, k, f, e));
                this.sigCluster.appendChild(h);
                this.sigCluster.sceneTitle = h
            }
            this.container.appendChild(this.sigCluster);
            this.sigCluster.active = true;
            this.sigCluster.toggle = function () {
                this.sceneTitle && this.line && (this.active ? (this.removeChild(this.sceneTitle),
                    this.removeChild(this.line)) : (this.appendChild(this.sceneTitle),
                        this.appendChild(this.line)));
                this.active = !this.active
            }.bind(this.sigCluster);
            this.helpOverlay = document.createElement("div");
            this.helpOverlay.style.pointerEvents = "none";
            this.container.appendChild(this.helpOverlay);
            this.hideSigOnHelp = b = 450 > this.container['width'];
            this.hideSigOnStrips = true;
            f = [8, 8];
            b ? (d = 198 + 2 * f[0],
                e = 258 + 2 * f[1]) : (d = 354 + 2 * f[0],
                    e = 218 + 2 * f[1]);
            g = document.createElement("div");
            g.style.position = "absolute";
            g.style.width = g.style.height = "100%";
            this.helpOverlay.contents = g;
            g = document.createElement("div");
            g.style.position = "absolute";
            g.style.right = marmoset.largeUI ? "92px" : "54px";
            g.style.top = b ? "16px" : "48px";
            g.style.width = d + "px";
            g.style.height = e + "px";
            this.helpOverlay.contents.appendChild(g);
            e = document.createElement("div");
            e.style.position = "absolute";
            e.style.width = "100%";
            e.style.height = "100%";
            e.style.backgroundColor = "black";
            e.style.opacity = "0.65";
            e.style.borderRadius = "16px";
            g.appendChild(e);
            e = document.createElement("input");
            e.type = "button";
            e.value = "x";
            e.style.position = "absolute";
            e.style.color = "#FFFFFF";
            e.style.fontWeight = "bolder";
            e.style.backgroundColor = "rgba(0,0,0,0.0)";
            e.style.border = "0px";
            e.style.outline = "0px";
            e.style.fontSize = marmoset.largeUI ? "16pt" : "10pt";
            e.style.right = marmoset.largeUI ? "2px" : "8px";
            e.style.top = marmoset.largeUI ? "0px" : "4px";
            e.style.width = e.style.height = marmoset.largeUI ? "32px" : "16px";
            e.style.pointerEvents = "auto";
            e.style.cursor = "pointer";
            e.onclick = function (a) {
                this.helpOverlay.toggle();
                this.refreshUI()
            }.bind(this, e);
            g.appendChild(e);
            e = document.createElement("center");
            e.style.position = "absolute";
            e.style.left = f[0] - 4 + "px";
            e.style.right = f[0] + 4 + "px";
            e.style.top = e.style.bottom = f[1] + "px";
            e.style.paddingTop = "8px";
            b || (e.style.paddingRight = "8px");
            g.appendChild(e);
            g = e;
            f = (this.viewer.mobile ? "M" : "PC") + (2 < a ? 4 : 2) + "x.png";
            e = document.createElement("img");
            e.src = marmoset.dataLocale + "helprotate" + f;
            e.style.width = "66px";
            e.style.height = "90px";
            g.appendChild(e);
            e = document.createElement("img");
            e.src = marmoset.dataLocale + "helpzoom" + f;
            e.style.width = "66px";
            e.style.height = "90px";
            g.appendChild(e);
            e = document.createElement("img");
            e.src = marmoset.dataLocale + "helpmove" + f;
            e.style.width = "66px";
            e.style.height = "90px";
            g.appendChild(e);
            e = document.createElement("img");
            e.src = marmoset.dataLocale + "helpreset" + f;
            e.style.width = "66px";
            e.style.height = "90px";
            g.appendChild(e);
            e = document.createElement("img");
            e.src = marmoset.dataLocale + "helplights" + f;
            e.style.position = "relative";
            b || (e.style.left = "8px");
            e.style.width = "66px";
            e.style.height = "90px";
            g.appendChild(e);
            f = document.createElement("a");
            f.href = "http://www.marmoset.co/viewer?utm_source=inapp&utm_medium=menu&utm_campaign=viewer";
            f.target = "_blank";
            f.style.pointerEvents = "auto";
            g.appendChild(f);
            h = document.createElement("img");
            h.src = marmoset.dataLocale + "helpshadow.png";
            h.style.position = "absolute";
            h.style.left = 0.5 * d - (b ? 65 : 116) + "px";
            h.style.bottom = b ? "6px" : "8px";
            h.style.width = b ? "116px" : "232px";
            h.style.opacity = 0;
            f.appendChild(h);
            h.targetOpacity = 0;
            f.onmouseover = function () {
                this.targetOpacity = 0.65
            }.bind(h);
            f.onmouseout = function () {
                this.targetOpacity = 0
            }.bind(h);
            window.setInterval(function () {
                this.style.opacity = 0.1 * this.targetOpacity + 0.9 * this.style.opacity
            }.bind(h), 20);
            e = document.createElement("img");
            e.src = marmoset.dataLocale + "helptitle.png";
            e.style.position = "absolute";
            e.style.left = 0.5 * d - (b ? 65 : 116) + "px";
            e.style.bottom = b ? "8px" : "12px";
            e.style.width = b ? "116px" : "232px";
            f.appendChild(e);
            d = document.createElement("div");
            d.style.position = "absolute";
            d.style.left = 0;
            d.style.right = b ? "30px" : "108px";
            d.style.bottom = b ? "-4px" : "4px";
            d.style.textAlign = "right";
            d.style.fontFamilly = "Arial";
            g.appendChild(d);
            b = document.createElement("font");
            b.style.fontSize = "9pt";
            b.style.fontFamily = "Arial";
            d.appendChild(b);
            f = document.createElement("a");
            f.style.color = "#FF0044";
            f.style.textDecoration = "none";
            f.style.pointerEvents = "auto";
            f.innerHTML = "www.marmoset.co/viewer";
            f.href = "http://www.marmoset.co/viewer?utm_source=inapp&utm_medium=menu&utm_campaign=viewer";
            f.target = "_blank";
            f.onmouseover = function (a) {
                this.style.textDecoration = "underline";
                a.targetOpacity = 0.65
            }.bind(f, h);
            f.onmouseout = function (a) {
                this.style.textDecoration = "none";
                a.targetOpacity = 0
            }.bind(f, h);
            b.appendChild(f);
            this.helpOverlay.active = false;
            this.helpOverlay.toggle = function (a) {
                this.active ? this.removeChild(this.contents) : this.appendChild(this.contents);
                this.active = !this.active
            }.bind(this.helpOverlay, this.viewer);
            this.menuCluster = document.createElement("div");
            this.menuCluster.style.position = "absolute";
            this.menuCluster.style.right = marmoset.largeUI ? "4px" : "8px";
            this.menuCluster.style.top = marmoset.largeUI ? "70px" : "40px";
            marmoset.largeUI ? (this.menuCluster.style.width = "72px",
                this.menuCluster.style.height = "64px") : (this.menuCluster.style.width = "36px",
                    this.menuCluster.style.height = "36px");
            g = document.createElement("div");
            g.style.left = g.style.top = "0px";
            g.style.width = g.style.height = "100%";
            this.menuCluster['contents'] = g;
            this.menuCluster.appendChild(g);
            b = 0;
            d = function (a, b, c, d, e) {
                let f = document.createElement("input");
                f.type = "image";
                f.src = marmoset.dataLocale + c;
                f.style.position = "absolute";
                f.style.left = "0px";
                f.style.bottom = -100 * d + "%";
                f.style.border = "none";
                f.style.outline = "0px";
                f.title = b;
                f.style.opacity = e;
                marmoset.largeUI ? (f.style.width = "64px",
                    f.style.height = "48px") : (f.style.width = "32px",
                        f.style.height = "24px");
                f.onmouseover = function (a) {
                    this.style.opacity = a
                }.bind(f, 1);
                f.onmouseout = function (a) {
                    this.style.opacity = a
                }.bind(f, e);
                f.onmouseup = function (a) {
                    this.style.opacity = a
                }.bind(f, e);
                b = new XMLHttpRequest;
                b.open("HEAD", f.src, true);
                b.onload = function (a) {
                    a.appendChild(this)
                }.bind(f, a);
                b.send();
                return f
            }
                ;
            FullScreen.support() && (g = d(this.menuCluster['contents'], "Full Screen", "fullscreen" + a + "x.png", b++, c),
                g.onclick = function (a) {
                    FullScreen.active() ? FullScreen.end() : FullScreen.begin(this.viewer.domRoot, this.viewer.fullscreenChange.bind(this.viewer));
                    a.style.opacity = c;
                    this.refreshUI()
                }.bind(this, g));
            g = d(this.menuCluster['contents'], "Layer Views", "strips" + a + "x.png", b++, c);
            g.onclick = function (a) {
                this.stripData.toggleMenu();
                this.helpOverlay.active && this.helpOverlay.toggle();
                this.viewer.wake();
                this.refreshUI()
            }.bind(this, g);
            g = d(this.menuCluster['contents'], "Help", "help" + a + "x.png", b++, c);
            g.onclick = function (a) {
                this.stripData.selectedStrip == this.stripData.STRIP_MENU && this.stripData.toggleMenu();
                this.helpOverlay.toggle();
                this.refreshUI()
            }.bind(this, g);
            this.guiScreen && this.guiScreen.setupActiveView(this);
            this.container.appendChild(this.menuCluster);
            this.menuCluster.active = true;
            this.menuCluster.toggle = function () {
                this.active ? this.removeChild(this.contents) : this.appendChild(this.contents);
                this.active = !this.active
            }.bind(this.menuCluster);
            void 0 !== marmoset.hostImage && (marmoset.hostURL && (f = document.createElement("a"),
                f.href = marmoset.hostURL,
                f.target = "_blank"),
                e = document.createElement("img"),
                e.src = marmoset.hostImage,
                e.style.position = "absolute",
                e.style.top = "4px",
                e.style.left = "4px",
                e.style.opacity = 0.65,
                e.style["-webkit-transform"] = e.style.transform = "translate(-50%,-50%) scale(0.5,0.5) translate(50%,50%)",
                marmoset.hostURL ? (e.onmouseover = function () {
                    this.style.opacity = 1
                }.bind(e),
                    e.onmouseout = function () {
                        this.style.opacity = 0.5
                    }.bind(e),
                    f.appendChild(e),
                    this.hostLogo = f) : this.hostLogo = e,
                b = new XMLHttpRequest,
                b.open("HEAD", e.src, true),
                b.onload() {
                this.container.appendChild(this.hostLogo)
            }.bind(this),
                b.send());
            this.sceneStats = document.createElement("text");
            this.sceneStats.style.position = "absolute";
            this.sceneStats.style.left = "9px";
            this.sceneStats.style.bottom = "8px";
            this.sceneStats.style.color = "gray";
            this.sceneStats.style.fontFamily = "Arial";
            this.sceneStats.style.fontSize = "75%";
            for (d = b = a = 0; d < this.viewer.scene.meshes.length; ++d)
                g = this.viewer.scene.meshes[d],
                    a += g.indexCount / 3,
                    b += g.vertexCount;
            this.sceneStats.innerHTML = "Triangles: " + (a | 0).toLocaleString() + "<br>Vertices: " + (b | 0).toLocaleString();
            marmoset.showFrameTime && (this.frameTimer = document.createElement("text"),
                this.frameTimer.style.position = "absolute",
                this.frameTimer.style.left = this.frameTimer.style.top = "5px",
                this.frameTimer.style.color = "gray",
                this.frameTimer.style.fontSize = "75%",
                this.container.appendChild(this.frameTimer),
                this.frameTimer.innerHTML = "--",
                this.frameCount = 1E20);
            this.animateStrips()
        }
    }
    removeChild(sceneTitle: any) {
        throw new Error("Method not implemented.");
    }
    appendChild(sceneTitle: any) {
        throw new Error("Method not implemented.");
    }
    contents(contents: any) {
        throw new Error("Method not implemented.");
    }

    refreshUI() {
        if (this.sigCluster) {
            let a = false
                , c = this.stripData.selectedStrip == this.stripData.STRIP_MENU;
            this.hideSigOnStrips && (a = a || c);
            this.hideSigOnHelp && (a = a || this.helpOverlay.active);
            this.sigCluster.active == a && this.sigCluster.toggle()
        }
    }
    signalLoadProgress(a, c) {
        if (this.thumbnail) {
            if (!this.progressBar) {
                let b = document.createElement("div");
                b.style.backgroundColor = "rgb(30,30,30)";
                b.style.opacity = 0.5;
                b.style.position = "absolute";
                b.style.left = "20%";
                b.style.width = "60%";
                b.style.bottom = "30%";
                b.style.height = "2px";
                this.progressBar = document.createElement("div");
                this.progressBar.style.backgroundColor = "white";
                this.progressBar.style.position = "absolute";
                this.progressBar.style.left = this.progressBar.style.bottom = "0px";
                this.progressBar.style.height = "100%";
                this.progressBar.style.width = "0px";
                b.appendChild(this.progressBar);
                this.container.appendChild(b);
                this.playButton && (this.container.removeChild(this.playButton),
                    delete this.playButton)
            }
            this.progressBar.style.width = 0 >= c ? (100 * a / (2097152 + a) | 0) + "%" : (100 * a / c | 0) + "%"
        }
    }
    animating() {
        return !!this.fadeThumbnail || !!this.frameTimer
    }
    animate() {
        this.fadeThumbnail && (this.fadeThumbnailTimer = this.fadeThumbnailTimer || Date.now(),
            this.fadeThumbnail.style.opacity = 1 - 0.0015 * (Date.now() - this.fadeThumbnailTimer),
            0.01 > this.fadeThumbnail.style.opacity && (this.container.removeChild(this.fadeThumbnail),
                delete this.fadeThumbnail,
                delete this.fadeThumbnailTimer));
        if (this.frameTimer && (this.frameCount++,
            60 <= this.frameCount)) {
            let a = (new Date).getTime();
            if (void 0 !== this.frameTime) {
                let c = (a - this.frameTime) / this.frameCount
                    , c = Math.floor(100 * c) / 100;
                this.frameTimer.innerHTML = c + " ms";
                this.frameTimer.style.color = 32 > c ? "green" : "red"
            }
            this.frameCount = 0;
            this.frameTime = a
        }
        this.guiScreen && this.guiScreen.playbackControls && (a = this.guiScreen.playbackControls.timelineSlider,
            a.draggingSlider ? this.viewer.scene.sceneAnimator.setAnimationProgress(a.sliderPercent, true) : a.setSliderPercent(this.viewer.scene.sceneAnimator.animationProgress));
        if (this.sceneStats) {
            for (let b = c = a = 0; b < this.viewer.scene.meshes.length; ++b)
                let d = this.viewer.scene.meshes[b]
                    , a = a + d.indexCount / 3
                    , c = c + d.vertexCount;
            this.sceneStats.innerHTML = "Triangles: " + (a | 0).toLocaleString() + "<br>Vertices: " + (c | 0).toLocaleString();
            this.viewer.scene.sceneAnimator && this.viewer.scene.sceneAnimator.showPlayControls && (this.sceneStats.innerHTML += "<br><br><br><br>");
            a = !!this.sceneStats.parentElement;
            c = this.stripData.active() || false;
            a && !c ? (this.container.removeChild(this.sceneStats),
                this.hostLogo && this.container.appendChild(this.hostLogo)) : !a && c && (this.container.appendChild(this.sceneStats),
                    this.hostLogo && this.container.removeChild(this.hostLogo))
        }
        this.refreshUI();
        if (this.stripData.animationActive || this.stripData.active())
            this.animateStrips(),
                this.stripData.animationActive && this.viewer.wake()
    }
    animateStrips() {
        if (this.stripText)
            for (let a = Math.atan(this.viewer.canvas.height / this.viewer.canvas.width / this.stripData.stripSlant), c = 0; c < this.stripData.labels.length; ++c) {
                let b = this.stripData.strips[c]
                    , b = b - this.stripData.stripSlant
                    , b = 0.5 + 0.5 * b;
                c == this.stripData.selectedStrip ? (this.stripText[c].style["-ms-transform"] = this.stripText[c].style["-webkit-transform"] = this.stripText[c].style.transform = "none",
                    this.stripText[c].style.top = "4px",
                    this.stripText[c].style.left = "0px",
                    this.stripText[c].style.width = "150px",
                    this.stripText[c].txt.style.textAlign = "center",
                    this.stripText[c].txt.style.background = "rgba(0, 0, 0, 0.75)",
                    this.stripText[c].txt.style.background = "-webkit-linear-gradient(left, rgba(0,0,0,0.75), rgba(0,0,0,0))",
                    this.stripText[c].txt.style.background = "-o-linear-gradient(left,      rgba(0,0,0,0.75), rgba(0,0,0,0))",
                    this.stripText[c].txt.style.background = "-moz-linear-gradient(left,    rgba(0,0,0,0.75), rgba(0,0,0,0))",
                    this.stripText[c].txt.style.background = "linear-gradient(left,         rgba(0,0,0,0.75), rgba(0,0,0,0))",
                    this.stripText[c].txt.style.paddingLeft = "32px",
                    this.stripText[c].txt.style.paddingTop = "6px",
                    this.stripText[c].txt.style.paddingBottom = "4px",
                    this.stripText[c].txt.style.textShadow = "1px 1px 2px rgba(0,0,0,0.7)",
                    this.stripText[c].line.style.opacity = 0.5,
                    this.stripText[c].line.style.top = "100%",
                    this.stripText[c].line.style.width = "100%",
                    this.stripText[c].line.style.height = "1px") : (this.stripText[c].style["-ms-transform"] = this.stripText[c].style["-webkit-transform"] = this.stripText[c].style.transform = "translate(-50%, -50%) rotate(" + a + "rad) translate(50%, 50%)",
                        this.stripText[c].style.left = 100 * b + "%",
                        this.stripText[c].style.top = "0px",
                        this.stripText[c].style.width = "85px",
                        this.stripText[c].txt.style.textAlign = "left",
                        this.stripText[c].txt.style.background = "none",
                        this.stripText[c].txt.style.paddingLeft = "8px",
                        this.stripText[c].txt.style.paddingTop = "6px",
                        this.stripText[c].txt.style.paddingBottom = "4px",
                        this.stripText[c].txt.style.textShadow = "2px 0px 3px rgba(0,0,0,0.7)",
                        this.stripText[c].line.style.opacity = 1,
                        this.stripText[c].line.style.top = "-1px",
                        this.stripText[c].line.style.width = "10000px",
                        this.stripText[c].line.style.height = "2px")
            }
    }
}
