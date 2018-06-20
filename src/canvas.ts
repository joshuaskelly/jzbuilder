enum EditMode {
    VERTEX,
    LINE,
    SECTOR,
    THING,
    MAKESECTOR
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

class BuilderCanvas {
    // Constants
    CANVAS_BG_COLOR : string        = "#434043";
    GRID_COLOR : string             = "#000000";
    GRID_CENTER_COLOR : string      = "#888888";
    DRAWLINE_COLOR : string         = "#998811";
    MAPLINE_COLOR : string          = "#cccccc";
    HIGHLIGHTLINE_COLOR : string    = "#FFFFFF";
    VERTEX_COLOR : string           = "#FF8811";
    DRAWVERTEX_COLOR : string       = "#FFFFFF";
    SECTOR_COLOR : string           = "#22441144";
    SELECTEDLINE_COLOR : string     = "#FFAA11";


    public resetDefaultColors():void {
        this.CANVAS_BG_COLOR        = "#434043";
        this.GRID_COLOR             = "#000000";
        this.GRID_CENTER_COLOR      = "#888888";
        this.DRAWLINE_COLOR         = "#998811";
        this.MAPLINE_COLOR          = "#cccccc";
        this.HIGHLIGHTLINE_COLOR    = "#FFFFFF";
        this.VERTEX_COLOR           = "#FF8811";
        this.DRAWVERTEX_COLOR       = "#FFFFFF";
        this.SECTOR_COLOR           = "#22441144";
        this.SELECTEDLINE_COLOR     = "#FFAA11";
    }

    public randomColors():void {
        this.CANVAS_BG_COLOR        = getRandomColor();
        this.GRID_COLOR             = getRandomColor();
        this.GRID_CENTER_COLOR      = getRandomColor();
        this.DRAWLINE_COLOR         = getRandomColor();
        this.MAPLINE_COLOR          = getRandomColor();
        this.HIGHLIGHTLINE_COLOR    = getRandomColor();
        this.VERTEX_COLOR           = getRandomColor();
        this.DRAWVERTEX_COLOR       = getRandomColor();
        this.SELECTEDLINE_COLOR     = getRandomColor();
        this.SECTOR_COLOR           = getRandomColor()+"44";
        this.redraw();
    }

    LINE_SELECT_DISTANCE : number   = 5;
    VERTEX_SIZE : number            = 2;
    ZOOM_SPEED : number             = 1.05;
    GRIDLINE_WIDTH : number         = 0.5;
    PERP_LENGTH : number            = 5.0;

    viewOffset : Vertex = new Vertex(-400, -300);
    zoom : number = 1.0;
    gridSize : number = 32;

    canvas : HTMLCanvasElement;
    ctx : CanvasRenderingContext2D;

    mapData : MapData;

    drawingLines : Array<Line>;
    selectedLines : Array<Line>;
    highlightSector : number;
    highlightLines : Array<Line>;

    public constructor (canvas: HTMLCanvasElement, mapData : MapData) {
        this.mapData = mapData;
        this.canvas = canvas;
        this.drawingLines = new Array<Line>();
        this.selectedLines = new Array<Line>();
        this.ctx = <CanvasRenderingContext2D> this.canvas.getContext('2d');
    }

    public posToView(p:Vertex): Vertex {
        return new Vertex((p.x / this.zoom) - this.viewOffset.x, (p.y / this.zoom) - this.viewOffset.y);
    }

    public viewToPos(p:Vertex): Vertex {
        return new Vertex((p.x + this.viewOffset.x) * this.zoom, (p.y + this.viewOffset.y)* this.zoom);
    }

    public viewToGridPos(p:Vertex): Vertex {
        let mp = this.viewToPos(p);
        mp.x = Math.round(mp.x / this.gridSize) * this.gridSize;
        mp.y = Math.round(mp.y / this.gridSize) * this.gridSize;
        return mp;
    }

    public redraw():void {
        this.drawGrid();
        this.drawSectors();
        this.drawMapLines();
        this.drawDrawLines();
        if (Input.state == InputState.EXTRUDING) this.drawExtrudeLine();
        this.drawVertexes();
        this.drawSelectedLines();
        this.drawHighlightedLines();
        //this.drawDebug();
    }

    drawDebug() {
        this.ctx.strokeText(Input.state.toString(), 10, 10);
    }

    drawGrid():void {
        this.ctx.fillStyle = this.CANVAS_BG_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineWidth = this.GRIDLINE_WIDTH;
        this.ctx.strokeStyle = this.GRID_COLOR;
        let i;
        for (i = 0; i < this.canvas.width; i++) {
            if ( (i + this.viewOffset.x) % Math.round(this.gridSize/this.zoom) == 0 ) {
                if (i + this.viewOffset.x == 0) this.ctx.strokeStyle = this.GRID_CENTER_COLOR;
                this.ctx.beginPath();
                this.ctx.moveTo(i, 0);
                this.ctx.lineTo(i, this.canvas.height);
                this.ctx.stroke();
                if (i + this.viewOffset.x == 0) this.ctx.strokeStyle = this.GRID_COLOR;
            }
        }

        for (i = 0; i < this.canvas.height; i++) {
            if ( (i + this.viewOffset.y) % Math.round(this.gridSize/this.zoom) == 0 ) {
                if (i + this.viewOffset.y == 0) this.ctx.strokeStyle = this.GRID_CENTER_COLOR;
                this.ctx.beginPath();
                this.ctx.moveTo(0, i);
                this.ctx.lineTo(this.canvas.width, i);
                this.ctx.stroke();
                if (i + this.viewOffset.y == 0) this.ctx.strokeStyle = this.GRID_COLOR;
            }
        }
    }

    drawSectors():void {
        if (this.mapData.sectors.length != 0) {
            //console.log("hello");
            for (let i = 0; i < mapData.sectors.length; i++) {
                let p = this.posToView(this.mapData.sectors[i].bounds.topLeft);
                this.ctx.drawImage(this.mapData.sectors[i].preview, p.x, p.y, this.mapData.sectors[i].bounds.width / this.zoom, this.mapData.sectors[i].bounds.height / this.zoom);
                this.drawLines(this.mapData.sectors[i].lines, (i == this.highlightSector)?this.HIGHLIGHTLINE_COLOR: this.MAPLINE_COLOR, (i == this.highlightSector)?2.0:1.0);
            }
        }
    }

    drawMapLines():void {
        this.drawLines(this.mapData.lines, this.MAPLINE_COLOR);
    }

    drawDrawLines():void {
        this.drawLines(this.drawingLines, this.DRAWLINE_COLOR, 2, false);
    }

    drawVertexes():void {
        this.ctx.fillStyle = this.VERTEX_COLOR;
        let allLines:Array<Line> = mapData.getAllLines();
        for (let i = 0; i < allLines.length; i++) {
            let p = this.posToView(allLines[i].start);
            this.ctx.fillRect(p.x - this.VERTEX_SIZE, p.y - this.VERTEX_SIZE, this.VERTEX_SIZE * 2, this.VERTEX_SIZE * 2);

            p = this.posToView(allLines[i].end);
            this.ctx.fillRect(p.x - this.VERTEX_SIZE, p.y - this.VERTEX_SIZE, this.VERTEX_SIZE * 2, this.VERTEX_SIZE * 2);
        }

        if (editMode == EditMode.VERTEX) {
            this.ctx.fillStyle = this.DRAWVERTEX_COLOR;
            let p = this.posToView(Input.mouseGridPos);
            this.ctx.fillRect(p.x - this.VERTEX_SIZE, p.y - this.VERTEX_SIZE, this.VERTEX_SIZE * 2, this.VERTEX_SIZE * 2);
        }
    }

    drawSelectedLines():void {
        this.drawLines(this.selectedLines, this.SELECTEDLINE_COLOR, 2.0);
    }

    drawHighlightedLines():void {
        if (this.highlightLines != null) this.drawLines(this.highlightLines, this.HIGHLIGHTLINE_COLOR, 2.0);
    }

    drawLines(lines : Array<Line>, color:string, width:number = 1.0, drawNodule:boolean = true):void {
        if (lines == null) return;
        if (lines.length == 0) return;
        this.ctx.lineWidth = width;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        for (let i = 0; i < lines.length; i++) {
            if (lines[i] != null) {
                let p:Vertex = this.posToView(lines[i].start);
                this.ctx.moveTo(p.x, p.y);
                p = this.posToView(lines[i].end);
                this.ctx.lineTo(p.x, p.y);
                if (drawNodule) {
                    p = this.posToView(lines[i].getMidpoint());
                    this.ctx.moveTo(p.x, p.y);
                    let perp = lines[i].getPerpendicular();
                    this.ctx.lineTo(p.x - (perp.x * this.PERP_LENGTH), p.y - (perp.y * this.PERP_LENGTH));
                }
            }
        }
        this.ctx.stroke();
    }

    drawExtrudeLine():void {
        this.drawLines( [
            new Line(extrudeEnd.start, extrudeStart.end),
            extrudeEnd,
            new Line(extrudeStart.start, extrudeEnd.end),
            extrudeStart
        ], this.DRAWLINE_COLOR, 2.0, false);
    }
}