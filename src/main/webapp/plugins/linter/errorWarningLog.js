// Part 6: Error/Warning state management
// Structure inspired from unconnectedArrows.js and overlappingShapes.js

var linterHoverHighlight = null;

function setLinterMessage(cell, rule, message) {
	if (cell.linterMessages == null) {
		cell.linterMessages = {};
	}

	cell.linterMessages[rule] = message;
}

function clearLinterMessage(cell, rule) {
	if (cell.linterMessages != null) {
		delete cell.linterMessages[rule];

		if (Object.keys(cell.linterMessages).length === 0) {
			delete cell.linterMessages;
		}
	}
}

function updateLinterCellStyle(graph, cell) {
	if (cell.linterMessages != null) {
		if (cell.linterOriginalStroke == null) {
			cell.linterOriginalStroke = mxUtils.getValue(
				graph.getCellStyle(cell),
				mxConstants.STYLE_STROKECOLOR,
				'defaultColor'
			);
		}

		graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'light-dark(#FF0000,#FF0000)', [cell]);
	} else if (cell.linterOriginalStroke != null) {
		graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, cell.linterOriginalStroke, [cell]);
		delete cell.linterOriginalStroke;
	}
}

function getLinterHoverHighlight(ui) {
	if (linterHoverHighlight == null) {
		// the detectors applied, so hover is visibly distinct, orange border
		linterHoverHighlight = new mxCellHighlight(ui.editor.graph, '#FFA500', 4);
	}
	return linterHoverHighlight;
}

// Runs every detector, then returns the list of currently-flagged cells
function collectLinterMessages(ui) {
	var graph = ui.editor.graph;
	var userRules = {};

	if (window.LinterUserRules != null && typeof window.LinterUserRules.load === 'function') {
		userRules = window.LinterUserRules.load();
	}

	var overlapping = new overlappingShapesHelper(ui);

	if (
		userRules != null &&
		userRules.overlappingShapes != null &&
		userRules.overlappingShapes.enabled !== false
	) {
		overlapping.detectOverlappingShapes();
	} else {
		overlapping.clearAllMarks();
	}

	if (
		userRules != null &&
		userRules.unconnectedEdges != null &&
		userRules.unconnectedEdges.enabled !== false
	) {
		detectUnconnectedArrows(ui);
	} else {
		revertUnconnectedArrows(ui);
	}

	if (
		userRules != null &&
		userRules.tooManyArrows != null &&
		userRules.tooManyArrows.enabled !== false
	) {
		detectTooManyArrows(ui);
	} else {
		revertTooManyArrows(ui);
	}

	var messages = [];
	Object.values(graph.model.cells).forEach(function (cell) {
		updateLinterCellStyle(graph, cell);

		if (cell.linterMessages != null) {
			Object.values(cell.linterMessages).forEach(function (message) {
				messages.push({ cell: cell, message: message });
			});
		}
	});
	graph.refresh();

	return messages;
}

// Rebuilds the log's DOM from current state and wires it to the Run button below.
function refreshLinterLog(ui, logContainer) {
	var graph = ui.editor.graph;
	var messages = collectLinterMessages(ui);
	var highlight = getLinterHoverHighlight(ui);

	logContainer.innerHTML = '';

	if (messages.length === 0) {
		var empty = document.createElement('div');
		empty.style.padding = '8px';
		empty.style.color = 'light-dark(#777,#aaa)';
		mxUtils.write(empty, 'No issues found');
		logContainer.appendChild(empty);
		return;
	}

	messages.forEach(function (finding) {
		var cell = finding.cell;
		var row = document.createElement('div');
		row.style.padding = '6px 8px';
		row.style.borderBottom = '1px solid light-dark(#ddd,#505759)';
		row.style.cursor = 'pointer';
		row.style.fontSize = '12px';
		mxUtils.write(row, finding.message);

		mxEvent.addListener(row, 'mouseenter', function () {
			row.style.backgroundColor = 'light-dark(#f0f0f0,#3a3a3a)';
			var state = graph.view.getState(cell);
			if (state != null) highlight.highlight(state);
		});

		mxEvent.addListener(row, 'mouseleave', function () {
			row.style.backgroundColor = '';
			highlight.highlight(null);
		});

		mxEvent.addListener(row, 'click', function () {
			graph.setSelectionCell(cell);
			graph.scrollCellToVisible(cell);
		});

		logContainer.appendChild(row);
	});
}
/* exported clearLinterMessage, refreshLinterLog, setLinterMessage */
