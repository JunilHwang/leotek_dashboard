var bus = new Vue({
	data:{
		member:dataProcessor.getMember()
	},
	computed:{
	},
	methods:{
	}
});

//app
function app(){
	return new Vue({
		el:"#app",
		data:{
			member:false
		},
		template:getTemplate('app.html'),
		components:{
			'login':{
				template:getTemplate('login.html')
			}
		}
	})
}

//Application Execute
app();

//get
function getTemplate(file,option){
	if(!option) option = null;
	$.ajax({
		type:"GET",
		url:"./component/"+file,
		data:option,
		async: false,
		success:function(data){
			text = data;
		}
	})
	return text;
}