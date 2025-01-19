import { LatheGeometry, Path } from "three";
const CapsuleGeometry = /* @__PURE__ */ (() => {
  class CapsuleGeometry2 extends LatheGeometry {
    constructor(radius = 1, length = 1, capSegments = 4, radialSegments = 8) {
      const path = new Path();
      path.absarc(0, -length / 2, radius, Math.PI * 1.5, 0);
      path.absarc(0, length / 2, radius, 0, Math.PI * 0.5);
      super(path.getPoints(capSegments), radialSegments);
      this.type = "CapsuleGeometry";
      this.parameters = {
        radius,
        height: length,
        capSegments,
        radialSegments
      };
    }
    static fromJSON(data) {
      return new CapsuleGeometry2(data.radius, data.length, data.capSegments, data.radialSegments);
    }
  }
  return CapsuleGeometry2;
})();
export {
  CapsuleGeometry
};
//# sourceMappingURL=CapsuleGeometry.js.map
