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
	var vertices = Object.values(this.cells).filter(function (value) {
		return value.vertex && !value.edge;
	});

	// Store every overlap for each shape.
	var overlapMap = {};

	vertices.forEach(function (value) {
		overlapMap[value.mxObjectId] = [];
	});

	for (var i = 0; i < vertices.length; i++) {
		for (var j = i + 1; j < vertices.length; j++) {
			var first = vertices[i];
			var second = vertices[j];

			var firstBounds = this.graph.getCellBounds(first);
			var secondBounds = this.graph.getCellBounds(second);

			if (
				firstBounds &&
				secondBounds &&
				this._boundsOverlap(firstBounds, secondBounds)
			) {
				overlapMap[first.mxObjectId].push(second.mxObjectId);
				overlapMap[second.mxObjectId].push(first.mxObjectId);
			}
		}
	}

	vertices.forEach(function (value) {
		var overlappingIds = overlapMap[value.mxObjectId];

		if (overlappingIds.length > 0) {
			setLinterMessage(
				value,
				'overlappingShapes',
				'Shape ' +
					value.mxObjectId +
					' overlaps shape(s): ' +
					overlappingIds.join(', ')
			);
		} else {
			clearLinterMessage(value, 'overlappingShapes');
		}
	});
};

overlappingShapesHelper.prototype.clearAllMarks = function () {
	var vertices = Object.values(this.cells).filter(function (value) {
		return value.vertex && !value.edge;
	});

	vertices.forEach(function (value) {
		clearLinterMessage(value, 'overlappingShapes');
	}, this);
};
