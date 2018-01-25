var bus = new Vue({
	data:{
		member:dataProcessor.getMember(),
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
		activeData:null,
		graphPoint:null,
		graphData:null
	},
	computed:{
	},
	methods:{
		setPage:function(e){
			e.preventDefault();
		},
		getGraph:function(){
			var _this = this;
			var start_date = "2018-01-24", end_date = "2018-01-25";
			//var start_date = getNow(), end_date = getNow();
			if($(".datepicker.start").length){
				start_date = $(".datepicker.start").val();
				end_date = $(".datepicker.end").val();
			}
			$.ajax({
				type:'get',
				url:'./getGraph',
				data:{srno:_this.activeData.DVC_SRNO,start:start_date,end:end_date},
				success:function(data){
					var jsonData = JSON.parse(data);
					_this.graphData = jsonData.data;
					_this.graphPoint = jsonData.point;
					graphCreated();
				}
			})
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
					loading:true
				}
			},
			methods:{
				/*scrolling:function(e){
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
				},*/
				selectIndoor:function(obj){
					obj = this.getDetail(obj);
					bus.selectedIndoor = obj;
					localStorage.setItem("indoor",JSON.stringify(obj));
					bus.activeData = obj;
					bus.getGraph();
				},
				selectOutdoor:function(obj){
					obj = this.getDetail(obj);
					bus.selectedOutdoor = obj;
					localStorage.setItem("outdoor",JSON.stringify(obj));
					bus.activeData = obj;
					bus.getGraph();
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
						bus.device = device;
						bus.indoor = indoor;
						bus.outdoor = outdoor;
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
			template:getTemplate('content-02'),
			data:function(){
				return {
					start:getNow(),
					end:getNow()
				}
			},
			computed:{
				activeIn:function(){
					return bus.activeData === bus.selectedIndoor ? ' active' : '';
				},
				activeOut:function(){
					return bus.activeData === bus.selectedOutdoor ? ' active' : '';
				}
			},
			methods:{
				active:function(type){
					if(type == 'in'){
						bus.activeData = bus.selectedIndoor;
					} else if(type == 'out'){
						bus.activeData = bus.selectedOutdoor;
					}
					bus.getGraph();
				},
			},
			created:function(){
				bus.activeData = bus.selectedIndoor;
				bus.getGraph();
			},
			mounted:function(){
				$(".datepicker").datepicker().val(getNow());
			}
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

$(document)
.on("click","a[href='#']",function(e){
	e.preventDefault();
})
.on("change",".datepicker",function(){
	var selectedDate = getDate(this);
	if($(this).hasClass("start")){
		$(".datepicker.end").datepicker("option","minDate",selectedDate);
	} else {
		$(".datepicker.start").datepicker("option","maxDate",selectedDate);
	}
})
$.datepicker.setDefaults({
    dateFormat: 'yy-mm-dd',
    showMonthAfterYear: true,
    changeMonth:true,
    changeYear:true,
    maxDate:new Date()
})

function getDate( element ) {
	var date = null
	date = $.datepicker.parseDate( "yy-mm-dd", element.value );
	return date;
}

function getNow(){
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	if(month < 10) month = "0"+month;
	var now = year+"-"+month+"-"+day;
	return now;
}

function graphCreated(){
	var data = bus.graphData;
	var point = bus.graphPoint;
	var type = 'CO2_IDX';
	var max = point[('MAX_'+type).replace("_IDX","")];
	var min = point[('MIN_'+type).replace("_IDX","")];
	var canvas = document.getElementById('graph'),
		context = canvas.getContext('2d'),
		ratio = 1,
		move_left_by = 1,
		step = 1,
		width = canvas.width = $("#graph").width(),
		height = canvas.height = $("#graph").height();
	var renderData = [];
	if(max != 0) if(height < max){
		ratio = max/height;
		height = max;
		console.log(height);
	} else {
		ratio = height/max;
	}
	if(data.length > 0) if(width >= data.length){
		move_left_by = width/data.length;
		width = data.length;
		renderData = data;
		for(var i=0,len=data.length;i<len;i++){
			renderData[i] = data[i][type];
		}
	} else {
		step = parseInt(data.length/width)+1;
		var avg, cnt;
		for(var i=0,len=data.length;i<len;i+=step){
			avg = cnt = 0
			for(var j=i;j<i+step;j++){
				if(!data[j]) break;
				avg += parseInt(data[j][type]);
				cnt++;
			}
			if(cnt != 0) avg = avg/cnt;
			renderData.push(avg);
		}
		width = renderData.length;
	}
	if(canvas.width > width){
		move_left_by = canvas.width/width;
	}
	context.translate(0, height);
	context.scale(1, -1);
	context.fillStyle = '#fff';
	context.fillRect(0, 0, width, height);
	var left = 0,
		prev_stat = renderData[0]*ratio;
	for(var i=0,len=renderData.length;i<len;i++) {
		the_stat = renderData[i]*ratio;
		context.beginPath();
		context.moveTo(left, prev_stat);
		context.lineTo(left+move_left_by, the_stat);
		context.lineWidth = 2;
		context.lineCap = 'round';
		context.stroke();
		prev_stat = the_stat;
		left += move_left_by;
	}
}