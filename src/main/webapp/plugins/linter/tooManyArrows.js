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
				value.message =
					'Shape ' +
					value.mxObjectId +
					' has ' +
					edgeCount +
					' connected arrows (limit is ' +
					maxArrows +
					')';

				if (!value.oldColor) {
					value.oldColor = mxUtils.getValue(
						this.graph.getCellStyle(value),
						mxConstants.STYLE_STROKECOLOR,
						'defaultColor'
					);
				}
				this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'light-dark(#FF0000,#FF0000)', [
					value
				]);
			} else {
				if (value.oldColor) {
					this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, value.oldColor, [value]);
					delete value.oldColor;
				}
				if (value.message) {
					delete value.message;
				}
			}
		}
	});
	this.graph.refresh();
}
/* exported detectTooManyArrows */
