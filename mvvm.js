function MVVM(options) {
    this.$options = options;
    var data = this._data = this.$options.data;
    var methods = this._methods = this.$options.methods;
    var me = this;
    // // 属性代理，实现 vm.xxx -> vm._data.xxx
    // Object.keys(data).forEach(function(key) {
    //     me._proxy(key);
    // });

    observe(data);
    this.$compile = new Compile(options.el, data, options.methods);
};

// MVVM.prototype = {
        //     _proxy: function(key) {
        //         var me = this;
        //         Object.defineProperty(me, key, {
        //             configurable: false,
        //             enumerable: true,
        //             get: function proxyGetter() {
        //                 return me._data[key];
        //             },
        //             set: function proxySetter(newVal) {
        //                 me._data[key] = newVal;
        //             }
        //         });
        //     }
        // };