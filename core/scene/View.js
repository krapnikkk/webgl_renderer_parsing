function View(a) {
    this.pivot = [0, 0, 0];
    this.rotation = [0, 0];
    this.radius = 1;
    this.nearPlane = 0.3;
    this.fov = 45;
    this.size = [1, 1];
    this.transform = Matrix.empty();
    this.viewMatrix = Matrix.empty();
    this.projectionMatrix = Matrix.empty();
    this.viewProjectionMatrix = Matrix.empty();
    a ? this.loadView(a, !0) : (this.saveResetView(),
        this.updateView(),
        this.updateProjection())
}
View.prototype.saveResetView = function () {
    this.resetDesc = {
        angles: [this.rotation[0], this.rotation[1]],
        pivot: [this.pivot[0], this.pivot[1], this.pivot[2]],
        limits: this.limits,
        orbitRadius: this.radius,
        fov: this.fov
    }
}
    ;
View.prototype.loadView = function (a, c) {
    a && (this.rotation[0] = a.angles[0],
        this.rotation[1] = a.angles[1],
        this.pivot[0] = a.pivot[0],
        this.pivot[1] = a.pivot[1],
        this.pivot[2] = a.pivot[2],
        this.radius = a.orbitRadius,
        this.fov = a.fov,
        this.limits = a.limits,
        c && this.saveResetView(),
        this.updateView(),
        this.updateProjection())
}
    ;
View.prototype.reset = function () {
    this.loadView(this.resetDesc)
}
    ;
View.prototype.updateView = function () {
    if (void 0 !== this.limits) {
        if (this.limits.angles) {
            var a = this.limits.angles.x
                , c = this.limits.angles.y;
            if (void 0 !== a) {
                var b = this.rotation[0] - a.offset
                    , a = Math.min(Math.max(b, a.min), a.max);
                this.rotation[0] += a - b
            }
            void 0 !== c && (b = this.rotation[1] - c.offset,
                a = Math.min(Math.max(b, c.min), c.max),
                this.rotation[1] += a - b)
        }
        void 0 !== this.limits.orbitRadius && (c = this.limits.orbitRadius.min,
            b = this.limits.orbitRadius.max,
            void 0 !== c && (this.radius = Math.max(this.radius, c)),
            void 0 !== b && (this.radius = Math.min(this.radius, b)));
        void 0 !== this.limits.pan && (c = this.limits.pan,
            b = this.resetDesc.pivot,
            c.x && (this.pivot[0] = b[0]),
            c.y && (this.pivot[1] = b[1]),
            c.z && (this.pivot[2] = b[2]))
    }
    Matrix.translation(this.transform, 0, 0, this.radius);
    c = Matrix.rotation(Matrix.empty(), this.rotation[0], 0);
    b = Matrix.rotation(Matrix.empty(), this.rotation[1], 1);
    Matrix.mul(c, b, c);
    Matrix.mul(this.transform, c, this.transform);
    this.transform[12] += this.pivot[0];
    this.transform[13] += this.pivot[1];
    this.transform[14] += this.pivot[2];
    Matrix.invert(this.viewMatrix, this.transform);
    Matrix.mul(this.viewProjectionMatrix, this.viewMatrix, this.projectionMatrix)
}
    ;
View.prototype.updateProjection = function (a) {
    Matrix.perspectiveInfinite(this.projectionMatrix, this.fov, this.size[0] / this.size[1], this.nearPlane, a);
    Matrix.mul(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix)
}
    ;