import { Program } from './program';

export class LensFlareProgram extends Program {
  public async init(): Promise<void> {
    const vsPath = '/assets/shaders/lens-flare/vertex.glsl';
    const fsPath = '/assets/shaders/lens-flare/fragment.glsl';

    this.program = await this.setProgram(vsPath, fsPath);

    this.addAttribute('aVertexPosition');

    this.addUniform('uResolution');
    this.addUniform('uScreenTexture');
    this.addUniform('sun_position');
    this.addUniform('tint');
    this.addUniform('noise_texture');
  }
}
