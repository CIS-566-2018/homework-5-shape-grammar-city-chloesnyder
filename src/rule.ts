import {vec3, vec4, mat3, mat4, quat} from 'gl-matrix';

const PI = Math.PI;
const deg2rad = PI / 180.0;


// A class representing rules. This is the class that 
// takes the initial string and expands it to its final string
// This class processes the initial axiom string,
// and expands it into a longer string based on a set of rules
// the string is expanded for a given number of iterations
//http://interactivepython.org/courselib/static/thinkcspy/Strings/TurtlesandStringsandLSystems.html
class  Rule
{

    constructor() {}

    // TODO: come up with actual rules
    // The rules stating how to expand the original string
    applyRules(ch: number, str: string, iter: number) : string
    {
       var currChar = str.charAt(ch);
       var toReturn = "";
       var probability = Math.random();

      if(currChar === "X")
       {
           toReturn = "F";
       } else if (currChar === "F")
       {
  
         if(probability < .3)
          {
            toReturn = "F[&-F][+F][<F][>F][F*]";
          } else if (probability > .3 && probability < .6){
            toReturn = "F[^<F][>F][-F][+F][F*]";
          } else {
              toReturn = "F[^<F][>F][-F][+F][F*]"
          }
          //toReturn = "F[&-F][+F][<F][>F][F][F*]";
          //  console.log(toReturn);
       } else {
           toReturn = currChar;
       }


        return toReturn;
    }

    // Process initial string and expand based on rules
    processString(oldStr: string, iter: number) : string
    {
        var newstr = "";
        for(var ch = 0; ch < oldStr.length; ch++)
        {
            newstr = newstr + this.applyRules(ch, oldStr, iter);
        }
        console.log(newstr);
        return newstr;
    }

    createLSystem(numIters: number, axiom: string) : string
    {
      var startString = axiom;
      var endString = "";
      for(var i = 0; i < numIters; i++)
      {
        endString = this.processString(startString, i);
        startString = endString;
      }
      return endString;
    }
    
}

export default Rule;