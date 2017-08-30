'use strict';

const THREE      = require('three');

const bind       = require('./misc/bind');
const threePatch = require('./misc/three_patch');

const Controls   = require('./controls');
const Renderer   = require('./renderer');
const VoxelModel  = require('./geometry/voxel_model');

module.exports = (function() {

  function Editor() {
    bind(this);

    // Enhances THREE Vector3 with utility functions.
    threePatch(THREE);

    // Maximum dimensions of the voxel grid.
    const voxelGridSize = new THREE.Vector3(50, 0, 100);

    this.renderer = new Renderer(voxelGridSize);
    this.voxelModel = new VoxelModel(this.renderer.scene, voxelGridSize)
    this.controls = new Controls(this.renderer, this.voxelModel);
  }

  Editor.prototype.run = function() {
    this.renderer.update();
    requestAnimationFrame(this.run);
  }

  return Editor;

})();
