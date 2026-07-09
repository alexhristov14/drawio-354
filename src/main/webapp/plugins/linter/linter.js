/**
 * Linter plugin
 */

mxscript('plugins/linter/userRules.js', null, null, null, true);

Draw.loadPlugin(function (ui) {
	window.debugUi = ui;
	//Load the file responsible for overlapping shape detection logic
	mxscript("plugins/linter/overlappingShapes.js", null, null, null, true)
	//Load the file responsible for unconnected Arrow detection logic
	mxscript("plugins/linter/unconnectedArrows.js", null, null, null, true)
	//Load the file responsible for error/warning log management
	mxscript("plugins/linter/errorWarningLog.js", null, null, null, true)
	mxResources.parse('linter=Linter');

	ui.actions.addAction('linter', function () {
		initLinterWindow(ui);
	});

	const menu = ui.menus.get('extras');
	const oldFunct = menu.funct;

	menu.funct = function (menu, parent) {
		oldFunct.apply(this, arguments);
		ui.menus.addMenuItems(menu, ['-', 'linter'], parent);
	};
});


const fallbackLinterSettings = {
	overlappingShapes: {
		enabled: true,
		level: 'warning'
	},
	unconnectedEdges: {
		enabled: true,
		level: 'warning'
	}
};


const cloneLinterSettings = function (settings) {
	return JSON.parse(JSON.stringify(settings));
};

const getLinterSettings = function () {
	if (window.LinterUserRules != null && typeof window.LinterUserRules.load === 'function') {
		return window.LinterUserRules.load();
	}

	EditorUi.debug('LinterUserRules not loaded. Using fallback linter settings.');

	return cloneLinterSettings(fallbackLinterSettings);
};

const saveLinterSettings = function (settings) {
	if (window.LinterUserRules != null && typeof window.LinterUserRules.save === 'function') {
		const updatedSettings = window.LinterUserRules.save(settings);
		EditorUi.debug('Linter settings saved.');
		return updatedSettings;
	}

	EditorUi.debug('LinterUserRules not loaded. Could not save linter settings.');

	return settings;
};

const resetLinterSettings = function () {
	if (window.LinterUserRules != null && typeof window.LinterUserRules.reset === 'function') {
		const resetSettings = window.LinterUserRules.reset();
		EditorUi.debug('Linter settings reset to defaults.');
		return resetSettings;
	}

	EditorUi.debug('LinterUserRules not loaded. Could not reset linter settings.');

	return cloneLinterSettings(fallbackLinterSettings);
};

const getLabel = function (resourceKey, fallbackText) {
	const value = mxResources.get(resourceKey);

	return value != null ? value : fallbackText;
};

const createFooterButton = function (text) {
	const button = document.createElement('button');

	button.appendChild(document.createTextNode(text));
	button.style.marginRight = '8px';

	return button;
};

const cancelLinterSettings = function () {
	EditorUi.debug('Cancelling linter settings');
};

var LinterWindow = function (editorUi, x, y, w, h) {
	this.settings = cloneLinterSettings(getLinterSettings());
	const self = this;

	function createSettingRow(labelResource, name, setting) {
		const row = document.createElement('tr');
		var input = null;

		let td = document.createElement('td');
		td.style.verticalAlign = 'middle';
		td.style.padding = '4px 8px';
		td.style.whiteSpace = 'nowrap';
		mxUtils.write(td, getLabel(labelResource, labelResource));
		row.appendChild(td);

		// Enabled
		td = document.createElement('td');
		td.style.textAlign = 'center';

		const enabled = document.createElement('input');
		enabled.type = 'checkbox';
		enabled.checked = setting.enabled !== false;

		td.appendChild(enabled);
		row.appendChild(td);

		// Value
		td = document.createElement('td');
		td.style.textAlign = 'center';

		if (setting.inputType != null) {
			input = document.createElement('input');
			input.type = setting.inputType;
			input.value = setting.value || '';
			input.style.width = '60px';

			mxEvent.addListener(input, 'change', function () {
				setting.value = input.value;
			});

			td.appendChild(input);
		}

		row.appendChild(td);

	
		// Hide the level and value inputs if the rule is disabled
		mxEvent.addListener(enabled, 'change', function () {
			setting.enabled = enabled.checked;
		});

		function updateLevel() {
			setting.level = 'warning';
		}

		
		
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
	content.style.bottom = '42px';
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

	['Setting', 'Enabled', 'Value'].forEach(function (text) {
		const th = document.createElement('th');
		th.style.textAlign = 'left';
		th.style.padding = '4px 8px';
		mxUtils.write(th, getLabel(text.toLowerCase(), text));
		header.appendChild(th);
	});

	tbody.appendChild(header);

	Object.keys(self.settings).forEach(function (key) {
		console.log(key);
		const setting = self.settings[key];
		const row = createSettingRow(key, 'ge' + key, setting);
		console.log(row);
		tbody.appendChild(row);
	});

	content.appendChild(table);

	// Error/Warning log
	var logTitle = document.createElement('div');
	logTitle.style.marginTop = '12px';
	logTitle.style.fontWeight = 'bold';
	logTitle.style.fontSize = '12px';
	mxUtils.write(logTitle, 'Errors & Warnings');
	content.appendChild(logTitle);

	var logContainer = document.createElement('div');
	logContainer.style.marginTop = '4px';
	logContainer.style.minHeight = '60px';
	logContainer.style.maxHeight = '150px';
	logContainer.style.overflow = 'auto';
	logContainer.style.border = '1px solid light-dark(#ddd,#505759)';
	logContainer.style.backgroundColor = 'light-dark(#fafafa,#2a2a2a)';
	content.appendChild(logContainer);
	this.logContainer = logContainer;

	const footer = document.createElement('div');
	footer.className = 'geToolbarContainer geDialogToolbar';
	footer.style.position = 'absolute';
	footer.style.left = '0px';
	footer.style.right = '0px';
	footer.style.bottom = '0px';
	footer.style.height = '42px';
	footer.style.padding = '6px 8px';
	footer.style.borderWidth = '1px 0 0 0';
	footer.style.borderStyle = 'solid';
	footer.style.display = 'flex';
	footer.style.alignItems = 'center';
	footer.style.justifyContent = 'flex-end';

	const saveButton = createFooterButton('Save');
	mxEvent.addListener(saveButton, 'click', function (event) {
		saveLinterSettings(self.settings);
		mxEvent.consume(event);
	});
	footer.appendChild(saveButton);

	const resetButton = createFooterButton('Reset');
	mxEvent.addListener(resetButton, 'click', function (event) {
		self.settings = resetLinterSettings();

		if (editorUi.linterWindow != null) {
			editorUi.linterWindow.window.destroy();
			editorUi.linterWindow = null;
		}

		initLinterWindow(editorUi);
		mxEvent.consume(event);
	});
	footer.appendChild(resetButton);

	// to the right of the save button, add a "Run" button that refreshes the log
	var runLink = document.createElement('a');
	runLink.className = 'geButton';
	runLink.style.marginLeft = '8px';
	mxUtils.write(runLink, 'Run');
	footer.appendChild(runLink);

	mxEvent.addListener(runLink, 'click', function (event) {
		refreshLinterLog(editorUi, self.logContainer);
		mxEvent.consume(event);
	});

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
	const settings = getLinterSettings();

	if (settings.unconnectedEdges == null || settings.unconnectedEdges.enabled !== false) {
		if (typeof detectUnconnectedArrows === 'function') {
			detectUnconnectedArrows(ui);
		} else {
			EditorUi.debug('detectUnconnectedArrows is not loaded.');
		}
	} else {
		EditorUi.debug('Skipping unconnected edge detection because the rule is disabled.');
	}

	if (ui.linterWindow == null) {
		const saved = ui.installWindowPersistence != null ?
			mxSettings.getWindowState('linter') : null;
		var ox = (saved != null && saved.x != null) ? saved.x :
			document.body.offsetWidth - 300;
		var oy = (saved != null && saved.y != null) ? saved.y : 100;
		var ow = (saved != null && saved.w != null) ? saved.w : 400;
		var oh = (saved != null && saved.h != null) ? saved.h : 420;
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
	refreshLinterLog(ui, ui.linterWindow.logContainer);
}
