const test = require('tape');
const {AnyObject, defineClass, create} = require('../');

function t(name, fn) {
    test(name, function(test) {
        fn(test);
        test.end();
    });
}

t('basic method call', ({equal}) => {
    const C1 = defineClass(() => {
        return {
            methods: {
                add(a, b) { return a + b; }
            }
        }
    });
    equal(6, create(C1).add(4, 2));
});

t('explicit constructor', ({equal}) => {
    const C1 = defineClass(() => {
        return {
            __constructor__: function() {
                this.x = 10;
            }
        }
    });
    equal(10, create(C1).x);
});

t('explicit constructor with subclassing', ({equal}) => {
    const C1 = defineClass(() => {
        return {
            __constructor__: function(x) {
                this.x = x + 1;
            }
        }
    });
    const C2 = defineClass(C1, (sm, sc, sp) => {
        return {
            __constructor__: function() {
                sc.call(this, 2);
            }
        }
    });
    equal(3, create(C2).x);
})

t('parent metaclass', ({equal}) => {
    const C1 = defineClass(() => {});
    const C2 = defineClass(C1, () => {});
    equal(AnyObject, create(C1).metaClass.getParent());
    equal(C1, create(C2).metaClass.getParent());
});

t('subclassing - method call', ({equal}) => {
    const C1 = defineClass(() => {
        return {
            methods: {
                gimme5() { return 5; }
            }
        }
    });
    const C2 = defineClass(C1, () => {
        return {
            methods: {
                gimme5() { return 6; }
            }
        }
    });
    equal(5, create(C1).gimme5());
    equal(6, create(C2).gimme5());
});

t('subclassing - super call', ({equal}) => {
    const C1 = defineClass(() => {
        return {
            methods: {
                gimme5() { return 5; }
            }
        }
    });
    const C2 = defineClass(C1, (sm, sc, sp) => {
        return {
            methods: {
                gimme5() { return 6 + sp.gimme5.call(this); }
            }
        }
    });
    equal(11, create(C2).gimme5());
});

t('metaclass available', ({equal}) => {
    const C1 = defineClass(() => {});
    const C2 = defineClass(C1, () => {});
    equal(C1, create(C1).metaClass);
    equal(C2, create(C2).metaClass);
});

t('ascend', ({deepEqual}) => {
    const C1 = defineClass(() => {});
    const C2 = defineClass(C1, () => {});
    const C3 = defineClass(C2, () => {});
    let res = [];
    C3.ascendHierarchy((mc) => res.push(mc));
    deepEqual([C3, C2, C1, AnyObject], res);
});

t('descend', ({deepEqual}) => {
    const C1 = defineClass(() => {});
    const C2 = defineClass(C1, () => {});
    const C3 = defineClass(C2, () => {});
    let res = [];
    C3.descendHierarchy((mc) => res.push(mc));
    deepEqual([AnyObject, C1, C2, C3], res);
});

t('methods - names', ({deepEqual}) => {
    const C1 = defineClass(() => {
        return {
            methods: {
                a: function() {},
                b: function() {}
            }
        }
    });
    const C2 = defineClass(C1, () => {
        return {
            methods: {
                b: function() {},
                c: function() {}
            }
        }
    });
    deepEqual(C1.getMethodNames(), ['a', 'b']);
    deepEqual(C1.getAllMethodNames(), ['a', 'b']);
    deepEqual(C2.getMethodNames(), ['b', 'c']);
    deepEqual(C2.getAllMethodNames(), ['a', 'b', 'c']);
});