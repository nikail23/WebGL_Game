import { Camera } from '../camera';
import { Light3D } from '../light';
import { SceneData } from './scene-data';
import {
  SceneCameraParams,
  SceneLightParams,
  SceneMeshParams,
  SceneObjectEnum,
  SceneObjectParams,
  SceneParams,
  ScenePhysiscleObjectParams,
} from './scene-params';
import {
  anisotropicFilteringExtension,
  gl,
  mainProgram,
  shadowProgram,
} from '../../webgl';
import { mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { Mesh, MeshWithBuffers, OBJ } from 'webgl-obj-loader';
import { CameraStrategy } from '../update-strategies';
import { Object3D } from '../object';

export class Scene {
  private _camera: Camera = new Camera();
  private _meshes: MeshWithBuffers[] = [];
  private _objects: Object3D[] = [];
  private _light: Light3D | null = null;

  private _shadowMapFrameBufferData: {
    frameBuffer: WebGLFramebuffer | null;
    colorTexture: WebGLTexture | null;
    depthTexture: WebGLTexture | null;
    width: number;
    height: number;
  } | null = null;
  private _shadowsEnabled = false;
  private _staticShadowMap: WebGLTexture | null = null;

  private get viewMatrix(): mat4 {
    return this._camera.viewMatrix;
  }

  public async init(params: SceneParams): Promise<void> {
    await this._loadMeshes(params.meshes);

    await this._buildObjects(params.objects);

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
      gl.uniformMatrix4fv(
        mainProgram.getUniform('uProjectionMatrix'),
        false,
        this._camera.projectionMatrix
      );
      gl.uniform1f(
        mainProgram.getUniform('uHasShadows'),
        this._shadowsEnabled ? 1 : 0
      );

      if (this._shadowsEnabled) {
        await this._prepareShadows();
      }

      await this._renderScene();
    }
  }

  public update(deltaTime: number): void {
    const sceneData = this._getSceneData();

    this._camera.update(deltaTime, sceneData);

    this._objects.forEach((object) => object.update(deltaTime, sceneData));
  }

  private async _loadMeshes(meshesParams: SceneMeshParams[]): Promise<void> {
    this._meshes = [];

    for (const params of meshesParams) {
      const mesh = await this._loadMesh(params.objUrl);
      mesh.name = params.name;
      this._meshes.push(mesh);
    }
  }

  private async _buildObjects(
    objectParams: SceneObjectParams[]
  ): Promise<void> {
    this._objects = [];

    for (const p of objectParams) {
      switch (p.type) {
        case SceneObjectEnum.PHYSICAL_OBJECT:
          const object = await this._buildPhysicalObject(p);
          this._objects.push(object);
          break;
        case SceneObjectEnum.LIGHT:
          this._light = await this._buildLight(p);
          break;
        case SceneObjectEnum.CAMERA:
          this._camera = this._buildCamera(p);
          break;
      }
    }
  }

  private _buildCamera(p: SceneCameraParams): Camera {
    const camera = new Camera();
    camera.position = p.position;
    camera.rotation = p.rotation;
    camera.aspect = p.aspect;
    camera.fov = p.fov;
    camera.near = p.near;
    camera.far = p.far;
    camera.updateStrategy = new CameraStrategy().init(camera);
    return camera;
  }

  private async _buildPhysicalObject(
    p: ScenePhysiscleObjectParams
  ): Promise<Object3D> {
    const mesh = this._meshes.find((model) => model.name === p.model);

    if (!mesh) {
      throw new Error(`Mesh ${p.model} not found`);
    }

    const object = new Object3D();
    object.position = p.position;
    object.rotation = p.rotation;
    object.scale = p.scale;
    object.textureScale = p.textureScale;
    object.mesh = mesh;

    if (p.strategy) object.updateStrategy = p.strategy;

    if (p.alpha !== undefined) {
      object.baseColor[3] = p.alpha;
    }

    if (p.textureUrl) {
      object.texture = await this._loadTexture(p.textureUrl);
    }

    if (p.baseColor) {
      object.baseColor = p.baseColor;
    }

    if (p.baseColorValue !== undefined) {
      object.baseColorValue = p.baseColorValue;
    }

    return object;
  }

  private async _buildLight(p: SceneLightParams): Promise<Light3D> {
    const mesh = this._meshes.find((model) => model.name === p.model);

    if (!mesh) {
      throw new Error(`Mesh ${p.model} not found`);
    }

    const light = new Light3D();
    light.color = p.color;
    light.shininess = p.shininess;
    light.ambient = p.ambient;
    light.position = p.position;
    light.lookAt = p.lookAt;
    light.fovy = p.fovy;
    light.aspect = p.aspect;
    light.near = p.near;
    light.far = p.far;
    light.mesh = mesh;
    light.textureScale = p.textureScale;
    light.rotation = p.rotation;
    light.scale = p.scale;

    if (p.alpha !== undefined) {
      light.baseColor[3] = p.alpha;
    }

    if (p.textureUrl) {
      light.texture = await this._loadTexture(p.textureUrl);
    }

    if (p.baseColor) {
      light.baseColor = p.baseColor;
    }

    if (p.baseColorValue !== undefined) {
      light.baseColorValue = p.baseColorValue;
    }

    return light;
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
      await this._renderObject(object, 'shadow');
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
      gl.uniformMatrix4fv(uViewMatrix, false, this.viewMatrix);

      if (this._light) {
        this._prepareLight(this._light);
        this._renderObject(this._light, 'base');
      }

      // Разбиваем объекты на непрозрачные и прозрачные
      const opaqueObjects: Object3D[] = [];
      const transparentObjects: Object3D[] = [];
      for (const object of this._objects) {
        // Если значение альфа меньше 1, считаем объект прозрачным
        const alpha = object.baseColor[3] ?? 1.0;
        if (alpha < 1.0) {
          transparentObjects.push(object);
        } else {
          opaqueObjects.push(object);
        }
      }

      // Рендерим непрозрачные объекты
      for (const object of opaqueObjects) {
        await this._renderObject(object, 'base');
      }

      // Сортируем прозрачные объекты по расстоянию от камеры (от дальней к ближней)
      transparentObjects.sort((a, b) => {
        const da = vec3.distance(this._camera.position, a.position);
        const db = vec3.distance(this._camera.position, b.position);
        return db - da;
      });

      // Отключаем запись в z-буфер и рендерим прозрачные объекты
      gl.depthMask(false);
      for (const object of transparentObjects) {
        await this._renderObject(object, 'base');
      }
      gl.depthMask(true);
    }
  }

  private _getSceneData(): SceneData {
    return {
      camera: this._camera,
      objects: this._objects,
    };
  }

  private async _renderObject(
    object: Object3D,
    mode: 'base' | 'shadow'
  ): Promise<void> {
    if (!object.mesh || !object.visible) {
      return;
    }

    if (mode === 'base') {
      this._prepareMesh(object.mesh, mode);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, object.texture);
      gl.uniform1i(mainProgram.getUniform('uSampler'), object.baseColorValue);
      gl.uniform1f(
        mainProgram.getUniform('uBaseColorMix'),
        1 - object.baseColorValue
      );
      gl.uniform4fv(mainProgram.getUniform('uBaseColor'), object.baseColor);
      const normalMatrix = mat3.create();
      const viewModelMatrix = mat4.create();
      mat4.multiply(viewModelMatrix, this.viewMatrix, object.modelMatrix);
      mat3.normalFromMat4(normalMatrix, viewModelMatrix);
      gl.uniformMatrix4fv(
        mainProgram.getUniform('uModelMatrix'),
        false,
        object.modelMatrix
      );
      gl.uniformMatrix3fv(
        mainProgram.getUniform('uNormalMatrix'),
        false,
        normalMatrix
      );
      gl.uniform1f(
        mainProgram.getUniform('uTextureScale'),
        object.textureScale
      );
      gl.drawElements(
        gl.TRIANGLES,
        object.mesh.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );
    } else if (mode === 'shadow') {
      this._prepareMesh(object.mesh, mode);
      gl.uniformMatrix4fv(
        shadowProgram.getUniform('uModelMatrix'),
        false,
        object.modelMatrix
      );
      gl.drawElements(
        gl.TRIANGLES,
        object.mesh.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );
    }
  }

  private _prepareLight(light: Light3D): void {
    const position = vec4.fromValues(
      light.position[0],
      light.position[1],
      light.position[2],
      1
    );
    const viewPosition = vec4.create();
    vec4.transformMat4(viewPosition, position, this.viewMatrix);

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
      new Float32Array([light.color[0], light.color[1], light.color[2]])
    );
    gl.uniform1f(uLightShininess, light.shininess);
    gl.uniform1f(uLightAmbient, light.ambient);
  }

  private _prepareMesh(
    mesh: MeshWithBuffers,
    mode: 'base' | 'shadow' = 'base'
  ): void {
    if (!mesh) {
      console.warn('GAME_prepareMesh: Mesh is not loaded!');
    }

    if (mode === 'base') {
      if (!mainProgram?.isActive) {
        console.warn('GAME_prepareToRender: Main program is not active!');
        return;
      }

      const aVertexPosition = mainProgram.getAttribute('aVertexPosition');
      const aNormal = mainProgram.getAttribute('aNormal');
      const aTextureCoordinate = mainProgram.getAttribute('aTextureCoordinate');

      gl.enableVertexAttribArray(aVertexPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
      gl.vertexAttribPointer(
        aVertexPosition,
        mesh.vertexBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.enableVertexAttribArray(aNormal);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
      gl.vertexAttribPointer(
        aNormal,
        mesh.normalBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.enableVertexAttribArray(aTextureCoordinate);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
      gl.vertexAttribPointer(
        aTextureCoordinate,
        mesh.textureBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    } else if (mode === 'shadow') {
      if (!shadowProgram.isActive) {
        console.warn(
          'GAME_prepareToShadowRender: Shadow program is not active!'
        );
      }

      const aVertexPosition = shadowProgram.getAttribute('aVertexPosition');
      gl.enableVertexAttribArray(aVertexPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
      gl.vertexAttribPointer(
        aVertexPosition,
        mesh.vertexBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    }
  }

  private async _loadMesh(objUrl: string): Promise<MeshWithBuffers> {
    return await fetch(objUrl)
      .then((response) => response.text())
      .then((text) => OBJ.initMeshBuffers(gl, new Mesh(text)))
      .catch((error) => {
        console.error('Error loading .obj file:', error);
        throw new Error(error);
      });
  }

  private async _loadTexture(url: string): Promise<WebGLTexture | null> {
    return new Promise((resolve) => {
      const texture = gl.createTexture();
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        if (anisotropicFilteringExtension) {
          const maxAnisotropy = gl.getParameter(
            anisotropicFilteringExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT
          );
          gl.texParameteri(
            gl.TEXTURE_2D,
            anisotropicFilteringExtension.TEXTURE_MAX_ANISOTROPY_EXT,
            maxAnisotropy
          );
        }

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          gl.LINEAR_MIPMAP_LINEAR
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
        resolve(texture);
      };
      image.src = url;
    });
  }
}
