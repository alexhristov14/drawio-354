//Structure inspired from unconnectedArrows.js
function overlappingShapesHelper(ui) {
  this.graph = ui.editor.graph
  this.model = this.graph.model
  this.cells = this.model.cells
}

//Axis-aligned bounding box overlap test. Returns true for partial overlap
//as well as full containment (one shape inside another).
overlappingShapesHelper.prototype._boundsOverlap = function (a, b) {
  return !(a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y)
}

overlappingShapesHelper.prototype.detectOverlappingShapes = function () {
  //Only real shapes: vertices that are not edges. Skip the invisible root/layer
  //cells by requiring geometry via getCellBounds below.
  var vertices = Object.values(this.cells).filter(function (value) {
    return value.vertex && !value.edge
  })

  //Track which cells are currently overlapping so we can clear the ones
  //that no longer are (mirrors how unconnectedArrows restores oldColor).
  var overlapping = {}

  for (var i = 0; i < vertices.length; i++) {
    for (var j = i + 1; j < vertices.length; j++) {
      var a = this.graph.getCellBounds(vertices[i])
      var b = this.graph.getCellBounds(vertices[j])

      if (a && b && this._boundsOverlap(a, b)) {
        overlapping[vertices[i].mxObjectId] = true
        overlapping[vertices[j].mxObjectId] = true

        //Property used to display text in the log or on hover
        vertices[i].message = "Shape " + vertices[i].mxObjectId + " overlaps " + vertices[j].mxObjectId
        vertices[j].message = "Shape " + vertices[j].mxObjectId + " overlaps " + vertices[i].mxObjectId

        //Style modification: remember the previous colour once, then turn red
        this._markRed(vertices[i])
        this._markRed(vertices[j])
      }
    }
  }

  //Restore any shape that was flagged before but no longer overlaps
  vertices.forEach(function (value) {
    if (!overlapping[value.mxObjectId] && value.oldStroke) {
      this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, value.oldStroke, [value])
      delete value.oldStroke
      delete value.message
    }
  }, this)

  //Update the graph.
  this.graph.refresh()
}

overlappingShapesHelper.prototype._markRed = function (value) {
  if (!value.oldStroke) {
    //New property to hold the previous non-erroring color
    value.oldStroke = mxUtils.getValue(this.graph.getCellStyle(value), mxConstants.STYLE_STROKECOLOR, "defaultColor")
  }
  this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, "light-dark(#FF0000,#FF0000)", [value])
}

overlappingShapesHelper.prototype.clearAllMarks = function () {
  var vertices = Object.values(this.cells).filter(function (value) {
    return value.vertex && !value.edge
  });
  var overlapping = {}

  vertices.forEach(function (value) {
    if (!overlapping[value.mxObjectId] && value.oldStroke) {
      this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, value.oldStroke, [value])
      delete value.oldStroke
      delete value.message
    }
  }, this)

  //Update the graph.
  this.graph.refresh()

}
