/**
 * Created by ghassaei on 9/16/16.
 */

var beamMaterialHighlight = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 4});

function Beam(nodes, material){

    this.type = "beam";//changes to dynamicBeam for dynamic sim

    nodes[0].addBeam(this);
    nodes[1].addBeam(this);
    this.vertices = [nodes[0].getPosition(), nodes[1].getPosition()];
    this.nodes = nodes;

    var lineGeometry = new THREE.Geometry();
    lineGeometry.dynamic = true;
    lineGeometry.vertices = this.vertices;

    this.material = new THREE.LineBasicMaterial({linewidth: 3});
    this.object3D = new THREE.Line(lineGeometry, this.material);
    this.object3D._myBeam = this;

    if (material === undefined) material = globals.materials.material1;
    this.setMaterial(material);

    this.force = null;
}

Beam.prototype.highlight = function(){
    if (this.type == "schematic") {
        //var hsl = this.material.color.getHSL();
        //hsl.l += 0.2;
        //if (hsl.l>1) hsl.l = 1;
        //beamMaterialHighlight.color.setHSL(hsl.h, hsl.s, hsl.l);
        this.object3D.material = beamMaterialHighlight;
    }
};

Beam.prototype.unhighlight = function(){
    if (this.material) this.object3D.material = this.material;
};

Beam.prototype.setColor = function(hex){
    this.object3D.material.color.setHex(hex);
};

Beam.prototype.setMaterialColor = function(){
    this.material.color.setStyle(this.beamMaterial.color);
};

Beam.prototype.setHSLColor = function(val, max, min){
    if (val === null){
        this.object3D.material.color.setHex(0x000000);
        return;
    }
    var scaledVal = (val - min)/(max - min) * 0.7;
    var color = new THREE.Color();
    color.setHSL(scaledVal, 1, 0.5);
    this.object3D.material.color.set(color);
};

Beam.prototype.setThreeMaterial = function(material){
    this.material = material;
    this.object3D.material = this.material;
    this.object3D.geometry.verticesNeedUpdate = true;
    this.object3D.geometry.computeBoundingSphere();
    this.object3D.geometry.computeLineDistances();
};

Beam.prototype.setMaterial = function(material, noRender){
    if (this.beamMaterial == material) {
        this.unhighlight();
        return false;
    }
    this.beamMaterial = material;
    if (noRender) return;
    this.material.color.setStyle(material.color);
    this.unhighlight();
    return true;
};

Beam.prototype.getMaterial = function(){
    return this.beamMaterial;
};

Beam.prototype.getLength = function(schematicLength){
    var vertex1Pos = this.nodes[0].getPosition().clone();
    if (schematicLength && this.nodes[0].fixed) vertex1Pos.y = 0;
    var vertex2Pos = this.nodes[1].getPosition().clone();
    if (schematicLength && this.nodes[1].fixed) vertex2Pos.y = 0;
    return vertex1Pos.sub(vertex2Pos).length();
};

Beam.prototype.isFixed = function(){
    return this.nodes[0].fixed && this.nodes[1].fixed;
};

Beam.prototype.getForce = function(){
    if (this.isFixed()) return null;
    return this.getLength()*this.beamMaterial.getForceDensity();
};

Beam.prototype.getVector = function(){
    return this.vertices[0].clone().sub(this.vertices[1]);
};



//dynamic solve

Beam.prototype.getK = function(){
    return this.beamMaterial.getForceDensity();
};

Beam.prototype.getD = function(){
    return globals.percentDamping*2*Math.sqrt(this.getK()*this.getMinMass());
};

Beam.prototype.getNaturalFrequency = function(){
    return Math.sqrt(this.getK()/this.getMinMass());
};

Beam.prototype.getMinMass = function(){
    var minMass = this.nodes[0].getSimMass();
    if (this.nodes[1].getSimMass()<minMass) minMass = this.nodes[1].getSimMass();
    return minMass;
};

Beam.prototype.getOtherNode = function(node){
    if (this.nodes[0] == node) return this.nodes[1];
    return this.nodes[0];
};

Beam.prototype.getForceDensity = function(){
    return this.beamMaterial.getForceDensity();
};



//render

Beam.prototype.getObject3D = function(){
    return this.object3D;
};

Beam.prototype.render = function(shouldComputeLineDistance){
    if (this.type == "schematic") {
        this.zero();
    } else {
        this.object3D.geometry.verticesNeedUpdate = true;
        this.object3D.geometry.computeBoundingSphere();
    }
    if (shouldComputeLineDistance) this.object3D.geometry.computeLineDistances();
};

Beam.prototype.zero = function(){
    var vertex1 = this.vertices[0].clone();
    vertex1.y = 0;
    var vertex2 = this.vertices[1].clone();
    vertex2.y = 0;
    this.object3D.geometry.vertices = [vertex1, vertex2];
    this.object3D.geometry.verticesNeedUpdate = true;
    this.object3D.geometry.computeBoundingSphere();
};




//deallocate

Beam.prototype.destroy = function(){
    var self = this;
    _.each(this.nodes, function(node){
        node.removeBeam(self);
    });
    this.vertices = null;
    this.object3D._myBeam = null;
    this.object3D = null;
    this.material = null;
    this.beamMaterial = null;
    this.nodes = null;
};