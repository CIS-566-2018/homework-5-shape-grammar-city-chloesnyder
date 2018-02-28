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
        this.shapes.push(new Shape("C", false, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 0), vec3.fromValues(1,1,1)));
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

    /*    //need to add offset to indices so they are stored correctly
        var offset = Math.floor(this.positions.length / 4.0);
        for(let s of this.shapes)
        {
            for(var j = 0; j < s.meshCount; j++)
            {
                 this.t_indices.push(s.indices[j] + offset);
            }
        }
*/
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
    parseShapeGrammar(grammar: string, iter: number)
    {
      
        //for(var i = 0; i < iter; ++i)
       // {
        debugger;
            for(let s of this.shapes)
            {
                //force to stop if shape is too complicated
                if(!s.terminal && this.shapes.length < 15)
                {
                   this.applyRule(s, grammar);
                }
            }
       // }
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
            return "D";
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
                var child1Pos = vec3.fromValues(parentPos[0] + .25, parentPos[1] + .25, parentPos[2] + .25);
                var child2Pos = vec3.fromValues(parentPos[0] - .25, parentPos[1] + .25, parentPos[2] + .25);
                var child3Pos = vec3.fromValues(parentPos[0] + .25, parentPos[1] - .25, parentPos[2] + .25);
                var child4Pos = vec3.fromValues(parentPos[0] - .25, parentPos[1] - .25, parentPos[2] + .25);
                var child5Pos = vec3.fromValues(parentPos[0] + .25, parentPos[1] + .25, parentPos[2] - .25);
                var child6Pos = vec3.fromValues(parentPos[0] - .25, parentPos[1] - .25, parentPos[2] - .25);
                var child7Pos = vec3.fromValues(parentPos[0] + .25, parentPos[1] - .25, parentPos[2] - .25);
                var child8Pos = vec3.fromValues(parentPos[0] - .25, parentPos[1] + .25, parentPos[2] - .25);

                var childScale = vec3.fromValues(parentScale[0] / 8, parentScale[1] / 8, parentScale[2] / 8);

                // add the successors to the shape set
                successors.push(new Shape(this.randomRule(), Math.random() > .5, child1Pos, s.rotation, childScale));
                successors.push(new Shape(this.randomRule(), Math.random() > .5, child2Pos, s.rotation, childScale));
                successors.push(new Shape(this.randomRule(), Math.random() > .5, child3Pos, s.rotation, childScale));
                successors.push(new Shape(this.randomRule(), Math.random() > .5, child4Pos, s.rotation, childScale));
                successors.push(new Shape(this.randomRule(), Math.random() > .5, child5Pos, s.rotation, childScale));
                successors.push(new Shape(this.randomRule(), Math.random() > .5, child6Pos, s.rotation, childScale));
                successors.push(new Shape(this.randomRule(), Math.random() > .5, child7Pos, s.rotation, childScale));
                successors.push(new Shape(this.randomRule(), Math.random() > .5, child8Pos, s.rotation, childScale));
            } else if (rule === "X")
            {
                //scale in X direction
                var childScale = vec3.fromValues(s.scale[0],  .5 * s.scale[1], .5 * s.scale[2]);
                successors.push(new Shape(this.randomRule(), Math.random() > .5, s.position, s.rotation, childScale));
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
            } else if (rule === "R") {
                // add a roof and make terminal
                successors.push(new Shape("", true, s.position, s.rotation, s.scale)); // save the curr shape

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