
import { BEST_OF_ALL, BEST_OF_EXPERT, PLAYER_STATS, RANKS, MODES, GRID } from "../SnakeHole.js";

//import { BEST_OF_ALL} from "../SnakeHole.js"

export var checkRankGlobal = function(stageName, targetRank) {
    if (BEST_OF_ALL.get(stageName) != undefined ) {
                
        var resultRank = BEST_OF_ALL.get(stageName).stageRank()
        var bool = resultRank >= targetRank
        return  bool;
    } else {
        //debugger
        return false;
    }

}

export var checkRank = function(stageName, targetRank) {
    // Only unlock on expert if you unlocked in classic.
    // But progress Expert just like you progress classic.
    
    switch (this.scene.get("GameScene").mode) {
        /*case MODES.CLASSIC:
            if (BEST_OF_ALL.get(stageName) != undefined ) {
                
                var resultRank = BEST_OF_ALL.get(stageName).stageRank()
                var bool = resultRank >= targetRank
                return  bool;
            } else {
                //debugger
                return false;
            }
            break;*/ // Default seems to work okay.

        case MODES.EXPERT:
            if (BEST_OF_ALL.get(stageName) != undefined && BEST_OF_EXPERT.get(stageName) != undefined) {
                var resultRank = BEST_OF_EXPERT.get(stageName).stageRank()
                var bool = resultRank >= targetRank
                return  bool;
            } else {
                //debugger
                return false;
            } 
            break;
    
        default:
            if (BEST_OF_ALL.get(stageName) != undefined ) {
                
                var resultRank = BEST_OF_ALL.get(stageName).stageRank()
                var bool = resultRank >= targetRank
                return  bool;
            } else {
                //debugger
                return false;
            }
            break;
    }
}

export var checkCanExtract = function(stageID) {
    var checkEnds = [];
    EXTRACT_CODES.forEach(path => {
        if (path.includes(stageID)) {
            
            var splitPath = path.split("|");
            checkEnds.push(splitPath[splitPath.length - 1]);
        }
    })

    var hasPath = checkEnds.some(endID => {
        return BEST_OF_ALL.has(STAGES.get(endID))
    });

    return hasPath;

}

/**
 * INSTRUCTIONS for adding a stage.
 *  0. Tiled - Stage name, new UUID, Slug. (Also correct Layers)
 *      - Next only matters if not in EXTRACT CODES (Tutorials and Bonus levels)
 *      - End stage has "end" as convention. Not techinally needed.
 *  1. STAGES - Add ID and Name.
 *  2. EXTRACT_CODES - put in the right place.
 *  3. MAP_CORDS - Add Stage ID and x,y location relative to 0,0 as map center.
 *  4. STAGE_UNLOCKS - Add how stage is unlocked using the stage `slug`.
 */

export const STAGES = new Map([
    ["0-1", "World_0-1"],
    ["1-1", "World_1-1"],
    ["1-2", "World_1-2"],
    ["1-3", "World_1-3"],
    ["2-1", "World_2-1"],
    ["2-6", "World_2-6"],
    ["2-2", "World_2-2"],
    ["2-7", "World_2-7"],
    ["2-3", "World_2-3"],
    ["2-4", "World_2-4"],
    ["2-8", "World_2-8"],
    ["2-10", "World_2-10"],
    ["2-9", "World_2-9"],
    ["3-1", "World_3-1_Wrap"],
    ["3-2", "World_3-2_Wrap"],
    ["3-3", "World_3-3_Wrap"],
    ["4-1", "World_4-1"],
    ["4-2", "World_4-2"],
    ["4-6", "World_4-6"],
    ["4-7", "World_4-7"],
    ["4-8", "World_4-8"],
    ["4-9", "World_4-9"],
    ["4-10", "World_4-10"],
    ["4-3", "World_4-3"],
    ["4-4", "World_4-4"],
    ["4-5", "World_4-5"],
    ["5-1", "World_5-1_Racing"],
    ["5-2", "World_5-2_Racing"],
    ["5-3", "World_5-3_Racing"],
    ["5-4", "World_5-4_Racing"],
    ["8-1", "World_8-1_Adv_Portaling"],
    ["8-2", "World_8-2_Adv_Portaling"],
    ["8-3", "World_8-3_Adv_Portaling"],
    ["8-4", "World_8-4_Adv_Portaling"],
    ["8-5", "World_8-5_Adv_Portaling"],
    ["8-6", "World_8-6_Adv_Portaling"],
    ["8-7", "World_8-7_Adv_Portaling"],
    ["8-8", "World_8-8_Adv_Portaling"],
    ["8-9", "World_8-9_Adv_Portaling"],
    ["8-10", "World_8-10_Adv_Portaling"],
    ["8-11", "World_8-11_Adv_Portaling"],
    ["9-1", "World_9-1_Final_Exams"],
    ["9-2", "World_9-2_Final_Exams"],
    ["9-3", "World_9-3_Final_Exams"],
    ["10-1", "World_10-1"],
    ["10-2", "World_10-2"],
    ["10-3", "World_10-3"],

    ["G1-1", "Gauntlet_1-1"],
    ["G1-2", "Gauntlet_1-2"],
    ["G1-3", "Gauntlet_1-3"],
    ["G1-4", "Gauntlet_1-4"],
    ["G1-5", "Gauntlet_1-5"]
])

export const EXTRACT_CODES = [
    "0-1|1-1|1-2|1-3",
    "0-1|2-1|2-6|2-2|2-7|2-3",
    "0-1|2-1|2-8|2-9|2-10|2-4",
    "0-1|3-1|3-2|3-3",
    "0-1|4-2|4-6|4-8|4-7|4-9|4-10|4-1",
    //"0-1|4-1|4-2|4-3",
    //"0-1|4-1|4-4|4-5",
    "0-1|5-1|5-2|5-3",
    "0-1|5-1|5-2|5-4",
    "0-1|8-1|8-2|8-3",
    //"0-1|8-1|8-2|8-4",
    "0-1|8-1|8-8|8-7|8-11|8-4",
    //"0-1|8-1|8-3|8-4",
    "0-1|8-1|8-9|8-10|8-11|8-4",
    //"0-1|8-1|8-2|8-5",
    "0-1|1-1|9-1|9-2|9-3",
    "0-1|2-1|10-1|10-2|10-3",   
];

const mGrid = 12;

export const MAP_CORDS = new Map([
    // Relative to 0,0 as center
    ["0-1", { x:0, y:0 }],
    ["1-1", { x:mGrid * 1, y:0 }],
    ["1-2", { x:mGrid * 2, y:0 }],
    ["1-3", { x:mGrid * 3, y:0 }],
    ["2-1", { x:mGrid * -1, y:0 }],
    ["2-2", { x:mGrid * -2, y:0 }],
    ["2-3", { x:mGrid * -3, y:0 }],
    ["2-4", { x:mGrid * -3, y:mGrid * -1 }],
    ["3-1", { x:mGrid * -2, y:mGrid * -2 }],
    ["3-2", { x:mGrid * -2, y:mGrid * -3 }],
    ["3-3", { x:mGrid * -2, y:mGrid * -4 }],
    ["4-1", { x:mGrid * 0, y:mGrid * -2 }],
    ["4-2", { x:mGrid * 0, y:mGrid * -3 }],
    ["4-3", { x:mGrid * 0, y:mGrid * -4 }],
    ["4-4", { x:mGrid * 1, y:mGrid * -3 }],
    ["4-5", { x:mGrid * 1, y:mGrid * -4 }],
    ["5-1", { x:mGrid * 2, y:mGrid * -2 }],
    ["5-2", { x:mGrid * 3, y:mGrid * -3 }],
    ["5-3", { x:mGrid * 4, y:mGrid * -4 }],
    ["5-4", { x:mGrid * 4, y:mGrid * -2 }],
    ["8-1", { x:mGrid * 0, y:mGrid * 2 }],
    ["8-2", { x:mGrid * 0, y:mGrid * 3 }],
    ["8-5", { x:mGrid * 1, y:mGrid * 3 }],
    ["8-3", { x:mGrid * -1, y:mGrid * 3 }],
    ["8-4", { x:mGrid * 0, y:mGrid * 4 }],
    ["9-1", { x:mGrid * 2, y:mGrid * 1 }],
    ["9-2", { x:mGrid * 3, y:mGrid * 1 }],
    ["9-3", { x:mGrid * 4, y:mGrid * 1 }],
    ["10-1", { x:mGrid * -2, y:mGrid * 1 }],
    ["10-2", { x:mGrid * -3, y:mGrid * 1 }],
    ["10-3", { x:mGrid * -4, y:mGrid * 1 }],
]);

var checkMapCords = function () {
    /*
    * Used to verify each node has a location on the map.
    * Otherwise it the Tracker Map errors with no helpful information.
    * */

    var ids = new Set();
    
    EXTRACT_CODES.forEach( code => {

        var split = code.split("|");
        split.forEach( id => {
            ids.add(id);
        })
    });

    ids.forEach( id => {
        if (!MAP_CORDS.has(id)) {
            //throw new Error(`MAP_CORDS does not contain ID "${id}"`);    
        }
    });
}
checkMapCords();


export const COMPASS_ORDER = [
    ["1-3", new Map([["0-1", "E"],["1-1", "E"],["1-2", "E"]])],
    ["2-3", new Map([["0-1", "W"]])],
    ["8-4", new Map([["0-1", "W"]])], // Random placehodler test
];

export const GAUNTLET_CODES = new Map([
    ["TRIAL I", {
        checkUnlock: function () {
            return checkRankGlobal(STAGES.get("2-4"), RANKS.WOOD);
        },
        stages: "G1-1|G1-2|G1-3|G1-4|G1-5", //"1-1|2-1|1-2|2-2|1-3|2-3|2-4"
        startingCoins: 8,
    }],
    /*["Easy Gauntlet", {
        checkUnlock: function () {
            return checkRankGlobal(STAGES.get("2-4"), RANKS.WOOD);
        },
        stages: "G1-1|2-1|1-2|2-2|1-3|2-3|2-4", //"1-1|2-1|1-2|2-2|1-3|2-3|2-4"
        startingCoins: 24,
    }],*/
    /*["Oops! All Ones", {
        checkUnlock: function () {
            var checkLevels = [
                STAGES.get("1-1"), STAGES.get("2-1"), STAGES.get("3-1"),
                STAGES.get("4-1"), STAGES.get("5-1"), STAGES.get("8-1"),
                STAGES.get("9-1"), STAGES.get("10-1"),
            ];
            var pass = checkLevels.every(stage => {
                return checkRankGlobal(stage, RANKS.WOOD);
            });
            return pass;
            //return checkRankGlobal(STAGES.get("4-5"), RANKS.WOOD);
        },
        stages: "1-1|2-1|3-1|4-1|5-1|8-1|9-1|10-1",
        startingCoins: 1,
    }],
    ["Marathon -- Tutorial Is Over", {
        checkUnlock: function () {
            return true;
            //return checkRankGlobal(STAGES.get("4-5"), RANKS.WOOD);
        },
        stages: "0-1|1-1|1-2|1-3|2-1|2-2|2-3|4-1|4-2|4-3|8-1|8-2|8-4|9-2|9-3|9-4|10-2|10-3|10-4",
        startingCoins: 36,
    }],
    ["Extra Worlds", {
        checkUnlock: function () {
            return checkRankGlobal(STAGES.get("5-4"), RANKS.WOOD);
        },
        stages: "5-1|3-1|5-2|3-2|5-3|3-3|5-4",
        startingCoins: 20,
    }],
    ["Hardest Only -- 0 Lives", {
        checkUnlock: function () {
            return checkRankGlobal(STAGES.get("4-5"), RANKS.WOOD);
        },
        stages: "4-5|9-3|10-3",
        startingCoins: 0,
    }],*/
]);

/* Template
        ['', function () { 
        return checkRank.call(this,"", RANKS.WOOD)}],
*/


export const STAGE_UNLOCKS = new Map([
    ['long-racer', function () { 
        return checkRank.call(this,STAGES.get("5-1"), RANKS.WOOD)}],
    ['tri-racer', function () { 
        return checkRank.call(this,STAGES.get("5-2"), RANKS.WOOD)}],
    ['hard-racer', function () { 
        var checkLevels = [
            STAGES.get("5-1"),
            STAGES.get("5-2"),
            STAGES.get("5-3"),
        ];
        var pass = checkLevels.every(stage => {
            return checkRank.call(this,stage, RANKS.GOLD);
        });

        return pass}],
    ['you-portal-turn-now', function () { 
        var checkLevels = [
            STAGES.get("8-1"),
            STAGES.get("8-2"),
            STAGES.get("8-4"),
        ];
        var pass = checkLevels.every(stage => {
            return checkRank.call(this,stage, RANKS.SILVER);
        });

        return pass}],
    ['dino-tess', function () { checkRank.bind(this);
        return checkRank.call(this,STAGES.get("4-3"), RANKS.WOOD)}],
    ['og-plus', function () { 
        var checkLevels = [
            STAGES.get("1-1"),
            STAGES.get("1-2"),
            STAGES.get("1-3"), 
            STAGES.get("2-1"), 
            STAGES.get("2-2"),
            STAGES.get("2-3"),
        ];
        var pass = checkLevels.every(stage => {
            return checkRank.call(this,stage, RANKS.GOLD);
        });
        return true // return pass
    }],
        //return checkRank.call(this,["World_2-4", RANKS.GOLD)}],
    ['railgun', function () { 
        return checkRank.call(this,STAGES.get("4-3"), RANKS.WOOD)}],
    ['two-wide-corridors', function () {
        return checkRank.call(this,STAGES.get("8-4"), RANKS.WOOD);}],
    ['double-back-portals', function () {
        return checkRank.call(this,STAGES.get("10-3"), RANKS.WOOD);
    }],
    ['easy-wrap', function () {
        return PLAYER_STATS.wraps > 128;
    }],
    ['hard-wrap', function () {
        return checkRank.call(this,STAGES.get("3-2"), RANKS.WOOD);
    }],
    ['more-blocks', function () {
        return checkRank.call(this,STAGES.get("2-1"), RANKS.WOOD);
    }],
    ['wrap-and-warp', function () {
        return checkRank.call(this,STAGES.get("1-2"), RANKS.WOOD);
    }],
    ['learn-to-wrap', function () {
        return true;
    }],
    ['these-are-coins', function () {
        return true;
    }],
    ['welcome', function () {
        return true;
    }],
    ['unidirectional-portals', function () {
        return checkRank.call(this,STAGES.get("8-2"), RANKS.WOOD);
    }],
    ['hardest----for-now', function () {
        return checkRank.call(this,STAGES.get("10-2"), RANKS.WOOD);
    }],
    ['swirl-swirl', function () {
        return checkRank.call(this,STAGES.get("4-4"), RANKS.WOOD);
    }],
    ['eye', function () {
        return checkRank.call(this,STAGES.get("4-2"), RANKS.WOOD);
    }],
    ['plus-plus', function () {
        return checkRank.call(this,STAGES.get("10-1"), RANKS.WOOD);
    }],
    ['col', function () {
        return checkRank.call(this,STAGES.get("4-2"), RANKS.WOOD);
    }],
    ['its-a-snek', function () {
        return checkRank.call(this,STAGES.get("4-1"), RANKS.WOOD);
    }],
    ['now-a-fourth', function () {
        return checkRank.call(this,STAGES.get("8-4"), RANKS.WOOD);
    }],
    ['horizontal-uturns', function () {
        return checkRank.call(this,STAGES.get("9-2"), RANKS.WOOD);
    }],
    ['horizontal-gaps', function () {
        return checkRank.call(this,STAGES.get("9-1"), RANKS.WOOD); 
    }],
    ['first-medium', function () {
        return true;
    }],
    ['lights-out', function () {
        return false;
    }],
    ['easy-racer', function () {
        return checkRank.call(this,STAGES.get("0-1"), RANKS.PLATINUM);
    }],
    ['hello-ghosts', function () {
        return false;
    }],
    ['medium-happy', function () {
        return checkRank.call(this,STAGES.get("2-3"), RANKS.WOOD);
    }],
    ['bidirectional-portals', function () {
        return checkRank.call(this,STAGES.get("8-1"), RANKS.WOOD); 
    }],
    ['start', function ( ) { 
        return true
    }],
    ['babies-first-wall', function () {
        return checkRank.call(this,STAGES.get("0-1"), RANKS.WOOD);
    }],
    ['horz-rows', function () {
        return checkRank.call(this,STAGES.get("1-1"), RANKS.WOOD);
    }],
    ['first-blocks', function () {
        return checkRank.call(this,STAGES.get("1-3"), RANKS.WOOD);
    }],
    ['asteroid-channel', function () {
        return true;
    }],
    ['two-spaces', function () {
        return true;
    }],
    ['maze', function () {
        return true;
    }],
    ['fine-separation', function () {
        return true;
    }],
    ['boxed-in', function () {
        return true;
    }],
    ['pandora', function () {
        return true;
    }],
    ['interlock', function () {
        return true;
    }],
    ['fillet', function () {
        return true;
    }],
    ['xylem', function () {
        return true;
    }],
    ['squid', function () {
        return true;
    }],
    ['spin-doctor', function () {
        return true;
    }],
    ['obstructed-passage', function () {
        return true;
    }],
    ['snare-hold', function () {
        return true;
    }],
    ['precarious-sanctum', function () {
        return true;
    }],
    ['iron-reverb', function () {
        return true;
    }],
    ['medium-wrap', function () {
        return checkRank.call(this,STAGES.get("3-1"), RANKS.WOOD)
    }],
]);