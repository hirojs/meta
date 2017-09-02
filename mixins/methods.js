module.exports = require('../').createMixin({
	methods: {
		method(name) {
			const self = this, method = this[name];
  			return function() { return method.apply(self, arguments); }
		},
		lateBoundMethod(name) {
			const self = this;
			return function() { return self[name].apply(self, arguments); }
		}
	}
});