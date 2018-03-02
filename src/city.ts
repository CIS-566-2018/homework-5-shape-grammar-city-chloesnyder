
import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';
import ShapeSet from './ShapeSet'

const PI = Math.PI;
const deg2rad = PI / 180.0;

class City {

    buildings: Array<ShapeSet>;
    building: ShapeSet;

    // define 3 points as "high density areas"
    highDensityArea1: vec3;
    highDensityArea2: vec3;
    highDensityArea3: vec3;

    // a "radius" around the high density points
    // points that fall inside this radius are considered high density, and buildings are scaled up 
    rad1: number;

    rad2: number;

    rad3: number;



    // the max/min positions that buildings can be placed at
    max_x_pos: number;
    max_z_pos: number;
    min_x_pos: number;
    min_z_pos: number;

    constructor()
    {
       // debugger;
        this.buildings = new Array<ShapeSet>();

        this.highDensityArea1 = vec3.fromValues(5.0, 0, 3.0);
        this.highDensityArea2 = vec3.fromValues(-6.0, 0, -2.0);
        this.highDensityArea3 = vec3.fromValues(-3.0, 0.0, 8.0);

        this.max_x_pos = 9;
        this.max_z_pos = 9;
        this.min_x_pos = -9;
        this.min_z_pos = -9;

        this.rad1 = 3 + Math.random();
        this.rad2 = 2 + Math.random();
        this.rad3 = 1 + Math.random();

        // Seed buildings in the high density areas
        var building1 = new ShapeSet(5.0, this.highDensityArea1[0], this.highDensityArea1[2]);
        var iter1 = Math.ceil(Math.random() * (6 - 1 + 2) + 1);
        building1.parseShapeGrammar(iter1);
        building1.isTerminal = false;
        building1.symbol = "S";
  
        var building2 = new ShapeSet(5.0, this.highDensityArea2[0], this.highDensityArea2[2]);
        var iter2 = Math.ceil(Math.random() * (6 - 1 + 2) + 1);
        building2.parseShapeGrammar(iter2);
        building2.isTerminal = false;
        building2.symbol = "S";

        var building3 = new ShapeSet(5.0, this.highDensityArea3[0], this.highDensityArea3[2]);
        var iter3 = Math.ceil(Math.random() * (6 - 1 + 2) + 1);
        building3.parseShapeGrammar(iter3);
        building3.isTerminal = false;
        building3.symbol = "S";

        this.buildings.push(building1);
        this.buildings.push(building2);
        this.buildings.push(building3);
        
        // add some more buildings in random areas
        for(var i = 0; i < 20; i++)
        {
            var x = Math.random() * 8;
            var z = Math.random() * 8;
            var px = Math.random();
            if(px > .5) x *= -1;
            var pz = Math.random();
            if(pz > .5) z *= -1;

            var b = new ShapeSet(1.0, x, z);
            var iter = 1;
            b.isTerminal = false;
            b.symbol = "S";
            b.parseShapeGrammar(iter);
            this.buildings.push(b);
        }

        this.parseShapeGrammar();   
    }

    randomRule(b : ShapeSet) : string
    {
       // debugger;
        var parentPos = b.position;
       
        var distfromHDA1 = vec3.distance(parentPos, this.highDensityArea1);
        var distfromHDA2 = vec3.distance(parentPos, this.highDensityArea2);
        var distfromHDA3 = vec3.distance(parentPos, this.highDensityArea3);
        
        var condition = Math.random(); 


        // if it is close to a high density, make it more likely to subdivide
        if(distfromHDA1 < this.rad1 || distfromHDA2 < this.rad2 || distfromHDA3 < this.rad3)
        {
            if(condition < (1/2))
            {
                return "S";
            } else if (condition > (1/2) && condition < (1/2 + 1/3)) {
                return "X";
            } else if (condition > (1/2 + 1/3) && condition < (1/2 + 2/3)) {
                return "Z";
            } else if (condition > (1/2 + 2/3) && condition < (1)) {
                return "D";
            } 
        } else {
            if(condition < (1/4))
            {
                return "S";
            } else if (condition > (1/4) && condition < (2/4)) {
                return "X";
            } else if (condition > (2/4) && condition < (3/4)) {
                return "Z";
            } else if (condition > (3/5) && condition < (1)) {
                return "D";
            } 
        }
    }

    applyRule(b: ShapeSet, rule: string)
    {
      //  debugger;
        let successors = new Array<ShapeSet>();
        var parentPos = b.position;
        var parentScale = b.scale;
       
        var distfromHDA1 = vec3.distance(parentPos, this.highDensityArea1);
        var distfromHDA2 = vec3.distance(parentPos, this.highDensityArea2);
        var distfromHDA3 = vec3.distance(parentPos, this.highDensityArea3);

        let doDelete = true;
        if(rule === "S")
        {
            var childScale = parentScale / 4;

            var b1 = new ShapeSet(childScale, parentPos[0] + childScale, parentPos[2] + childScale);
            var b2 = new ShapeSet(childScale, parentPos[0] - childScale, parentPos[2] + childScale);
            var b3 = new ShapeSet(childScale, parentPos[0] + childScale, parentPos[2] - childScale);
            var b4 = new ShapeSet(childScale, parentPos[0] - childScale, parentPos[2] - childScale);
            b1.symbol = this.randomRule(b1);
            b1.isTerminal = Math.random() < .25; // 75% chance it will not become a terminal building
            b2.symbol = this.randomRule(b2);
            b2.isTerminal = Math.random() < .25; 
            b3.symbol = this.randomRule(b3);
            b3.isTerminal = Math.random() < .25; 
            b4.symbol = this.randomRule(b4);
            b4.isTerminal = Math.random() < .25; 

            // only want to generate a complex building if it's terminal
            var iter1, iter2, iter3, iter4 = 1;
            if(b1.isTerminal)
            {
                iter1 = Math.ceil(Math.random() * (4 - 1 + 2) + 1);
            }
            if(b2.isTerminal)
            {
                iter2 = Math.ceil(Math.random() * (4 - 1 + 2) + 1);
            }
            if(b3.isTerminal)
            {
                iter3 = Math.ceil(Math.random() * (4 - 1 + 2) + 1);
            }
            if(b4.isTerminal)
            {
                iter4 = Math.ceil(Math.random() * (4 - 1 + 2) + 1);
            }

            b1.parseShapeGrammar(iter1);
            b2.parseShapeGrammar(iter2);
            b3.parseShapeGrammar(iter3);
            b4.parseShapeGrammar(iter4);

            successors.push(b1);
            successors.push(b2);
            successors.push(b3);
            successors.push(b4);

        } else if (rule === "X") {
            // subdivide into 2 buildings along x axis
            var b1x = new ShapeSet(parentScale / 2, parentPos[0] + parentScale / 2, parentPos[2]);
            var b2x = new ShapeSet(parentScale / 2, parentPos[0], parentPos[2]);
            
            b1x.symbol = this.randomRule(b1x);
            b1x.isTerminal = Math.random() > .5;
            b2x.symbol = this.randomRule(b2x);
            b2x.isTerminal = Math.random() > .5;

            var iter11, iter22 = 1;
            if(b1x.isTerminal)
            {
                iter11 = Math.ceil(Math.random() * (4 - 1 + 2) + 1);
            }
            if(b2x.isTerminal)
            {
                iter22 = Math.ceil(Math.random() * (4 - 1 + 2) + 1);
            }
            b1x.parseShapeGrammar(iter11);
            b2x.parseShapeGrammar(iter22);
            
            successors.push(b1x);
            successors.push(b2x);

            
        } else if (rule === "Z") {
            // subdivide into 2 buildings along z axis
            var b1z = new ShapeSet(parentScale / 2, parentPos[0], parentPos[2] + parentScale / 2);
            var b2z = new ShapeSet(parentScale / 2, parentPos[0], parentPos[2]);

            b1z.symbol = this.randomRule(b1z);
            b1z.isTerminal = Math.random() > .5;
            b2z.symbol = this.randomRule(b2z);
            b2z.isTerminal = Math.random() > .5;

            var iter111, iter222 = 1;
            if(b1z.isTerminal)
            {
                iter111 = Math.ceil(Math.random() * (4 - 1 + 2) + 1);
            }
            if(b2z.isTerminal)
            {
                iter222 = Math.ceil(Math.random() * (4 - 1 + 2) + 1);
            }
            b1z.parseShapeGrammar(iter111);
            b2z.parseShapeGrammar(iter222);

            successors.push(b1z);
            successors.push(b2z);

        } else if (rule === "D") {
            // possibly delete a building. If it is within a certain distance from a high density area, do not delete
            // else, delete
            if(distfromHDA1 < this.rad1 || distfromHDA2 < this.rad2 || distfromHDA3 < this.rad3)
            {
                doDelete = false;
            }
        }

        //add the new shapes to the list
        this.buildings = this.buildings.concat(successors);

        if(doDelete)
        {
            // remove the old shape from the set of shapes
            var idx = this.buildings.indexOf(b);
            this.buildings.splice(idx, 1);
        }
    }

    parseShapeGrammar()
    {
        for(var i = 0; i < 20; ++i)
        {
            for(let b of this.buildings)
            {
                //force to stop if shape is too complicated
                if(!b.isTerminal)
                {
                   // debugger;
                   this.applyRule(b, b.symbol);
                }
            }
        }
    }

    getCity() : Array<ShapeSet>
    {
        return this.buildings;
    }
};

export default City;