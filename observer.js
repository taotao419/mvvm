

function observe(data){
	if (!data||typeof data!='object') {
		return;
	}

	Object.keys(data).forEach(function (key) {
		// console.log('data -->'+ data);
		// console.log('key -->'+ key);
		// console.log('data[key] -->'+ data[key]);
		defineReactive(data,key,data[key]);
	});
};


function defineReactive(data,key,val) {
	var dep=new Dep();
	observe(val); // observe the children node
	Object.defineProperty(data,key,{
		enumerable:true,
		configurable:false,
		get:function () {
			Dep.target && dep.addSub(Dep.target);
			return val;
		},
		set:function(newVal) {
			console.log('hahaha , change watched ' + val+' --> '+newVal);
			val=newVal;
			dep.notify();
		}
	})
}


function Dep() {
	this.subs=[];
}
Dep.prototype={
	addSub:function (sub) {
		console.log('add sub '+sub);
		this.subs.push(sub);
	},
	notify:function () {
		this.subs.forEach(function(sub){
			sub.update();
		});
	}
}














