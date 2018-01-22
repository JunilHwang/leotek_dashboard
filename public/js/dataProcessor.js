var db = new function(){
	var _this = this;
	_this.get = function(option){
		option.type = 'get'
		option.url = './getData'
		$.ajax(option);
	}
}
var dataProcessor = new Vue({
	methods:{
		loginChk:function(e){
			if(e) e.preventDefault();/*
			var option = {
				data:{table:'/GetDevice'},
				success:function(data){
					bus.member = true
				}
			}
			db.get(option);*/
			$.ajax({
				type:"get",
				url:"./getLogin",
				data:null,
				async: false,
				success:function(data){
					if(data != 'false'){
						bus.member = JSON.parse(data)[0];
						alert('로그인 되었습니다.');
					}
				}
			})
		},
		getMember:function(){
			var member = false;
			$.ajax({
				type:"get",
				url:"./getMember",
				data:null,
				async: false,
				success:function(data){
					if(data != 'false'){
						member = JSON.parse(data)[0];
					}
				}
			})
			return member;
		}
	}
})