import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import * as fs from 'fs';
var OBJ = require('webgl-obj-loader');

class Mesh extends Drawable {
 // indices: Uint32Array;
//  positions: Float32Array;
 // normals: Float32Array;
  center: vec4;
  
  tempBufPos = new Array();
  tempBufNor = new Array();
  tempBufIdx = new Array();


  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
  }

  getTempIndices() : number[]
  {
    return this.tempBufIdx;
  }

  getTempPos() : number[]
  {
    return this.tempBufPos;
  }

  getTempNor() : number[]
  {
    return this.tempBufNor;
  }


  getCount() : number
  {
    return this.count;
  }

    // Convert from vec3 to vec4, insert a 1 in the w position
loadTempPos(positions : any)
   { 
      for(var i = 0; i < positions.length; i++)
      {
        this.tempBufPos.push(positions[i]);
        if((i + 1) % 3 == 0)
        {
          this.tempBufPos.push(1.0);
        }
      }
    }
  
    // convert from vec3 to vec4, insert a 0 in w postion
loadTempNor(normals : any) 
  {     
    for(var i = 0; i < normals.length; i++)
     {
      this.tempBufNor.push(normals[i]);
        if((i + 1) % 3 == 0)
        {
          this.tempBufNor.push(0.0);
        }
      }
}

loadTempIdx(indices : any)
{
  for(var i = 0; i < indices.length; i++)
  {
    this.tempBufIdx.push(indices[i]);
  }
}

      // Loads relevant index, normal and position data but does not create the mesh
  loadBuffers(obj:string)
  {
    var mesh = new OBJ.Mesh(obj);
    OBJ.initMeshBuffers(gl, mesh);

    this.count = mesh.indices.length;
    this.loadTempNor(mesh.vertexNormals);
    this.loadTempPos(mesh.vertices);
    this.loadTempIdx(mesh.indices);

  }

  create(){}
};

export default Mesh;
