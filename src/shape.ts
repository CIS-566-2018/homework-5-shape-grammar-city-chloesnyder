import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';
import Mesh from './geometry/Mesh';
import {gl} from './globals';
import * as fs from 'fs';

var OBJ = require('webgl-obj-loader');
const PI = Math.PI;
const deg2rad = PI / 180.0;

class Shape {
    symbol: string;
    mesh: Mesh;
    position: vec3;
    rotation: vec3;
    scale: vec3;
    terminal: boolean;

    indices: Array<number> = new Array();
    positions: Array<number> = new Array();
    normals: Array<number> = new Array();

    shapeIdx: Array<number> = new Array();
    shapePos: Array<Array<number>>= new Array<Array<number>>();
    shapeNor: Array<Array<number>>= new Array<Array<number>>();

    //TODO: color
    color: vec3;

    meshCount: number;
    numVerts: number;


    constructor(sym: string, t: boolean, pos: vec3, rot: vec3, scale: vec3)
    {
        this.symbol = sym; //symbol will determine kind of mesh to load into object
        this.terminal = t;
        this.position = pos;
        this.rotation = rot;
        this.scale = scale;

        this.mesh = new Mesh(vec3.fromValues(0, 0, 0));

      //  this. mesh.loadBuffers(this.readTextFile('src/objs/cube.obj'));
        
       if(sym === "C")
        {
            //roof
            this. mesh.loadBuffers(this.readTextFile('src/objs/cylinder.obj'));

        } else {
           this. mesh.loadBuffers(this.readTextFile('src/objs/cube.obj'));
        }

        var t_Pos =  this.mesh.getTempPos();
        var t_Nor =  this.mesh.getTempNor();
        var t_Idx =  this.mesh.getTempIndices();

        this.meshCount = this.mesh.getCount();
        this.numVerts = t_Pos.length / 4.0;

         // convert into an array of "vec4s"
         for(var i = 0; i < this.numVerts; i++)
         {
             this.shapeNor.push([t_Nor[i * 4], t_Nor[i * 4 + 1], t_Nor[i * 4 + 2], 0.0]);
             this.shapePos.push([t_Pos[i * 4], t_Pos[i * 4 + 1], t_Pos[i * 4 + 2], 1.0]);
         }
 
         //offset indices
         for(var j = 0; j < this.meshCount; j++)
         {
             this.shapeIdx.push(t_Idx[j]);
         }

         //convert rotation from euler angles to quaternion
         var currRot = quat.create();
         quat.fromEuler(currRot, this.rotation[0], this.rotation[1], this.rotation[2]);
         quat.normalize(currRot, currRot);

         var currPos = this.position;

         var currTrans = mat4.create();
         mat4.fromRotationTranslationScale(currTrans, currRot, this.position, this.scale);

         //transform data to right position, scale and orientation
         for(var i = 0; i < this.numVerts; i++)
         {
             var transPositions = vec4.fromValues(this.shapePos[i][0], this.shapePos[i][1], this.shapePos[i][2], 1.0);
             var transNormals = vec4.create();

             //transform brach pos based on current transformation (rotation and position) of turtle
            transPositions = vec4.transformMat4(transPositions, transPositions, currTrans);
            //rotate normals based on current turtle rotation
            var mat4Rot =  mat4.create();
            mat4.fromQuat(mat4Rot, currRot);
            transNormals = vec4.transformMat4(transNormals, this.shapeNor[i], mat4Rot);

             // flatten into a temp VBO to append to final array
            this.normals.push(transNormals[0]);
            this.normals.push(transNormals[1]);
            this.normals.push(transNormals[2]);
            this.normals.push(0.0);
            this.positions.push(transPositions[0]);
            this.positions.push(transPositions[1]);
            this.positions.push(transPositions[2]);
            this.positions.push(1.0);
         }

         // indices are unchanged because only a single instance
         this.indices = this.shapeIdx;
    }

      //https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
      readTextFile(file: string) : string
      {
          var text = "";
          var rawFile = new XMLHttpRequest();
          rawFile.open("GET", file, false);
          rawFile.onreadystatechange = function ()
          {
              if(rawFile.readyState === 4)
              {
                  if(rawFile.status === 200 || rawFile.status == 0)
                  {
                      var allText = rawFile.responseText;
                      text = allText;
                  }
              }
          }
          rawFile.send(null);
          return text;
      }
}
export default Shape;