#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

void main()
{
    // Material base color (before shading)
        vec4 diffuseColor = vec4(178.0/255.0, 178.0/255.0, 137.0/255.0, 1.0);
        // texture windows on x and z planes
     /*   float x = fs_Pos.x;
        float y = fs_Pos.y;
        float dx = .005;
        float dy = .007;
        if(fs_Nor == vec4(1,0,0,0) || fs_Nor == vec4(-1,0,0,0) || fs_Nor == vec4(0,0,1,0) || fs_Nor == vec4(0, 0, -1, 0))
        {
            // Fragment space is -1 to 1

            // windows centered at points (-.25, -.25), (-.25, 0), (-.25, .25), (0, -.25), (0, 0), (0, .25), (.25, -.25), (.25, 0), (.25, .25)
            // with "radius" sx = .005 and sy = .007
            if((x > -.25 - dx && x < -.25 + dx) || (x > -dx && x < dx) || (x > .25 - dx && x < .25 + dx))
            {
                if((y > -.25 - dy && y < -.25 + dy) || (y > -dy && x < dy) || (y > .25 - dy && y < .25 + dy))
                {
                    diffuseColor = vec4(0,0,0,1);
                }
            }
        }*/

        // Calculate the diffuse term for Lambert shading
        float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
        // Avoid negative lighting values
        // diffuseTerm = clamp(diffuseTerm, 0, 1);

        float ambientTerm = 0.2;

        float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.

        // Compute final shaded color
        out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}
