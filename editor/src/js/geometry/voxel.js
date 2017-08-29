'use strict';

const THREE        = require('three');
const bind         = require('../misc/bind');

module.exports = (function() {

    function Voxel(position,cellCoords, cellType) {
        this.position = position;
        this.cellCoords = cellCoords;
        this.cellType = cellType;
        this.meshes = [];
        this.geometries = [];
        this.materials = [];
        this.compressionRatio = 0;

        this.hingeDistance = 0.0;
        this.hingeOffset = 0.0;
        this.hingePosition = 0.0;
        
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
            linewidth: 2
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

        var cellColor = 0xaa0000;
        if(this.cellType == 2)
            cellColor = 0x00aa00;
        if(this.cellType == 3)
            cellColor = 0x0000aa;

        const maxForeShortening = .5 * 0.75;
        const currentForeShortening = maxForeShortening * this.compressionRatio;
        const currentLength = .5 - currentForeShortening;
        const currentHeight = Math.sqrt(Math.pow(.5, 2) - Math.pow(currentLength, 2));

        const maxHingeOffset = .5 * 0.5;
        const currentHalfHingeOffset = maxHingeOffset * this.hingeOffset;

        const maxHingePosition = .5 * .5;
        const currentHalfHingePosition = maxHingePosition * this.hingePosition;

        const cornerA = new THREE.Vector3(-currentLength, 0, -.5);
        const cornerB = new THREE.Vector3(currentLength, 0, -.5);
        const cornerC = new THREE.Vector3(currentLength, 0, .5);
        const cornerD = new THREE.Vector3(-currentLength, 0, .5);

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
            linewidth: 2
            } );
        this.materials.push(outlineMaterial);

        const outline = new THREE.Line( outlineGeometry, outlineMaterial );
        outline.position.set(this.position.x + .5 - this.position.x * currentForeShortening * 2, 
                                this.position.y, this.position.z + .5);
        this.scene.add(outline);
        this.meshes.push(outline);

        const maxHingeDistance = maxForeShortening * 0.5;
        const currentHalfHingeDistance = maxHingeDistance * this.hingeDistance / 2.0;
        const tension = Math.min(this.hingeDistance, 0.5);
        
        //BACK HINGE
        const topALeft = new THREE.Vector3(0 - currentHalfHingeDistance + currentHalfHingePosition, 
                                            currentHeight, 
                                            -.5);
        const topARight = new THREE.Vector3(0 + currentHalfHingeDistance + currentHalfHingePosition, 
                                            currentHeight, 
                                            -.5);
        
        var positions = [];
        positions.push(new THREE.Vector3(cornerA.x + currentHalfHingeOffset, cornerA.y, cornerA.z));
        positions.push(topALeft);

        if(this.hingeDistance > 0.0)
            positions.push(topARight);

        positions.push(new THREE.Vector3(cornerB.x - currentHalfHingeOffset, cornerB.y, cornerB.z));

        var hingeA = this.createHinge(positions, tension);

        hingeA.position.set(this.position.x + .5 - this.position.x * currentForeShortening * 2, 
                            this.position.y, 
                            this.position.z + .5);
        this.scene.add(hingeA);
        this.meshes.push(hingeA);

        //FRONT HINGE
        const topBLeft = new THREE.Vector3(0 - currentHalfHingeDistance +  currentHalfHingePosition
                                            , currentHeight, 
                                            .5);
        const topBRight = new THREE.Vector3(0 + currentHalfHingeDistance +  currentHalfHingePosition, 
                                            currentHeight, 
                                            .5);

        positions = [];
        positions.push(new THREE.Vector3(cornerC.x - currentHalfHingeOffset, cornerC.y, cornerC.z));
        positions.push(topBRight);
        
        if(this.hingeDistance > 0.0)
            positions.push(topBLeft);

        positions.push(new THREE.Vector3(cornerD.x + currentHalfHingeOffset, cornerD.y, cornerD.z));

        var hingeB = this.createHinge(positions, tension);
        
        hingeB.position.set(this.position.x + .5 - this.position.x * currentForeShortening * 2, 
                            this.position.y, 
                            this.position.z + .5);
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
            linewidth: 2
            } );
        this.materials.push(hingeLeftConnectionMaterial);

        const hingeLeft = new THREE.Line( hingeLeftGeometry, hingeLeftConnectionMaterial );
        hingeLeft.position.set(this.position.x + .5 - this.position.x * currentForeShortening * 2, 
                                this.position.y, this.position.z + .5);
        this.scene.add(hingeLeft);
        this.meshes.push(hingeLeft);

        if(this.hingeDistance > 0.0)
        {
            var hingeRightGeometry = new THREE.Geometry();
            hingeRightGeometry.vertices.push(topARight);
            hingeRightGeometry.vertices.push(topBRight);
            this.geometries.push(hingeRightGeometry);

            const hingeRightConnectionMaterial = new THREE.LineBasicMaterial( {
                color: 0x000000,
                opacity: 1,
                linewidth: 2
                } );
            this.materials.push(hingeRightConnectionMaterial);        

            const hingeRight = new THREE.Line( hingeRightGeometry, hingeRightConnectionMaterial );
            hingeRight.position.set(this.position.x + .5 - this.position.x * currentForeShortening * 2, 
                                    this.position.y, this.position.z + .5);
            this.scene.add(hingeRight);
            this.meshes.push(hingeRight);
        }

        // const geometry = new THREE.PlaneGeometry(1.0, 1.0);
        // geometry.rotateX(-90 * THREE.Math.DEG2RAD);
        // const material = new THREE.MeshBasicMaterial({
        //   transparent: true, 
        //   color: 0x444444});
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
    
    Voxel.prototype.updateHingeDistance = function(value)
    {
        this.hingeDistance = value;
    };
    
    Voxel.prototype.updateHingeOffset = function(value)
    {
        this.hingeOffset = value;
    };

    Voxel.prototype.updateHingePosition = function(value)
    {
        this.hingePosition = value;
    };

    Voxel.prototype.updateDrawing = function(scene)
    {
        this.removeVoxelFromScene();
        this.drawVoxel(this.scene);
    };

    return Voxel;

})();