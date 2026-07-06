// Part 6: Error/Warning state management
// Structure inspired from unconnectedArrows.js and overlappingShapes.js
//
// This file doesn't decide *when* checks run — it only:
//   1. Runs the existing detectors (they mutate cell.message + stroke color)
//   2. Scans the model for every cell that ended up with a .message
//   3. Renders that list as a log
//   4. Highlights the matching shape when its log entry is hovered

// Reusable highlight so we don't create a new overlay per hover
var linterHoverHighlight = null;

function getLinterHoverHighlight(ui) {
  if (linterHoverHighlight == null) {
    // Orange, 4px — reads differently from the red "error" stroke
    // the detectors already applied, so hover is visibly distinct
    linterHoverHighlight = new mxCellHighlight(ui.editor.graph, '#FFA500', 4);
  }
  return linterHoverHighlight;
}

// Runs every detector, then returns the list of currently-flagged cells
function collectLinterMessages(ui) {
  var graph = ui.editor.graph;

  var overlapping = new overlappingShapesHelper(ui);
  overlapping.detectOverlappingShapes();
  detectUnconnectedArrows(ui);

  var messages = [];
  Object.values(graph.model.cells).forEach(function (cell) {
    if (cell.message) {
      messages.push(cell);
    }
  });

  return messages;
}

// Rebuilds the log's DOM from current state. Safe to call repeatedly —
// wired to the Run button below.
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

  messages.forEach(function (cell) {
    var row = document.createElement('div');
    row.style.padding = '6px 8px';
    row.style.borderBottom = '1px solid light-dark(#ddd,#505759)';
    row.style.cursor = 'pointer';
    row.style.fontSize = '12px';
    mxUtils.write(row, cell.message);

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