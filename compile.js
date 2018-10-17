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

    isDirective: function(attr) {
        return attr.index('v-') === 0;
    },

    isEventDirective: function(attr) {
        return attr.index('on') === 0;
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

        /* var me = this;
          var val = this._getVMVal(vm, exp);
          node.addEventListener('input', function(e) {
              var newValue = e.target.value;
              if (val == newValue) {
                  return;
              }

              me._setVMVal(vm, exp, newValue);
              val = newValue;
          }) //需要理解  
          */
    },

    bind: function(node, vm, exp, cmd) {
        var updateFn = updater[cmd + 'Updater'];
        //第一次初始化视图
        updateFn && updateFn(node, vm[exp]);

        new Watcher(vm, exp, function(value, oldValue) {
            updateFn && updateFn(node, value, oldValue);
        });
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