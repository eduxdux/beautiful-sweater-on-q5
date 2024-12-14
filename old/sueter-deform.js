new Q5();

let img;
let buffer;
let imgResized;
let colorVariations;
let colorGrid;
let pointsGrid;
const BORDER = 0;
const REDUCED_SIZE = 50;
const NUM_CELLS = 120;
const noiseScale = 0.03;
const FOLD_INTENSITY = 1.80;
let FOLD_ANGLE;

function preload() {
  img = loadImage('https://pbs.twimg.com/media/GdJyB0YXcAATnrc?format=png&name=4096x4096');
}

function setup() {
  createCanvas(1080, 1080);
  pixelDensity(1);
  buffer = createGraphics(width, height);
  buffer.pixelDensity(1);
  
  FOLD_ANGLE = random(TWO_PI);
  console.log('Fold angle:', degrees(FOLD_ANGLE));
  
  imgResized = createGraphics(REDUCED_SIZE, REDUCED_SIZE);
  imgResized.pixelDensity(1);
  imgResized.image(img, 0, 0, REDUCED_SIZE, REDUCED_SIZE);
  
  initColorVariations();
  initColorGrid();
  initPointsGrid();
  drawKnits();
  noLoop();
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

function initColorGrid() {
  colorGrid = [];
  
  for (let x = 0; x < NUM_CELLS; x++) {
    colorGrid[x] = [];
    for (let y = 0; y < NUM_CELLS; y++) {
      let imgX = int((x / NUM_CELLS) * REDUCED_SIZE);
      let imgY = int((y / NUM_CELLS) * REDUCED_SIZE);
      
      imgX = constrain(imgX, 0, REDUCED_SIZE - 1);
      imgY = constrain(imgY, 0, REDUCED_SIZE - 1);
      
      colorGrid[x][y] = colorVariations[imgY][imgX];
    }
  }
}

function initPointsGrid() {
  let gridSize = width - (BORDER * 2);
  let cellSize = gridSize / NUM_CELLS;
  let startX = BORDER;
  let startY = BORDER;
  let knitSize = cellSize * 1.6;
  
  pointsGrid = [];
  
  let extraCells = 10;
  let totalCells = NUM_CELLS + extraCells;
  
  for (let x = -extraCells/2; x < totalCells - extraCells/2; x++) {
    let gridX = Math.floor(x + extraCells/2);
    pointsGrid[gridX] = [];
    for (let y = -extraCells/2; y < totalCells - extraCells/2; y++) {
      let gridY = Math.floor(y + extraCells/2);
      
      let baseX = startX + x * cellSize + cellSize/2;
      let baseY = startY + y * cellSize + cellSize/2;
      
      let deformed = deformPoint(baseX, baseY);
      
      let maxOffset = cellSize * 1.2;
      let dx = deformed.x - baseX;
      let dy = deformed.y - baseY;
      let offsetMag = sqrt(dx*dx + dy*dy);
      
      if (offsetMag > maxOffset) {
        let scale = maxOffset / offsetMag;
        deformed.x = baseX + dx * scale;
        deformed.y = baseY + dy * scale;
      }
      
      if (gridX > 0 && gridY > 0) {
        let leftPoint = pointsGrid[gridX-1][gridY];
        let topPoint = pointsGrid[gridX][gridY-1];
        
        if (leftPoint && topPoint) {
          let distLeft = dist(deformed.x, deformed.y, leftPoint.x, leftPoint.y);
          let distTop = dist(deformed.x, deformed.y, topPoint.x, topPoint.y);
          
          let maxDist = cellSize * 1.5;
          if (distLeft > maxDist) {
            deformed.x = lerp(leftPoint.x, deformed.x, maxDist/distLeft);
            deformed.y = lerp(leftPoint.y, deformed.y, maxDist/distLeft);
          }
          if (distTop > maxDist) {
            deformed.x = lerp(topPoint.x, deformed.x, maxDist/distTop);
            deformed.y = lerp(topPoint.y, deformed.y, maxDist/distTop);
          }
        }
      }
      
      let colorX = constrain(Math.floor(((x + extraCells/2) / totalCells) * NUM_CELLS), 0, NUM_CELLS-1);
      let colorY = constrain(Math.floor(((y + extraCells/2) / totalCells) * NUM_CELLS), 0, NUM_CELLS-1);
      
      pointsGrid[gridX][gridY] = {
        x: deformed.x,
        y: deformed.y,
        size: knitSize,
        color: colorGrid[colorX][colorY]
      };
    }
  }
}

function deformPoint(x, y) {
  const mainFoldAngle = FOLD_ANGLE;
  
  let intensityMap = noise(x * 0.001, y * 0.001);
  let strongFoldZone = smoothstep((intensityMap - 0.65) * 3);
  let softFoldZone = smoothstep((0.35 - intensityMap) * 3);
  
  let numFolds = int(random(1, 2));
  let offsetX = 0;
  let offsetY = 0;
  
  let totalInfluence = 0;
  let foldEffects = [];
  
  let perpAngle = mainFoldAngle + PI/2;
  let projectedDist = x * cos(perpAngle) + y * sin(perpAngle);
  
  for (let i = 0; i < numFolds; i++) {
    let baseIntensity = (noise(i * 100) * 120 + 40) * FOLD_INTENSITY;
    
    let foldPos = width * (i + 1) / (numFolds + 1);
    let distToFold = abs(projectedDist - foldPos);
    let foldWidth = width * (0.4 + noise(i * 200) * 0.2);
    
    if (distToFold < foldWidth) {
      let foldIntensity = smoothstep(1 - pow(distToFold/foldWidth, 1.2));
      
      let zoneIntensity = 1 + strongFoldZone * 1.5 - softFoldZone * 0.7;
      foldIntensity *= zoneIntensity;
      
      let variation = noise(x * 0.003, y * 0.003);
      foldIntensity *= variation;
      
      let foldAmount = sin(distToFold * 0.005) * baseIntensity * foldIntensity;
      
      foldEffects.push({
        x: foldAmount * cos(mainFoldAngle),
        y: foldAmount * sin(mainFoldAngle),
        weight: foldIntensity
      });
      
      totalInfluence += foldIntensity;
    }
  }
  
  if (totalInfluence > 0) {
    for (let effect of foldEffects) {
      let weight = effect.weight / totalInfluence;
      offsetX += effect.x * weight;
      offsetY += effect.y * weight;
    }
  }
  
  let microScale = 0.008;
  let microIntensity = 20 * FOLD_INTENSITY * 0.5;
  microIntensity *= 1 + strongFoldZone * 0.5 - softFoldZone * 0.3;
  
  let microX = noise(x * microScale, y * microScale) * microIntensity;
  let microY = noise(x * microScale + 1000, y * microScale) * microIntensity;
  
  offsetX += (microX - microIntensity/2) * smoothstep(noise(x * 0.002, y * 0.002));
  offsetY += (microY - microIntensity/2) * smoothstep(noise(x * 0.002, y * 0.002 + 1000));
  
  let edgeFade = 1;
  let edgeX = smoothstep(min(x, width - x) / 150);
  let edgeY = smoothstep(min(y, height - y) / 150);
  edgeFade = min(edgeX, edgeY);
  
  offsetX *= edgeFade;
  offsetY *= edgeFade;
  
  let maxDeform = width / NUM_CELLS * (1 + strongFoldZone) * FOLD_INTENSITY;
  let deformMag = sqrt(offsetX * offsetX + offsetY * offsetY);
  if (deformMag > maxDeform) {
    let scale = smoothstep(maxDeform / deformMag);
    offsetX *= scale;
    offsetY *= scale;
  }
  
  return {
    x: x + offsetX,
    y: y + offsetY
  };
}

function fastKnit(g, x, y, s) {
  const s4 = s/4;
  const s9 = s*0.9;
  const s10 = s/10;
  
  g.push();
  g.translate(x, y);
  
  g.push();
  g.translate(-s10, 0);
  g.rotate(-PI/12);
  g.ellipse(0, 0, s4, s9);
  g.pop();
  
  g.push();
  g.translate(s10, 0);
  g.rotate(PI/12);
  g.ellipse(0, 0, s4, s9);
  g.pop();
  
  g.pop();
}

function smoothstep(x) {
  x = constrain(x, 0, 1);
  return x * x * (3 - 2 * x);
}

function drawKnits() {
  buffer.clear();
  if (!img) return;
  
  buffer.noStroke();
  
  for (let x = 0; x < NUM_CELLS; x++) {
    for (let y = 0; y < NUM_CELLS; y++) {
      let point = pointsGrid[x][y];
      
      if (point.y > height - BORDER) continue;
      
      buffer.fill(point.color[0], point.color[1], point.color[2]);
      fastKnit(buffer, point.x, point.y, point.size);
    }
  }
}

function draw() {
  clear();
  image(buffer, 0, 0, width*1.05, height*1.05);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buffer = createGraphics(width, height);
  buffer.pixelDensity(1);
} 