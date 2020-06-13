

allEntities = []

function CreateEntity(position, rotation, scale, parent = -1, weight = 1, isLeft = true)
{
    var prevSibling = -1;
    var entityId = allEntities.length;


    var matrix = mat4();
    var tr = translate(position[0], position[1], position[2]);
    var rt = rotateZ(rotation);
    var sc = scalem(scale[0], scale[1], scale[2]);
    matrix = mult(tr, mult(rt, mult(sc, matrix)));
    
    var transform = {
        m_needsUpdate : false,
        m_position : position, 
        m_rotation : rotation,
        m_scale : scale,
        m_modelMatrix : matrix,
        m_globalOrientationVector : rotation,
    };


    var entity = 
        {
            m_id : entityId,
            m_transform : transform,
            m_parent : parent,
            m_firstChild : -1,
            m_lastChild : -1,
            m_nextSibling : -1,
            m_prevSibling : prevSibling,
            m_weight : weight,
            m_depth : 1,
            m_isLeft : isLeft,
            m_distFromRoot : 0,
            m_animPhase : Math.random(),
            m_initialRotation : 0,
            m_angularVelocity : 0,
        };

    allEntities.push(entity);

    if(parent != -1)
        AddChildEntity(parent, entityId);

    return entity;

}

function AddChildEntity(parent, child)
{
    var parentObj = GetEntity(parent);
    var childObj = GetEntity(child);
    parentObj.m_lastChild = child;

    if(parentObj.m_firstChild == -1)
        parentObj.m_firstChild = child;

    childObj.m_distFromRoot = parentObj.m_distFromRoot + 1;
        
    while(parentObj)
    {   
        childObj.m_prevSibling = parentObj.m_lastChild;
        
        parentObj.m_depth++;
        parentObj = GetEntity(parentObj.m_parent);
    }

}

function GetEntity(entityId)
{
    if(entityId < 0 || entityId >= allEntities.length)
        return null;
    
    return allEntities[entityId];
}

function RetrieveAndUpdateTransform(id)
{
    if(id < 0 || id >= allEntities.length)
        return null;

    var entity = allEntities[id];
    var transform = entity.m_transform;
    if(transform.m_needsUpdate)
    {
        var localMatrix = mat4();
        var scaleMatrix = scalem(transform.m_scale);
        var rotMatrix = rotateZ(transform.m_rotation);
        var trMatrix = translate(transform.m_position);
        localMatrix = mult(trMatrix, mult(rotMatrix, mult(scaleMatrix, localMatrix)));

        var parentMatrix;
        if(entity.m_parent != -1)
            parentMatrix = RetrieveAndUpdateTransform(entity.m_parent);
        else 
            parentMatrix = mat4();

        transform.m_modelMatrix = mult(parentMatrix, localMatrix);
        transform.m_needsUpdate = false;
    }    

    return transform.m_modelMatrix;
}

function UpdateTransforms()
{
    for(var i = 0 ; i < allEntities.length ; i++)
        allEntities[i].m_transform.m_needsUpdate = true;

    for(var i = 0 ; i < allEntities.length ; i++)
        RetrieveAndUpdateTransform(i);
}

function RotateEntity(entity, rotation)
{
    if(isNaN(rotation))
        return;
    entity.m_transform.m_rotation += rotation;
}