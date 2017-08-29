'use strict';

const THREE        = require('three');
const bind         = require('../misc/bind');

module.exports = (function() {

    function Voxel(position,cellCoords, cellType) {
        this.position = position;
        this.cellCoords = cellCoords;
        this.cellType = cellType;
        this.meshes = [];
        bind(this);
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

        //outline
        var outlineGeometry = new THREE.Geometry();
        outlineGeometry.vertices.push(new THREE.Vector3(-.5, 0, -.5));
        outlineGeometry.vertices.push(new THREE.Vector3(.5, 0, -.5));
        outlineGeometry.vertices.push(new THREE.Vector3(.5, 0, .5));
        outlineGeometry.vertices.push(new THREE.Vector3(-.5, 0, .5));
        outlineGeometry.vertices.push(new THREE.Vector3(-.5, 0, -.5));

        const outline = new THREE.Line( outlineGeometry, material );
        outline.position.set(this.position.x + .5, this.position.y, this.position.z + .5);
        scene.add(outline);
        this.meshes.push(outline);
        
        const elevation = .4;

        var hingeGeometry = new THREE.Geometry();
        hingeGeometry.vertices.push(new THREE.Vector3(-.5, 0, -.5));
        hingeGeometry.vertices.push(new THREE.Vector3(0, elevation, -.5));
        hingeGeometry.vertices.push(new THREE.Vector3(.5, 0, -.5));
        hingeGeometry.vertices.push(new THREE.Vector3(0, elevation, -.5));
        hingeGeometry.vertices.push(new THREE.Vector3(0, elevation, .5));
        hingeGeometry.vertices.push(new THREE.Vector3(.5, 0, .5));
        hingeGeometry.vertices.push(new THREE.Vector3(0, elevation, .5));
        hingeGeometry.vertices.push(new THREE.Vector3(-.5, 0, .5));

        const hinge = new THREE.Line( hingeGeometry, material );
        hinge.position.set(this.position.x + .5, this.position.y, this.position.z + .5);
        scene.add(hinge);
        this.meshes.push(hinge);

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

            this.scene = null;
            this.meshes = [];            
        }    
    }

    Voxel.prototype.setCompression = function(compressionRatio)
    {
        this.compressionRatio = compressionRatio;
    }

    Voxel.prototype.updateDrawing = function(scene)
    {
        this.removeVoxelFromScene();
        this.drawVoxel(scene);
    }

    return Voxel;

})();