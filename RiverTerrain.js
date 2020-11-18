class RiverTerrain extends TerrainObject {
    constructor(x, y, a, from, to) {
        super();

        this.x = x;
        this.y = y;
        this.altitude = a;
        this.from = from;
        this.to = to;
        this.terrain = "";
        this.class = "";
    }

    getX() { return this.x; }
    getY() { return this.y; }
    getAltitude() { return this.altitude; }
    getTerrain() { return this.terrain; }

    setTerrain(terrain, map, from, to) {
        if(terrain != "river" && terrain != "delta") {
            var newTerrain = new TerrainObject(this.x, this.y, this.altitude);
            newTerrain.setTerrain(terrain);
            map.setTerrainAtCoord(this.x, this.y, newTerrain);
        }
        else this.terrain = terrain;
    }

    adjustEdges(adj, size) {
        var dirs = [],
            ts = ["river", "delta", "lake", "coast", "cove"];

        if(this.from == undefined) {}
        else {
            if(this.from.getY() < this.y) dirs.push("n");
            if(this.from.getX() > this.x) dirs.push("e");
            if(this.from.getY() > this.y) dirs.push("s");
            if(this.from.getX() < this.x) dirs.push("w");
        }
        if(this.to == undefined) {}
        else {
            if(this.to.getY() < this.y) dirs.push("n");
            if(this.to.getX() > this.x) dirs.push("e");
            if(this.to.getY() > this.y) dirs.push("s");
            if(this.to.getX() < this.x) dirs.push("w");
        }

        // // North
        // if(this.y > 1 && ts.indexOf(adj[0].getTerrain()) >= 0)
        //     dirs.push("n")
        // // East
        // if(this.x < size && ts.indexOf(adj[2].getTerrain()) >= 0)
        //     dirs.push("e")
        // // South
        // if(this.y < size && ts.indexOf(adj[4].getTerrain()) >= 0)
        //     dirs.push("s")
        // // West
        // if(this.x > 1 && ts.indexOf(adj[6].getTerrain()) >= 0)
        //     dirs.push("w")
       
        this.class = dirs.join(" ");
    }

    getText() {
        return "";
    }
    
    render() {
        var result = $("<td />")
            .addClass(this.class)
            .attr("altitude", this.altitude)
            .attr("terrain", this.terrain)
            .attr("abrev", this.getText())
            .append($(`<svg height='75' width='75'>
                <line class='n' x1='50%'  y1='0'    x2='50%' y2='50%' stroke='rgb(148, 213, 241)' stroke-width='5' />
                <line class='e' x1='100%' y1='50%'  x2='50%' y2='50%' stroke='rgb(148, 213, 241)' stroke-width='5' />
                <line class='s' x1='50%'  y1='100%' x2='50%' y2='50%' stroke='rgb(148, 213, 241)' stroke-width='5' />
                <line class='w' x1='0'    y1='50%'  x2='50%' y2='50%' stroke='rgb(148, 213, 241)' stroke-width='5' />
            </svg>`));
        
        return result;
    }
}