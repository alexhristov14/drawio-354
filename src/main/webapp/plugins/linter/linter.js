/**
 * Linter plugin
 */
Draw.loadPlugin(function(ui) {
  mxResources.parse('linter=Linter');

	// var CustomDialog = function(editorUi, content, okFn, cancelFn, okButtonText, helpLink,
	// buttonsContent, hideCancel, cancelButtonText, hideAfterOKFn, customButtons,
	// marginTop)
	// EditorUi.prototype.showDialog = function(elt, w, h, modal, closable, onClose, noScroll, transparent, minSize, ignoreBgClick, persistenceKey)
	ui.actions.addAction('linter', () => initLinterWindow(ui));

	const menu = ui.menus.get('extras');
	const oldFunct = menu.funct;
	menu.funct = function(menu, parent)
	{
		oldFunct.apply(this, arguments);

		ui.menus.addMenuItems(menu, ['-', 'linter'], parent);
	};
});

var saveLinterSettings = function(settings) {
	// TODO
	EditorUi.debug('Saving linter settings: ' + JSON.stringify(settings));
}

var cancelLinterSettings = function() {
	// TODO
	EditorUi.debug('Cancelling linter settings');
}


var LinterWindow = function(editorUi, x, y, w, h)
{
	const div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.width = '100%';
	div.style.height = '100%';
	div.style.overflow = 'hidden';

	const settingsSection = document.createElement('div');
	settingsSection.className = 'geDialogSection';
	div.append(settingsSection);

	const row = document.createElement('div');
	row.className = 'geDialogFormRow';

	const label = document.createElement('span');
	label.className = 'geDialogFormLabel';
	mxUtils.write(label, mxResources.get('zoom') + ':');
	row.appendChild(label);

	const input = document.createElement('input');
	input.setAttribute('type', 'text');
	row.appendChild(input);

	settingsSection.appendChild(row);

	const logSection = document.createElement('div');
	logSection.className = 'geDialogSection';
	div.append(logSection);

	const minimizable = true;
	const movable = true;

	this.window = new mxWindow(mxResources.get('linter'), div, x, y, w, h, minimizable, movable);
	this.window.destroyOnClose = false;
	this.window.setMaximizable(false);
	this.window.setResizable(true);
	this.window.setClosable(true);
	this.window.setVisible(true);
};

var initLinterWindow = function(ui) {
	if (ui.linterWindow == null) {
		var saved = (ui.installWindowPersistence != null) ?
			mxSettings.getWindowState('linter') : null;
		// 20px less than outlineWindow
		var ox = (saved != null && saved.x != null) ? saved.x :
			document.body.offsetWidth - 240;
		var oy = (saved != null && saved.y != null) ? saved.y : 100;
		var ow = (saved != null && saved.w != null) ? saved.w : 180;
		var oh = (saved != null && saved.h != null) ? saved.h : 180;
		ui.linterWindow = new LinterWindow(ui, ox, oy, ow, oh, null);

		if (ui.installWindowPersistence != null)
		{
			ui.installWindowPersistence('linter', ui.linterWindow);
			if (saved != null)
			{
				ui.restoreWindowState('linter', ui.linterWindow);
			}
		}
	} else {
		ui.linterWindow.window.setVisible(!ui.linterWindow.window.isVisible());
	}
}

	// // Sidebar is null in lightbox
	// if (ui.sidebar != null)
	// {
	//     // Adds custom sidebar entry
	//     ui.sidebar.addPalette('esolia', 'eSolia', true, function(content) {
	
	//         // content.appendChild(ui.sidebar.createVertexTemplate(null, 120, 60));
	//         content.appendChild(ui.sidebar.createVertexTemplate('shape=image;image=http://download.esolia.net.s3.amazonaws.com/img/eSolia-Logo-Color.svg;resizable=0;movable=0;rotatable=0', 100, 100));
	//         content.appendChild(ui.sidebar.createVertexTemplate('text;spacingTop=-5;fontFamily=Courier New;fontSize=8;fontColor=#999999;resizable=0;movable=0;rotatable=0', 100, 100));
	//         content.appendChild(ui.sidebar.createVertexTemplate('rounded=1;whiteSpace=wrap;gradientColor=none;fillColor=#004C99;shadow=1;strokeColor=#FFFFFF;align=center;fontColor=#FFFFFF;strokeWidth=3;fontFamily=Courier New;verticalAlign=middle', 100, 100));
	//         content.appendChild(ui.sidebar.createVertexTemplate('curved=1;strokeColor=#004C99;endArrow=oval;endFill=0;strokeWidth=3;shadow=1;dashed=1', 100, 100));
	//     });
	
	//     // Collapses default sidebar entry and inserts this before
	//     var c = ui.sidebar.container;
	//     c.firstChild.click();
	//     c.insertBefore(c.lastChild, c.firstChild);
	//     c.insertBefore(c.lastChild, c.firstChild);
	
	//     // Adds logo to footer
	//     ui.footerContainer.innerHTML = '<img width=50px height=17px align="right" style="margin-top:14px;margin-right:12px;" ' + 'src="http://download.esolia.net.s3.amazonaws.com/img/eSolia-Logo-Color.svg"/>';
		
	// 	// Adds placeholder for %today% and %filename%
	//     var graph = ui.editor.graph;
	// 	var graphGetGlobalVariable = graph.getGlobalVariable;
		
	// 	graph.getGlobalVariable = function(name)
	// 	{
	// 		if (name == 'today')
	// 		{
	// 			return new Date().toLocaleString();
	// 		}
	// 		else if (name == 'filename')
	// 		{
	// 			var file = ui.getCurrentFile();
				
	// 			return (file != null && file.getTitle() != null) ? file.getTitle() : '';
	// 		}
			
	// 		return graphGetGlobalVariable.apply(this, arguments);
	// 	};
		
	// 	// Adds support for exporting PDF with placeholders
	// 	var graphGetExportVariables = graph.getExportVariables;
		
	// 	Graph.prototype.getExportVariables = function()
	// 	{
	// 		var vars = graphGetExportVariables.apply(this, arguments);
	// 		var file = ui.getCurrentFile();
			
	// 		vars['today'] = new Date().toLocaleString();
	// 		vars['filename'] = (file != null && file.getTitle() != null) ? file.getTitle() : '';
			
	// 		return vars;
	// 	};
	
//	    // Adds resource for action
//	    mxResources.parse('helloWorldAction=Hello, World!');
//	
//	    // Adds action
//	    ui.actions.addAction('helloWorldAction', function() {
//	        var ran = Math.floor((Math.random() * 100) + 1);
//	        mxUtils.alert('A random number is ' + ran);
//	    });
//	
//	    // Adds menu
//	    ui.menubar.addMenu('Hello, World Menu', function(menu, parent) {
//	        ui.menus.addMenuItem(menu, 'helloWorldAction');
//	    });
//	
//	    // Reorders menubar
//	    ui.menubar.container.insertBefore(ui.menubar.container.lastChild,
//	        ui.menubar.container.lastChild.previousSibling.previousSibling);
//	
//	    // Adds toolbar button
//	    ui.toolbar.addSeparator();
//	    var elt = ui.toolbar.addItem('', 'helloWorldAction');
//	
//	    // Cannot use built-in sprites
//	    elt.firstChild.style.backgroundImage = 'url(https://www.draw.io/images/logo-small.gif)';
//	    elt.firstChild.style.backgroundPosition = '2px 3px';
