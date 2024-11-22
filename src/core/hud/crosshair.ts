import { HUDElement } from './hud-element';

export class Crosshair implements HUDElement {
  private readonly size: number = 10;
  private readonly thickness: number = 2;
  private readonly color: string = 'white';

  public draw(ctx: CanvasRenderingContext2D): void {
    const x = ctx.canvas.width / 2;
    const y = ctx.canvas.height / 2;

    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    ctx.moveTo(x - this.size, y);
    ctx.lineTo(x + this.size, y);
    ctx.moveTo(x, y - this.size);
    ctx.lineTo(x, y + this.size);
    ctx.stroke();
  }

  public update(): boolean {
    return true;
  }
}
