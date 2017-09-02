function MetaClass(parent) {
	this._parent = parent;
	this.__constructor__ = null;
	this.__prototype__ = null;
	this._availableFeatures = Object.create(parent ? parent._availableFeatures : null);
	this._attachedFeatures = {};
}

MetaClass.prototype.initializeInstance = function(instance) {
	if (this._parent) {
		this._parent.initializeInstance(this, instance);
	}
	for (let fn in this._attachedFeatures) {
		this._attachedFeatures[fn].initializeInstance(this, instance);
	}
}

MetaClass.prototype.registerAvailableFeature = function(def) {
	if (this._availableFeatures[def.name]) {
		throw new Error("error: duplicate feature name `" + def.name + "`");
	}
	this._availableFeatures[def.name] = def;
}

MetaClass.prototype.getAvailableFeature = function(name) {
	if (!this._availableFeatures[name]) {
		throw new Error("unknown feature: " + name);
	}
	return this._availableFeatures[name];
}

MetaClass.prototype.hasFeature = function(name) {
	return name in this._attachedFeatures;
}

MetaClass.prototype.getParent = function() {
	return this._parent;
}

MetaClass.prototype.getConstructor = function() {
	return this.__constructor__;
}

MetaClass.prototype.getPrototype = function() {
	return this.__prototype__;
}

MetaClass.prototype.ascendHierarchy = function(cb) {
	let curr = this;
	while (curr) {
		cb(curr);
		curr = curr._parent;
	}
}

MetaClass.prototype.descendHierarchy = function(cb) {
	if (this._parent) {
		this._parent.descendHierarchy(cb);
	}
	cb(this);
}

function defineClass(parent, cb) {
	if (typeof parent === 'function') {
		cb = parent;
		parent = AnyObject;
	}
	
	let opts = cb(parent, parent.__constructor__, parent.__prototype__) || {};

	const ctor = opts.__constructor__ || function() {
		this.metaClass.initializeInstance(this);
	};
	
	ctor.prototype = Object.create(parent.__prototype__);

	const klass = new MetaClass(parent);
	klass.__constructor__ = ctor;
	klass.__prototype__ = ctor.prototype;
	klass.__prototype__.metaClass = klass;

	for (let k in opts) {
		if (k === '__constructor__') continue;
		attachFeature(klass, parent.getAvailableFeature(k), opts[k]);
	}

	finalize(klass);

	return klass;
}

function attachFeature(metaclass, featureDef, rawDef) {
	if (!(featureDef.name in metaclass._attachedFeatures)) {
		featureDef.initializeMetaclass(metaclass);
		metaclass._attachedFeatures[featureDef.name] = featureDef;
	}
	featureDef.apply(metaclass, featureDef.parse(rawDef));
}

function finalize(metaclass, opts) {
	for (let fn in metaclass._attachedFeatures) {
		metaclass._attachedFeatures[fn].finalize(metaclass);
	}
}

function create(metaClass) {
	return new metaClass.__constructor__();
}

const AnyObject = new MetaClass(null);
AnyObject.__constructor__ = function() {};
AnyObject.__prototype__ = Object.create(null);
AnyObject.__prototype__.metaClass = AnyObject;
AnyObject.registerAvailableFeature(require('./features/methods'));

module.exports = {
	AnyObject,
	defineClass,
	create
};