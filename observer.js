function observe(data) {
    if (!data || typeof data != 'object') {
        return;
    }

    Object.keys(data).forEach(function(key) {
        //给每个property 定义了一个dep , dep里面又有多个watcher
        defineReactive(data, key, data[key]);
    });
};


function defineReactive(data, key, val) {
    var dep = new Dep();
    observe(val); // observe the children node
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: false,
        get: function() {
            console.log("data getter triggered : [" + key + "][" + val + "]");
            console.log("run getter function Dep target : " + Dep.target);
            Dep.target && dep.addSub(Dep.target);
            console.log(dep.subs);
            return val;
        },
        set: function(newVal) {
            console.log('hahaha , change watched ' + val + ' --> ' + newVal);
            val = newVal;
            dep.notify();
        }
    })
}


function Dep() {
    this.subs = [];
    Dep.subscriptions = this.subs;
}
Dep.prototype = {
    addSub: function(sub) {
        var existed = this.subs.includes(sub);
        if (existed) {
            console.log("this sub is duplicated");
            return;
        }
        // debugger;
        console.log('add sub exp : [' + sub.exp + ']');
        this.subs.push(sub);

    },
    notify: function() {
        console.log("ViewModel setter trigger Dep call notify function");
        console.log(this.subs);
        this.subs.forEach(function(sub) {
            sub.update();
        });
    }
}