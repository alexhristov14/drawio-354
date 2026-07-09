(function () {
  /**
   * Key used to save linter settings in browser localStorage.
   * localStorage keeps the settings even after refreshing the page.
   */
  var STORAGE_KEY = 'drawio-linter-user-rules';

  /**
   * Default rule settings.
   *
   * Each rule can have:
   * - enabled: true/false, controls whether the rule runs
   * - level: warning/error, controls severity
   * - inputType/value: optional setting for rules that need extra values
   */
  var defaultRules = {
    overlappingShapes: {
      enabled: true,
      level: 'warning'
    },
    unconnectedEdges: {
      enabled: true,
      level: 'warning'
    }
  };

  /**
   * Debug helper.
   * The team asked us to use EditorUi.debug() instead of console.log().
   */
  function debug(message) {
    if (typeof EditorUi !== 'undefined' && typeof EditorUi.debug === 'function') {
      EditorUi.debug(message);
    }
  }

  /**
   * Creates a deep copy of the default rules.
   * This avoids modifying defaultRules directly by accident.
   */
  function copyDefaultRules() {
    return JSON.parse(JSON.stringify(defaultRules));
  }

  /**
   * Deep-merges rule overrides on top of a base rules object.
   * Only known keys (from baseRules) are kept; each rule's sub-fields
   * (enabled/level/value) are merged individually so a partial override
   * like { maxLength: { value: 50 } } doesn't wipe out enabled/level.
   */
  function mergeRuleSettings(baseRules, overrides) {
    var merged = JSON.parse(JSON.stringify(baseRules));

    if (overrides != null && typeof overrides === 'object') {
      Object.keys(merged).forEach(function (key) {
        if (overrides[key] != null && typeof overrides[key] === 'object') {
          Object.assign(merged[key], overrides[key]);
        }
      });
    }

    return merged;
  }

  /**
   * Loads saved linter rules from localStorage.
   * If there are no saved rules yet, it returns the default settings.
   */
  function loadUserRules() {
    try {
      var savedRules = localStorage.getItem(STORAGE_KEY);

      if (!savedRules) {
        debug('Linter user rules not found. Using default rules.');
        return copyDefaultRules();
      }

      var parsedRules = JSON.parse(savedRules);
      var mergedRules = mergeRuleSettings(defaultRules, parsedRules);

      debug('Linter user rules loaded.');

      return mergedRules;
    } catch (e) {
      debug('Failed to load linter user rules. Using default rules.');
      return copyDefaultRules();
    }
  }

  /**
   * Saves linter rules to localStorage.
   * linter.js calls this when the user clicks Save.
   */
  function saveUserRules(rules) {
    try {
      var currentRules = loadUserRules();
      var updatedRules = mergeRuleSettings(currentRules, rules);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRules));

      debug('Linter user rules saved.');

      return updatedRules;
    } catch (e) {
      debug('Failed to save linter user rules.');
      return loadUserRules();
    }
  }

  /**
   * Removes saved settings from localStorage.
   * After this, the plugin will use the default settings again.
   */
  function resetUserRules() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      debug('Linter user rules reset to defaults.');
    } catch (e) {
      debug('Failed to reset linter user rules.');
    }

    return copyDefaultRules();
  }

  /**
   * Exports current linter settings as a JSON file.
   * This lets users back up or share their settings.
   */
  function exportUserRules(rules) {
    var rulesToExport = rules || loadUserRules();
    var json = JSON.stringify(rulesToExport, null, 2);

    var blob = new Blob([json], {
      type: 'application/json'
    });

    var url = URL.createObjectURL(blob);

    var link = document.createElement('a');
    link.href = url;
    link.download = 'drawio-linter-rules.json';
    link.click();

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);

    debug('Linter user rules exported.');
  }

  /**
   * Imports linter settings from JSON text.
   * linter.js uses this after the user selects an imported JSON file.
   */
  function importUserRulesFromText(jsonText) {
    try {
      var importedRules = JSON.parse(jsonText);
      var updatedRules = saveUserRules(importedRules);

      debug('Linter user rules imported.');

      return updatedRules;
    } catch (e) {
      debug('Invalid linter rules JSON. Import failed.');
      return loadUserRules();
    }
  }

  /**
   * Expose the storage functions globally so linter.js can use them.
   */
  window.LinterUserRules = {
    load: loadUserRules,
    save: saveUserRules,
    reset: resetUserRules,
    export: exportUserRules,
    importFromText: importUserRulesFromText,
    defaults: copyDefaultRules
  };
})();