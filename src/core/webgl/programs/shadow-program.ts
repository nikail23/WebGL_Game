import { gl } from '../context';
import { Program } from './program';

export class ShadowProgram extends Program {
  public async init(): Promise<void> {
    const vsPath = '/assets/shaders/shadow/vertex.glsl';
    const fsPath = '/assets/shaders/shadow/fragment.glsl';

    this.program = await this.setProgram(vsPath, fsPath);

    this.addAttribute('aVertexPosition');
    this.addUniform('uModelMatrix');
    this.addUniform('uLightViewProjectionMatrix');
  }

  public dispose(): void {
    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = null;
    }
  }
}
