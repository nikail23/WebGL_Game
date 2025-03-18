import { HUDElement } from './hud-element';

export class FpsCounter implements HUDElement {
  private fps: number = 0;
  private accumulator: number = 0;
  private frameCount: number = 0;
  private position = { x: 10, y: 30 };
  private memoryInfo: any = null;
  private memoryUpdateTime: number = 0;

  public update(deltaTime: number): boolean {
    this.accumulator += deltaTime;
    this.frameCount++;

    if (this.accumulator >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.accumulator -= 1;

      // Update memory info every second (if supported)
      this.memoryUpdateTime += 1;
      if (
        this.memoryUpdateTime >= 1 &&
        (window as any).performance &&
        (window as any).performance.memory
      ) {
        this.memoryInfo = (window as any).performance.memory;
        this.memoryUpdateTime = 0;
      }
    }
    return true;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`FPS: ${this.fps}`, this.position.x, this.position.y);

    if (this.memoryInfo) {
      const usedHeapMB = Math.round(
        this.memoryInfo.usedJSHeapSize / (1024 * 1024)
      );
      const totalHeapMB = Math.round(
        this.memoryInfo.totalJSHeapSize / (1024 * 1024)
      );
      ctx.fillText(
        `Memory: ${usedHeapMB}MB / ${totalHeapMB}MB`,
        this.position.x,
        this.position.y + 25
      );
    }
  }
}
