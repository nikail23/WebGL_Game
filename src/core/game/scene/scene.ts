import { Camera } from '../camera';
import { Light } from '../light';
import { Model3D } from '../model';
import { Object3D } from '../object';
import { SceneData } from './scene-data';
import { SceneParams } from './scene-params';
import { gl, mainProgram, shadowProgram } from '../../webgl';
import { vec2 } from 'gl-matrix';

export class Scene {
  private _camera: Camera | null = null;
  private _models: Model3D[] = [];
  private _objects: Object3D[] = [];
  private _light: Light | null = null;

  private _shadowMapFrameBufferData: {
    frameBuffer: WebGLFramebuffer | null;
    colorTexture: WebGLTexture | null;
    depthTexture: WebGLTexture | null;
    width: number;
    height: number;
  } | null = null;
  private _shadowsEnabled = false;
  private _staticShadowMap: WebGLTexture | null = null;

  public async init(params: SceneParams): Promise<void> {
    this._camera = new Camera(
      params.camera.position,
      params.camera.rotation,
      params.camera.aspect,
      params.camera.fov,
      params.camera.near,
      params.camera.far
    );

    this._models = params.models ?? [];
    if (this._models.length) {
      await this._loadModels();
    }

    params.objects.forEach((objectParams) => {
      const model = this._models.find(
        (model) => model.name === objectParams.model
      );

      if (!model) {
        throw new Error(`Model ${objectParams.model} not found`);
      }

      this._objects.push(
        new Object3D(
          objectParams.position,
          objectParams.rotation,
          objectParams.scale,
          objectParams.textureScale,
          model,
          objectParams.strategy
        )
      );
    });

    if (params.light) {
      this._light = new Light(
        params.light.position,
        params.light.shininess,
        params.light.color,
        params.light.ambient,
        params.light.lookAt,
        params.light.fovy,
        params.light.aspect,
        params.light.near,
        params.light.far
      );
    }

    this._shadowsEnabled = params.shadows.enabled;
    if (this._shadowsEnabled) {
      this._shadowMapFrameBufferData = this._createFrameBufferObject(
        params.shadows?.width ?? 1024,
        params.shadows?.height ?? 1024
      );

      this._shadowsEnabled = !!this._shadowMapFrameBufferData && !!this._light;
    }
  }

  public async render(): Promise<void> {
    if (this._camera) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const uProjectionMatrix = mainProgram.getUniform('uProjectionMatrix');
      const uHasShadows = mainProgram.getUniform('uHasShadows');

      gl.uniformMatrix4fv(
        uProjectionMatrix,
        false,
        this._camera.projectionMatrix
      );
      gl.uniform1f(uHasShadows, this._shadowsEnabled ? 1 : 0);

      if (this._shadowsEnabled) {
        await this._prepareShadows();
      }

      await this._renderScene();
    }
  }

  public update(deltaTime: number): void {
    const sceneData = this._getSceneData();

    this._camera?.update(deltaTime, sceneData);

    this._objects.forEach((object) => object.update(deltaTime, sceneData));
  }

  private async _loadModels(): Promise<void> {
    for (const model of this._models) {
      await model.load();
    }
  }

  private async _prepareShadows(): Promise<void> {
    const data = this._shadowMapFrameBufferData!;
    const light = this._light!;

    if (!this._staticShadowMap) {
      this._staticShadowMap = await this._renderStaticShadowMap(
        data.width,
        data.height
      );

      const uShadowMap = mainProgram.getUniform('uShadowMap');

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this._staticShadowMap);
      gl.uniform1i(uShadowMap, 1);
    }

    const uLightViewProjectionMatrix = mainProgram.getUniform(
      'uLightViewProjectionMatrix'
    );
    const uShadowMapSize = mainProgram.getUniform('uShadowMapSize');

    gl.uniformMatrix4fv(
      uLightViewProjectionMatrix,
      false,
      light.getLightViewProjectionMatrix()
    );
    gl.uniform2fv(uShadowMapSize, vec2.fromValues(data.width, data.height));
  }

  private _createFrameBufferObject(width: number, height: number) {
    let frame_buffer: WebGLFramebuffer | null;
    let color_buffer: WebGLTexture | null;
    let depth_buffer: WebGLTexture | null;
    let status: number;

    function _errors(buffer: WebGLFramebuffer | null, buffer_name: string) {
      var error_name = gl.getError();
      if (!buffer || error_name !== gl.NO_ERROR) {
        console.error(
          'Error in _createFrameBufferObject,',
          buffer_name,
          'failed; ',
          error_name
        );

        gl.deleteTexture(color_buffer);
        gl.deleteFramebuffer(frame_buffer);

        return true;
      }
      return false;
    }

    frame_buffer = gl.createFramebuffer();
    if (_errors(frame_buffer, 'frame buffer')) {
      return null;
    }

    color_buffer = gl.createTexture();
    if (_errors(color_buffer, 'color buffer')) {
      return null;
    }
    gl.bindTexture(gl.TEXTURE_2D, color_buffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    if (_errors(color_buffer, 'color buffer allocation')) {
      return null;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    depth_buffer = gl.createTexture();
    if (_errors(depth_buffer, 'depth buffer')) {
      return null;
    }
    gl.bindTexture(gl.TEXTURE_2D, depth_buffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT24,
      width,
      height,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_INT,
      null
    );
    if (_errors(depth_buffer, 'depth buffer allocation')) {
      return null;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, frame_buffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      color_buffer,
      0
    );
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      depth_buffer,
      0
    );
    if (_errors(frame_buffer, 'frame buffer')) {
      return null;
    }

    status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      _errors(frame_buffer, 'frame buffer status:' + status.toString());
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {
      frameBuffer: frame_buffer,
      colorTexture: color_buffer,
      depthTexture: depth_buffer,
      width,
      height,
    };
  }

  private async _renderStaticShadowMap(
    width: number,
    height: number
  ): Promise<WebGLTexture | null> {
    if (!this._light) {
      console.warn('GAME_renderShadowMap: Light is not initialized!');
      return null;
    }

    if (!this._shadowMapFrameBufferData) {
      console.warn('GAME_renderShadowMap: Shadow map data is not initialized!');
      return null;
    }

    shadowProgram.use();

    gl.bindFramebuffer(
      gl.FRAMEBUFFER,
      this._shadowMapFrameBufferData.frameBuffer
    );
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const lightViewProjMatrix = this._light.getLightViewProjectionMatrix();
    const uLightViewProjectionMatrix = shadowProgram.getUniform(
      'uLightViewProjectionMatrix'
    );
    gl.uniformMatrix4fv(uLightViewProjectionMatrix, false, lightViewProjMatrix);

    for (const object of this._objects) {
      await object.renderShadow();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mainProgram.use();

    return this._shadowMapFrameBufferData?.depthTexture ?? null;
  }

  private async _renderScene(): Promise<void> {
    if (this._camera) {
      const uViewMatrix = mainProgram.getUniform('uViewMatrix');

      gl.uniformMatrix4fv(uViewMatrix, false, this._camera.viewMatrix);

      this._light?.prepareToRender(this._camera.viewMatrix);

      for (const object of this._objects) {
        await object.render(this._camera.viewMatrix);
      }
    }
  }

  private _getSceneData(): SceneData {
    return {
      camera: this._camera,
      objects: this._objects,
    };
  }
}
