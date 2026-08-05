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
				setLinterMessage(
					value,
					'unconnectedEdges',
					'Arrow ' + value.mxObjectId + ' lacks at least a connection'
				);
				// console.log(value.message)

				//If both connections already exist
			} else {
				clearLinterMessage(value, 'unconnectedEdges');
			}
		}
	});
}

function revertUnconnectedArrows(ui) {
	this.graph = ui.editor.graph;
	this.cells = this.graph.model.cells;

	Object.values(this.cells).forEach((value) => {
		if (value.edge) {
			clearLinterMessage(value, 'unconnectedEdges');
		}
	});
}
/* exported detectUnconnectedArrows, revertUnconnectedArrows */
