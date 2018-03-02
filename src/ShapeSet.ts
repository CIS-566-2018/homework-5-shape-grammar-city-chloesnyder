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
    colors: Float32Array;
    center: vec4;

    t_indices: Array<number> = new Array(); // temp arrays that hold all the shapes
    t_positions: Array<number> = new Array();
    t_normals: Array<number> = new Array();
    t_colors: Array<number> = new Array();

    shapes: Array<Shape> = new Array();

    sx: number;
    sy: number;
    sz: number;

    //sym : String;
    isTerminal: boolean; // for parsing a city, treating shapesets as shapes (buidlings)
    position : vec3;
    scale_vec : vec3;
    scale : number;
    symbol : string;
    color : vec3;

    constructor(scale: number, xpos: number, zpos: number)
    {
        super();
        this.isTerminal = false;
        this.sx = 5 * scale;
        this.sy = 5 * scale;
        this.sz = 5 * scale;

        this.scale = scale;
        this.symbol = "";

        // starting height between .5 and sy/
        var ypos = Math.random() * (this.sy/2 - .5) + .5;
        
        this.position = vec3.fromValues(xpos, ypos, zpos);
        this.scale_vec = vec3.fromValues(this.sx,this.sy,this.sz);
  
        this.shapes.push(new Shape("S", false, this.position, vec3.fromValues(0, 0, 0), this.scale_vec));
        this.color = vec3.fromValues(1, 1, 1);
    }

    loadTempBuffers()
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
          for(var i = 0; i < this.t_positions.length; i++)
          {  
              this.t_colors.push(this.color[0]);
              this.t_colors.push(this.color[1]);
              this.t_colors.push(this.color[2]);
              this.t_colors.push(1);
          }
    }

    create()
    {
        this.loadTempBuffers();

        this.normals = new Float32Array(this.t_normals);
        this.positions = new Float32Array(this.t_positions);
        this.indices = new Uint32Array(this.t_indices);
        this.colors = new Float32Array(this.t_colors);

        this.generateIdx();
        this.generatePos();
        this.generateNor();
        this.generateCol();
    
        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    }

    // creates a ground plane
    addGround()
    {
        this.shapes = new Array<Shape>();
        this.shapes.push(new Shape("", true, vec3.fromValues(0, 0, 0), vec3.fromValues(0,0,0), vec3.fromValues(22, .2, 22)));
    }
    addColumns()
    {
        // add "columns" below all shapes not already at ground level
        var columns = new Array<Shape>();
        for(let s of this.shapes)
        {
            var ground = vec3.fromValues(0, 0, 0);
            var pos = s.position;
            var dy = s.position[1] - (s.scale[1]/2);

            if(dy > 0)
            {
                var columnScale = vec3.fromValues(.5 * s.scale[0], dy / 2, .5 * s.scale[0]);
                columns.push(new Shape ("C", true, vec3.fromValues(s.position[0], dy / 2, s.position[2]), s.rotation, columnScale));
          }
        }
        this.shapes = this.shapes.concat(columns);
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

       this.addColumns();
    }

    randomRule() : string
    {
        // generates a random rule
        var seed = Math.random();
        var noise = seed; //TODO: some kind of noise function to vary the seed?
        if(noise < (1/6))
        {
            return "S";
        } else if (noise > (1/6) && noise < (2/6)) {
            return "X";
        } else if (noise > (3/6) && noise < (4/6)) {
            return "Y";
        } else if (noise > (4/6) && noise < (5/6)) {
            return "Z";
        } else if (noise > (5/6) && noise < (6/6)) {
            return "D";
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

                 // if parent position y is greater than 0, then we can move the floors down but don't otherwise
                var transYDownBy = 0;
                if(parentPos[1] > .5)
                {
                    transYDownBy = Math.random() / 2;
                }

                var topPos1= vec3.fromValues(parentPos[0] + .25, parentPos[1] + (Math.random() / 2), parentPos[2] + .25); // top floor
                var bottomPos1 =  vec3.fromValues(parentPos[0] + .25, parentPos[1] - transYDownBy, parentPos[2] + .25); // bottom floor
                var bottomRule1 = this.randomRule();
                var topRule1 = this.randomRule();
                var isTopTerminal1 = Math.random() > .5;
                var isBottomTerminal1 = Math.random() > .5;


                if(parentPos[1] > .5)
                {
                    transYDownBy = Math.random() / 2;
                }      
                var topPos2 =  vec3.fromValues(parentPos[0] + .25, parentPos[1] + (Math.random() / 2), parentPos[2] - .25); // top floor
                var bottomPos2 =  vec3.fromValues(parentPos[0] + .25, parentPos[1] - transYDownBy, parentPos[2] - .25); // bottom floor
                var bottomRule2 = this.randomRule();
                var topRule2 = this.randomRule();
                var isTopTerminal2 = Math.random() > .5;
                var isBottomTerminal2 = Math.random() > .5;


                if(parentPos[1] > .5)
                {
                    transYDownBy = Math.random() / 2;
                }
                var topPos3 =  vec3.fromValues(parentPos[0] - .25, parentPos[1] + (Math.random() / 2), parentPos[2] + .25); // top floor
                var bottomPos3 =  vec3.fromValues(parentPos[0] - .25, parentPos[1] - transYDownBy, parentPos[2] + .25); // bottom floor
                var bottomRule3 = this.randomRule();
                var topRule3 = this.randomRule();
                var isTopTerminal3 = Math.random() > .5;
                var isBottomTerminal3 = Math.random() > .5;

                if(parentPos[1] > .5)
                {
                    transYDownBy = Math.random() / 2;
                }
                var topPos4 = vec3.fromValues(parentPos[0] - .25, parentPos[1] + (Math.random() / 2), parentPos[2] - .25); // top floor
                var bottomPos4 = vec3.fromValues(parentPos[0] - .25, parentPos[1] - transYDownBy, parentPos[2] - .25); // bottom floor
                var bottomRule4 = this.randomRule();
                var topRule4 = this.randomRule();
                var isTopTerminal4 = Math.random() > .5;
                var isBottomTerminal4 = Math.random() > .5;

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