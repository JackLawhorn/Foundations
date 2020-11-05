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

    setTerrain(terrain) {
        if(terrain != "river" && terrain != "delta") {
            var newTerrain = new TerrainObject(this.x, this.y, this.a);
            newTerrain.setTerrain(terrain);
            map.setTerrainAtCoord(newTerrain);
        }
        else this.terrain = terrain;
    }

    adjustEdges(adj, size) {
        var dirs = [];
            
        if(this.from == undefined) {}
        else {
            if(this.from.getY() < this.x) dirs.push("n");
            if(this.from.getX() > this.x) dirs.push("e");
            if(this.from.getY() > this.x) dirs.push("s");
            if(this.from.getX() < this.x) dirs.push("w");
        }
        if(this.to == undefined) {}
        else {
            if(this.to.getY() < this.x) dirs.push("n");
            if(this.to.getX() > this.x) dirs.push("e");
            if(this.to.getY() > this.x) dirs.push("s");
            if(this.to.getX() < this.x) dirs.push("w");
        }
       
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