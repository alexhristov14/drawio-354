/**
 * Linter plugin
 */

mxscript('plugins/linter/userRules.js', null, null, null, true);

Draw.loadPlugin(function (ui) {
	mxscript('plugins/linter/unconnectedArrows.js', null, null, null, true);

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
	},
	maxLength: {
		enabled: true,
		level: 'warning',
		inputType: 'number',
		value: 100
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

const exportLinterSettings = function (settings) {
	if (window.LinterUserRules != null && typeof window.LinterUserRules.export === 'function') {
		window.LinterUserRules.export(settings);
		EditorUi.debug('Linter settings exported.');
		return;
	}

	EditorUi.debug('LinterUserRules not loaded. Could not export linter settings.');
};

const importLinterSettingsFromText = function (jsonText) {
	if (window.LinterUserRules != null && typeof window.LinterUserRules.importFromText === 'function') {
		const importedSettings = window.LinterUserRules.importFromText(jsonText);
		EditorUi.debug('Linter settings imported.');
		return importedSettings;
	}

	EditorUi.debug('LinterUserRules not loaded. Could not import linter settings.');

	return getLinterSettings();
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

		mxEvent.addListener(enabled, 'change', function () {
			setting.enabled = enabled.checked;
		});

		function updateLevel() {
			if (warning.checked) {
				setting.level = 'warning';
			} else if (error.checked) {
				setting.level = 'error';
			}
		}

		// Warning
		td = document.createElement('td');
		td.style.textAlign = 'center';

		const warning = document.createElement('input');
		warning.type = 'radio';
		warning.name = name;
		warning.value = 'warning';
		warning.checked = setting.level === 'warning';

		td.appendChild(warning);
		row.appendChild(td);

		// Error
		td = document.createElement('td');
		td.style.textAlign = 'center';

		const error = document.createElement('input');
		error.type = 'radio';
		error.name = name;
		error.value = 'error';
		error.checked = setting.level === 'error';

		td.appendChild(error);
		row.appendChild(td);

		mxEvent.addListener(warning, 'change', updateLevel);
		mxEvent.addListener(error, 'change', updateLevel);

		// Value
		td = document.createElement('td');
		td.style.textAlign = 'center';

		if (setting.inputType != null) {
			const input = document.createElement('input');
			input.type = setting.inputType;
			input.value = setting.value || '';
			input.style.width = '60px';

			mxEvent.addListener(input, 'change', function () {
				setting.value = input.value;
			});

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

	['Setting', 'Enabled', 'Warning', 'Error', 'Value'].forEach(function (text) {
		const th = document.createElement('th');
		th.style.textAlign = 'left';
		th.style.padding = '4px 8px';
		mxUtils.write(th, getLabel(text.toLowerCase(), text));
		header.appendChild(th);
	});

	tbody.appendChild(header);

	Object.keys(self.settings).forEach(function (key) {
		const setting = self.settings[key];
		const row = createSettingRow(key, 'ge' + key, setting);
		tbody.appendChild(row);
	});

	content.appendChild(table);

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

	const importInput = document.createElement('input');
	importInput.type = 'file';
	importInput.accept = 'application/json';
	importInput.style.display = 'none';

	mxEvent.addListener(importInput, 'change', function (event) {
		const file = event.target.files[0];

		if (file == null) {
			return;
		}

		const reader = new FileReader();

		reader.onload = function () {
			self.settings = importLinterSettingsFromText(reader.result);

			if (editorUi.linterWindow != null) {
				editorUi.linterWindow.window.destroy();
				editorUi.linterWindow = null;
			}

			initLinterWindow(editorUi);
		};

		reader.readAsText(file);
		importInput.value = '';
	});

	div.appendChild(importInput);

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

	const exportButton = createFooterButton('Export');
	mxEvent.addListener(exportButton, 'click', function (event) {
		exportLinterSettings(self.settings);
		mxEvent.consume(event);
	});
	footer.appendChild(exportButton);

	const importButton = createFooterButton('Import');
	mxEvent.addListener(importButton, 'click', function (event) {
		importInput.click();
		mxEvent.consume(event);
	});
	footer.appendChild(importButton);

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

		const ox = saved != null && saved.x != null ?
			saved.x : document.body.offsetWidth - 420;

		const oy = saved != null && saved.y != null ?
			saved.y : 100;

		const ow = saved != null && saved.w != null ?
			saved.w : 520;

		const oh = saved != null && saved.h != null ?
			saved.h : 220;

		ui.linterWindow = new LinterWindow(ui, ox, oy, ow, oh);

		if (ui.installWindowPersistence != null) {
			ui.installWindowPersistence('linter', ui.linterWindow);

			if (saved != null) {
				ui.restoreWindowState('linter', ui.linterWindow);
			}
		}
	} else {
		ui.linterWindow.window.setVisible(!ui.linterWindow.window.isVisible());
	}
};