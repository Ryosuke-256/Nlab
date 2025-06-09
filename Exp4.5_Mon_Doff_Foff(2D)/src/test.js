import * as PIXI from 'pixi.js';

// Create a PixiJS application.
const app = new PIXI.Application();
await app.init({ background: '#1099bb', resizeTo: window });
document.body.appendChild(app.canvas);

// Add texture
const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');
const bunny = new PIXI.Sprite(texture);
app.stage.addChild(bunny);

bunny.anchor.set(0.5);
bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;

app.ticker.add((time) => {
    //second
    const sec = performance.now()/1000
    bunny.rotation = sec * 2 * Math.PI;
})

