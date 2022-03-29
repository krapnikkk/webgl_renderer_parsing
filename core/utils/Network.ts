export default class Network {
    static fetchImage(url: string, complete: (image:HTMLImageElement)=>void, onerror?: Function) {
        var image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload = function () {
            0 < image.width && 0 < image.height ? complete(image) : onerror && onerror()
        };
        image.onerror = function () {
            onerror();
        }
        image.src = url;
    }

    static fetchText(url: string, complete: Function, onerror?: Function, onprogress?: Function) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function () {
            200 == xhr.status ? complete(xhr.responseText) : onerror && onerror()
        };
        onerror && (xhr.onerror = function () {
            onerror()
        }
        );
        onprogress && (xhr.onprogress = function (a) {
            onprogress(a.loaded, a.total)
        }
        );
        xhr.send()
    }

    static fetchBinary(url: string, complete: Function, onerror?: Function, onprogress?: Function) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function () {
            200 == xhr.status ? complete(xhr.response) : onerror && onerror()
        };
        onerror && (xhr.onerror = function () {
            onerror()
        });
        onprogress && (xhr.onprogress = function (a) {
            onprogress(a.loaded, a.total)
        }
        );
        xhr.send()
    }

    static fetchBinaryIncremental(url: string, complete: Function, onerror?: Function, range?: number) {
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", url, true);
        xhr.onload = function () {
            if (200 == xhr.status) {
                var f = xhr.getResponseHeader("Accept-Ranges");
                if (f && "none" != f) {
                    var contentLength = +xhr.getResponseHeader("Content-Length") | 0;
                    var fetchBinaryRange = function (start: number, offset: number) {
                        var f = new XMLHttpRequest();
                        f.open("GET", url, true);
                        f.setRequestHeader("Range", "bytes=" + start + "-" + offset);
                        f.responseType = "arraybuffer";
                        f.onload = function () {
                            if (206 == f.status || 200 == f.status) {
                                complete(f.response);
                                if (offset < contentLength) {
                                    start += range,
                                    offset += range;
                                    offset = offset < contentLength - 1 ? offset : contentLength - 1;
                                    fetchBinaryRange(start, offset);
                                }
                            }
                        };
                        f.send();
                    };
                    fetchBinaryRange(0, range - 1);
                } else
                    onerror && onerror();
            } else
                onerror && onerror();
        };
        onerror && (xhr.onerror = function () {
            onerror()
        }
        );
        xhr.send()
    }
}