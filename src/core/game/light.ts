import { Object3D } from './object';
import { currentProgram, gl } from '../webgl';
import { mat4, vec3, vec4 } from 'gl-matrix';

export class Light extends Object3D {
  public shininess = 32;
  public color = vec3.fromValues(1, 1, 1);
  public ambient = 0.2;

  public constructor() {
    super();
  }

  public prepareToRender(viewMatrix: mat4): void {
    if (gl && currentProgram) {
      const uLightPosition = currentProgram.uLightPosition;
      const uLightColor = currentProgram.uLightColor;
      const uLightShininess = currentProgram.uLightShininess;
      const uLightAmbient = currentProgram.uLightAmbient;

      const position = vec4.fromValues(
        this.position[0],
        this.position[1],
        this.position[2],
        1
      );
      const viewPosition = vec4.create();
      vec4.transformMat4(viewPosition, position, viewMatrix);

      gl.uniform3fv(
        uLightPosition,
        new Float32Array([viewPosition[0], viewPosition[1], viewPosition[2]])
      );

      gl.uniform3fv(
        uLightColor,
        new Float32Array([this.color[0], this.color[1], this.color[2]])
      );

      gl.uniform1f(uLightShininess, this.shininess);

      gl.uniform1f(uLightAmbient, this.ambient);
    }
  }
}
