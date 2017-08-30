'use strict';

const THREE        = require('three');
const bind         = require('../misc/bind');
const CSG          = require('openjscad-csg').CSG;
const Voxel        = require('./voxel');

module.exports = (function() {

    function VoxelModel(scene, size) {
        bind(this);

        this.scene = scene;
        this.size = size;

        this.elements = [];

        this.compression = 0.0;
        this.hingeDistance = 0.0;
        this.hingeOffset = 0.0;
        this.hingePosition = 0.0;
        
        // this.settings = settings;
    }

    VoxelModel.prototype.updateGridSettings = function(newThickness, newCellSize) {
        if(this.minThickness == newThickness && this.cellSize == newCellSize)
        return;

        this.minThickness = newThickness;
        this.cellSize = newCellSize;

        //update elements and stuff
    };

    VoxelModel.prototype.update = function() {
        //perform sanity checks and other functions (e.g. merge) here.
    };
    
    VoxelModel.prototype.add = function(position, cellCoords, cellType){
        var containingVoxel = this.tryGetVoxel(position, cellCoords);
        if(containingVoxel != null)
            return containingVoxel;

        var voxel = new Voxel(position, cellCoords, cellType, 
                                this.hingeDistance, this.hingeOffset, this.hingePosition, this.compression);
        this.elements.push(voxel);
        return voxel;        
    };

    VoxelModel.prototype.tryGetVoxel = function(position, cellCoords)
    {
        for(var i = 0; i < this.elements.length; i++)
        {
            if(this.elements[i].position.distanceToSquared(position) < .1)
                return this.elements[i];
        }
        
        return null;
    }

    VoxelModel.prototype.removeVoxel = function(position, cellCoords)
    {
        var indexOfElementToRemove = -1;

        for(var i = 0; i < this.elements.length && indexOfElementToRemove == -1; i++)
        {
            if(this.elements[i].position.distanceToSquared(position) < .1)
                indexOfElementToRemove = i;
        }

        if(indexOfElementToRemove > -1)
        {
            const elementToRemove = this.elements[indexOfElementToRemove];
            this.elements.splice(indexOfElementToRemove, 1);
            return elementToRemove;
        }
        return null;   
    };

    VoxelModel.prototype.edit = function(position, cellCoords, cellType)
    {
        var voxel = this.tryGetVoxel(position, cellCoords);

        if(voxel == null)
            return;

        voxel.updateParams(this.hingeDistance, this.hingeOffset,this.hingePosition);
        voxel.updateDrawing();
    };


    VoxelModel.prototype.updateCompression = function(value)
    {
        this.compression = value;

        for(var i = 0; i < this.elements.length; i++)
        {
            this.elements[i].updateCompression(value);
            this.elements[i].updateDrawing();
        }
    };

    VoxelModel.prototype.updateHingeDistance = function(value)
    {
        this.hingeDistance = value;

        // for(var i = 0; i < this.elements.length; i++)
        // {
        //     this.elements[i].updateHingeDistance(value);
        //     this.elements[i].updateDrawing();
        // }
    };
    VoxelModel.prototype.updateHingeOffset = function(value)
    {
        this.hingeOffset = value;

        // for(var i = 0; i < this.elements.length; i++)
        // {
        //     this.elements[i].updateHingeOffset(value);
        //     this.elements[i].updateDrawing();
        // }
    }; 

    VoxelModel.prototype.updateHingePosition = function(value)
    {
        this.hingePosition = value;

        // for(var i = 0; i < this.elements.length; i++)
        // {
        //     this.elements[i].updateHingePosition(value);
        //     this.elements[i].updateDrawing();
        // }
    }; 

    VoxelModel.prototype.export = function() {
        // const elementGeometry = this.buffer.renderMesh.geometry;
        // const vertices = elementGeometry.attributes.position.array;
        // const indices = elementGeometry.index.array;

        // var polygons  = [];
        // var csgVertices = [];

        // for(var k = 0; k < indices.length; k++){
        //   if(k > 0 && k % 3 == 0){
        //     polygons.push(new CSG.Polygon(csgVertices));
        //     csgVertices = [];
        //   }

        //   var index = indices[k] * 3;
        //   csgVertices.push(new CSG.Vertex(new CSG.Vector3D(
        //     vertices[index] * this.cellSize,
        //     vertices[index+1] * this.cellSize,
        //     vertices[index+2] * this.cellSize
        //   )));
        // }

        // polygons.push(new CSG.Polygon(csgVertices));

        // const exportScene = CSG.fromPolygons(polygons);
        // return exportScene;
     };

    return VoxelModel;

})();