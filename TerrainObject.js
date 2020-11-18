class TerrainObject {
    constructor(x, y, a) {
        this.x = x;
        this.y = y;
        this.altitude = a;
        this.terrain  = "";
        this.class = "";
    }

    // X and Y coordinates from the top left and starting at 1
    getX() { return this.x; }
    getY() { return this.y; }

    // Altitude from -2 to 2
    getAltitude() {
        return this.altitude;
    }
    setAltitude(altitude) {
        this.altitude = altitude;
    }

    // Type of environment
    getTerrain() {
        return this.terrain;
    }
    setTerrain(terrain, map, from, to) {
        if(terrain == "river" || terrain == "delta") {
            var newTerrain = new RiverTerrain(this.x, this.y, this.altitude, from, to);
            newTerrain.setTerrain(terrain);
            map.setTerrainAtCoord(this.x, this.y, newTerrain);
        }
        else this.terrain = terrain;
    }

    adjustEdges(adj, size) {
        var dirs = [],
            water = ["ocean", "lake", "coast", "cove"],
            n = 0, ne = 1, e = 2, se = 3,
            s = 4, sw = 5, w = 6, nw = 7;

        if(water.indexOf(this.terrain) >= 0) {
            // North
            if(this.y > 1 && water.indexOf(adj[n].getTerrain()) == -1)
                dirs.push("n")
            // East
            if(this.x < size && water.indexOf(adj[e].getTerrain()) == -1)
                dirs.push("e")
            // South
            if(this.y < size && water.indexOf(adj[s].getTerrain()) == -1)
                dirs.push("s")
            // West
            if(this.x > 1 && water.indexOf(adj[w].getTerrain()) == -1)
                dirs.push("w")
            
            // Northeast
            if(this.x < size && this.y > 1 && water.indexOf(adj[ne].getTerrain()) == -1)
                dirs.push("ne")
            // Southeast
            if(this.x < size && this.y < size && water.indexOf(adj[se].getTerrain()) == -1)
                dirs.push("se")
            // Southwest
            if(this.x > 1 && this.y < size && water.indexOf(adj[sw].getTerrain()) == -1)
                dirs.push("sw")
            // Northwest
            if(this.x > 1 && this.y > 1 && water.indexOf(adj[nw].getTerrain()) == -1)
                dirs.push("nw")
        }
        else {
            // North
            if(this.y > 1 && water.indexOf(adj[n].getTerrain()) >= 0)
                dirs.push("n")
            // East
            if(this.x < size && water.indexOf(adj[e].getTerrain()) >= 0)
                dirs.push("e")
            // South
            if(this.y < size && water.indexOf(adj[s].getTerrain()) >= 0)
                dirs.push("s")
            // West
            if(this.x > 1 && water.indexOf(adj[w].getTerrain()) >= 0)
                dirs.push("w")
            
            // Northeast
            if(this.x < size && this.y > 1 && water.indexOf(adj[ne].getTerrain()) >= 0)
                dirs.push("ne")
            // Southeast
            if(this.x < size && this.y < size && water.indexOf(adj[se].getTerrain()) >= 0)
                dirs.push("se")
            // Southwest
            if(this.x > 1 && this.y < size && water.indexOf(adj[sw].getTerrain()) >= 0)
                dirs.push("sw")
            // Northwest
            if(this.x > 1 && this.y > 1 && water.indexOf(adj[nw].getTerrain()) >= 0)
                dirs.push("nw")
        }

        this.class = dirs.join(" ");
    }

    getText() {
        switch(this.terrain) {
            case "ocean":
                return "~";
            case "lake":
                return "La";
            case "mountain":
                return "Mt";
            case "volcano":
                return "Vo";
            case "hill":
                return "^";
            case "foothill":
                return "^";
            case "coast":
                return "~";
            case "beach":
                return "Be";
            case "cliff":
                return "Cl";
            case "cove":
                return "Co";
            case "grassland":
                return "🌿";
            case "tundra":
                return "❄️";
            case "mesa":
                return "🌵^";
            case "canyon":
                return "V";
            case "desert":
                return "🌵";
            case "lowland":
                return "v";
            case "valley":
                return "Vy";
            case "lake":
                return "🌊";
            case "swamp":
                return "~";
            case "forest":
                return "Fo";
            default:
                return "";
        }
    }
    
    render() {
        var result = $("<td />")
            .addClass(this.class)
            .attr("altitude", this.altitude)
            .attr("terrain", this.terrain)
            .attr("abrev", this.getText());
        
        if(this.terrain == "lake" || this.terrain == "coast" || this.terrain == "cove")
            $(result).append("<div class='water-helper ne' />")
            .append("<div class='water-helper se' />")
            .append("<div class='water-helper sw' />")
            .append("<div class='water-helper nw' />");
        
        return result;
    }
}