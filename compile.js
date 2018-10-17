function Compile(el, vm) {
    this.$vm = vm;
    this.$el = /*this.isElementNode(el) ? el :*/ document.querySelector(el);
    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        console.log(this.$fragment);
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    init: function() {
        this.compileElement(this.$fragment);
    },

    node2Fragment: function(el) {
        //DocumentFragments 是DOM节点.它们不是主DOM树的一部分.通常的用例是创建文档片段
        //将元素附加到文档片段,然后将文档片段附加到DOM树.
        //因为文档片段存在内存中,并不在DOM树中,所以将子元素插入文档片段时并不会引起页面回流
        //因此,使用文段片段会带来更好的性能.
        var fragment = document.createDocumentFragment();
        var child;
        //将原生节点copy到fragment
        while (child = el.firstChild) {
            //如果被插入的节点已经存在于当前文档的文档树中,则那个节点会首先从原来的位置移除,然后再插入到新的位置.
            //也就是说firstChild这个节点 会先从el移除,然后插入到fragment.
            fragment.appendChild(child);
            //所以每次执行后el.firstChild就会自动move to next Child
        }

        return fragment;
    },

    compileElement: function(el) {
        var childNodes = el.childNodes;
        var me = this;
        [].slice.call(childNodes).forEach(function(node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/; // 表达式文本  {{}} 双大括号
            if (me.isElementNode(node)) {
                me.compile(node);
            } else if (me.isTextNode(node) && reg.test(text)) {
                //非标准$1~$9属性是包含括号子串匹配的正则表达式,尽量不要在生产环境使用
                //这里RegExp.$1就是得到双括号里面的所有内容
                me.compileText(node, RegExp.$1);
            }

            //recursive children
            if (node.childNodes && node.childNodes.length) {
                me.compileElement(node);
            }
        })
    },

    compile: function(node) {
        var nodeAttrs = node.attributes;
        var me = this;
        [].slice.call(nodeAttrs).forEach(function(attr) {
            //规定:指令以v-xxx命名
            //如<span v-text="content"></span>中指令为v-text
            var attrName = attr.name; //v-text
            if (me.isDirective(attrName)) {
                var exp = attr.value; //content
                var cmd = attrName.substring(2); //v-text取v-后面的字符串 即text
                if (me.isEventDirective(cmd)) {
                    //event command , ex : v-on:click
                    compileUtil.eventHandler(node, me.$vm, exp, cmd);
                } else {
                    //common command
                    //函数存在并且执行此函数
                    compileUtil[cmd] && compileUtil[cmd](node, me.$vm, exp);
                }
            }
        })
    },

    compileText: function(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },
    //directive 指令,指导的
    isDirective: function(attr) {
        return attr.indexOf('v-') === 0;
    },

    isEventDirective: function(attr) {
        return attr.indexOf('on') === 0;
    },

    isElementNode: function(node) {
        /*
            1 -- element
            2 -- Attr 
            3 -- Text
            4 -- CDATASection
            8 -- Comment
            9 -- Document 整个文档 (DOM树的根节点)
            11 -- DocumentFragment
        */
        return node.nodeType == 1;
    },

    isTextNode: function(node) {
        return node.nodeType == 3;
    },
};


var compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },

    model: function(node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        var me = this;
        var val = this._getVMVal(vm, exp);
        /*
        input event,当<input> <select> <textarea>元素的值更改时
        ,DOM input事件会同步触发.
        对于type=ckeckbox 或type=radio的input元素,当每次切换控件
        (通过触摸/鼠标或键盘) input事件都应该触发,从历史来看,情况并非如此.
        或者使用change事件代替
        */
        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (val == newValue) {
                return;
            }

            me._setVMVal(vm, exp, newValue);
            val = newValue;
        });
    },

    bind: function(node, vm, exp, cmd) {
        var updateFn = updater[cmd + 'Updater'];
        //第一次初始化视图
        updateFn && updateFn(node, vm[exp]);

        new Watcher(vm, exp, function(value, oldValue) {
            updateFn && updateFn(node, value, oldValue);
        });
    },

    _getVMVal: function(vm, exp) {
        // ex : get val by "a.b.c"
        // {
        //     a:{
        //         b:{
        //             c: 'test'
        //         }
        //     }
        // }
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    },

    _setVMVal: function(vm, exp, newValue) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k, i) {
            //非最后一个key,更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = newValue;
            }
        })
    }
};

var updater = {
    textUpdater: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },

    modelUpdater: function(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    },
}