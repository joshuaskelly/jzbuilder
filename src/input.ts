enum InputMode {
    VERTEX = "vertex",
    EDGE = "edge",
    SECTOR = "sector"
}

class Input {
    static mousePos:Vertex;
    static mouseGridPos:Vertex;

    static viewDragging:boolean = false;
    static mode:InputMode = InputMode.VERTEX;

    static lockModes:Boolean = false;

    static lastAnim:Anim;
    static ctrlHeld:boolean = false; // This is necessary for checking CMD on mac
    static shiftHeld:boolean = false;

    static switchMode(mode:InputMode) {
        if (Input.lockModes == false) {
            Input.mode = mode;

            let off = 10;
            if (mode != InputMode.VERTEX) off += 74;
            if (mode == InputMode.SECTOR) off += 74;

            if (this.lastAnim != null) {
                this.lastAnim.cancel();
            }

            this.lastAnim = new Anim(mainCanvas.modeSelectionOffset, "x", off, 0.3);

            if (Tool.activeTool.onModeChange) {
                Tool.activeTool.onModeChange(mode);
            }
        }
    }

    static Initialise() {
        this.mousePos = new Vertex(0, 0);
        this.mouseGridPos = new Vertex(0, 0);

        window.addEventListener("keydown", Input.onKeyDown);
        window.addEventListener("keyup", Input.onKeyUp);
        mainCanvas.canvas.addEventListener("mousemove", Input.onMouseMove);
        mainCanvas.canvas.addEventListener("mousedown", Input.onMouseDown);
        mainCanvas.canvas.addEventListener("mouseup", Input.onMouseUp);

        // I love standards
        mainCanvas.canvas.addEventListener("mousewheel", Input.onMouseWheel);
        mainCanvas.canvas.addEventListener("wheel", Input.onMouseWheel);
    }

    static Uninitialise() {
        window.removeEventListener("keydown", Input.onKeyDown);
        window.removeEventListener("keyup", Input.onKeyUp);
        mainCanvas.canvas.removeEventListener("mousemove", Input.onMouseMove);
        mainCanvas.canvas.removeEventListener("mousedown", Input.onMouseDown);
        mainCanvas.canvas.removeEventListener("mouseup", Input.onMouseUp);
        mainCanvas.canvas.removeEventListener("mousewheel", Input.onMouseWheel);
        mainCanvas.canvas.removeEventListener("wheel", Input.onMouseWheel);
    }

    static onKeyDown(e : KeyboardEvent):void {
        dirty = true;
    
        if (e.key == " ") Input.viewDragging = true;
    
        if (e.key == "1") Input.switchMode(InputMode.VERTEX);
        if (e.key == "2") Input.switchMode(InputMode.EDGE);
        if (e.key == "3") Input.switchMode(InputMode.SECTOR);
    
        for (let i = 0; i < Tool.tools.length; i++) {
            if (e.key == Tool.tools[i].selectKey) {
                Tool.changeTool(Tool.tools[i]);
            }
        }
    
        if (e.key == "]") {
            mainCanvas.gridSize *= 2;
        }
    
        if (e.key == "[") {
            mainCanvas.gridSize /= 2;
        }
    
        if (e.key == "Escape") {
            Tool.changeTool(Tool.tools[0]);
        }
    
        if (e.key == "Shift") {
            Input.shiftHeld = true;
        }
    
        if (e.keyCode == 224 || e.keyCode == 91 || e.keyCode == 93 || e.key == "Control") {
            Input.ctrlHeld = true;
        }
    
        if (Input.ctrlHeld && e.key == "z") {
            Undo.undo();
        }
    
        if (e.key == "Tab") {
            switchView();
        }
    }
    
    static onKeyUp(e:KeyboardEvent):void {
        dirty = true;
        if (e.key == " ") Input.viewDragging = false;
    
        if (e.key == "Shift") {
            Input.shiftHeld = false;
        }
    
        if (e.keyCode == 224 || e.keyCode == 91 || e.keyCode == 93 || e.key == "Control") {
            Input.ctrlHeld = false;
        }
    }
    
    static onMouseMove(e:MouseEvent) {
        dirty = true;
        Input.mousePos = mainCanvas.viewToPos(new Vertex(e.offsetX, e.offsetY));
        Input.mouseGridPos = mainCanvas.viewToGridPos(new Vertex(e.offsetX, e.offsetY));
    
        if (Input.viewDragging) {
            mainCanvas.viewOffset.x -= e.movementX;
            mainCanvas.viewOffset.y -= e.movementY;
        }
    
        if (Tool.activeTool.onMouseMove) {
            Tool.activeTool.onMouseMove(e);
        }
    }
    
    static onMouseWheel(e:MouseWheelEvent) {
        dirty = true;
        e.preventDefault();
    
        if (e.deltaY > 0) {
            mainCanvas.zoom *= mainCanvas.ZOOM_SPEED;
            mainCanvas.viewOffset.x -= (Input.mousePos.x) * ((mainCanvas.ZOOM_SPEED - 1.0) / mainCanvas.zoom);
            mainCanvas.viewOffset.y -= (Input.mousePos.y) * ((mainCanvas.ZOOM_SPEED - 1.0) / mainCanvas.zoom);
        }
        if (e.deltaY < 0) {
            mainCanvas.zoom /= mainCanvas.ZOOM_SPEED;
            mainCanvas.viewOffset.x += (Input.mousePos.x) * ((mainCanvas.ZOOM_SPEED - 1.0) / mainCanvas.zoom);
            mainCanvas.viewOffset.y += (Input.mousePos.y) * ((mainCanvas.ZOOM_SPEED - 1.0) / mainCanvas.zoom);
        }
    }
    
    static onMouseDown(e:MouseEvent) {
        e.preventDefault();
    
        if (Tool.activeTool.onMouseDown) {
            Tool.activeTool.onMouseDown(e);
        }
    
        dirty = true;
    }
    
    static onMouseUp(e:MouseEvent) {
        if (Tool.activeTool.onMouseUp) {
            Tool.activeTool.onMouseUp(e);
        }
    
        dirty = true;
    }
}

