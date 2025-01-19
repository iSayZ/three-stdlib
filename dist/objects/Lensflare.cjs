"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const THREE = require("three");
const Lensflare = /* @__PURE__ */ (() => {
  class Lensflare2 extends THREE.Mesh {
    constructor() {
      super(Lensflare2.Geometry, new THREE.MeshBasicMaterial({ opacity: 0, transparent: true }));
      this.isLensflare = true;
      this.type = "Lensflare";
      this.frustumCulled = false;
      this.renderOrder = Infinity;
      const positionScreen = new THREE.Vector3();
      const positionView = new THREE.Vector3();
      const tempMap = new THREE.Texture({ width: 16, height: 16 });
      tempMap.isFramebufferTexture = true;
      tempMap.magFilter = THREE.NearestFilter;
      tempMap.minFilter = THREE.NearestFilter;
      tempMap.generateMipmaps = false;
      tempMap.needsUpdate = true;
      const occlusionMap = new THREE.Texture({ width: 16, height: 16 });
      occlusionMap.isFramebufferTexture = true;
      occlusionMap.magFilter = THREE.NearestFilter;
      occlusionMap.minFilter = THREE.NearestFilter;
      occlusionMap.generateMipmaps = false;
      occlusionMap.needsUpdate = true;
      const geometry = Lensflare2.Geometry;
      const material1a = new THREE.RawShaderMaterial({
        uniforms: {
          scale: { value: null },
          screenPosition: { value: null }
        },
        vertexShader: (
          /* glsl */
          `

				precision highp float;

				uniform vec3 screenPosition;
				uniform vec2 scale;

				attribute vec3 position;

				void main() {

					gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );

				}`
        ),
        fragmentShader: (
          /* glsl */
          `

				precision highp float;

				void main() {

					gl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );

				}`
        ),
        depthTest: true,
        depthWrite: false,
        transparent: false
      });
      const material1b = new THREE.RawShaderMaterial({
        uniforms: {
          map: { value: tempMap },
          scale: { value: null },
          screenPosition: { value: null }
        },
        vertexShader: (
          /* glsl */
          `

				precision highp float;

				uniform vec3 screenPosition;
				uniform vec2 scale;

				attribute vec3 position;
				attribute vec2 uv;

				varying vec2 vUV;

				void main() {

					vUV = uv;

					gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );

				}`
        ),
        fragmentShader: (
          /* glsl */
          `

				precision highp float;

				uniform sampler2D map;

				varying vec2 vUV;

				void main() {

					gl_FragColor = texture2D( map, vUV );

				}`
        ),
        depthTest: false,
        depthWrite: false,
        transparent: false
      });
      const mesh1 = new THREE.Mesh(geometry, material1a);
      const elements = [];
      const shader = LensflareElement.Shader;
      const material2 = new THREE.RawShaderMaterial({
        uniforms: {
          map: { value: null },
          occlusionMap: { value: occlusionMap },
          color: { value: new THREE.Color(16777215) },
          scale: { value: new THREE.Vector2() },
          screenPosition: { value: new THREE.Vector3() }
        },
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });
      const mesh2 = new THREE.Mesh(geometry, material2);
      this.addElement = function(element) {
        elements.push(element);
      };
      const scale = new THREE.Vector2();
      const screenPositionPixels = new THREE.Vector2();
      const validArea = new THREE.Box2();
      const viewport = new THREE.Vector4();
      this.onBeforeRender = function(renderer, scene, camera) {
        renderer.getCurrentViewport(viewport);
        const invAspect = viewport.w / viewport.z;
        const halfViewportWidth = viewport.z / 2;
        const halfViewportHeight = viewport.w / 2;
        let size = 16 / viewport.w;
        scale.set(size * invAspect, size);
        validArea.min.set(viewport.x, viewport.y);
        validArea.max.set(viewport.x + (viewport.z - 16), viewport.y + (viewport.w - 16));
        positionView.setFromMatrixPosition(this.matrixWorld);
        positionView.applyMatrix4(camera.matrixWorldInverse);
        if (positionView.z > 0)
          return;
        positionScreen.copy(positionView).applyMatrix4(camera.projectionMatrix);
        screenPositionPixels.x = viewport.x + positionScreen.x * halfViewportWidth + halfViewportWidth - 8;
        screenPositionPixels.y = viewport.y + positionScreen.y * halfViewportHeight + halfViewportHeight - 8;
        if (validArea.containsPoint(screenPositionPixels)) {
          renderer.copyFramebufferToTexture(screenPositionPixels, tempMap);
          let uniforms = material1a.uniforms;
          uniforms["scale"].value = scale;
          uniforms["screenPosition"].value = positionScreen;
          renderer.renderBufferDirect(camera, null, geometry, material1a, mesh1, null);
          renderer.copyFramebufferToTexture(screenPositionPixels, occlusionMap);
          uniforms = material1b.uniforms;
          uniforms["scale"].value = scale;
          uniforms["screenPosition"].value = positionScreen;
          renderer.renderBufferDirect(camera, null, geometry, material1b, mesh1, null);
          const vecX = -positionScreen.x * 2;
          const vecY = -positionScreen.y * 2;
          for (let i = 0, l = elements.length; i < l; i++) {
            const element = elements[i];
            const uniforms2 = material2.uniforms;
            uniforms2["color"].value.copy(element.color);
            uniforms2["map"].value = element.texture;
            uniforms2["screenPosition"].value.x = positionScreen.x + vecX * element.distance;
            uniforms2["screenPosition"].value.y = positionScreen.y + vecY * element.distance;
            size = element.size / viewport.w;
            const invAspect2 = viewport.w / viewport.z;
            uniforms2["scale"].value.set(size * invAspect2, size);
            material2.uniformsNeedUpdate = true;
            renderer.renderBufferDirect(camera, null, geometry, material2, mesh2, null);
          }
        }
      };
      this.dispose = function() {
        material1a.dispose();
        material1b.dispose();
        material2.dispose();
        tempMap.dispose();
        occlusionMap.dispose();
        for (let i = 0, l = elements.length; i < l; i++) {
          elements[i].texture.dispose();
        }
      };
    }
  }
  const _geometry = new THREE.BufferGeometry();
  const interleavedBuffer = new THREE.InterleavedBuffer(
    new Float32Array([-1, -1, 0, 0, 0, 1, -1, 0, 1, 0, 1, 1, 0, 1, 1, -1, 1, 0, 0, 1]),
    5
  );
  _geometry.setIndex([0, 1, 2, 0, 2, 3]);
  _geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
  _geometry.setAttribute("uv", new THREE.InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));
  Lensflare2.Geometry = _geometry;
  return Lensflare2;
})();
const LensflareElement = /* @__PURE__ */ (() => {
  class LensflareElement2 {
    constructor(texture, size = 1, distance = 0, color = new THREE.Color(16777215)) {
      this.texture = texture;
      this.size = size;
      this.distance = distance;
      this.color = color;
    }
  }
  LensflareElement2.Shader = {
    uniforms: {
      map: { value: null },
      occlusionMap: { value: null },
      color: { value: null },
      scale: { value: null },
      screenPosition: { value: null }
    },
    vertexShader: (
      /* glsl */
      `

      precision highp float;

      uniform vec3 screenPosition;
      uniform vec2 scale;

      uniform sampler2D occlusionMap;

      attribute vec3 position;
      attribute vec2 uv;

      varying vec2 vUV;
      varying float vVisibility;

      void main() {

        vUV = uv;

        vec2 pos = position.xy;

        vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );
        visibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );
        visibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );
        visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );
        visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );
        visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );
        visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );
        visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );
        visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );

        vVisibility =        visibility.r / 9.0;
        vVisibility *= 1.0 - visibility.g / 9.0;
        vVisibility *=       visibility.b / 9.0;

        gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );

      }
    `
    ),
    fragmentShader: (
      /* glsl */
      `

      precision highp float;

      uniform sampler2D map;
      uniform vec3 color;

      varying vec2 vUV;
      varying float vVisibility;

      void main() {

        vec4 texture = texture2D( map, vUV );
        texture.a *= vVisibility;
        gl_FragColor = texture;
        gl_FragColor.rgb *= color;

      }
    `
    )
  };
  return LensflareElement2;
})();
exports.Lensflare = Lensflare;
exports.LensflareElement = LensflareElement;
//# sourceMappingURL=Lensflare.cjs.map
