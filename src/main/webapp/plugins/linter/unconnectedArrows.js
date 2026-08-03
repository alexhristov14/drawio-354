//Structure inspired from the webcola plugin
function detectUnconnectedArrows(ui) {
	//We need it
	this.graph = ui.editor.graph;
	//We need it
	this.cells = this.graph.model.cells;

	Object.values(this.cells).forEach((value) => {
		//If it is an arrow/connection
		if (value.edge) {
			//If there are lacking connections
			if (value.source === null || value.target === null) {
				//Property that will be used to display text in the log or on hover
				value.message = 'Arrow ' + value.mxObjectId + ' lacks at least a connection';
				// console.log(value.message)

				//Style modification
				if (!value.oldColor) {
					//New property to hold the previous non-erroring color
					value.oldColor = mxUtils.getValue(
						this.graph.getCellStyle(value),
						mxConstants.STYLE_STROKECOLOR,
						'defaultColor'
					);
				}
				this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'light-dark(#FF0000,#FF0000)', [
					value
				]);

				//If both connections already exist
			} else {
				//Remove oldColor
				if (value.oldColor) {
					this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, value.oldColor, [value]);
					//Remove the unneeded property
					delete value.oldColor;
				}
				//Remove message
				if (value.message) {
					delete value.message;
				}
			}
		}
	});
	//Used to update the graph. Perhaps better methods exist, but this one works
	this.graph.refresh();
}

function revertUnconnectedArrows(ui) {
	this.graph = ui.editor.graph;
	this.cells = this.graph.model.cells;

	Object.values(this.cells).forEach((value) => {
		// touch arrows/edges here, tooManyArrows.js marks shapes using
		//these same oldColor/message properties, so without this check we'd
		//also erase its marks whenever this rule gets reverted
		if (!value.edge) {
			return;
		}
		//Remove oldColor
		if (value.oldColor) {
			this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, value.oldColor, [value]);
			//Remove the unneeded property
			delete value.oldColor;
		}
		//Remove message
		if (value.message) {
			delete value.message;
		}
	});
}
/* exported detectUnconnectedArrows, revertUnconnectedArrows */
