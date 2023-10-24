//////////////////////////////-ENUM-/////////////////////////////////////

const tileStatus = Object.freeze({  // enum of tile status
    ALIVE: 0,
    BURNING: 1,
    DEAD: 2
});

////////////////////////////-CLASSES-////////////////////////////////////

class Tile {
    constructor(rows, cols, tileSize) {
        this.cols = cols; // Adjust the cols position based on grid coordinates and tileSize
        this.rows = rows; // Adjust the rows position based on grid coordinates and tileSize
        this.tileSize = tileSize;
        this.currentStatus = tileStatus.ALIVE;
        this.color = "green";
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.cols * (this.tileSize + 2), this.rows * (this.tileSize + 2), this.tileSize, this.tileSize);
    }

    isBurning() { return this.currentStatus === tileStatus.BURNING; }

    isAlive() { return this.currentStatus === tileStatus.ALIVE; }

    getCurrentStatus() { return this.currentStatus; }

    getColPosition() { return this.cols; }

    getRowPosition() { return this.rows; }

    setStatus(newStatus, ctx) {
        switch (newStatus) {
            case tileStatus.BURNING:
                this.currentStatus = tileStatus.BURNING;
                this.color = "red";
                break;
            case tileStatus.DEAD:
                this.currentStatus = tileStatus.DEAD;
                this.color = "grey"
                break;
            default:
                throw new Error(`Invalid status: ${newStatus}`);
        }
        this.draw(ctx);
    }
}

class Grid {
    constructor(rows, cols, tileSize) {
        this.rows = rows;
        this.cols = cols;
        this.tiles = [];

        for (let i = 0; i < rows; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < cols; j++) {
                this.tiles[i][j] = new Tile(i, j, tileSize); // Pass tileSize to the Tile constructor
            }
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.tiles[i][j].draw(ctx);
            }
        }
    }

    getTile(row, col) { return this.tiles[row][col]; }

    getRowCount() { return this.rows; }

    getColCount() { return this.cols; }

    getNeighbors(tile) { // x for rows and y for col (easier to understand with dx and dy)
        const neighbors = [];
        const x = tile.getColPosition();
        const y = tile.getRowPosition();

        const offsets = [
            { dx: 0, dy: -1 }, // Top
            { dx: 1, dy: 0 },  // Right
            { dx: 0, dy: 1 },  // Bottom
            { dx: -1, dy: 0 }  // Left
        ];

        for (const offset of offsets) {
            const neighborX = x + offset.dx;
            const neighborY = y + offset.dy;
            if (neighborX >= 0 && neighborX < this.cols && neighborY >= 0 && neighborY < this.rows) {
                neighbors.push(this.tiles[neighborY][neighborX]);
            }
        }

        return neighbors;
    }
}

class Simulation {
    constructor(config) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.grid;
        this.simulationInterval;
        this.started = false;
        this.probability = config.probability;
        this.initTiles = config.initTiles;
        this.tileSize = 20;
        this.initializeCanvas(config);
    }

    initializeCanvas(config) {
        if (config.cols && config.rows && config.probability && config.initTiles) {
            this.drawCanvas(config.cols, config.rows)
            
            this.grid = new Grid(config.cols, config.rows, this.tileSize); // Pass tileSize to the Grid constructor

            this.grid.draw(this.ctx);
        } else {
            alert("Could not initialize the simulation. Please fill properly the following properties in the config.json file: \"rows\", \"cols\", \"probability\" and \"initTiles\".")
        }
    }

    simulate() {
        if (!this.started) {

            if (this.initTiles.length > 0) { // set on fire the specified trees if any or else set 0:0 on fire
                this.initTiles.forEach(tile => {
                    try {
                        this.grid.getTile(tile[0], tile[1]).setStatus(tileStatus.BURNING, this.ctx);
                    } catch {
                        alert("Could not use the initial tiles. Please modify your config.json file.");
                        this.resetSimulation();
                    }
                });
            } else {
                this.grid.getTile(0, 0).setStatus(tileStatus.BURNING, this.ctx);
            }

            this.started = true;
        } else {
            const skipList = new Set(); // list of tiles that are going to be burning next round: should not be checked this round
            for (let row = 0; row < this.grid.getRowCount(); row++) {  // read all rows from the grid
                for (let col = 0; col < this.grid.getColCount(); col++) {  // read all columns from the grid
                    let tile = this.grid.getTile(row, col);
                    if (tile.isBurning() && !(skipList.has(tile))) {  // if tile is burning and not part of the tile that will be burning next round
                        let neighbors = this.grid.getNeighbors(tile);
                        neighbors.forEach(neighbor => {
                            if (neighbor.isAlive()) {  // if neighbor didn't burn yet
                               if (Math.random() < this.probability) {   // probability check
                                    neighbor.setStatus(tileStatus.BURNING, this.ctx)
                                    skipList.add(neighbor)  // add tiles that will be burning next round
                                }
                            }
                        });
                        tile.setStatus(tileStatus.DEAD, this.ctx); // the tile will be dead next round
                    }
                }
            }
        }
    }

    drawCanvas(nbRows, nbCols) {
        this.canvas.width = nbCols * (this.tileSize + 2);
        this.canvas.height = nbRows * (this.tileSize + 2);

        document.body.appendChild(this.canvas);
    }

    startSimulation() {
        const timeStep = 1000;
        if (!this.simulationInterval) {
            this.simulationInterval = setInterval(() => this.simulate(), timeStep);
        }
    }

    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = undefined;
        }
    }

    resetSimulation() {
        this.started = false;
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = undefined;
        }
        this.canvas.remove();
        fetchDataToInitialize();
    }
}

/////////////////////////////-MAIN-///////////////////////////////////

let simulation; // Declare a global variable

function fetchDataToInitialize() {
    fetch('./config.json')
        .then(response => response.json())
        .then(config => {
            simulation = new Simulation(config); // Assign the instance to the global variable
        })
        .catch(error => console.error(error));
}

fetchDataToInitialize();


