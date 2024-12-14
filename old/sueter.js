new Q5();

let img;
let buffer;
let imgResized;
let colorVariations;
const BORDER = 25;
const REDUCED_SIZE = 200;

function preload() {
  img = loadImage('https://pbs.twimg.com/media/GCEomAaXUAAo-dz?format=jpg&name=large');
}

function setup() {
  createCanvas(1080, 1080);
  pixelDensity(1);
  buffer = createGraphics(width, height);
  buffer.pixelDensity(1);
  
  imgResized = createGraphics(REDUCED_SIZE, REDUCED_SIZE);
  imgResized.pixelDensity(1);
  imgResized.image(img, 0, 0, REDUCED_SIZE, REDUCED_SIZE);
  
  initColorVariations();
}

function initColorVariations() {
  colorVariations = [];
  imgResized.loadPixels();
  
  for (let y = 0; y < REDUCED_SIZE; y++) {
    colorVariations[y] = [];
    for (let x = 0; x < REDUCED_SIZE; x++) {
      let index = (y * REDUCED_SIZE + x) * 4;
      let r = imgResized.pixels[index] + random(-10, 10);
      let g = imgResized.pixels[index + 1] + random(-10, 10);
      let b = imgResized.pixels[index + 2] + random(-10, 10);
      
      let brightness = (r + g + b) / 3;
      if (brightness > 200) {
        r *= 0.9;
        g *= 0.9;
        b *= 0.9;
      }
      
      colorVariations[y][x] = [r, g, b];
    }
  }
}

function knit(g, x, y, s) {
  g.push();
  g.noStroke();
  g.translate(x, y);

  g.push();
  g.translate(-s/10, 0);
  g.rotate(-PI/12);
  g.ellipse(0, 0, s/4, s*0.9);
  g.pop();

  g.push();
  g.translate(s/10, 0);
  g.rotate(PI/12);
  g.ellipse(0, 0, s/4, s*0.9);
  g.pop();

  g.pop();
}

function drawKnits() {
  buffer.clear();
  
  if (!img) return;
  
  let gridSize = width - (BORDER * 2);
  let numCells = 100;
  let cellSize = gridSize / numCells;
  
  let startX = BORDER;
  let startY = BORDER;
  
  let yOffset = cellSize * 1.0;
  let knitSize = cellSize * 1.4;
  
  buffer.noStroke();
  
  let totalRows = numCells;
  
  for (let x = 0; x < numCells; x++) {
    for (let y = 0; y < totalRows; y++) {
      let posX = startX + x * cellSize + cellSize/2;
      let posY = startY + y * cellSize + cellSize/2;
      
      if (posY > height - BORDER) continue;
      
      let imgX = int((x / numCells) * REDUCED_SIZE);
      let imgY = int((y / totalRows) * REDUCED_SIZE);
      
      imgX = constrain(imgX, 0, REDUCED_SIZE - 1);
      imgY = constrain(imgY, 0, REDUCED_SIZE - 1);
      
      let c = colorVariations[imgY][imgX];
      buffer.fill(c[0], c[1], c[2]);
      
      knit(buffer, posX, posY, knitSize);
    }
  }
}

function draw() {
  clear();
  drawKnits();
  image(buffer, 0, 0);
  noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buffer = createGraphics(width, height);
  buffer.pixelDensity(1);
  loop();
} 