function Compile(el) {
	this.$el = /*this.isElementNode(el) ? el :*/ document.querySelector(el);
	if (this.$el) {
		this.$fragment = this.node2Fragment(this.$el);
		this.init();
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
			var reg = /\{\{(.*)\}\}/; // 表达式文本
			if (me.isElementNode(node)) {
				// me.compile(node);
			} else if (me.isTextNode(node) && reg.test(text)) {
				// me.compileText(node.RegExp.$1);
			}

			//recursive children
			if (node.childNodes && node.childNodes.length) {
				me.compileElement(node);
			}
		})
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