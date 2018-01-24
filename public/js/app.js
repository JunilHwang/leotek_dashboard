var bus = new Vue({
	data:{
		member:dataProcessor.getMember()
	},
	computed:{
	},
	methods:{
		setPage:function(e){
			e.preventDefault();
		}
	}
});

//app
function app(){
	return new Vue({
		el:"#app",
		data:{
			member:false
		},
		template:getTemplate('app'),
		components:{
			'login':{
				template:getTemplate('login'),
				created:function(){
					$("#page-title").html('Leotek Dashboard Login');
					setTimeout(function(){ $("[autofocus]").focus()});
				}
			},
			'site':{
				template:getTemplate('site'),
				created:function(){
					$("#page-title").html('Leotek Dashboard');					
				},
				components:site()
			}
		}
	})
}

function site(){
	return {
		'site-header':{
			template:getTemplate('site-header'),
			methods:{
				logout:function(e){
					e.preventDefault();
					$.get("./logout",null,function(data){
						alert('로그아웃 되었습니다.');
						bus.member = false;
					});
				}
			}
		},
		'content-01':{
			template:getTemplate('content-01'),
			data:function(){
				return {
					device:[],
					indoor:[],
					outdoor:[],
					selectedOutdoor:(function(){
					var obj = localStorage.getItem('outdoor');
						return obj ? JSON.parse(obj) : null;
					}()),
					selectedIndoor:(function(){
						var obj = localStorage.getItem('indoor');
						return obj ? JSON.parse(obj) : null;
					}()),
					loading:true
				}
			},
			methods:{
				scrolling:function(e){
					var obj = $(".content-01 .list");
					var obj2 = $(".scrollbar");
					var scrollH = obj[0].scrollHeight;
					var moving = e.deltaY/5;
					var moving2 = (320/(scrollH-370))*moving;
					var pos = obj.scrollTop()+moving;
					var pos2 = parseInt(obj2.css("top"))+moving2;
					if(pos2 < 0) pos2 = 0;
					if(pos2 > 320) pos2 = 320;
					if(scrollH != 370){
						obj.scrollTop(pos);
						obj2.css({top:pos2+"px"});
					}
				},
				selectIndoor:function(obj){
					obj = this.getDetail(obj);
					this.selectedIndoor = obj;
					localStorage.setItem("indoor",JSON.stringify(obj));
				},
				selectOutdoor:function(obj){
					obj = this.getDetail(obj);
					this.selectedOutdoor = obj;
					localStorage.setItem("outdoor",JSON.stringify(obj));
				},
				getDetail:function(obj){
					var option = {
						data:{
							table:'GetDayMeterData',
							serialNo:obj.DVC_SRNO,
							id:bus.member.USR_ID
						},
						async:false,
						success:function(data){
							obj['list'] = JSON.parse(data).Data;
						}
					}
					db.get(option);
					console.log(obj.list);
					return obj;
				}
			},
			created:function(){
				var _this = this;
				var option = {
					data:{
						table:"GetDevice",
						userid:bus.member.USR_ID
					},
					success:function(data){
						var device = JSON.parse(data).Data;
						var indoor = [], outdoor = [];
						var obj;
						if(device) for(var i=0, len = device.length; i<len; i++){
							obj = device[i];
							if(obj.DVC_CD == '03'){
								outdoor.push(obj);
							} else {
								indoor.push(obj);
							}
							//console.log(obj.DVC_SRNO);
						}
						_this.device = device;
						_this.indoor = indoor;
						_this.outdoor = outdoor;
						_this.loading = false;
					}
				}
				db.getDevice(option);
				setInterval(function(){
					db.getDevice(option)
				},1000*6000);
			}
		},
		'content-02':{
			template:getTemplate('content-02')
		}
	}
}

//Application Execute
app();

//get
function getTemplate(file,option){
	if(!option) option = null;
	$.ajax({
		type:'GET',
		url:'./component/'+file+'.html',
		data:option,
		async: false,
		success:function(data){
			text = data;
		}
	})
	return text;
}

/*function customScrollLoad(){
	if($(".custom_scroll").length){
		var obj = $(".content-01 .list");
		var scrollH = obj[0].scrollHeight;
		if(scrollH <= 370){
			$(".custom_scroll").hide();
		} else {
			$(".custom_scroll").show();
		}
	}
}

$(window).on("load resize",customScrollLoad)*/