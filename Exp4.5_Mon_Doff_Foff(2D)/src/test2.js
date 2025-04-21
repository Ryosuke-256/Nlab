import * as PIXI from 'pixi.js';

// Create the application and initialize
const app = new PIXI.Application();
await app.init({ width: 640, height: 360 });
document.body.appendChild(app.canvas);

// Label showing scene graph hierarchy
const label = new PIXI.Text(
    'Scene Graph:\n\napp.stage\n  ┗ A\n     ┗ B\n     ┗ C\n  ┗ D',
    {
        fill: '#ffffff',
        fontSize: 14,
        lineHeight: 20,
    }
);
label.position.set(300, 100);
app.stage.addChild(label);

// Store all letters
const letters = [];

// Helper function to create a block with a letter
function addLetter(letter, parent, color, pos) {
    const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    bg.width = 100;
    bg.height = 100;
    bg.tint = color;

    const text = new PIXI.Text(letter, {
        fill: '#ffffff',
        fontSize: 32,
    });
    text.anchor.set(0.5);
    text.position.set(50, 50);

    const container = new PIXI.Container();
    container.position.set(pos.x, pos.y);
    container.visible = false;
    container.addChild(bg, text);
    parent.addChild(container);

    letters.push(container);
    return container;
}

// Define 4 letters
let a = addLetter('A', app.stage, 0xff0000, { x: 100, y: 100 });
let b = addLetter('B', a,         0x00ff00, { x: 20,  y: 20 });
let c = addLetter('C', a,         0x0000ff, { x: 20,  y: 40 });
let d = addLetter('D', app.stage, 0xff8800, { x: 140, y: 100 });

// Display letters one by one over time
let elapsed = 0.0;
app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime / 60.0;
    if (elapsed >= letters.length) { elapsed = 0.0; }

    for (let i = 0; i < letters.length; i++) {
        letters[i].visible = elapsed >= i;
    }
});
