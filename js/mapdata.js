var MapData = /** @class */ (function () {
    function MapData() {
        //         this.lines = new Array<Line>();
        this.sectors = new Array();
        this.defaultMap();
    }
    MapData.prototype.defaultMap = function () {
        var v = new Array();
        v.push(new Vertex(-32, -32));
        v.push(new Vertex(32, -32));
        v.push(new Vertex(32, 32));
        v.push(new Vertex(-32, 32));
        var s = new Sector();
        s.edges.push(new Edge(v[3], v[2]));
        s.edges.push(new Edge(v[2], v[1]));
        s.edges.push(new Edge(v[1], v[0]));
        s.edges.push(new Edge(v[0], v[3]));
        s.edges[1].modifiers.push(new EdgeSubdivider(3));
        s.edges[1].modifiers.push(new EdgeInset(8, 0));
        this.sectors.push(s);
    };
    MapData.prototype.getAllEdges = function () {
        var output = new Array();
        for (var i = 0; i < this.sectors.length; i++) {
            output = output.concat(this.sectors[i].edges);
        }
        return output;
    };
    //     getSectorIndexAt(p:Vertex):number {
    //         if (this.sectors.length == 0) return -1;
    //         var nIndex = -1;
    //         var nDist = Number.MAX_VALUE;
    //         for (let i = 0; i < this.sectors.length; i++) {
    //             if (this.sectors[i].bounds.pointInBounds(p)) {
    //                 let d = sqrDist(p, this.sectors[i].bounds.midPoint);
    //                 if (d < nDist) {
    //                     nDist = d;
    //                     nIndex = i;
    //                 }
    //             }
    //         }
    //         return nIndex;
    //     }
    MapData.prototype.getNearestEdge = function (p) {
        var allEdges = this.getAllEdges();
        if (allEdges.length == 0)
            return null;
        if (allEdges.length == 1)
            return allEdges[0];
        var nDist = distToSegmentMidpoint(p, allEdges[0]);
        var nEdge = allEdges[0];
        for (var i = 1; i < allEdges.length; i++) {
            var d = distToSegmentMidpoint(p, allEdges[i]);
            if (d < nDist) {
                nDist = d;
                nEdge = allEdges[i];
            }
        }
        return nEdge;
    };
    MapData.prototype.moveVertex = function (from, to) {
        // This gets slower the more lines there are. If this gets bad, sort the lines and do a binary search
        // Also, this invalidates sectors a lot. I should really have a system for marking sectors as dirty and invalidate later.
        for (var i = 0; i < this.sectors.length; i++) {
            for (var j = 0; j < this.sectors[i].edges.length; j++) {
                if (this.sectors[i].edges[j].start.equals(from)) {
                    this.sectors[i].edges[j].start.x = to.x;
                    this.sectors[i].edges[j].start.y = to.y;
                    this.sectors[i].edges[j].dirty = true;
                }
                if (this.sectors[i].edges[j].end.equals(from)) {
                    this.sectors[i].edges[j].end.x = to.x;
                    this.sectors[i].edges[j].end.y = to.y;
                    this.sectors[i].edges[j].dirty = true;
                }
            }
        }
    };
    return MapData;
}());
//# sourceMappingURL=mapdata.js.map