var db = new function(){
	var _this = this;
	_this.get = function(option){
		option.type = 'get'
		option.url = 'getData'
		$.ajax(option);
	}
}
var dataProcessor = new Vue({
	methods:{
		loginChk:function(e){
			e.preventDefault();
			var option = {
				data:{table:'/GetDevice'},
				success:function(data){
					bus.member = true
				}
			}
			db.get(option);
		},
		getMember:function(){
			var option = {}
		}
	}
})