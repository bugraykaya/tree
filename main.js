"use strict";
var canvas;
var gl;
var NumVertices  = 36;
var xAxis = 0, yAxis = 1, zAxis = 2;
var axis = 0;
var cameraPos = [0, 1.4, -1];
var cameraAt = [0,0,0]
var modelLoc;
var toggle = false;
var projLoc;
var viewLoc;

var orthographicSize = 1.7;
var vBuffer;
var leafBuffer;
var program;
var leafBranchLength = 0.15;
var leafLength = 0.10;
var branchWidth = 0.02;
var leafWidth = 0.04
//1, 0, 3, 1, 0, 2
var branchVertices = [    
    vec3(-branchWidth,  branchLength,  0.1),
    vec3(-branchWidth,          -0.0,  0.1),
    vec3( branchWidth,          -0.0,  0.1),
    vec3(-branchWidth,  branchLength,  0.1),
    vec3( branchWidth,          -0.0,  0.1),
    vec3( branchWidth,  branchLength,  0.1),
    vec3(0.54, 0.45, 0.38),
    vec3(0.54, 0.45, 0.38),
    vec3(0.54, 0.45, 0.38),
    vec3(0.54, 0.45, 0.38),
    vec3(0.54, 0.45, 0.38),
    vec3(0.54, 0.45, 0.38),
];

var leafVertices = [
    vec3(-branchWidth, -0.0,                  0.1),
    vec3(    0,        leafBranchLength,     0.1),
    vec3( branchWidth, -0.0,                  0.1),

    vec3(-0.0 ,  leafBranchLength        ,  0.1),
    vec3( 0.0 ,  leafBranchLength + leafLength * 2,  0.1),
    vec3(-leafWidth,  leafBranchLength + leafLength,  0.1),
    vec3(-0.0 ,  leafBranchLength       ,  0.1),
    vec3( leafWidth ,  leafBranchLength + leafLength,  0.1),
    vec3(-0.0,  leafBranchLength + leafLength * 2,  0.1),
    
    vec3(0.54, 0.45, 0.38),
    vec3(0.54, 0.45, 0.38),
    vec3(0.54, 0.45, 0.38),
    
    vec3(0, 0.7, 0),
    vec3(0, 0.7, 0),
    vec3(0, 0.7, 0),
    vec3(0, 0.7, 0),
    vec3(0, 0.7, 0),
    vec3(0, 0.7, 0),
];

var s = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

window.onload = function init()
{
    
    canvas = document.getElementById( "gl-canvas" );
    document.getElementById( "canvasContainer" ).addEventListener("wheel", wheelCallback);
    document.getElementById( "canvasContainer" ).addEventListener("drag", dragCallback);
    document.getElementById("canvasContainer").addEventListener("keyup", keyPressCallback);


    gl = canvas.getContext("webgl2");
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.48, 0.78, 0.85, 1 );

    gl.enable(gl.DEPTH_TEST);

    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vShader", "fShader" );
    gl.useProgram( program );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(branchVertices), gl.STATIC_DRAW );

    leafBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, leafBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(leafVertices), gl.STATIC_DRAW );

    projLoc = gl.getUniformLocation(program, "proj");
    viewLoc = gl.getUniformLocation(program, "view");
    modelLoc = gl.getUniformLocation(program, "model");

    document.getElementById( "tButton" ).onclick = updateText;
    document.getElementById( "change-wind" ).onclick = changeWind;
    document.getElementById( "change-stiffness" ).onclick = changeStiffness;

    document.getElementById("wind_x").value = windVelocity[0];
    document.getElementById("wind_y").value = -windVelocity[1];
    document.getElementById("stiffness").value = stiffness;
    

    document.getElementById("text-field").value = "Szeth-son-son-Vallano, Truthless of Shinovar, wore white on the day he was to kill a king. The white clothing was a Parshendi tradition, foreign to him. But he did as his masters required and did not ask for an explanation. He sat in a large stone room, baked by enormous firepits that cast a garish light upon the revelers, causing beads of sweat to form on their skin as they danced, and drank, and yelled, and sang, and clapped. Some fell to the ground red-faced, the revelry too much for them, their stomachs proving to be inferior wineskins. They looked as if they were dead, at least until their friends carried them out of the feast hall to waiting beds. Szeth did not sway to the drums, drink the sapphire wine, or stand to dance. He sat on a bench at the back, a still servant in white robes. Few at the treaty-signing celebration noticed him. He was just a servant, and Shin were easy to ignore. Most out here in the East thought Szeth's kind were docile and harmless. They were generally right.";
    //document.getElementById("text-field").value = "a";
    
    updateText();
    

    render();
}


function render()
{
    cameraAt[0] = cameraPos[0];
    cameraAt[1] = cameraPos[1];
    cameraAt[2] = cameraPos[2] + 1;

    AnimateEntities();
    UpdateTransforms();

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    var aspectRatio = canvas.height / canvas.width;
    var left = -orthographicSize / aspectRatio, right = orthographicSize / aspectRatio, top = orthographicSize, bottom = -orthographicSize;

    var projMat = ortho(left, right, bottom, top, -1, 200);
    var viewMat = lookAt(cameraPos, cameraAt, [0,1,0]);
    
    gl.uniformMatrix4fv(projLoc, false, flatten(projMat));
    gl.uniformMatrix4fv(viewLoc, false, flatten(viewMat));

    for(var i = 0 ; i < allEntities.length ; i++)
    {
        var entity = allEntities[i];
        if(entity.m_firstChild == -1)
            drawLeaf(entity.m_transform);
        else
            drawBranch(entity.m_transform);
    }
    

    
    requestAnimationFrame( render );
}

function drawLeaf(transform)
{
    gl.bindBuffer( gl.ARRAY_BUFFER, leafBuffer );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 108);
    gl.enableVertexAttribArray( vColor );
    
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    
    gl.uniformMatrix4fv(modelLoc, false, flatten(transform.m_modelMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, 9);
}


function drawBranch(transform)
{
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.enableVertexAttribArray( vColor );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 72);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.uniformMatrix4fv(modelLoc, false, flatten(transform.m_modelMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
}


function wheelCallback(event)
{
    event.preventDefault();
    orthographicSize += event.deltaY * 0.001;

}


function dragCallback(event)
{
    event.preventDefault();
    cameraPos[0] += event.movementX * 0.001;
    cameraPos[1] += event.movementY * 0.001;


}

function keyPressCallback(event)
{
    console.log("yes");
    event.preventDefault();
    if(event.key == null)
    {
        
    }
}

function updateText(event)
{
    allEntities = [];
    var text = document.getElementById("text-field").value;
    BuildHuffmannTree(text);
     
    var nEntities = allEntities.length;

    var treeDepth = allEntities[0].m_depth;
    var rotationMag = 30;
    
    for(var i = 1 ; i < nEntities ; i++)
    {
        var entity = allEntities[i];
        entity.m_transform.m_rotation = (entity.m_isLeft ? -rotationMag : rotationMag) * Math.pow(1 - entity.m_depth / treeDepth, 1);
        entity.m_initialRotation = entity.m_transform.m_rotation;
    }

}

function changeWind()
{
    var windX = document.getElementById("wind_x").value;
    var windY = -document.getElementById("wind_y").value;
    windVelocity = [windX, windY, 0, 0];
    
    updateText();
}

function changeStiffness()
{
    var _stiffness = document.getElementById("stiffness").value;
    stiffness = _stiffness;
    
    updateText();
}