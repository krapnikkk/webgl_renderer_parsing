function Bounds(a) {
    for (var c = 0; c < a.length; ++c) {
        var b = a[c].bounds;
        if (void 0 === this.min)
            this.min = [b.min[0], b.min[1], b.min[2]],
                this.max = [b.max[0], b.max[1], b.max[2]];
        else
            for (var d = 0; 3 > d; ++d)
                this.min[d] = Math.min(b.min[d], this.min[d]),
                    this.max[d] = Math.max(b.max[d], this.max[d])
    }
    this.min = this.min ? this.min : [0, 0, 0];
    this.max = this.max ? this.max : [0, 0, 0];
    this.center = [0.5 * (this.min[0] + this.max[0]), 0.5 * (this.min[1] + this.max[1]), 0.5 * (this.min[2] + this.max[2])];
    this.radius = [this.max[0] - this.center[0], this.max[1] - this.center[1], this.max[2] - this.center[2]];
    this.radiusDiagonal = Math.sqrt(this.radius[0] * this.radius[0] + this.radius[1] * this.radius[1] + this.radius[2] * this.radius[2])
}
;