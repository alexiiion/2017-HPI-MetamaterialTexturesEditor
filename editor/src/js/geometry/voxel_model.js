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
        var voxel = new Voxel(position, cellCoords, cellType);
        this.elements.push(voxel);
        return voxel;        
    };

    VoxelModel.prototype.updateCompression = function(value)
    {
        for(var i = 0; i < this.elements.length; i++)
        {
            this.elements[i].updateCompression(value);
            this.elements[i].updateDrawing();
        }
    };

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

    VoxelModel.prototype.edit = function(position, cellCoords, cellType){
        // var elementToRemove;
        // elements.forEach(function(element) {
        //     if(element.position == position)
        //     {
        //         elementToRemove = element;
        //         break;
        //     }
        // }, this);
        // this.elements.remove(elementToRemove);
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