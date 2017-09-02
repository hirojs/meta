const FEATURE_NAME = 'methods';

module.exports = {
	name: FEATURE_NAME,

	initializeMetaclass: function(metaclass) {
		metaclass._methods = {};
		
		metaclass.getMethodNames = function() {
			return Object.keys(metaclass._methods).sort();
		}

		metaclass.getAllMethodNames = function() {
			const names = {};
			metaclass.ascendHierarchy((klass) => {
				if (klass.hasFeature(FEATURE_NAME)) {
					for (let mn in klass._methods) {
						names[mn] = true;
					}
				}
			});
			return Object.keys(names).sort();
		}
	},

	initializeInstance: function(metaclass, instance) {
		// nothing to do here
	},

	parse: function(opts) {
		return opts;
	},

	apply: function(metaclass, opts) {
		for (let k in opts) {
			metaclass._methods[k] = opts[k];
		}
	},

	finalize: function(metaclass) {
		const proto = metaclass.getPrototype();
		for (let k in metaclass._methods) {
			proto[k] = metaclass._methods[k];
		}
	}
};
