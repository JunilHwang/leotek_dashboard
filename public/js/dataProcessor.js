var db = new function(){
	var _this = this;
	_this.get = function(option){
		option.type = 'get'
		option.url = './getData'
		$.ajax(option);
	}
	_this.getDevice = function(option){
		option.type = 'get'
		option.url = './getDevice'
		$.ajax(option);
	}
}
var dataProcessor = new Vue({
	methods:{
		loginChk:function(e){
			if(e) e.preventDefault();
			/*
			e.preventDefault();
			var id = e.target.id.value;
			var pwd = e.target.pwd.value;
			var json;
			var option = {
				data:{table:'Login',id:id,pwd:pwd},
				success:function(data){
					json = JSON.parse(data);
					if(json.Message){
						alert(json.Message);
					}
				}
			}
			db.get(option);
			*/
			$.ajax({
				type:"get",
				url:"./getLogin",
				data:{id:e.target.id.value},
				async: false,
				success:function(data){
					if(data != 'false'){
						console.log(data);
						bus.member = JSON.parse(data);
						alert('로그인 되었습니다.');
					} else {
						alert('일치하는 아이디가 없습니다.');
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
						member = JSON.parse(data);
					}
				}
			})
			return member;
		}
	}
})