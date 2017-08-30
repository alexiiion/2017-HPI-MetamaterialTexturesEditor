'use strict';

const bind  = require('../misc/bind');
const Tool  = require('./tool');
// const addBorderingIfNeeded = require('./bordering');

const $     = require('jquery');
const _     = require('lodash');
const THREE = require('three');

module.exports = (function() {

  function VoxelTool(renderer, voxelModel) {
    Tool.call(this, renderer);

    this.voxelModel = voxelModel;
    this.startPosition = new THREE.Vector3();
    this.endPosition = new THREE.Vector3();

    this.extrusionNormal = new THREE.Vector3();
    this.extrusionComponent = 0;

    this.allowCube = true;
    this.cursorBorder = 0.0;
    this.stiffness = 0.01;

    this.cellType = 0;

    this.minPosition = new THREE.Vector3(
      -(this.voxelModel.size.x / 2 - 0.5),
      0.5,
      -(this.voxelModel.size.z / 2 - 0.5)
    );
    this.maxPosition = new THREE.Vector3(
      this.voxelModel.size.x / 2 - 0.5,
      this.voxelModel.size.y - 0.5,
      this.voxelModel.size.z / 2 - 0.5
    );

    this.cursor = this.buildCursor();
    this.cursor.visible = false;
    this.scene.add(this.cursor);

    this.setRectMode(true);

    this.mirror = [false, false, false];
  }

  VoxelTool.prototype = Object.create(Tool.prototype);

  VoxelTool.prototype.setMirrorMode = function(mirrorMode) {
    this.mirror = [mirrorMode, false, false];
  }

  VoxelTool.prototype.buildCursor = function() {
    var geometry = new THREE.PlaneGeometry(1.0, 1.0);
    geometry.rotateX(-90 * THREE.Math.DEG2RAD);
    const material = new THREE.MeshBasicMaterial({
      transparent: true, 
      color: 0x00ff00});
    // material.color = new THREE.Color(0x00ff00);

    const cursor = new THREE.Mesh(geometry, material);
    return cursor;
  }

  VoxelTool.prototype.setCurrentCellType = function(cellType)
  {
    this.cellType = cellType;
  };

  VoxelTool.prototype.setRectMode = function(enableRect)
  {
    this.mouseMoveUp = this.processSingle;
    this.mouseUp = this.updatevoxelModel;

    if(enableRect)
    {
      this.mouseMoveDown = this.processRect;
    }else
    {
      this.mouseMoveDown = null;
    }

    this.processSingle();
  };

  // VoxelTool.prototype.setCuboidMode = function(cuboidMode) {
  //   this.cuboidMode = cuboidMode;

  //   if (this.cuboidMode) {
  //     this.mouseMoveUp = this.processSingle;
  //     this.mouseMoveDown = this.processRect;

  //     if (this.allowCube) {
  //       this.mouseUp = function() {
  //         this.processRect();
  //         this.savedEndPosition = this.endPosition.clone();
  //         this.mouseMoveUp = this.processCube;
  //         this.mouseMoveDown = this.processCube;
  //         this.mouseUp = this.updatevoxelModel;
  //       }.bind(this);
  //     } else {
  //       this.mouseUp = this.updatevoxelModel;
  //     }
  //   } else {
  //     this.mouseMoveUp = this.processSingle;
  //     this.mouseMoveDown = null;
  //     this.mouseUp = this.updatevoxelModel;
  //   }

  //   this.processSingle();
  // }

  VoxelTool.prototype.processSingle = function() {
    // const intersectionVoxels = _.values(this.voxelModel.intersectionVoxels);
    // const intersection = this.raycaster.intersectObjects(intersectionVoxels)[0];

    const plane = new THREE.Plane(new THREE.Vector3(0.0,1.0,0.0), 0);
    const intersection = this.raycaster.ray.intersectPlane(plane);

    if (intersection == null) {
      return;
    }

    //the whole scenes is scaled since the cells are not uniform.
    intersection.x /= 2.0;

    this.startPosition = intersection.floor();
    this.startPosition.add(new THREE.Vector3(.5, 0, .5));
    
    this.extrusionNormal = new THREE.Vector3(0.0,1.0,0.0);

    this.extrusionComponent = this.extrusionNormal.largestComponent();

    this.endPosition = this.startPosition;
    this.updateSelection();

    if(this.enableRect)
    {
      
    }
  }

  VoxelTool.prototype.processRect = function() {
    if (!this.startPosition) {
      return;
    }

    // const planeOffset = -this.startPosition.getComponent(this.extrusionComponent) * this.extrusionNormal.getComponent(this.extrusionComponent);
    const plane = new THREE.Plane(this.extrusionNormal, 0);
    const intersection = this.raycaster.ray.intersectPlane(plane);

    if(intersection == null)
      return;

    //the whole scenes is scaled since the cells are not uniform.
    intersection.x /= 2.0;
    
    // if (this.rotatedMode) {
    //   this.endPosition = intersection.clone().sub(this.startPosition).divideScalar(2.0).ceil().multiplyScalar(2.0);
    //   const rectDirection = this.endPosition.largestComponent();
    //   this.endPosition.setComponent((rectDirection + 1) % 3, 0.0);
    //   this.endPosition.setComponent((rectDirection + 2) % 3, 0.0);
    //   this.endPosition.add(this.startPosition);
    // } else 
    {
      this.endPosition = intersection.floor(); //intersection.clone().sub(this.startPosition).round().add(this.startPosition);
      this.endPosition.add(new THREE.Vector3(.5, 0, .5));
    }
    this.updateSelection();
  }

  VoxelTool.prototype.processCube = function() {
    const normal = this.extrusionNormal.clone().cross(this.raycaster.ray.direction);
    const intersectionNormal = normal.cross(this.raycaster.ray.direction);
    const intersection = this.raycaster.ray.origin.clone().sub(this.savedEndPosition).dot(intersectionNormal) / this.extrusionNormal.clone().dot(intersectionNormal);

    const extrusionLength = 0;//this.extrusionLengthFromIntersection(intersection) * this.extrusionNormal.getComponent(this.extrusionComponent);
    // this.endPosition.setComponent(this.extrusionComponent, this.savedEndPosition.getComponent(this.extrusionComponent) + extrusionLength);
    this.updateSelection();
  }

  VoxelTool.prototype.updateSelection = function() {
    if (!this.startPosition || !this.endPosition) {
      this.cursor.visible = false;
      this.infoBox.hide();
      return;
    }

    this.startPosition.clamp(this.minPosition, this.maxPosition);
    this.endPosition.clamp(this.minPosition, this.maxPosition);

    const start = this.startPosition.clone().min(this.endPosition);
    const end = this.startPosition.clone().max(this.endPosition);
    // end.setY(0);

    this.cursor.visible = true;

    // if (this.cuboidMode) {
    //   this.infoBox.show();
    // } else {
    //   this.infoBox.hide();
    // }
  
    this.cursor.scale.set(end.x - start.x + 1, 1, end.z - start.z + 1);
    this.cursor.position.set(end.x - 0.5 * (this.cursor.scale.x - 1), 0, end.z - 0.5 * (this.cursor.scale.z - 1));
    
    // this.infoBox.html('size ' + this.cursor.scale.toArray().join(' x '));

    this.updateCursor();
  }

  VoxelTool.prototype.updateCursor = function() {


  };


  VoxelTool.prototype.updatevoxelModel = function() {
    if (!this.startPosition || !this.endPosition && this.hasMoved) {
      this.processSingle();
      return;
    }

    const start = this.startPosition.clone().min(this.endPosition);
    const end = this.startPosition.clone().max(this.endPosition);

    start.floor();
    end.floor();

    var runner = 0;
    for (var x = start.x; x <= end.x; x++)
    {
        for (var z = start.z; z <= end.z; z++) 
        {
          const voxel = this.updateSingleVoxel(new THREE.Vector3(x, 0, z), new THREE.Vector2(x, z));
          
          if(voxel != null)
            voxel.drawVoxel(this.renderer.voxelContainer);
        }
    }

    this.voxelModel.update();
    this.setRectMode(true);
    this.processSingle();
    // this.voxelModel.highlightHinges();

    // this.voxelModel.detectBadVoxels();
    // this.voxelModel.highlightBadVoxels();
    // addBorderingIfNeeded( this );
  }

  VoxelTool.prototype.updateSingleVoxel = function(position, offset) {
    var positions = [ position.clone() ];
    var invalidPosition = false;


    // this.mirror.forEach(function(mirror, axis) {
    //   if (!mirror) {
    //     return [];
    //   }

    //   positions = positions.concat(positions.map(function(position) {
    //     const mirroredPosition = position.clone();
    //     invalidPosition = invalidPosition || mirroredPosition.getComponent(axis) < 0;
    //     mirroredPosition.setComponent(axis, -mirroredPosition.getComponent(axis));
    //     return mirroredPosition;
    //   }));
    // });

    if (invalidPosition) {
      return [];
    }

    // const cellCoords = [offset.y % this.activeBrush.height, offset.x % this.activeBrush.width];
    const cellCoords = [offset.y, offset.x];
    // const features = this.activeBrush.cells[cellCoords].mirroredFeatures;

    return this.updateVoxel(position, cellCoords, this.cellType);

    // return _.flatten(positions.map(function(mirroredPosition) {
    //   const mirrorFactor = mirroredPosition.getComponent(this.extrusionComponent) / position.getComponent(this.extrusionComponent);
    //   var mirror = this.mirror.slice();
    //   if (this.mirror[this.extrusionComponent]) {
    //     mirror = [true, true, true];
    //     mirror[this.extrusionComponent] = false;
    //   }
    //   mirror = mirror.map(function(cur, idx) {
    //     return cur && mirroredPosition.getComponent(idx) != position.getComponent(idx);
    //   });

    //   return this.updateVoxel(mirroredPosition, features[mirror], mirrorFactor);
    // }.bind(this)));
  };

  VoxelTool.prototype.__defineGetter__('activeBrush', function() {
    return this._activeBrush;
  });

  VoxelTool.prototype.__defineSetter__('activeBrush', function(activeBrush) {
    this._activeBrush = activeBrush;
    // this.cursor.material.uniforms.image.value = new THREE.Texture(activeBrush.textureIcon);
    // this.cursor.material.uniforms.image.value.needsUpdate = true;
  });

  VoxelTool.prototype.alterMouseEvents = function(){
    const oldouseMoveDown = this.mouseMoveDown;
    const oldouseDown = this.mouseDown;
    const oldouseUp = this.mouseUp;

    this.mouseMoveDown = this.alternativeMouseMoveDown;
    this.mouseDown = this.alternativeMouseDown;
    this.mouseUp = this.alternativeMouseUp;

    this.alternativeMouseMoveDown = oldouseMoveDown;
    this.alternativeMouseDown = oldouseDown;
    this.alternativeMouseUp = oldouseUp;
  }

  return VoxelTool;

})();
