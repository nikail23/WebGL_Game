import { mainProgram, Game, shadowProgram, lensFlareProgram } from './core';

await mainProgram.init();
await shadowProgram.init();
await lensFlareProgram.init();

mainProgram.use();

const game = new Game();
game.start();
