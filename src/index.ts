import { mainProgram, Game, shadowProgram } from './core';

await mainProgram.init();
await shadowProgram.init();

mainProgram.use();

const game = new Game();
game.start();
