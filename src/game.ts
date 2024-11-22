import { mat4 } from "gl-matrix";
import { ShaderProgram } from "./core/shader";
import { Cube } from "./models/cube";
import { BufferManager } from "./core/bufferManager";
import { ShaderLoader } from "./core/shaderLoader";
import { Camera } from "./core/camera";
import { Floor } from "./models/floor";
import { Weapon } from "./core/weapon";

export class Game {
  private canvas!: HTMLCanvasElement;
  private gl!: WebGLRenderingContext;
  private lastTime!: number;
  private shaderProgram!: ShaderProgram;
  private bufferManager!: BufferManager;
  private cube!: Cube;
  private floor!: Floor;
  private weapon!: Weapon;
  private camera!: Camera;
  private projectionMatrix!: mat4;
  private modelViewMatrix!: mat4;

  constructor(canvas: HTMLCanvasElement) {
    this.initGame(canvas);
  }

  private addListeners(canvas: HTMLCanvasElement): void {
    canvas.addEventListener("click", () => {
      canvas.requestPointerLock();
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.weapon.fire();
      }
    });
  }

  private async initGame(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    this.addListeners(canvas);
    this.lastTime = 0;
    this.projectionMatrix = mat4.create();
    this.modelViewMatrix = mat4.create();

    this.gl = canvas.getContext("webgl") as WebGLRenderingContext;
    if (!this.gl) {
      throw new Error("WebGL not supported");
    }

    this.cube = new Cube();
    this.floor = new Floor();
    this.camera = new Camera();
    this.weapon = new Weapon();

    const { vs, fs } = await ShaderLoader.loadShaders();
    this.shaderProgram = new ShaderProgram(this.gl, vs, fs);
    this.initWebGL();
    this.bufferManager = new BufferManager(this.gl);
    this.bufferManager.initObjectBuffers(
      "cube",
      this.cube.positions,
      this.cube.colors,
      this.cube.indices
    );
    this.bufferManager.initObjectBuffers(
      "floor",
      this.floor.positions,
      this.floor.colors,
      this.floor.indices
    );
    this.bufferManager.initObjectBuffers(
      "weapon",
      this.weapon.getModel().positions,
      this.weapon.getModel().colors,
      this.weapon.getModel().indices
    );
  }

  private initWebGL() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  start() {
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(timestamp: number) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number) {
    this.camera.update(deltaTime);
    this.weapon.update(
      deltaTime,
      this.camera.getPosition(),
      this.camera.getRotation()
    );
  }

  private render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    mat4.perspective(this.projectionMatrix, fieldOfView, aspect, 0.1, 100.0);

    this.camera.getViewMatrix(this.modelViewMatrix);

    if (this.shaderProgram) {
      this.shaderProgram.use();

      const projectionLocation =
        this.shaderProgram.getUniformLocation("uProjectionMatrix");
      const modelViewLocation =
        this.shaderProgram.getUniformLocation("uModelViewMatrix");

      this.gl.uniformMatrix4fv(
        projectionLocation,
        false,
        this.projectionMatrix
      );
      this.gl.uniformMatrix4fv(modelViewLocation, false, this.modelViewMatrix);

      const cubeIndices = this.bufferManager.bindObjectBuffers(
        "cube",
        this.shaderProgram
      );
      if (cubeIndices)
        this.gl.drawElements(
          this.gl.TRIANGLES,
          cubeIndices,
          this.gl.UNSIGNED_SHORT,
          0
        );

      const floorIndices = this.bufferManager.bindObjectBuffers(
        "floor",
        this.shaderProgram
      );
      if (floorIndices)
        this.gl.drawElements(
          this.gl.TRIANGLES,
          floorIndices,
          this.gl.UNSIGNED_SHORT,
          0
        );

      const weaponIndices = this.bufferManager.bindObjectBuffers(
        "weapon",
        this.shaderProgram
      );
      if (weaponIndices) {
        const weaponViewMatrix = mat4.create();
        mat4.copy(weaponViewMatrix, this.modelViewMatrix);

        mat4.multiply(
          weaponViewMatrix,
          weaponViewMatrix,
          this.weapon.getModelMatrix()
        );

        this.gl.uniformMatrix4fv(modelViewLocation, false, weaponViewMatrix);

        this.gl.drawElements(
          this.gl.TRIANGLES,
          weaponIndices,
          this.gl.UNSIGNED_SHORT,
          0
        );
      }
    }
  }
}
