import Shape from './shape'
import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';

const PI = Math.PI;
const deg2rad = PI / 180.0;



// A class to create an LSystem. This class
// takes the final expanded string from Rule and maps the string to a function (moves the Turtle)

// When the string is fully parsed, call draw to send the final LSystem to a VBO
// Reference: http://interactivepython.org/courselib/static/thinkcspy/Strings/TurtlesandStringsandLSystems.html
class  ShapeSet extends Drawable
{
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;
  //  colors: Floar32Array;
    center: vec4;

    t_indices: Array<number> = new Array(); // temp arrays that hold all the shapes
    t_positions: Array<number> = new Array();
    t_normals: Array<number> = new Array();

    shapes: Array<Shape> = new Array();

    constructor()
    {
        super();
        this.shapes.push(new Shape("S", false, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 0), vec3.fromValues(10,10,10)));
    }

    // TurtleStack holds the overall VBOs, now we copy them and create the final LSystem
    create()
    {
        // go through every shape in the set, and append their normals and positions to shapeSet data
        for(let s of this.shapes)
        {
            var offset = Math.floor(this.t_positions.length / 4.0);
            for(var j = 0; j < s.meshCount; j++)
            {
                 this.t_indices.push(s.indices[j] + offset);
            }

            this.t_positions = this.t_positions.concat(s.positions);
            this.t_normals = this.t_normals.concat(s.normals);
        }
        this.normals = new Float32Array(this.t_normals);
        this.positions = new Float32Array(this.t_positions);
        this.indices = new Uint32Array(this.t_indices);

       // this.colors

        this.generateIdx();
        this.generatePos();
        this.generateNor();
       // this.generateColor();
    
        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

        console.log(this.positions);
        console.log(this.normals);
        console.log(this.indices); 
    }

    //Apply rules to all shpaes in our shape set for n iterations
    parseShapeGrammar(iter: number)
    {
      //debugger;
        for(var i = 0; i < iter; ++i)
        {
            for(let s of this.shapes)
            {
                //force to stop if shape is too complicated
                if(!s.terminal)
                {
                   this.applyRule(s, s.symbol);
                }
            }
        }

        // add "columns" to any floating shapes
        // go through each shape, check to see if it is 
    }

    randomRule() : string
    {
        // generates a random rule
        var seed = Math.random();
        var noise = seed; //TODO: some kind of noise function to vary the seed?
        if(noise < (1/7))
        {
            return "S";
        } else if (noise > (1/7) && noise < (2/7)) {
            return "X";
        } else if (noise > (3/7) && noise < (4/7)) {
            return "Y";
        } else if (noise > (4/7) && noise < (5/7)) {
            return "Z";
        } else if (noise > (5/7) && noise < (6/7)) {
            return "C";
        } else {
            return "R";
        }
       
    }

    applyRule(s: Shape, rule: string) 
    {
        let successors = new Array<Shape>();
        if(!(rule === "D")) { // if D, we are just removing this shape from our shape set (deletion)
     
        
            if(rule === "S")
            {
 
                // subdivide into 8 cubes
                var parentPos = s.position;
                var parentScale = s.scale;
                var childScale = vec3.fromValues(parentScale[0] / 8, parentScale[1] / 8, parentScale[2] / 8);

                var topPos1= vec3.fromValues(parentPos[0] + .25, parentPos[1] + .5, parentPos[2] + .25); // top floor
                var bottomPos1 =  vec3.fromValues(parentPos[0] + .25, parentPos[1], parentPos[2] + .25); // bottom floor
                var bottomRule1 = this.randomRule();
                var topRule1 = this.randomRule();
                var isTopTerminal1 = Math.random() > .5;
                var isBottomTerminal1 = Math.random() > .5;
                // if a top floor is generated and the bottom floor is deleted, replace bottom floor rule with "C" so it is replaced with 
                // 4 columns, and make those columns terminal
                if(topRule1 !== "D" && bottomRule1 === "D")
                {
                    bottomRule1 = "C";
                    isTopTerminal1 = true;
                    isBottomTerminal1 = true;
                }
                
                var topPos2 =  vec3.fromValues(parentPos[0] + .25, parentPos[1] + .5, parentPos[2] - .25); // top floor
                var bottomPos2 =  vec3.fromValues(parentPos[0] + .25, parentPos[1], parentPos[2] - .25); // bottom floor
                var bottomRule2 = this.randomRule();
                var topRule2 = this.randomRule();
                var isTopTerminal2 = Math.random() > .5;
                var isBottomTerminal2 = Math.random() > .5;
                if(topRule2 !== "D" && bottomRule2 === "D")
                {
                    bottomRule2 = "C";
                    isTopTerminal2 = true;
                    isBottomTerminal2 = true;
                }

                var topPos3 =  vec3.fromValues(parentPos[0] - .25, parentPos[1] + .5, parentPos[2] + .25); // top floor
                var bottomPos3 =  vec3.fromValues(parentPos[0] - .25, parentPos[1], parentPos[2] + .25); // bottom floor
                var bottomRule3 = this.randomRule();
                var topRule3 = this.randomRule();
                var isTopTerminal3 = Math.random() > .5;
                var isBottomTerminal3 = Math.random() > .5;
                if(topRule3 !== "D" && bottomRule3 === "D")
                {
                    bottomRule3 = "C";
                    isTopTerminal3 = true;
                    isBottomTerminal3 = true;
                }
                
                var topPos4 = vec3.fromValues(parentPos[0] - .25, parentPos[1] + .5, parentPos[2] - .25); // top floor
                var bottomPos4 = vec3.fromValues(parentPos[0] - .25, parentPos[1], parentPos[2] - .25); // bottom floor
                var bottomRule4 = this.randomRule();
                var topRule4 = this.randomRule();
                var isTopTerminal4 = Math.random() > .5;
                var isBottomTerminal4 = Math.random() > .5;
                if(topRule4 !== "D" && bottomRule4 === "D")
                {
                    bottomRule4 = "C";
                    isTopTerminal3 = true;
                    isBottomTerminal3 = true;
                }

                 // add the successors to the shape set
                successors.push(new Shape(bottomRule1, isBottomTerminal1, bottomPos1, s.rotation, childScale));
                successors.push(new Shape(topRule1, isTopTerminal1, topPos1, s.rotation, childScale));
                successors.push(new Shape(bottomRule2, isBottomTerminal2, bottomPos2, s.rotation, childScale));
                successors.push(new Shape(topRule2, isTopTerminal2, topPos2, s.rotation, childScale));
                successors.push(new Shape(bottomRule3, isBottomTerminal3, bottomPos3, s.rotation, childScale));
                successors.push(new Shape(topRule3, isTopTerminal3, topPos3, s.rotation, childScale));
                successors.push(new Shape(bottomRule4, isBottomTerminal4, bottomPos4, s.rotation, childScale));
                successors.push(new Shape(topRule4, isTopTerminal4, topPos4, s.rotation, childScale));

                // check to see if a "top floor" has a deleted bottom floor. If so, change D to C so 4 columns are put in instead
            } else if (rule === "X")
            {
                //scale in X direction
                var childScale = vec3.fromValues(s.scale[0],  .5 * s.scale[1], .5 * s.scale[2]);
                successors.push(new Shape(this.randomRule(), Math.random() > .5, s.position, s.rotation, childScale));
                // add a column beneath
                successors.push(new Shape("", true, vec3.fromValues(s.position[0], s.position[1] - .5, s.position[2]), s.rotation, vec3.fromValues(childScale[0] * .5, s.scale[1], childScale[2] * .5)));
            } else if (rule === "Y")
            {
                //scale in Y direction
                var childScale = vec3.fromValues(.5 * s.scale[0],  s.scale[1], .5 * s.scale[2]);
                successors.push(new Shape(this.randomRule(), Math.random() > .5, s.position, s.rotation, childScale));
            } else if (rule === "Z")
            {
                //scale in Z direction
                var childScale = vec3.fromValues(.5 * s.scale[0],  .5 * s.scale[1], s.scale[2]);
                successors.push(new Shape(this.randomRule(), Math.random() > .5, s.position, s.rotation, childScale));
                // add a column beneath
                 // add a column beneath
                 successors.push(new Shape("", true, vec3.fromValues(s.position[0], s.position[1] - .5, s.position[2]), s.rotation, vec3.fromValues(childScale[0] * .5, s.scale[1], childScale[2] * .5)));
            } else if (rule === "R") {
                successors.push(new Shape("R", true, s.position, s.rotation, s.scale)); 
            } else if (rule === "C") {
                // subdivide into 4 columns
               // var childScale = vec3.fromValues(.25 * s.scale[0], 5.0 * s.scale[1], .25 * s.scale[2]); // scale to 1/4th the size but preserve y scale
               // successors.push((new Shape("", true, s.position, s.rotation, childScale)));
            }
      
        }

        //add the new shapes to the list
        this.shapes = this.shapes.concat(successors);

        // remove the old shape from the set of shapes
        var idx = this.shapes.indexOf(s);
        this.shapes.splice(idx, 1);
    }
}

export default ShapeSet;