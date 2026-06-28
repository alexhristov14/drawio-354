/**
 * Linter plugin
 */
Draw.loadPlugin(function (ui) {
	mxResources.parse('linter=Linter');

	// var CustomDialog = function(editorUi, content, okFn, cancelFn, okButtonText, helpLink,
	// buttonsContent, hideCancel, cancelButtonText, hideAfterOKFn, customButtons,
	// marginTop)
	// EditorUi.prototype.showDialog = function(elt, w, h, modal, closable, onClose, noScroll, transparent, minSize, ignoreBgClick, persistenceKey)
	ui.actions.addAction('linter', () => initLinterWindow(ui));

	const menu = ui.menus.get('extras');
	const oldFunct = menu.funct;
	menu.funct = function (menu, parent) {
		oldFunct.apply(this, arguments);

		ui.menus.addMenuItems(menu, ['-', 'linter'], parent);
	};
});

const saveLinterSettings = function (settings) {
	// TODO
	EditorUi.debug('Saving linter settings: ' + JSON.stringify(settings));
}

const cancelLinterSettings = function () {
	// TODO
	EditorUi.debug('Cancelling linter settings');
}


var LinterWindow = function (editorUi, x, y, w, h) {
	/**
	 * Create setting row with label, warning and error radio buttons, and optional input field
	 */
	function createSettingRow(labelResource, name, inputType, inputValue) {
		const row = document.createElement('tr');

		// Setting name
		let td = document.createElement('td');
		td.style.verticalAlign = 'middle';
		td.style.padding = '4px 8px';
		td.style.whiteSpace = 'nowrap';
		mxUtils.write(td, mxResources.get(labelResource));
		row.appendChild(td);

		// Warning
		td = document.createElement('td');
		td.style.textAlign = 'center';

		const warning = document.createElement('input');
		warning.type = 'radio';
		warning.name = name;
		warning.value = 'warning';

		td.appendChild(warning);
		row.appendChild(td);

		// Error
		td = document.createElement('td');
		td.style.textAlign = 'center';

		const error = document.createElement('input');
		error.type = 'radio';
		error.name = name;
		error.value = 'error';

		td.appendChild(error);
		row.appendChild(td);


		td = document.createElement('td');
		td.style.textAlign = 'center';

		if (inputType != null) {
			const input = document.createElement('input');
			input.type = inputType;
			input.value = inputValue || '';
			input.style.width = '60px';

			td.appendChild(input);
		}

		row.appendChild(td);

		return row;
	}

	const div = document.createElement('div');
	div.style.userSelect = 'none';
	div.style.overflow = 'hidden';
	div.style.padding = '10px';
	div.style.height = '100%';

	const content = document.createElement('div');
	content.style.position = 'absolute';
	content.style.left = '0px';
	content.style.right = '0px';
	content.style.top = '0px';
	content.style.bottom = '32px';
	content.style.overflow = 'auto';
	content.style.padding = '10px';
	content.style.boxSizing = 'border-box';

	div.appendChild(content);

	const table = document.createElement('table');
	table.style.width = '100%';
	table.style.tableLayout = 'fixed';
	table.setAttribute('cellpadding', '2');

	const tbody = document.createElement('tbody');
	table.appendChild(tbody);

	// Header
	const header = document.createElement('tr');

	['Setting', 'Warning', 'Error', 'Value'].forEach(function (text) {
		const th = document.createElement('th');
		th.style.textAlign = 'left';
		th.style.padding = '4px 8px';
		mxUtils.write(th, mxResources.get(text.toLowerCase()) || text);
		header.appendChild(th);
	});

	tbody.appendChild(header);

	tbody.appendChild(createSettingRow(
		'overlappingShapes',
		'geLinterOverlappingShapes'
	));

	tbody.appendChild(createSettingRow(
		'unconnectedEdges',
		'geLinterUnconnectedEdges'
	));

	tbody.appendChild(createSettingRow(
		'maxLength',
		'geLinterMaxLength',
		'number',
		100
	));

	content.appendChild(table);

	const footer = document.createElement('div');
	footer.className = 'geToolbarContainer geDialogToolbar';
	footer.style.position = 'absolute';
	footer.style.left = '0px';
	footer.style.right = '0px';
	footer.style.bottom = '0px';
	footer.style.height = '32px';
	footer.style.padding = '3px 4px 4px 4px';
	footer.style.borderWidth = '1px 0 0 0';
	footer.style.borderStyle = 'solid';
	footer.style.display = 'flex';
	footer.style.alignItems = 'center';

	div.appendChild(footer);
	const minimizable = true;
	const movable = true;

	this.window = new mxWindow(mxResources.get('linter'), div, x, y, w, h, minimizable, movable);
	this.window.destroyOnClose = false;
	this.window.setMaximizable(false);
	this.window.setResizable(true);
	this.window.setClosable(true);
	this.window.setVisible(true);
};

var initLinterWindow = function (ui) {
	if (ui.linterWindow == null) {
		var saved = (ui.installWindowPersistence != null) ?
			mxSettings.getWindowState('linter') : null;
		var ox = (saved != null && saved.x != null) ? saved.x :
			document.body.offsetWidth - 300;
		var oy = (saved != null && saved.y != null) ? saved.y : 100;
		var ow = (saved != null && saved.w != null) ? saved.w : 400;
		var oh = (saved != null && saved.h != null) ? saved.h : 180;
		ui.linterWindow = new LinterWindow(ui, ox, oy, ow, oh, null);

		if (ui.installWindowPersistence != null) {
			ui.installWindowPersistence('linter', ui.linterWindow);
			if (saved != null) {
				ui.restoreWindowState('linter', ui.linterWindow);
			}
		}
	} else {
		ui.linterWindow.window.setVisible(!ui.linterWindow.window.isVisible());
	}
}
