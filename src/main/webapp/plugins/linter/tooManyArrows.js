//Structure inspired from unconnectedArrows.js
function detectTooManyArrows(ui) {
	//We need it
	this.graph = ui.editor.graph;
	//We need it
	this.cells = this.graph.model.cells;
	//Pull the user-configurable limit from the Linter settings window
	//(falls back to 4 if it hasn't been set yet, or isn't a valid number)
	var settings = getLinterSettings();
	// Number(0) is falsey. So to prevent it from being overriden by the default value:
	var configuredLimitValue = settings.tooManyArrows ? Number(settings.tooManyArrows.value) : NaN;
	var maxArrows = Number.isNaN(configuredLimitValue) ? 4 : configuredLimitValue;

	Object.values(this.cells).forEach((value) => {
		//If it is a shape (not an arrow itself)
		if (value.vertex && !value.edge) {
			//How many arrows touch this shape
			const edgeCount = this.graph.model.getEdgeCount(value);

			//If it exceeds the limit
			if (edgeCount > maxArrows) {
				setLinterMessage(
					value,
					'tooManyArrows',
					'Shape ' +
						value.mxObjectId +
						' has ' +
						edgeCount +
						' connected arrows (limit is ' +
						maxArrows +
						')'
				);
			} else {
				clearLinterMessage(value, 'tooManyArrows');
			}
		}
	});
}
// collectLinterMessages() only calls detectTooManyArrows() while the rule is enabled
// when the user disables it, nothing was ever un-flagging shapes that were already flagged.
function revertTooManyArrows(ui) {
	var graph = ui.editor.graph;
	var cells = graph.model.cells;

	Object.values(cells).forEach((value) => {
		if (value.vertex && !value.edge) {
			clearLinterMessage(value, 'tooManyArrows');
		}
	});
	graph.refresh();
}

/* exported detectTooManyArrows, revertTooManyArrows */
