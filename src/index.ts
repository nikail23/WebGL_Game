import { Game } from './game';

const canvas = document.createElement('canvas') as HTMLCanvasElement;
document.body.appendChild(canvas);
const game = new Game(canvas);
game.start();
