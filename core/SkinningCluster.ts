import Matrix from "./math/Matrix";

export default class SkinningCluster{
    associateObjectIndex: number;
    linkObjectIndex: number;
    linkMode: number;
    vertexIndices: any[];
    vertexWeights: any[];
    matrix: Float32Array;
    defaultAssociateWorldTransform: Float32Array;
    defaultClusterWorldTransform: Float32Array;
    defaultClusterBaseTransform: Float32Array;
    defaultClusterWorldTransformInvert: Float32Array;
    defaultAssociateWorldTransformInvert: Float32Array;
    debugString: string;
    constructor() {
       this.associateObjectIndex = this.linkObjectIndex = this.linkMode = 0;
       this.vertexIndices = [];
       this.vertexWeights = [];
       this.matrix = Matrix.identity();
       this.defaultClusterWorldTransformInvert = Matrix.identity();
       this.defaultAssociateWorldTransformInvert = Matrix.identity();
       this.debugString = ""
   }
   solveAdditiveClusterTransform(a, c, b) {
       c = Matrix.identity();
       var d = Matrix.identity()
           , e = Matrix.identity();
       Matrix.mul(c, a, this.defaultClusterBaseTransform);
       Matrix.mul(d, this.defaultAssociateWorldTransformInvert, c);
       Matrix.mul(e, this.defaultAssociateWorldTransformInvert, d);
       Matrix.mul(b, this.defaultClusterWorldTransformInvert, e)
   }
   solveSimpleClusterTransform(a, c, b) {
       var d = Matrix.identity()
           , e = Matrix.identity();
       Matrix.invert(e, c);
       Matrix.mul(d, e, a);
       Matrix.mul(b, d, this.defaultClusterBaseTransform)
   }
   solveClusterTransformAtFrame(a, c, b, d) {
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

}