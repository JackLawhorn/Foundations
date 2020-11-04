class MapObject {
    constructor(size) {
        this.size = size;
        this.stats = {};
        this.map = [];
        for(var x = 1; x <= this.size; x++) {
            this.map[x] = Array(this.size+1).fill([]);
        }

        this.fillAltitude();
        this.fillOcean();
        this.fillTerrain();
        this.traceRivers();
        this.finalizeAdjacents();
        
        this.groupRegions(); // TODO

        this.prepareStats();

        this.fillTable($("table#map"));
        this.fillStats();
    }

    // Fill in terrain altitudes at random
    fillAltitude() {
        for(var y = 1; y <= this.size; y++) {
            for(var x = 1; x <= this.size; x++) {
                this.map[x][y] = new TerrainObject(x, y, Math.ceil(Math.random()*5 - 3));
            }
        }
    }

    // Fills in the ocean from the edges inward
    fillOcean() {
        var thisObj = this;
        
        // Pick one side at random to be landlocked
        var landlocked = Math.ceil(Math.random()*4);
        // console.log(landlocked);

        for(var i = 0; i < this.size/10; i++) {
            var topEdge = this.search({ ys: [1+i], as: [-1, -2] }),
                rightEdge = this.search({ xs: [this.size-i], as: [-1, -2] }),
                bottomEdge = this.search({ ys: [this.size-i], as: [-1, -2] }),
                leftEdge = this.search({ xs: [1+i], as: [-1, -2] });

            var edges = [];
            if(i == 0) {
                if(landlocked != 1) edges = edges.concat(topEdge);
                if(landlocked != 2) edges = edges.concat(rightEdge);
                if(landlocked != 3) edges = edges.concat(bottomEdge);
                if(landlocked != 4) edges = edges.concat(leftEdge);
            }
            else edges = [].concat(topEdge, rightEdge, bottomEdge, leftEdge);

            $(edges).each(function() { thisObj.flood(this); });
        }
    }

    // (fillOcean) Flood the given TerrainObject if necessary
    flood(target) {
        target.setTerrain("ocean");
        var adj = this.adjacents(target, false);
        var thisObj = this,
            size = this.size;

        $(adj).each(function(i, val) {
            if(val != undefined) {
                if(val.getAltitude() < 0 && val.getTerrain() != "ocean")
                    thisObj.flood(val)
            }
        });
    }

    // Fill in Terrain based on altitude
    fillTerrain() {
        var thisObj = this;

        var islands = this.search({ ts: [""], adjacentTerrain: ["ocean", "coast"], adjacentDiagonal: false });
        $(islands).each(function() {
            if(!thisObj.adjacentTo(this, [], [""], 1, false)) {
                this.setTerrain("ocean");
                this.setAltitude(-1);
            }
            if(!thisObj.adjacentTo(this, [], [""], 3, true)) {
                this.setTerrain("ocean");
                this.setAltitude(-1);
            }
        })

        var coast = this.search({ ts: ["ocean"], adjacentTerrain: [""], adjacentDiagonal: true });
        $(coast).each(function() { this.setTerrain("coast") })
        coast = this.search({ ts: [""] });
        $(coast).each(function() {
            if(thisObj.adjacentTo(this, [], [""], 1, true) && !(
               thisObj.adjacentTo(this, [], [""], 1, false))) {
                   this.setAltitude(-1);
                   this.setTerrain("coast");
               }
        });
        coast = this.search({ ts: ["coast"], adjacentTerrain: [""], adjacentThreshhold: 3, adjacentDiagonal: false });
        $(coast).each(function() { this.setTerrain("cove"); });
        coast = this.search({ ts: ["cove", "lake"] });
        $(coast).each(function() {
            if(this.getX() == 1 || this.getX() == thisObj.size ||
               this.getY() == 1 || this.getY() == thisObj.size) {
                this.setAltitude(Math.floor(Math.random()*3));
                this.setTerrain("");
            }
        });
        
        var beaches = this.search({ ts: [""], adjacentTerrain: ["coast", "cove"], adjacentDiagonal: true })
        $(beaches).each(function() {
            if(this.getAltitude() <= 0) {
                this.setAltitude(0);
                this.setTerrain("beach");
            }
            else {
                this.setAltitude(1);
                this.setTerrain("cliff");
            }
        });
        
        var valleys = this.search({ as: [-2], ts: [""] });
        $(valleys).each(function() { this.setTerrain("valley") })
        valleys = this.search({ as: [-1, 0], ts: [""] });
        $(valleys).each(function() {
            if(thisObj.adjacentTo(this, [this.getAltitude() + 2, this.getAltitude() + 3], [], 2, false))
                this.setTerrain("valley");
        })

        var highlands = this.search({ as: [1, 2], ts: [""] });
        var volcano = Math.floor(Math.random()*highlands.length);
        $(highlands).each(function(i) {
            if(this.getAltitude() == 2 && i == volcano) this.setTerrain("volcano");
            else if(this.getAltitude() == 2) this.setTerrain("mountain");
            else this.setTerrain("hill");
        });
        highlands = this.search({ ts: ["hill"], adjacentTerrain: ["mountain", "volcano"], adjacentDiagonal: false })
        $(highlands).each(function() {
            this.setTerrain("foothill");
        });

        var plains = this.search({ as: [0, -1], ts: [""] });
        $(plains).each(function(i) {
            if(this.getAltitude() == 0) this.setTerrain("plain");
            else if(this.getAltitude() == -1) this.setTerrain("lowland");
        });
    }

    traceRivers() {
        var thisObj = this;

        var mountains = this.search({ ts: ["mountain"] });
        $(mountains).each(function() {
            thisObj.riverHelper(this);
        }); 

        var rivers = this.search({ ts: ["river"], });
        $(rivers).each(function() {
            if(this.getAltitude() == -2) this.setTerrain("lake");
            else if(thisObj.adjacentTo(this, [], ["coast", "ocean", "cove"], 1, true))
                this.setTerrain("delta");
        });

        var valleys = this.search({ as: [-1, -2], ts: ["lowland", "valley"], adjacentTerrain: ["river", "delta", "lake"], adjacentDiagonal: true });
        $(valleys).each(function() {
            this.setAltitude(-1);
            if(thisObj.adjacentTo(this, [], ["river", "delta", "lake"], 1, false)) this.setTerrain("swamp");
        });

        var forests = this.search({ ts: ["hill", "plain", "lowland"], adjacentTerrain: ["lake", "river", "delta", "swamp"], });
        $(forests).each(function() { this.setTerrain("forest"); });
    }
    riverHelper(s) {
        var thisObj = this,
            n = undefined;

        if(s != undefined) {
            if(s.getTerrain() != "mountain") s.setTerrain("river");
            if(!this.adjacentTo(s, [], ["coast", "cove", "ocean"], 1, false) &&
               !this.adjacentTo(s, [], ["river", "delta"], 1, true)) {
                var adj = this.adjacents(s, false);
                $(adj).each(function() {
                    if(this != undefined) {
                        if(n == undefined)
                            n = this;
                        else if((this.getTerrain() == "beach" || this.getTerrain() == "cliff") &&
                                n.getTerrain() != "beach" && n.getTerrain() != "cliff")
                            n = this;
                        else if(((this.getAltitude() <= s.getAltitude() && this.getAltitude() <= n.getAltitude) ||
                                 this.getAltitude() <= 0) && this.getTerrain() != "river" &&
                                 n.getTerrain() != "beach" && n.getTerrain() != "cliff")
                            n = this;
                    }
                });
                if(n != undefined) this.riverHelper(n);
            }
        }
    }

    finalizeAdjacents() {
        for(var y = 1; y <= this.size; y++) {
            for(var x = 1; x <= this.size; x++) {
                var target = this.map[x][y];
                var adj = this.adjacents(target, true);
                target.adjustEdges(adj, this.size);
            }
        }
    }

    // Group adjacent Terrains into Regions
    groupRegions() {

    }

    prepareStats() {
        var stats = {water: 0, land: 0, coast: 0, beaches: 0, cliffs: 0,
                     ocean: 0, lakes: 0, river: 0, swamp: 0, high: 0, low: 0,
                     mountains: 0, hills: 0, plains: 0, valleys: 0, };
        
        for(var y = 1; y <= this.size; y++) {
            for(var x = 1; x <= this.size; x++) {
                var t = this.map[x][y].getTerrain(),
                    a = this.map[x][y].getAltitude();
                
                if(t == "mountain" || t == "volcano") stats.mountains = stats.mountains + 1;
                if(t == "hill" || t == "foothill")    stats.hills = stats.hills + 1;
                if(t == "river" || t == "delta")      stats.river = stats.river + 1;
                if(t == "lowland")                    stats.lowland = stats.lowland + 1;
                if(t == "valley")                     stats.valleys = stats.valleys + 1;
                if(t == "beach")                      stats.beaches = stats.beaches + 1;
                if(t == "cliff")                      stats.cliffs = stats.cliffs + 1;
                if(t == "swamp")                      stats.swamp = stats.swamp + 1;
                if(t == "plain")                      stats.plains = stats.plains + 1;
                if(t == "coast")                      stats.coast = stats.coast + 1;
                if(t == "ocean")                      stats.ocean = stats.ocean + 1;
                if(t == "lake")                       stats.lakes = stats.lakes + 1;
                if(t == "cove")                       stats.coast = stats.coast + 1;
                if(a > 0)                             stats.high = stats.high + 1;  
                if(a < 0)                             stats.low = stats.low + 1;
            }
        }
        stats.ocean = stats.ocean + stats.coast;
        stats.water = stats.ocean + stats.coast + stats.lakes;
        stats.land  = (this.size * this.size) - stats.water;

        this.stats = stats;
    }

    // Return all Terrains that satisfy the given filters
    search(filters) {
        // LIST OF FILTERS
        // - xs
        // - ys
        // - as
        // - ts
        // - adjacentAltitude
        // - adjacentTerrain
        // - adjacentThreshold
        // - adjacentDiagonal
        
        var xs = (filters.xs == undefined) ? [] : filters.xs,
            ys = (filters.ys == undefined) ? [] : filters.ys,
            as = (filters.as == undefined) ? [] : filters.as,
            ts = (filters.ts == undefined) ? [] : filters.ts,
            adjacentAltitude = filters.adjacentAltitude,
            adjacentTerrain = filters.adjacentTerrain,
            adjacentThreshhold = filters.adjacentThreshhold,
            adjacentDiagonal = filters.adjacentDiagonal;
            
        var results = [];
        for(var y = 1; y <= this.size; y++) {
            for(var x = 1; x <= this.size; x++) {
                var curr = this.map[x][y];
                var a = curr.getAltitude(),
                    t = curr.getTerrain();
                // console.log(xs, ys, as, ts, adjacentAltitude, adjacentTerrain, adjacentThreshhold);
                if((xs.indexOf(x) >= 0 || xs.length == 0) &&
                   (ys.indexOf(y) >= 0 || ys.length == 0) &&
                   (as.indexOf(a) >= 0 || as.length == 0) &&
                   (ts.indexOf(t) >= 0 || ts.length == 0)) {
                       if(adjacentAltitude == undefined && adjacentTerrain == undefined) {
                           results.push(curr);
                       }
                       else if(this.adjacentTo(curr, adjacentAltitude, adjacentTerrain,
                                    adjacentThreshhold, adjacentDiagonal))
                           results.push(curr);
                   }
            }
        }

        return results;
    }

    // Return all adjacent terrains
    adjacents(target, diag) {
        var results = [];
        var x = target.getX(), y = target.getY();

        if(y > 1) results[0] = this.map[x][y-1];           // North
        if(x < this.size && y > 1 && diag)                 // North East
            results[1] = this.map[x+1][y-1];           
        if(x < this.size) results[2] = this.map[x+1][y];   // East
        if(x < this.size && y < this.size && diag)         // South East
            results[3] = this.map[x+1][y+1];
        if(y < this.size) results[4] = this.map[x][y+1];   // South
        if(x > 1 && y < this.size && diag)                 // South West
            results[5] = this.map[x-1][y+1]; 
        if(x > 1) results[6] = this.map[x-1][y];           // West
        if(x > 1 && y > 1 && diag)                         // North West
            results[7] = this.map[x-1][y-1];    
        
        return results;
    }

    adjacentTo(target, as, ts, threshhold, diag) {
        if(threshhold == undefined) threshhold = 1;
        as = (as == undefined) ? [] : as;
        ts = (ts == undefined) ? [] : ts;

        var adj = this.adjacents(target, diag);
        var around = 0;
        $(adj).each(function() {
            if(this != undefined) {
                if((as.indexOf(this.getAltitude()) >= 0 || as.length == 0) &&
                   (ts.indexOf(this.getTerrain())  >= 0 || ts.length == 0)) {
                    around++;
                }
            }
        });
        return around >= threshhold;
    }

    sandwhichedBetween(target, terrain) {
    
    }

    // Fill the given table with Terrain tiles
    fillTable(table) {
        var thisObj = this;
        for(var y = 1; y <= this.size; y++) {
            var tr = $("<tr />");
            for(var x = 1; x <= this.size; x++) {
                var terrain = this.map[x][y]
                if(terrain != undefined) {
                    var td = $(terrain.render());
                    $(tr).append(td);
                }
            }
            $(table).append(tr);
        }
    }

    fillStats() {
        var stats = this.stats,
            size = this.size;
        $(Object.keys(stats)).each(function(i, val) {
            $("details#stats span#" + val).html((100 * stats[val] / (size * size)) + "%");
        });
    }

    getObj()    { return this.map; }
    setObj(obj) {
        this.map = [];
        for(var x = 1; x <= this.size; x++) {
            this.map[x] = Array(this.size+1).fill([]);
        }

        for(var x = 1; x <= this.size; x++) {
            for(var y = 1; y <= this.size; y++) {
                var s = obj[x][y];
                var newObj = new TerrainObject(s.x, s.y, s.altitude);
                newObj.setTerrain(s.terrain);
                this.map[x][y] = newObj;
            }
        }

        this.finalizeAdjacents();
        this.prepareStats();
        this.fillTable($("table#map"));
        this.fillStats();
    }
}