'use strict';

const THREE        = require('three');
const bind         = require('../misc/bind');

const CSG            = require('openjscad-csg').CSG;

module.exports = (function() {

    function VoxelModel(scene, size) {
        bind(this);

        this.scene = scene;
        this.size = size;
        // this.settings = settings;
    }


    VoxelModel.prototype.updateGridSettings = function(newThickness, newCellSize) {
        if(this.minThickness == newThickness && this.cellSize == newCellSize)
        return;

        this.minThickness = newThickness;
        this.cellSize = newCellSize;

        //update elements and stuff
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