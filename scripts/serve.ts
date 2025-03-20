import { buildApp, serveApp } from './helpers';

await buildApp();

await serveApp(3000);
