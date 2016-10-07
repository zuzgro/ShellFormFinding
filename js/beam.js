/**
 * Created by ghassaei on 9/16/16.
 */

var beamMaterial = new THREE.LineBasicMaterial({color: 0x999999, linewidth: 3});
var beamMaterialHighlight = new THREE.LineBasicMaterial({color: 0x4444ff, linewidth: 3});

function Beam(nodes){

    nodes[0].addBeam(this);
    nodes[1].addBeam(this);
    this.vertices = [nodes[0].getPosition(), nodes[1].getPosition()];

    var lineGeometry = new THREE.Geometry();
    lineGeometry.dynamic = true;
    lineGeometry.vertices = this.vertices;

    this.object3D = new THREE.Line(lineGeometry, beamMaterial);
    this.object3D._myBeam = this;

    this.reset();
}

Beam.prototype.highlight = function(){
};

Beam.prototype.unhighlight = function(){
};


Beam.prototype.setColor = function(val, max, min){
    var scaledVal = (1-(val - min)/(max - min)) * 0.7;
    var color = new THREE.Color();
    color.setHSL(scaledVal, 1, 0.5);
    this.object3D.material.color.set(color);
};

Beam.prototype.reset = function(){
    this.inCompression = false;
    this.force = null;
};

Beam.prototype.getLength = function(){
    return this.vertices[0].clone().sub(this.vertices[1]).length();
};

Beam.prototype.getObject3D = function(){
    return this.object3D;
};

Beam.prototype.updatePosition = function(){
    this.object3D.geometry.verticesNeedUpdate = true;
    this.object3D.geometry.computeBoundingSphere();
};

Beam.prototype.destroy = function(){
    this.vertices = null;
    this.object3D._myBeam = null;
    this.object3D = null;
};