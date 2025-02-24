import { Program } from './program';

export class MainProgram extends Program {
  public async init(): Promise<void> {
    const vsPath = '/src/core/webgl/shaders/base/vertex.glsl';
    const fsPath = '/src/core/webgl/shaders/base/fragment.glsl';

    this.program = await this.setProgram(vsPath, fsPath);

    this.addAttribute('aVertexPosition');
    this.addAttribute('aTextureCoordinate');
    this.addAttribute('aNormal');

    this.addUniform('uHasTexture');
    this.addUniform('uSampler');
    this.addUniform('uColor');
    this.addUniform('uViewMatrix');
    this.addUniform('uModelMatrix');
    this.addUniform('uProjectionMatrix');
    this.addUniform('uNormalMatrix');
    this.addUniform('uLight.position');
    this.addUniform('uLight.color');
    this.addUniform('uLight.shininess');
    this.addUniform('uLight.ambient');
    this.addUniform('uLightViewProjectionMatrix');
    this.addUniform('uShadowMap');
    this.addUniform('uShadowMapSize');
    this.addUniform('uHasShadows');
    this.addUniform('uTextureScale');
  }
}
