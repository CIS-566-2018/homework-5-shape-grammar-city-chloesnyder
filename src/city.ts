
import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';
import ShapeSet from './shape'

const PI = Math.PI;
const deg2rad = PI / 180.0;

class City {

    buildings: Array<ShapeSet>;

    // define 3 points as "high density areas"
    highDensityArea1: vec3;
    highDensityArea2: vec3;
    highDensityArea3: vec3;

    // a "radius" around the high density points
    // points that fall inside this radius are considered high density, and buildings are scaled up 
    radx1: number;
    rady1: number;
    radx2: number;
    rady2: number;
    radx3: number;
    rady3: number;


    // the max/min positions that buildings can be placed at
    max_x_pos: number;
    max_z_pos: number;
    min_x_pos: number;
    min_z_pos: number;

    constructor()
    {
        this.buildings = new Array<ShapeSet>();

        this.highDensityArea1 = vec3.fromValues(5.0, 0, 3.0);
        this.highDensityArea2 = vec3.fromValues(-6.0, 0, -2.0);
        this.highDensityArea3 = vec3.fromValues(-3.0, 0.0, 8.0);

        this.max_x_pos = 9;
        this.max_z_pos = 9;
        this.min_x_pos = -9;
        this.min_z_pos = -9;

        this.radx1 = 3 + Math.random();
        this.rady1 = 3 + Math.random();

        this.radx2 = 2 + Math.random();
        this.rady2 = 2 + Math.random();

        this.radx3 = 1 + Math.random();
        this.rady3 = 1 + Math.random();

        var shape = new ShapeSet(1.0, 1.0, 1.0);

       /* // start off with a building at each high density area
        this.buildings.push(new ShapeSet(5.0, this.highDensityArea1[0], this.highDensityArea1[2]));
        // use noise to determine a "population density"
        // add more buildings to "high density" areas that are taller
        // add fewer buildings to "low density" areas
        for(var i = 0; i < 5; i++)
        {
            var x = Math.random() * 8;
            var z = Math.random() * 8;
            var px = Math.random();
            if(px > .5) x *= -1;
            var pz = Math.random();
            if(pz > .5) z *= -1;

            building = new ShapeSet(1.0, x, z);
            var iter = Math.ceil(Math.random() * (6 - 1 + 2) + 1);
            building.parseShapeGrammar(iter);
            building.create();
            buildings.push(building);
        }*/
    }

    randomRule() : string
    {
        // make subdivision more likely in high density areas. closer to high density area = higher subdiv chance

        // divide into 2 buildings

        // divide into 
        return "";
    }

    applyRule(rule: string)
    {
        if(rule === "S")
        {
            // subdivide by removing the building, adding 4 new buildings in its place. Scale smaller in x and z directions. Scale y based on
            // distance from high density area
        } else if (rule === "X") {
            // subdivide into 2 buildings along x axis
        } else if (rule === "Z") {
            // subdivide into 2 buildings along z axis
        }
    }

    parseShapeGrammar()
    {

    }

    getCity() : Array<ShapeSet>
    {
        return this.buildings;
    }
};

export default City;