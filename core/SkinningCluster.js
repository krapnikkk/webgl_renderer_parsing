function SkinningCluster() {
    this.associateObjectIndex = this.linkObjectIndex = this.linkMode = 0;
    this.vertexIndices = [];
    this.vertexWeights = [];
    this.matrix = Matrix.identity();
    this.defaultAssociateWorldTransform = this.defaultClusterWorldTransform = this.defaultClusterBaseTransform = 0;
    this.defaultClusterWorldTransformInvert = Matrix.identity();
    this.defaultAssociateWorldTransformInvert = Matrix.identity();
    this.debugString = ""
}
SkinningCluster.prototype.solveAdditiveClusterTransform = function (a, c, b) {
    c = Matrix.identity();
    var d = Matrix.identity()
        , e = Matrix.identity();
    Matrix.mul(c, a, this.defaultClusterBaseTransform);
    Matrix.mul(d, this.defaultAssociateWorldTransformInvert, c);
    Matrix.mul(e, this.defaultAssociateWorldTransformInvert, d);
    Matrix.mul(b, this.defaultClusterWorldTransformInvert, e)
}
    ;
SkinningCluster.prototype.solveSimpleClusterTransform = function (a, c, b) {
    var d = Matrix.identity()
        , e = Matrix.identity();
    Matrix.invert(e, c);
    Matrix.mul(d, e, a);
    Matrix.mul(b, d, this.defaultClusterBaseTransform)
}
    ;
SkinningCluster.prototype.solveClusterTransformAtFrame = function (a, c, b, d) {
    if (1 == this.linkMode) {
        var e = Matrix.identity();
        c = Matrix.identity();
        a.evaluateModelPartTransformAtFrame(this.linkObjectIndex, b, e, false);
        a.evaluateModelPartTransformAtFrame(this.associateObjectIndex, b, c, false);
        this.solveAdditiveClusterTransform(e, c, d)
    } else {
        var e = Matrix.identity()
            , f = Matrix.identity();
        a.evaluateModelPartTransformAtFrame(this.linkObjectIndex, b, e, false);
        a.evaluateModelPartTransformAtFrame(c, b, f, false);
        this.solveSimpleClusterTransform(e, f, d)
    }
}
    ;