'use strict';

const THREE        = require('three');
const bind         = require('../misc/bind');

module.exports = (function() {

    function Voxel(position,cellCoords, cellType) {
        this.position = position;
        this.cellCoords = cellCoords;
        this.cellType = cellType;
        this.meshes = [];
        this.compressionRatio = 0;
        this.hingeDistance = 0.0;
        this.hingeOffset = 0.0;

        this.hingeMaterial = new THREE.LineBasicMaterial( {
            color: 0x000000,
            opacity: 1,
            linewidth: 2
            } );
        bind(this);
    }

    Voxel.prototype.createHinge = function(positions, material, tension)
    {        
        var curve = new THREE.CatmullRomCurve3( positions );
        curve.tension = tension;
        curve.type = "catmullrom";
        curve.closed = false;

        var geometry = new THREE.Geometry();
        geometry.vertices = curve.getPoints(30);

        const hinge = new THREE.Line( geometry, material);
        return hinge;
    }

    Voxel.prototype.drawVoxel = function(scene)
    {
        if(this.scene != null)
        {
            for(var i = 0; i < this.meshes.length; i++)
                this.scene.remove(this.meshes[i]);       
        }

        this.scene = scene;

        var cellColor = 0xaa0000;
        if(this.cellType == 2)
            cellColor = 0x00aa00;
        if(this.cellType == 3)
            cellColor = 0x0000aa;

        var material = new THREE.LineBasicMaterial( {
            color: 0x000000,
            linewidth: 5,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin:  'round' //ignored by WebGLRenderer
        } );

        const maxForeShortening = .5 * 0.75;
        const currentForeShortening = maxForeShortening * this.compressionRatio;
        const currentLength = .5 - currentForeShortening;
        const currentHeight = Math.sqrt(Math.pow(.5, 2) - Math.pow(currentLength, 2));

        const maxHingeOffset = .5 * 0.5;
        const currentHalfHingeOffset = maxHingeOffset * this.hingeOffset;

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

        const outline = new THREE.Line( outlineGeometry, material );
        outline.position.set(this.position.x + .5 - this.position.x * currentForeShortening * 2, 
                                this.position.y, this.position.z + .5);
        this.scene.add(outline);
        this.meshes.push(outline);

        const maxHingeDistance = maxForeShortening * 0.5;
        const currentHalfHingeDistance = maxHingeDistance * this.hingeDistance / 2.0;
        const tension = Math.min(this.hingeDistance, 0.5);

        //BACK HINGE
        const topALeft = new THREE.Vector3(0 - currentHalfHingeDistance, currentHeight, -.5);
        const topARight = new THREE.Vector3(0 + currentHalfHingeDistance, currentHeight, -.5);
        
        var positions = [];
        positions.push(new THREE.Vector3(cornerA.x + currentHalfHingeOffset, cornerA.y, cornerA.z));
        positions.push(topALeft);

        if(this.hingeDistance > 0.0)
            positions.push(topARight);

        positions.push(new THREE.Vector3(cornerB.x - currentHalfHingeOffset, cornerB.y, cornerB.z));

        var hingeA = this.createHinge(positions, this.hingeMaterial,tension);

        hingeA.position.set(this.position.x + .5 - this.position.x * currentForeShortening * 2, 
                            this.position.y, 
                            this.position.z + .5);
        this.scene.add(hingeA);
        this.meshes.push(hingeA);

        //FRONT HINGE
        const topBLeft = new THREE.Vector3(0 - currentHalfHingeDistance, currentHeight, .5);
        const topBRight = new THREE.Vector3(0 + currentHalfHingeDistance, currentHeight, .5);

        positions = [];
        positions.push(new THREE.Vector3(cornerC.x - currentHalfHingeOffset, cornerC.y, cornerC.z));
        positions.push(topBRight);
        
        if(this.hingeDistance > 0.0)
            positions.push(topBLeft);

        positions.push(new THREE.Vector3(cornerD.x + currentHalfHingeOffset, cornerD.y, cornerD.z));

        var hingeB = this.createHinge(positions, this.hingeMaterial, tension);
        
        hingeB.position.set(this.position.x + .5 - this.position.x * currentForeShortening * 2, 
                            this.position.y, 
                            this.position.z + .5);
        this.scene.add(hingeB);
        this.meshes.push(hingeB);

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
                this.scene.remove(this.meshes[i]);

            this.meshes = [];            
        }    
    };
    
    Voxel.prototype.updateCompression = function(value)
    {
        this.compressionRatio = value;
    };
    
    //tension is a nice way to simulate having multiple hinges.
    //larger values look like there are two hinges.
    //note that this value is never smaller than the minimum hinge distance set in controls.js
    Voxel.prototype.updateHingeDistance = function(value)
    {
        this.hingeDistance = value;
    };
    
    //tension is a nice way to simulate having multiple hinges.
    //larger values look like there are two hinges.
    //note that this value is never smaller than the minimum hinge distance set in controls.js
    Voxel.prototype.updateHingeOffset = function(value)
    {
        this.hingeOffset = value;
    };

    Voxel.prototype.updateDrawing = function(scene)
    {
        this.removeVoxelFromScene();
        this.drawVoxel(this.scene);
    };

    return Voxel;

})();