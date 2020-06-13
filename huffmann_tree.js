


var entireWeight = 1;
function BuildHuffmannTree(text)
{
    var counts = [];
    
    for(var i  = 0 ; i < text.length ; i++)
    {
        var item = counts.find(item => item.key == text[i]);
        if(item == null)
            counts.push({key : text[i], weight : 1});
        else
            item.weight++;
    }
         
    
    
    while(counts.length > 1)
    {
        counts.sort((a, b) => b.weight - a.weight);
    
        var left = counts.pop();
        var right = counts.pop();
        var newNode = {
            weight : left.weight + right.weight,
            left : left,
            right : right,
        };
        counts.push(newNode);
    }
    entireWeight = counts[0].weight;
    CreateEntitiesFromTree(counts[0]);
    
    console.log(counts);
    
}

var branchLength = 0.3;
function CreateEntitiesFromTree(tree, parent = -1, isLeft = true)
{
    var posX = 0;
    var rotation = 0;
    var posY = 0;

    if(parent != -1)
    {
        posY = branchLength;
    }

    var scale = 1;  
    
            
    var scaleVec = [scale, scale, scale];
    
    var position = [posX, posY, 0];
    var entity = CreateEntity(position, rotation, scaleVec, parent, tree.weight, isLeft);
    
    if(tree.left)
    {
        CreateEntitiesFromTree(tree.left, entity.m_id, true)
        CreateEntitiesFromTree(tree.right, entity.m_id, false)
    }

}


function AnimateEntities()
{
    var date = new Date();
    var currentTime = date.getTime() / 1000.0 - startTime;
    deltaTime = (currentTime - time);
    time = currentTime;
    
    var treeDepth = allEntities[0].m_depth;
    
    for(var i = 0 ; i < allEntities.length ; i++)
    {
        var entity = allEntities[i];
        var localWind = [windVelocity[0], windVelocity[1], windVelocity[2], windVelocity[3]];//scalarMult(windVelocity, /*Math.cos(time * 4 + entity.m_animPhase) * deltaTime **/ 0.01);
        
        var inverseTransform = inverse4(entity.m_transform.m_modelMatrix);
        localWind = mult(inverseTransform, localWind);

        var windTorque = localWind[0];
        var currentRot = entity.m_transform.m_rotation - entity.m_initialRotation;
        
        var springTorque = stiffness * Math.pow(currentRot, 2) * entity.m_depth;
        if(currentRot < 0)
            springTorque *= -1;
        
        var acceleration = (windTorque - springTorque) / entity.m_depth;
        if(isNaN(acceleration) || acceleration == Infinity)
            continue;
        
        entity.m_angularVelocity += acceleration;
        RotateEntity(entity, entity.m_angularVelocity);
        
    }
    
}

function scalarMult(v, s)
{
    var result = []
    for(var i = 0 ; i < v.length ; i++)
        result.push(v[i] * s);
    return result;
}