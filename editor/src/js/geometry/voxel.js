'use strict';

const THREE        = require('three');
const bind         = require('../misc/bind');
const constants    = require('../constants');

module.exports = (function() {

    function Voxel(position,cellCoords,
                    hingeDistanceFront = 0.0, hingeDistanceBack = 0.0, 
                    hingeOffset = 0.0, 
                    hingePositionFront = 0.0, hingePositionBack = 0.0, 
                    compression = 0.0 ) {
        this.position = position;
        this.cellCoords = cellCoords;
        this.meshes = [];
        this.geometries = [];
        this.materials = [];
        this.compressionRatio = 0;

        this.voxelSize = new THREE.Vector2(1, 1);
        this.voxelHalfSize = new THREE.Vector2(0.5, 0.5);

        this.hingeDistanceFront = hingeDistanceFront;
        this.hingeDistanceBack = hingeDistanceBack;
        this.hingeOffset = hingeOffset;
        this.hingePositionFront = hingePositionFront;
        this.hingePositionBack = hingePositionBack;
        
        bind(this);
    }

    Voxel.prototype.createHinge = function(positions, tension)
    {        
        var curve = new THREE.CatmullRomCurve3( positions );
        curve.tension = tension;
        curve.type = "catmullrom";
        curve.closed = false;

        const hingeMaterial = new THREE.LineBasicMaterial( {
            color: 0x000000,
            opacity: 1,
            linewidth: constants.HINGE_LINE_WIDTH
            } );
        this.materials.push(hingeMaterial);

        var geometry = new THREE.Geometry();
        geometry.vertices = curve.getPoints(30);
        this.geometries.push(geometry);

        const hinge = new THREE.Line( geometry, hingeMaterial);
        
        return hinge;
    }

    Voxel.prototype.drawVoxel = function(scene)
    {
        this.removeVoxelFromScene();

        this.scene = scene;

        const maxForeShortening = this.voxelHalfSize.x * constants.MAX_FORESHORTENING_PERC
        const currentForeShortening = maxForeShortening * this.compressionRatio;
        const currentLength = this.voxelHalfSize.x - currentForeShortening;
        const currentHeight = Math.sqrt(Math.pow(this.voxelHalfSize.x, 2) - Math.pow(currentLength, 2));

        const maxHingeOffset = this.voxelHalfSize.x * constants.MAX_HINGE_OFFSET_PERC;
        const currentHalfHingeOffset = maxHingeOffset * this.hingeOffset;

        const maxHingePosition = this.voxelHalfSize.x * constants.MAX_HINGE_POSITION_PERC;
        const currentHalfHingePositionFront = maxHingePosition * this.hingePositionFront;
        const currentHalfHingePositionBack = maxHingePosition * this.hingePositionBack;

        const maxHingeDistance = maxForeShortening * constants.MAX_HINGE_DISTANCE_PERC;
        const currentHalfHingeDistanceFront = maxHingeDistance * this.hingeDistanceFront / 2.0;
        const currentHalfHingeDistanceBack = maxHingeDistance * this.hingeDistanceBack / 2.0;
        const tensionFront = Math.min(this.hingeDistanceFront, constants.MAX_TENSION);
        const tensionBack = Math.min(this.hingeDistanceBack, constants.MAX_TENSION);

        const cornerA = new THREE.Vector3(-currentLength, 0, -this.voxelHalfSize.y);
        const cornerB = new THREE.Vector3(currentLength,  0, -this.voxelHalfSize.y);
        const cornerC = new THREE.Vector3(currentLength,  0,  this.voxelHalfSize.y);
        const cornerD = new THREE.Vector3(-currentLength, 0,  this.voxelHalfSize.y);

        //outline
        var outlineGeometry = new THREE.Geometry();
        outlineGeometry.vertices.push(cornerA);
        outlineGeometry.vertices.push(cornerB);
        outlineGeometry.vertices.push(cornerC);
        outlineGeometry.vertices.push(cornerD);
        outlineGeometry.vertices.push(cornerA);
        this.geometries.push(outlineGeometry);

        const outlineMaterial = new THREE.LineBasicMaterial( {
            color: 0x000000,
            opacity: 1,
            linewidth: constants.OUTLINE_LINE_WIDTH
            } );
        this.materials.push(outlineMaterial);

        const outline = new THREE.Line( outlineGeometry, outlineMaterial );
        outline.position.set(this.position.x + this.voxelHalfSize.x - this.position.x * currentForeShortening * 2, 
                                this.position.y, this.position.z + this.voxelHalfSize.y);
        this.scene.add(outline);
        this.meshes.push(outline);
        
        //BACK HINGE
        const topALeft = new THREE.Vector3(0 - currentHalfHingeDistanceBack + currentHalfHingePositionBack, 
                                            currentHeight, 
                                            -this.voxelHalfSize.y);
        const topARight = new THREE.Vector3(0 + currentHalfHingeDistanceBack + currentHalfHingePositionBack, 
                                            currentHeight, 
                                            -this.voxelHalfSize.y);
        
        var positions = [];
        positions.push(new THREE.Vector3(cornerA.x + currentHalfHingeOffset, cornerA.y, cornerA.z));
        positions.push(topALeft);

        if(this.hingeDistanceFront > 0.0 || this.hingeDistanceBack > 0.0)
            positions.push(topARight);

        positions.push(new THREE.Vector3(cornerB.x - currentHalfHingeOffset, cornerB.y, cornerB.z));

        var hingeA = this.createHinge(positions, tensionBack);

        hingeA.position.set(this.position.x + this.voxelHalfSize.x - this.position.x * currentForeShortening * 2, 
                            this.position.y, 
                            this.position.z + this.voxelHalfSize.y);
        this.scene.add(hingeA);
        this.meshes.push(hingeA);

        //FRONT HINGE
        const topBLeft = new THREE.Vector3(0 - currentHalfHingeDistanceFront +  currentHalfHingePositionFront, 
                                            currentHeight, 
                                            this.voxelHalfSize.y);
        const topBRight = new THREE.Vector3(0 + currentHalfHingeDistanceFront +  currentHalfHingePositionFront, 
                                            currentHeight, 
                                            this.voxelHalfSize.y);

        positions = [];
        positions.push(new THREE.Vector3(cornerC.x - currentHalfHingeOffset, cornerC.y, cornerC.z));
        positions.push(topBRight);
        
        if(this.hingeDistanceFront > 0.0 || this.hingeDistanceBack > 0.0)
            positions.push(topBLeft);

        positions.push(new THREE.Vector3(cornerD.x + currentHalfHingeOffset, cornerD.y, cornerD.z));

        var hingeB = this.createHinge(positions, tensionFront);
        
        hingeB.position.set(this.position.x + this.voxelHalfSize.x - this.position.x * currentForeShortening * 2, 
                            this.position.y, 
                            this.position.z + this.voxelHalfSize.y);
        this.scene.add(hingeB);
        this.meshes.push(hingeB);

        //hinge connections
        var hingeLeftGeometry = new THREE.Geometry();
        hingeLeftGeometry.vertices.push(topALeft);
        hingeLeftGeometry.vertices.push(topBLeft);
        this.geometries.push(hingeLeftGeometry);

        const hingeLeftConnectionMaterial = new THREE.LineBasicMaterial( {
            color: 0x000000,
            opacity: 1,
            linewidth: constants.HINGE_LINE_WIDTH
            } );
        this.materials.push(hingeLeftConnectionMaterial);

        const hingeLeft = new THREE.Line( hingeLeftGeometry, hingeLeftConnectionMaterial );
        hingeLeft.position.set(this.position.x + this.voxelHalfSize.x - this.position.x * currentForeShortening * 2, 
                                this.position.y, this.position.z + this.voxelHalfSize.y);
        this.scene.add(hingeLeft);
        this.meshes.push(hingeLeft);

        if(this.hingeDistanceFront > 0.0 || this.hingeDistanceBack > 0.0)
        {
            var hingeRightGeometry = new THREE.Geometry();
            hingeRightGeometry.vertices.push(topARight);
            hingeRightGeometry.vertices.push(topBRight);
            this.geometries.push(hingeRightGeometry);

            const hingeRightConnectionMaterial = new THREE.LineBasicMaterial( {
                color: 0x000000,
                opacity: 1,
                linewidth: constants.HINGE_LINE_WIDTH
                } );
            this.materials.push(hingeRightConnectionMaterial);        

            const hingeRight = new THREE.Line( hingeRightGeometry, hingeRightConnectionMaterial );
            hingeRight.position.set(this.position.x + this.voxelHalfSize.x - this.position.x * currentForeShortening * 2, 
                                    this.position.y, this.position.z + this.voxelHalfSize.y);
            this.scene.add(hingeRight);
            this.meshes.push(hingeRight);
        }

        const planeGeometry = new THREE.PlaneGeometry(currentLength * 2, 1.0);
        planeGeometry.rotateX(-90 * THREE.Math.DEG2RAD);
        this.geometries.push(planeGeometry);

        const planeMaterial = new THREE.MeshBasicMaterial({          
          color: 0xeeeeee});
        this.materials.push(planeMaterial);
        
        var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        planeMesh.position.set(this.position.x + this.voxelHalfSize.x - this.position.x * currentForeShortening * 2, 
            this.position.y, this.position.z + this.voxelHalfSize.y);
        this.scene.add(planeMesh);
        this.meshes.push(planeMesh);
    }

    Voxel.prototype.removeVoxelFromScene = function()
    {
        if(this.scene != null)
        {
            for(var i = 0; i < this.meshes.length; i++)
            {
                const mesh = this.meshes[i];
                this.scene.remove(mesh);
                // this.meshes[i].geometry.dispose();
                // this.meshes[i].dispose();
            }
                
            this.meshes = [];        

            for(var j = 0; j < this.geometries.length; j++)
                this.geometries[j].dispose();

            this.geometries = [];

            for(var k = 0; k < this.materials.length; k++)
                this.materials[k].dispose();

            this.materials = [];
        }
    };
    
    Voxel.prototype.updateCompression = function(value)
    {
        this.compressionRatio = value;
    };
    
    Voxel.prototype.updateHingeDistanceFront = function(value)
    {
        this.hingeDistanceBack = value;
    };

    Voxel.prototype.updateHingeDistanceBack = function(value)
    {
        this.hingeDistanceBack = value;
    };
    
    Voxel.prototype.updateHingeOffset = function(value)
    {
        this.hingeOffset = value;
    };

    Voxel.prototype.updateHingePositionFront = function(value)
    {
        this.hingePositionFront = value;
    };

    Voxel.prototype.updateHingePositionBack = function(value)
    {
        this.hingePositionBack = value;
    };

    Voxel.prototype.updateParams = function(hingeDistanceFront = 0.0, hingeDistanceBack = 0.0,
                                            hingeOffset = 0.0, 
                                            hingePositionFront = 0.0, hingePositionBack = 0.0)
    {
        this.hingeDistanceFront = hingeDistanceFront;
        this.hingeDistanceBack = hingeDistanceBack;
        this.hingeOffset = hingeOffset;
        this.hingePositionFront = hingePositionFront;
        this.hingePositionBack = hingePositionBack;

        this.removeVoxelFromScene();
        this.drawVoxel(this.scene);
    };

    Voxel.prototype.updateDrawing = function(scene)
    {
        this.removeVoxelFromScene();
        this.drawVoxel(this.scene);
    };

    return Voxel;

})();