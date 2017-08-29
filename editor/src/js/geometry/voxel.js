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
        this.tension = 0.2;

        this.hingeMaterial = new THREE.LineBasicMaterial( {
            color: 0x000000,
            opacity: 1,
            linewidth: 2
            } );
        bind(this);
    }

    Voxel.prototype.createHinge = function(positions, material)
    {
        const tension = this.tension;//Math.max(Math.min(this.compressionRatio, .3), .8);
        
        var curve = new THREE.CatmullRomCurve3( positions );
        curve.tension = 0;
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

        const topA = new THREE.Vector3(0, currentHeight, -.5);
        const topB = new THREE.Vector3(0, currentHeight, .5);

        // var geometry = new THREE.Geometry();
        
        // const ARC_SEGMENTS = 10;
        // for ( var i = 0; i < ARC_SEGMENTS; i ++ ) {
        //     geometry.vertices.push( new THREE.Vector3() );
        // }
        
        var positions = [];
        positions.push(cornerA);
        positions.push(topA);
        positions.push(cornerB);

        var hingeA = this.createHinge(positions, this.hingeMaterial);

        hingeA.position.set(this.position.x + .5 - this.position.x * currentForeShortening * 2, 
                            this.position.y, 
                            this.position.z + .5);
        this.scene.add(hingeA);
        this.meshes.push(hingeA);

        positions = [];
        positions.push(cornerC);
        positions.push(topB);
        positions.push(cornerD);

        var hingeB = this.createHinge(positions, this.hingeMaterial);
        
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
        this.tension = value;
    };

    Voxel.prototype.updateDrawing = function(scene)
    {
        this.removeVoxelFromScene();
        this.drawVoxel(this.scene);
    };

    return Voxel;

})();