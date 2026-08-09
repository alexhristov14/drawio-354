//Structure inspired from unconnectedArrows.js
function overlappingShapesHelper(ui) {
	this.graph = ui.editor.graph;
	this.model = this.graph.model;
	this.cells = this.model.cells;
}

//Axis-aligned bounding box overlap test. Returns true for partial overlap
//as well as full containment (one shape inside another).
overlappingShapesHelper.prototype._boundsOverlap = function (a, b) {
	return !(
		a.x + a.width <= b.x ||
		b.x + b.width <= a.x ||
		a.y + a.height <= b.y ||
		b.y + b.height <= a.y
	);
};

overlappingShapesHelper.prototype.detectOverlappingShapes = function () {
	//Only real shapes: vertices that are not edges. Skip the invisible root/layer
	//cells by requiring geometry via getCellBounds below.
	var vertices = Object.values(this.cells).filter(function (value) {
		return value.vertex && !value.edge;
	});

	//Track which cells are currently overlapping so we can clear the ones
	//that no longer are (mirrors how unconnectedArrows restores oldColor).
	var overlapping = {};

	for (var i = 0; i < vertices.length; i++) {
		for (var j = i + 1; j < vertices.length; j++) {
			var a = this.graph.getCellBounds(vertices[i]);
			var b = this.graph.getCellBounds(vertices[j]);

			if (a && b && this._boundsOverlap(a, b)) {
				overlapping[vertices[i].mxObjectId] = true;
				overlapping[vertices[j].mxObjectId] = true;

				//Property used to display text in the log or on hover
				setLinterMessage(
					vertices[i],
					'overlappingShapes',
					'Shape ' + vertices[i].mxObjectId + ' overlaps ' + vertices[j].mxObjectId
				);
				setLinterMessage(
					vertices[j],
					'overlappingShapes',
					'Shape ' + vertices[j].mxObjectId + ' overlaps ' + vertices[i].mxObjectId
				);
			}
		}
	}

	//Restore any shape that was flagged before but no longer overlaps
	vertices.forEach(function (value) {
		if (!overlapping[value.mxObjectId]) {
			clearLinterMessage(value, 'overlappingShapes');
		}
	}, this);
};

overlappingShapesHelper.prototype.clearAllMarks = function () {
	var vertices = Object.values(this.cells).filter(function (value) {
		return value.vertex && !value.edge;
	});

	vertices.forEach(function (value) {
		clearLinterMessage(value, 'overlappingShapes');
	}, this);
};
