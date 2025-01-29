import { Object3D } from './object';
import { currentProgram, gl } from '../webgl';

export class Light extends Object3D {
  public constructor() {
    super();
  }

  public prepareToRender(): void {
    if (gl && currentProgram) {
      const uLightPosition = currentProgram.uLightPosition;

      gl.uniform3fv(
        uLightPosition,
        new Float32Array([this.position[0], this.position[1], this.position[2]])
      );
    }
  }
}
