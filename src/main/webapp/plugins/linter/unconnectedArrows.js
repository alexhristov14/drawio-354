//Structure inspired from the webcola plugin
function detectUnconnectedArrows(ui) {
	//Use local vars instead of "this", these run as plain function calls
	//(not "new" ), so "this" would otherwise be a global window object
	var graph = ui.editor.graph;
	var cells = graph.model.cells;

	Object.values(cells).forEach((value) => {
		//If it is an arrow/connection
		if (value.edge) {
			//If there are lacking connections
			if (value.source === null || value.target === null) {
				//Property that will be used to display text in the log or on hover
				var missingEnd =
					value.source === null && value.target === null
						? 'a source and a target'
						: value.source === null
							? 'a source'
							: 'a target';
				setLinterMessage(
					value,
					'unconnectedEdges',
					'Arrow ' + value.mxObjectId + ' is missing ' + missingEnd
				);
				// console.log(value.message)
				//Style modification
				if (value.oldColor === undefined) {
					//New property to hold the previous non-erroring color
					//fall back to null (not a fake color string) when theres no
					//explicit stroke override, so restoring it later removes the
					//style key instead of writing an invalid color value
					value.oldColor = mxUtils.getValue(
						graph.getCellStyle(value),
						mxConstants.STYLE_STROKECOLOR,
						null
					);
				}
				graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'light-dark(#FF0000,#FF0000)', [value]);

				//If both connections already exist
			} else {
				clearLinterMessage(value, 'unconnectedEdges');
				//Remove oldColor
				if (value.oldColor !== undefined) {
					graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, value.oldColor, [value]);
					//Remove the unneeded property
					delete value.oldColor;
				}
			}
		}
	});
	//Used to update the graph. Perhaps better methods exist, but this one works
	graph.refresh();
}

function revertUnconnectedArrows(ui) {
	var graph = ui.editor.graph;
	var cells = graph.model.cells;

	Object.values(cells).forEach((value) => {
		// touch arrows/edges here, tooManyArrows.js marks shapes using
		//these same oldColor/message properties, so without this check we'd
		//also erase its marks whenever this rule gets reverted
		if (!value.edge) {
			return;
		}
		//Remove oldColor
		if (value.oldColor !== undefined) {
			graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, value.oldColor, [value]);
			//Remove the unneeded property
			delete value.oldColor;
		}
		//Remove message
		clearLinterMessage(value, 'unconnectedEdges');
	});
	//detectUnconnectedArrows refreshes after making its changes, so revert
	// should too , otherwise the restored colors can be left stale on screen
	graph.refresh();
}
/* exported detectUnconnectedArrows, revertUnconnectedArrows */
