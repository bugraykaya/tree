                                             //
//  initShaders.js
//


var vShaderText = `
        #version 300 es

        in  vec3 vPosition;
        in  vec3 vColor;
        flat out vec3 vertColor;
        out vec3 localPos; 

        uniform mat4 model;
        uniform mat4 proj;
        uniform mat4 view;


        void main()
        {
            localPos = vPosition;
            vertColor = vColor;
            gl_Position = proj * view * model * vec4(vPosition, 1);
            gl_Position.z = -gl_Position.z;
        }`;

var fShaderText = `
        #version 300 es

        precision mediump float;

        in vec3 localPos;

        flat in vec3 vertColor;


        out vec4 fColor;

        void
        main()
        {
            bool isLeaf = vertColor.g > 0.45;
            float factor = isLeaf ? 1.0 : (1.0 - pow(localPos.x / 0.02, 2.0));

            fColor =  vec4( factor * vertColor, 1);

        }`;


function initShaders( gl, vertexShaderId, fragmentShaderId )
{
    var vertShdr;
    var fragShdr;


    vertShdr = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vertShdr, vShaderText.replace(/^\s+|\s+$/g, '' ));
    gl.compileShader( vertShdr );
    if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
        var msg = "Vertex shader failed to compile.  The error log is:"
            + "<pre>" + gl.getShaderInfoLog( vertShdr ) + "</pre>";
        alert( msg );
        return -1;
    }
    

    fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fragShdr, fShaderText.replace(/^\s+|\s+$/g, '' ) );
    gl.compileShader( fragShdr );
    if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
        var msg = "Fragment shader failed to compile.  The error log is:"
            + "<pre>" + gl.getShaderInfoLog( fragShdr ) + "</pre>";
        alert( msg );
        return -1;
    }
    

    var program = gl.createProgram();
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    gl.linkProgram( program );

    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
        alert( msg );
        return -1;
    }

    return program;
}