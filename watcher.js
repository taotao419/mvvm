function Watcher(vm, exp, updateFunc) {
    this.vm = vm;
    this.exp = exp;
    this.updateFunc = updateFunc;

    //init value
    this.value = this.get();
}

Watcher.prototype = {
    get: function() {
        Dep.target = this;
        //vm -> data , exp -> key
        var value = this.vm[this.exp]; //trigger data get function , then addSub
        Dep.target = null;
        return value;
    },

    update: function() {
        this.run(); //属性值变化收到通知
    },

    run: function() {
        var value = this.get(); //get latest value
        var oldVal = this.value;
        if (value != oldVal) {
            this.updateFunc.call(this.vm, value, oldVal);
        }
    },

}