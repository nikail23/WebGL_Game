import { Program } from './program';

export class ShadowProgram extends Program {
  public async init(): Promise<void> {
    const vsPath = '/src/core/webgl/shaders/shadow/vertex.glsl';
    const fsPath = '/src/core/webgl/shaders/shadow/fragment.glsl';

    this.program = await this.setProgram(vsPath, fsPath);

    this.addAttribute('aVertexPosition');
    this.addUniform('uModelMatrix');
    this.addUniform('uLightViewProjectionMatrix');
  }
}
