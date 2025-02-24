import { Object3D } from './object';
import { mainProgram, gl } from '../webgl';
import { mat4, vec3, vec4 } from 'gl-matrix';

export class Light extends Object3D {
  public constructor(
    public position = vec3.fromValues(0, 2, -5),
    public shininess = 32,
    public color = vec3.fromValues(1, 1, 1),
    public ambient = 0.2,
    public lookAt = vec3.fromValues(0, 0, 0),
    public fovy = Math.PI / 1.5,
    public aspect = 1,
    public near = 0.1,
    public far = 100
  ) {
    super(position);
  }

  public prepareToRender(viewMatrix: mat4): void {
    if (mainProgram.isActive) {
      const position = vec4.fromValues(
        this.position[0],
        this.position[1],
        this.position[2],
        1
      );
      const viewPosition = vec4.create();
      vec4.transformMat4(viewPosition, position, viewMatrix);

      const uLightPosition = mainProgram.getUniform('uLight.position');
      const uLightColor = mainProgram.getUniform('uLight.color');
      const uLightShininess = mainProgram.getUniform('uLight.shininess');
      const uLightAmbient = mainProgram.getUniform('uLight.ambient');

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

  public getLightViewProjectionMatrix(): mat4 {
    const lightProjectionMatrix = mat4.create();
    mat4.perspective(
      lightProjectionMatrix,
      this.fovy,
      this.aspect,
      this.near,
      this.far
    );

    const lightViewMatrix = mat4.create();
    mat4.lookAt(
      lightViewMatrix,
      [this.position[0], this.position[1], this.position[2]],
      [this.lookAt[0], this.lookAt[1], this.lookAt[2]],
      [0, this.position[1] + 1, 0]
    );

    const lightViewProjectionMatrix = mat4.create();
    mat4.multiply(
      lightViewProjectionMatrix,
      lightProjectionMatrix,
      lightViewMatrix
    );

    return lightViewProjectionMatrix;
  }
}
