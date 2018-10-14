function Watcher(data,updateFunc) {
	this.data=data;
	this.updateFunc=updateFunc;
}

Watcher.prototype={
	get:function (key) {
		Dep.target=this;
		var tmp=this.data[key];//trigger data get function , then addSub
		Dep.target=null;
	},

	update:function () {
		if(this.updateFunc&&typeof this.updateFunc=='function'){
			this.updateFunc();
		}
	}
}