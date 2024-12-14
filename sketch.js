new Q5();

const rnd_int = hl.randomInt;
const rnd_btw = hl.random;

const REDUCED_SIZE = rnd_int(60,100);

console.log('REDUCED_SIZE:', REDUCED_SIZE);

// Palette configuration object
const PALETTES = {
  Outono: {
    weight: 2,
    palette: ['#053043', '#F37247', '#FDAF3A'],
    bg: '#fcd5ce'
  },
  Fronce: {
    weight: 2,
    palette: ['#800016','#a0001c','#c00021','#ff002b','#1565c0'],
    bg: '#F2F2F2'
  },
  Mondrian: {
    weight: 2000,
    palette: ['#EDC917', '#F8F5F5', '#FD3E4D', '#6886DC'],
    bg: '#F8F5F5'
  },
  BW: {
    weight: 1,
    palette: ['#0B0C0C'],
    bg: '#F8F5F5'
  },
  'Inverse BW': {
    weight: 1,
    palette: ['#F8F5F5','#DDD', '#FFF'],
    bg: '#0B0C0C'
  },
  Riso: {
    weight: 2,
    palette: ['#1851BB', '#F7AFE1', '#39104A', '#FF3F00', '#F3D701'],
    bg: '#E8E7E3'
  },
  Antigo: {
    weight: 2,
    palette: ['#000005', '#FFF'],
    bg: '#F4D075'
  },
  'Blue dreams': {
    weight: 2,
    palette: ['#FF5995', '#D958FA', '#8762F5', '#5E5CE6', '#00BFFF'],
    bg: '#F8F5F5'
  },
  cmyk: {
    weight: 2,
    palette: ['cyan', 'magenta', 'yellow', 'black'],
    bg: '#F4D075'
  },
  Rubro: {
    weight: 1,
    palette: ['#0F0F0F', '#F22233'],
    bg: '#F4D075'
  },
  Garden: {
    weight: 1,
    palette: ['#2E5902', '#65A603', '#558C03', '#338C03', '#338C32'],
    bg: '#ECFFCB'
  },
  Vapor: {
    weight: 2,
    palette: ['#D7E8FC','#b7d3f2','#afafdc','#9370FD','#84afe6'],
    bg: '#000005'
  },
  Munch: {
    weight: 1,
    palette: ['#4278A1', '#E69352', '#EDB830', '#E4512F', '#272A2A'],
    bg: '#f7f3f2'
  },
  'Electric Night': {
    weight: 2,
    palette: ['#011627', '#D5D8E2', '#05AF9F', '#EB0925', '#EB8A06'],
    bg: '#f7f3f2'
  },
  'Contrasting Emotions': {
    weight: 2,
    palette: ['#9e0031', '#8e0045', '#770058', '#600047', '#44001a'],
    bg: '#f7f3f2'
  },
  'Nebula Nights': {
    weight: 2,
    palette: ['#31263e', '#eca72c', '#523086', '#ee5622', '#100A16'],
    bg: '#f7f3f2'
  },
  Blueness: {
    weight: 1,
    palette: ['#caf0f8', '#fefae0', '#000000', '#edf2f4', '#FFF'],
    bg: '#023e8a'
  },
  Redness: {
    weight: 1,
    palette: ['#370617', '#03071e', '#ffffff', '#e5e5e5', '#fca311'],
    bg: '#d90429'
  },
  Yellowness: {
    weight: 1,
    palette: ['#ffffff', '#000000', '#540b0e', '#ff006e', '#fefae0'],
    bg: '#ffba08'
  },
  Greeness: {
    weight: 1,
    palette: ['#ffffff', '#000000', '#001928', '#143601', '#00c49a'],
    bg: '#8ac926'
  },
  Pinkness: {
    weight: 1,
    palette: ['#ffffff', '#38040e', '#fae0e4', '#fff1e6', '#dfe7fd'],
    bg: '#fb6376'
  },
  Purpleness: {
    weight: 1,
    palette: ['#ffffff', '#e0c1e4', '#9264a7', '#d8b9d9', '#f3e9f1'],
    bg: '#7e43a3'
  }
};

// Optimized weighted selector
const createWeightedSelector = (palettes) => {
  const weightedArray = Object.entries(palettes).flatMap(([name, config]) => 
    Array(config.weight).fill({ name, ...config })
  );
  
  return () => {
    const selected = weightedArray[Math.floor(rnd_btw(0, 1) * weightedArray.length)];
    return {
      palette: selected.palette,
      bg: selected.bg
    };
  };
};

// Create selector and select palette
const { palette: COLOR_PALETTE, bg: BACKGROUND_COLOR } = createWeightedSelector(PALETTES)();

let img;
let buffer;
let imgResized;
let colorVariations;
let colorGrid;
let pointsGrid;
const BORDER = 0;
const NUM_CELLS = 120;
const noiseScale = 0.003;
const FOLD_INTENSITY = 1.80;
const WAVE_INTENSITY = 0.5;
const WAVE_SCALE = 0.008;
const FOLD_SCALE = 0.03;
let FOLD_ANGLE;

const LINE_COLOR = '#000000';       // Color for grid lines

const nSeed = rnd_int(0,99999999999999999999999999999999999999999999);
const rSeed = rnd_int(0,99999999999999999999999999999999999999999999);

// Grid pattern parameters
const GRID_PARAMS = {
  divisions: rnd_int(3,20),           // Number of times to subdivide the grid
  splitProb: rnd_btw(0.5,0.85),        // Probability of splitting a cell (0-1)
  verticalSplitProb: rnd_btw(0.5,0.85), // Probability of splitting vertically vs horizontally (0-1)
  minCellSize: rnd_int(5,30),       // Minimum cell size before stopping subdivision
  colorProb: rnd_btw(0.3, 0.7),     // Probability of a cell getting a color (vs staying background color)
  splitRangeMin: 0.3,    // Minimum position for splitting (0-1)
  splitRangeMax: 0.7,    // Maximum position for splitting (0-1)
  lineWeight: rnd_btw(0,1.5),         // Thickness of the grid lines
  padding: 2             // Padding around the grid (in pixels)
};

// Pattern drawing functions
function drawPattern(g, cell, patternType, color) {
  const padding = 2;
  const x = cell.x + padding;
  const y = cell.y + padding;
  const w = cell.w - padding * 2;
  const h = cell.h - padding * 2;
  
  g.stroke(color);
  g.fill(color);
  
  switch(patternType) {
    case 'lines':
      drawLines(g, x, y, w, h);
      break;
    case 'dots':
      drawDots(g, x, y, w, h);
      break;
    case 'crosshatch':
      drawCrosshatch(g, x, y, w, h);
      break;
  }
}

function drawLines(g, x, y, w, h) {
  const numLines = rnd_int(5, 15);
  const spacing = h / numLines;
  
  for(let i = 0; i < numLines; i++) {
    const yPos = y + i * spacing;
    g.line(x, yPos, x + w, yPos);
  }
}

function drawDots(g, x, y, w, h) {
  const gridSize = rnd_int(3, 6);
  const dotSize = Math.max(2, Math.min(w, h) / (gridSize * 3)); // Ensure minimum dot size of 2
  const spacingX = w / (gridSize + 1); // Add 1 to gridSize for better spacing
  const spacingY = h / (gridSize + 1);
  
  for(let i = 0; i < gridSize; i++) {
    for(let j = 0; j < gridSize; j++) {
      if(rnd_btw(0, 1) > 0.3) {
        const xPos = x + spacingX * (i + 1); // Start from 1 to avoid edge
        const yPos = y + spacingY * (j + 1);
        if (dotSize > 0) { // Safety check
          g.ellipse(xPos, yPos, dotSize, dotSize);
        }
      }
    }
  }
}

function drawCrosshatch(g, x, y, w, h) {
  const numLines = rnd_int(5, 10);
  const spacingX = w / numLines;
  const spacingY = h / numLines;
  
  // Draw diagonal lines in both directions
  for(let i = -numLines; i < numLines * 2; i++) {
    g.line(x + i * spacingX, y, x + (i + numLines) * spacingX, y + h);
    g.line(x + i * spacingX, y + h, x + (i + numLines) * spacingX, y);
  }
}

function createBasePattern() {
  let g = createGraphics(REDUCED_SIZE, REDUCED_SIZE);
  g.background(BACKGROUND_COLOR);
  g.stroke(LINE_COLOR);
  g.strokeWeight(GRID_PARAMS.lineWeight);
  
  // Create irregular grid
  let cells = [];
  
  // Calculate available space after padding
  const availableWidth = REDUCED_SIZE - (GRID_PARAMS.padding * 2);
  const availableHeight = REDUCED_SIZE - (GRID_PARAMS.padding * 2);
  
  // Initial grid with padding
  cells.push({
    x: GRID_PARAMS.padding, 
    y: GRID_PARAMS.padding, 
    w: availableWidth, 
    h: availableHeight
  });
  
  // Subdivide cells randomly
  let subdivisionCount = 0;
  for(let i = 0; i < GRID_PARAMS.divisions; i++) {
    let newCells = [];
    for(let cell of cells) {
      // Force split if no subdivisions happened yet and we're on last iteration
      let shouldSplit = (i === GRID_PARAMS.divisions - 1 && subdivisionCount === 0) ? 
                       true : 
                       random() > (1 - GRID_PARAMS.splitProb);
      
      if(shouldSplit && 
         cell.w > GRID_PARAMS.minCellSize && 
         cell.h > GRID_PARAMS.minCellSize) {
        subdivisionCount++;
        // Vertical split
        if(random() > (1 - GRID_PARAMS.verticalSplitProb) && 
           cell.w > GRID_PARAMS.minCellSize * 1.5) {
          let splitX = cell.x + random(
            cell.w * GRID_PARAMS.splitRangeMin, 
            cell.w * GRID_PARAMS.splitRangeMax
          );
          newCells.push({x: cell.x, y: cell.y, w: splitX - cell.x, h: cell.h});
          newCells.push({x: splitX, y: cell.y, w: cell.w - (splitX - cell.x), h: cell.h});
        }
        // Horizontal split
        else if(cell.h > GRID_PARAMS.minCellSize * 1.5) {
          let splitY = cell.y + random(
            cell.h * GRID_PARAMS.splitRangeMin, 
            cell.h * GRID_PARAMS.splitRangeMax
          );
          newCells.push({x: cell.x, y: cell.y, w: cell.w, h: splitY - cell.y});
          newCells.push({x: cell.x, y: splitY, w: cell.w, h: cell.h - (splitY - cell.y)});
        }
        else {
          newCells.push(cell);
        }
      } else {
        newCells.push(cell);
      }
    }
    cells = newCells;
  }
  
  // Color the cells
  g.noStroke();
  let usedColors = new Set();
  let backgroundCount = 0;
  let totalCells = cells.length;
  let coloredCells = 0;
  const minColoredCells = 2;
  
  const patterns = ['lines', 'dots', 'crosshatch'];
  
  // First pass: try to get minimum colored cells
  for(let i = 0; i < cells.length && coloredCells < minColoredCells; i++) {
    let cell = cells[i];
    
    let color = random(COLOR_PALETTE);
    g.fill(color);
    usedColors.add(color);
    coloredCells++;
    
    // Draw the base rectangle
    g.rect(cell.x, cell.y, cell.w, cell.h);
    
    // 50% chance of adding a pattern
    if(rnd_btw(0, 1) > 0.5) {
      g.strokeWeight(GRID_PARAMS.lineWeight * 0.5);
      drawPattern(g, cell, random(patterns), LINE_COLOR);
    }
  }
  
  // Second pass: random coloring for remaining cells
  for(let i = minColoredCells; i < cells.length; i++) {
    let cell = cells[i];
    
    // Force color if too many background cells
    let forceColor = (backgroundCount / (i + 1)) > (1 - GRID_PARAMS.colorProb);
    // Force background if too many colored cells
    let forceBackground = ((coloredCells) / (i + 1)) > GRID_PARAMS.colorProb;
    
    if(!forceBackground && (forceColor || random() > (1 - GRID_PARAMS.colorProb))) {
      let color = random(COLOR_PALETTE);
      g.fill(color);
      usedColors.add(color);
      coloredCells++;
      
      // Draw the base rectangle
      g.rect(cell.x, cell.y, cell.w, cell.h);
      
      // 50% chance of adding a pattern
      if(rnd_btw(0, 1) > 0.5) {
        g.strokeWeight(GRID_PARAMS.lineWeight * 0.5);
        drawPattern(g, cell, random(patterns), LINE_COLOR);
      }
    } else {
      g.fill(BACKGROUND_COLOR);
      g.rect(cell.x, cell.y, cell.w, cell.h);
      backgroundCount++;
    }
  }
  
  // Draw grid lines
  g.stroke(LINE_COLOR);
  g.strokeWeight(GRID_PARAMS.lineWeight);
  for(let cell of cells) {
    g.noFill();
    g.rect(cell.x, cell.y, cell.w, cell.h);
  }
  
  return g;
}

function preload() {
  // Create base pattern instead of loading image
  img = createBasePattern();
}

function setup() {
  createCanvas(1080, 1080);

  noiseSeed(nSeed);
  randomSeed(rSeed);

  pixelDensity(1);
  buffer = createGraphics(width, height);
  buffer.pixelDensity(1);
  
  FOLD_ANGLE = random(TWO_PI);
  console.log('Fold angle:', degrees(FOLD_ANGLE));
  
  imgResized = createGraphics(REDUCED_SIZE, REDUCED_SIZE);
  imgResized.pixelDensity(1);
  imgResized.image(img, 0, 0, REDUCED_SIZE, REDUCED_SIZE);

  generateSweater();
  noLoop();
}

function generateSweater() {
  generateKnitPatternColors();
  generateKnitColorGrid();
  generateKnitPointsGrid();
  renderKnitPattern();
}

// Knit Pattern Data Generation Functions
function generateKnitPatternColors() {
  colorVariations = [];
  imgResized.loadPixels();
  
  for (let y = 0; y < REDUCED_SIZE; y++) {
    colorVariations[y] = [];
    for (let x = 0; x < REDUCED_SIZE; x++) {
      let index = (y * REDUCED_SIZE + x) * 4;
      let r = imgResized.pixels[index];
      let g = imgResized.pixels[index + 1];
      let b = imgResized.pixels[index + 2];
      
      r += random(-5, 5);
      g += random(-5, 5);
      b += random(-5, 5);
      
      r = constrain(r, 0, 255);
      g = constrain(g, 0, 255);
      b = constrain(b, 0, 255);
      
      colorVariations[y][x] = [r, g, b];
    }
  }
}

function generateKnitColorGrid() {
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

function generateKnitPointsGrid() {
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
      
      let deformed = calculateKnitDeformation(baseX, baseY);
      
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

// Knit Pattern Deformation and Drawing Functions
function calculateKnitDeformation(x, y) {
  const mainFoldAngle = FOLD_ANGLE;
  
  let intensityMap = noise(x * FOLD_SCALE, y * FOLD_SCALE);
  let strongFoldZone = smoothstep((intensityMap - 0.65) * 3);
  let softFoldZone = smoothstep((0.35 - intensityMap) * 3);
  
  let offsetX = 0;
  let offsetY = 0;
  
  let numFolds = int(random(1, 2));
  
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
      
      offsetX += foldAmount * cos(mainFoldAngle);
      offsetY += foldAmount * sin(mainFoldAngle);
    }
  }
  
  let microX = noise(x * WAVE_SCALE, y * WAVE_SCALE) * 20 * WAVE_INTENSITY;
  let microY = noise(x * WAVE_SCALE + 1000, y * WAVE_SCALE) * 20 * WAVE_INTENSITY;
  
  offsetX += (microX - 10 * WAVE_INTENSITY) * smoothstep(noise(x * 0.002, y * 0.002));
  offsetY += (microY - 10 * WAVE_INTENSITY) * smoothstep(noise(x * 0.002, y * 0.002 + 1000));
  
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

function drawKnitStitch(g, x, y, s) {
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

function renderKnitPattern() {
  buffer.clear();
  if (!img) return;
  
  buffer.noStroke();
  
  for (let x = 0; x < NUM_CELLS; x++) {
    for (let y = 0; y < NUM_CELLS; y++) {
      let point = pointsGrid[x][y];
      
      if (point.y > height - BORDER) continue;
      
      buffer.fill(point.color[0], point.color[1], point.color[2]);
      drawKnitStitch(buffer, point.x, point.y, point.size);
    }
  }
}

function draw() {
  clear();
  const scale = 1.1;
  const offset = (width * scale - width) / -2;
  image(buffer, offset, offset, width * scale, height * scale);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buffer = createGraphics(width, height);
  buffer.pixelDensity(1);
}

function keyPressed() {
  if (key.toLowerCase() === 's') {
    // Save canvas with hash in filename
    let timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let filename = `artwork_${hl.tx.hash}_${timestamp}`;
    saveCanvas(filename, 'png');
  }
}