'use strict';

const $                  = require('jquery');
const FileSaver          = require('file-saver');

const bind               = require('./misc/bind');

const VoxelAddTool       = require('./tools/voxel_add_tool');
const VoxelDeleteTool    = require('./tools/voxel_delete_tool');
const VoxelEditTool      = require('./tools/voxel_edit_tool');

module.exports = (function() {

  function Controls(renderer, voxelModel) {
    bind(this);

    this.renderer = renderer;
    this.voxelModel = voxelModel;

    this.cellSize = 5.0;
    this.minThickness = 0.4;

    this.pressedKeys = {};

    $('#voxel-import-btn').click(this.import);
    $('#voxel-export-btn').click(this.export);

    this.tools = {
      'add-tool': new VoxelAddTool(this.renderer, this.voxelModel),
      'delete-tool': new VoxelDeleteTool(this.renderer, this.voxelModel),
      'edit-tool': new VoxelEditTool(this.renderer, this.voxelModel),
    };

    $('.voxel-tool-btn').click(this.selectTool);
    $('#voxel-mirror-btn').click(this.toggleMirrorMode);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.activeTool = this.tools['add-tool'];
    this.activeTool.activate();

    this.mirrorMode = false;

    $('#import-cellsize').blur(this.parseGridSettings);
    $('#import-thickness').blur(this.parseGridSettings);

    this.parseGridSettings();
  }

  Controls.prototype.selectTool = function(evt) {
    const toolName = typeof evt == 'string' ? evt : evt.currentTarget.id.slice(6, -4);

    $('.voxel-tool-btn').removeClass('active');
    $('#voxel-' + toolName + '-btn').addClass('active');

    this.activeTool.deactivate();
    this.activeTool = this.tools[toolName];
    this.activeTool.activate();
  }

  Controls.prototype.toggleMirrorMode = function(evt) {
    this.mirrorMode = !this.mirrorMode;

    this.tools['add-tool'].setMirrorMode(this.mirrorMode);
    this.tools['delete-tool'].setMirrorMode(this.mirrorMode);
    this.tools['edit-tool'].setMirrorMode(this.mirrorMode);

    if (this.mirrorMode) {
      $('#voxel-mirror-btn').addClass('active');
    } else {
      $('#voxel-mirror-btn').removeClass('active');
    }
  }

  // Controls.prototype.alterMouseEvents = function() {
  //   this.tools['smoothing-tool'].alterMouseEvents();
  // }

  Controls.prototype.setCuboidMode = function(cuboidMode) {
    this.cuboidMode = cuboidMode;

    this.tools['add-tool'].setCuboidMode(this.cuboidMode);
    this.tools['delete-tool'].setCuboidMode(this.cuboidMode);
    this.tools['edit-tool'].setCuboidMode(this.cuboidMode);

    if (this.cuboidMode) {
      $('#voxel-cuboid-btn').addClass('active');
    } else {
      $('#voxel-cuboid-btn').removeClass('active');
    }
  }

  Controls.prototype.toggleAddDelete = function() {
    switch (this.activeTool) {
      case this.tools['add-tool']:
        this.selectTool('delete-tool');
        break;
      case this.tools['delete-tool']:
        this.selectTool('add-tool');
        break;
    }
  }

  // Controls.prototype.selectStiffness = function(evt) {
  //   const stiffness = parseInt(evt.currentTarget.id.slice(16, -4)) / 100.0;

  //   $('.voxel-stiffness-btn').removeClass('active');
  //   $(evt.currentTarget).addClass('active');

  //   this.tools['add-tool'].stiffness = stiffness;
  //   this.tools['edit-tool'].stiffness = stiffness;
  // }

  // Controls.prototype.import = function() {
  //   $('<input type="file" >').on('change', function(event) {
  //     var file = event.target.files[0];
  //     if (file) {
  //       var reader = new FileReader();
  //       reader.onload = function() {
  //         this.voxelModel.import(reader.result, this.cellSize);
  //       }.bind(this);
  //       reader.readAsArrayBuffer(file);
  //     }
  //   }.bind(this)).click();
  // }

  Controls.prototype.export = function() {
    var stlBinary = this.voxelModel.export().toStlBinary();
    FileSaver.saveAs(stlBinary, 'export.stl');
  }

  Controls.prototype.onKeyDown = function(evt) {
    if (this.pressedKeys[evt.keyCode]) {
      return;
    }

    this.pressedKeys[evt.keyCode] = true;

    switch (evt.keyCode) {
      case 16:
        this.toggleAddDelete();
        break;
      case 17:
        this.setCuboidMode(false);
        this.alterMouseEvents();
        break;
    }
  }

  Controls.prototype.onKeyUp = function(evt) {
    delete this.pressedKeys[evt.keyCode];

    switch (evt.keyCode) {
      case 16:
        this.toggleAddDelete();
        break;
      case 17:
        this.setCuboidMode(true);
        this.alterMouseEvents();
        break;
      case 27:
        this.activeTool.reset();
        break;
    }
  }

  Controls.prototype.parseGridSettings = function() {
    this.voxelModel.cellSize = this.cellSize = parseFloat($('#import-cellsize').val());
    this.voxelModel.minThickness = this.minThickness = parseFloat($('#import-thickness').val());
  };

  return Controls;

})();
