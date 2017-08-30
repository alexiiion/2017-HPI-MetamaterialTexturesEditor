'use strict';

const bind  = require('../misc/bind');
const VoxelTool  = require('./voxel_tool');

const THREE = require('three');

module.exports = (function() {

  function VoxelEditTool(renderer, voxelModel) {
    bind(this);
    VoxelTool.call(this, renderer, voxelModel);

    // this.cursor.material.uniforms.tool.value = 2;
    this.allowCube = false;

    this.setRectMode(true);
  }

  VoxelEditTool.prototype = Object.create(VoxelTool.prototype);

  VoxelEditTool.prototype.extrusionParametersFromIntersection = function(intersection) {
    return intersection.object.isPlane ? {
      startPosition: undefined,
      extrusionNormal: new THREE.Vector3(0.0, -1.0, 0.0)
    } : {
      startPosition: intersection.object.position.clone(),
      extrusionNormal: new THREE.Vector3(0.0, -1.0, 0.0)
    }
  }

  // VoxelEditTool.prototype.updateCursor = function() {
  //   this.cursor.scale.setComponent(this.extrusionComponent, 0.1);
  //   this.cursor.position.add(this.extrusionNormal.clone().multiplyScalar(0.7));
  //   this.cursor.material.uniforms.scale.value = this.cursor.scale;
  //   this.cursor.material.uniforms.rotatedMode.value = this.rotatedMode ? 1 : 0;
  // }

  // VoxelEditTool.prototype.updateVoxel = function(position, features, mirrorFactor) {
  //   var voxel;
  //   const direction = this.extrusionNormal.largestComponent();
  //   const extrusionNormal = this.extrusionNormal.clone();
  //   extrusionNormal.setComponent(direction, mirrorFactor * extrusionNormal.getComponent(direction));

  //   const voxels = [];

  //   while ((voxel = this.voxelModel.voxelAtPosition(position)) && (!this.mirror[direction] ||  mirrorFactor * position.getComponent(direction) > 0)) {
  //     voxel.update(features, direction);
  //     voxel.setStiffness(this.stiffness);
  //     voxels.push(voxel);
  //     position.sub(extrusionNormal);
  //   }

  //   this.activeBrush.used = true;

  //   return voxels;
  // }
  VoxelEditTool.prototype.updateVoxel = function(position, cellCoords, cellType) {
    const voxel = this.voxelModel.edit(position, cellCoords);
    return voxel;
    // const voxel = this.voxelModel.getVoxel (position, cellCoords);
    // var voxel;
    // const voxels = [];

    // while ((voxel = this.voxelModel.voxelAtPosition(position)) && (!this.mirror[direction] ||  mirrorFactor * position.getComponent(direction) > 0)) {
    //   voxel.update(features, direction);
    //   voxel.setStiffness(this.stiffness);
    //   voxels.push(voxel);
    //   position.sub(extrusionNormal);
    // }

    // this.activeBrush.used = true;

    // return voxels;
  };

  return VoxelEditTool;

})();
