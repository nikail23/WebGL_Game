import { HUD } from '../hud/hud';
import { Crosshair } from '../hud/crosshair';
import { aspect, canvas, gl } from '../webgl';
import { Scene } from './scene/scene';
import { FpsCounter } from '../hud/fps';
import { vec3 } from 'gl-matrix';
import { SceneObjectEnum } from './scene';

export class Game {
  private lastTime: number;
  private hud: HUD;
  private scene: Scene;
  private running: boolean = false;
  private contextLostHandler: (e: Event) => void;
  private contextRestoredHandler: (e: Event) => void;

  constructor() {
    this.scene = new Scene();
    this.lastTime = 0;
    this.hud = new HUD();
    this.hud.addElement(new Crosshair());
    this.hud.addElement(new FpsCounter());

    // Initialize context event handlers
    this.contextLostHandler = this.handleContextLost.bind(this);
    this.contextRestoredHandler = this.handleContextRestored.bind(this);
  }

  private async initWebGL(): Promise<void> {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // Включаем blending для прозрачности
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Add context loss and restore event listeners
    canvas.addEventListener('webglcontextlost', this.contextLostHandler);
    canvas.addEventListener(
      'webglcontextrestored',
      this.contextRestoredHandler
    );
  }

  private handleContextLost(e: Event): void {
    console.warn('WebGL context lost. Stopping rendering loop.');
    e.preventDefault();
    this.running = false;
  }

  private async handleContextRestored(): Promise<void> {
    console.log('WebGL context restored. Reinitializing...');
    await this.initWebGL();
    await this.initScene();
    this.running = true;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private initListeners(): void {
    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });
  }

  private async initScene(): Promise<void> {
    this.scene.init({
      meshes: [
        {
          name: 'cube',
          objUrl: 'assets/models/cube/cube.obj',
        },
        {
          name: 'floor',
          objUrl: 'assets/models/floor/room_floor.obj',
        },
        {
          name: 'light',
          objUrl: 'assets/models/light/light.obj',
        },
        {
          name: 'sphere',
          objUrl: 'assets/models/sphere/sphere.obj',
        },
      ],
      objects: [
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(2, -1, 2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          texture: {
            scale: 1,
            url: 'assets/models/cube/cube.jpg',
          },
          model: 'cube',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(-2, -1, 2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          texture: {
            scale: 1,
            url: 'assets/models/cube/cube.jpg',
          },
          model: 'cube',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(-2, -1, -2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          texture: {
            scale: 1,
            url: 'assets/models/cube/cube.jpg',
          },
          model: 'cube',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(2, -1, -2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          texture: {
            scale: 1,
            url: 'assets/models/cube/cube.jpg',
          },
          model: 'cube',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(0, -2, 0),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(100, 1, 100),
          texture: {
            scale: 100,
            url: 'assets/models/floor/room_floor.jpg',
          },
          model: 'floor',
        },
        {
          type: SceneObjectEnum.LIGHT,
          color: vec3.fromValues(1, 1, 1),
          shininess: 32,
          ambient: 0.2,
          position: vec3.fromValues(8, 8, 8),
          lookAt: vec3.fromValues(0, 0, 0),
          fovy: Math.PI / 1.5,
          aspect: 1,
          near: 0.1,
          far: 100,
          model: 'light',
          texture: {
            scale: 1,
            url: 'assets/models/light/light.jpg',
          },
          scale: vec3.fromValues(0.001, 0.001, 0.001),
          rotation: vec3.fromValues(0, 0, 0),
        },
        {
          type: SceneObjectEnum.CAMERA,
          position: vec3.fromValues(0, 2, 6),
          rotation: vec3.fromValues(0, 0, 0),
          fov: (45 * Math.PI) / 180,
          aspect,
          near: 0.1,
          far: 100,
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(2, 1, 2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          texture: {
            scale: 1,
            alpha: 0.35,
          },
          model: 'sphere',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(2, 1, -2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          texture: {
            scale: 1,
            alpha: 0.3,
          },
          model: 'sphere',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(-2, 1, 2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          texture: {
            scale: 1,
            alpha: 0.25,
          },
          model: 'sphere',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(-2, 1, -2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          texture: {
            scale: 1,
            alpha: 0.2,
          },
          model: 'sphere',
        },
      ],
      shadows: {
        enabled: true,
        width: 4096,
        height: 4096,
      },
    });
  }

  private async initGame(): Promise<void> {
    await this.initWebGL();
    this.initListeners();
    await this.initScene();
  }

  public async start(): Promise<void> {
    await this.initGame();
    this.running = true;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(timestamp: number): void {
    if (!this.running) return;

    const deltaTime = Math.min(timestamp - this.lastTime, 100);
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number): void {
    const deltaInSeconds = deltaTime * 0.001;
    this.scene.update(deltaInSeconds);
    this.hud.update(deltaInSeconds);
  }

  private async render(): Promise<void> {
    await this.scene.render();

    this.hud.draw();
  }

  public dispose(): void {
    this.running = false;

    // Remove event listeners
    canvas.removeEventListener('webglcontextlost', this.contextLostHandler);
    canvas.removeEventListener(
      'webglcontextrestored',
      this.contextRestoredHandler
    );

    // Dispose resources
    this.scene.dispose();
    this.hud.dispose();
  }
}
