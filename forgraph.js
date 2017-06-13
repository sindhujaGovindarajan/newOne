function $(id)
{
	return document.getElementById(id);
}
function createDashPlaceholders()
{
	var obj = new xmlRequest();
	obj.getResponse("post","/",JSON.stringify({"request":"systemHome"}),'application/json',function(sysHome_resp)
	{
		if(sysHome_resp.success)
		{
			SetValStatic('Inst_Time_Val',DatetoString(sysHome_resp.commissionedOn));
			SetValStatic('Act_Apps_Val',sysHome_resp.applications);
			SetValStatic('License_Val','Expiry Date : '+DatetoString(sysHome_resp.license.validity)+'<br/>Nodes : '+sysHome_resp.license.nodeCount);
			$('userCount').innerHTML += ' ('+sysHome_resp.users+')';
			$('licensedUserCount').innerHTML += ' ('+sysHome_resp.license.users+')';
			drawChart(sysHome_resp,'sysHome');
		}
		else showPopup(sysHome_resp.errorstring,'thumbsDown.png');
	});
	obj.getResponse("post","/",JSON.stringify({"request":"getSystemUsage"}),'application/json',function(resp)
	{
		if(resp.success)
		{	
			$('cpu_used').innerHTML += ' ('+(resp.cpu).toFixed(2)+'%)';
			drawChart(resp,'sysdet');
			drawProgressBar(resp);
		}
		else showPopup(resp.errorstring,'thumbsDown.png');
	});
}
function SetValStatic(elem,value)
{
	$(elem).innerHTML = value;
}
/* The function expects values converted to percentage as input*/
function drawGraph(id,width,height,barwidth,bars,gap,data)
{
	while($(id).firstChild)
		$(id).firstChild.parentNode.removeChild($(id).firstChild);
	var elems_remove = $(id).parentNode.parentNode.parentNode.getElementsByTagName('div');
	for(var i=elems_remove.length-1;i>=0;i--)
	{
		if(elems_remove[i].className == 'remove')
		{
			elems_remove[i].parentNode.removeChild(elems_remove[i]);
		}
	}
	var count = data.values.length;
	var spacing = bars*barwidth + gap;
	for(var i=0;i<count;i++)
	{
		var leftpos=10,n=0;
		for(var k=0;k<data.values[i].length;k++)
		{
			var valheight = getht((data.values[i][k]),height);
			if(i>0)
				leftpos =10+(spacing*i) + (k*barwidth);
			else
				leftpos= 10+(k*barwidth);
			if(k==0)
				n=leftpos;
			var toppos = height - valheight;
			var newelem = document.createElement('div');
			newelem.style.cssText = 'width:'+barwidth+'px;position:absolute;height:'+valheight+'px;background:'+data.colors[k]+';top:'+toppos+'px;left:'+leftpos+'px;z-index:1;cursor:default';
			$(id).appendChild(newelem);
		}
		var xhead = document.createElement('div');
		if(i==0)
			var xlft = '10px';
		else
			var xlft = n+'px';
		xhead.style.cssText = 'position:absolute;top:'+(height+10)+'px;font-family:calibri;font-size:10px;text-align:left;left:'+xlft;
		xhead.id = 'x'+id+'scale'+i;
		xhead.className = 'remove';
		xhead.innerHTML = data.names[i];
		$(id).parentNode.appendChild(xhead);
	}
	for(var j=0;j<=10;j++)
	{
		var yhead = document.createElement('div');
		var yheadpos = height-((j*height)/10);
		if(j!=0)
			yhead.style.cssText ='position:absolute;top:'+yheadpos+'px;left:0px;border-top:1px solid #d8d8d8;width:'+(leftpos+barwidth)+'px';
		else
			yhead.style.cssText ='position:absolute;top:'+yheadpos+'px;left:0px;border-top:1px solid grey;width:'+(leftpos+barwidth)+'px';
		
		$(id).appendChild(yhead);
		var yscale = document.createElement('div');
		yscale.style.cssText = 'position:absolute;font:10px calibri;top:'+yheadpos+'px;left:0px;line-height:0px;';
		yscale.innerHTML = j*10;
		yscale.id = 'y'+id+'scale'+j;
		yscale.className = 'remove';
		$(id).parentNode.parentNode.parentNode.appendChild(yscale);
	}
	if(leftpos > width)
	{	
		$(id).style.cursor = 'all-scroll';
		$(id).parentNode.parentNode.style.cursor = 'all-scroll';
	}
}
function getht(param,height)
{
	var y = (param*height)/100;
	return y;
}
/* The function expects values converted to percentage as input*/

function drawChart(resp,flag)
{
	var colors = [[  "#d9b38c ","#f28113 "],['#10a7ce','#9acc2d '],['#cae2ad ','#7bb632 '],['#1facd5 ',' #ffc74a ','#fb574f ']];//#ffc74a
	if(flag=='sysdet')
	{
		var CPU_data = {numberOfParts:2,parts:{"pt": [(100-resp.cpu) ,resp.cpu]},colors:{"cs": colors[0]}};
		var cpuChart = new drawdountChart('cpu_Chart');cpuChart.set(80,70, 50, 40);cpuChart.draw(CPU_data);
		var snorkelTX_occ = ((resp.memory.snorkelTX/resp.memory.total)*100).toFixed(2);
		var free_mem = ((resp.memory.free/resp.memory.total)*100).toFixed(2);
		var othrs_occ = (((resp.memory.total-(resp.memory.snorkelTX+resp.memory.free))/resp.memory.total)*100).toFixed(2);
		
		$('snorkel_used').innerHTML += ' ('+snorkelTX_occ+'%)';
		$('others_used').innerHTML += '<br> ('+othrs_occ+'%)';
		$('mem_free').innerHTML += ' ('+free_mem+'%)';
		
		var memory_data = {numberOfParts:3,parts:{"pt": [snorkelTX_occ ,free_mem,othrs_occ]},colors:{"cs": colors[3]}};
		var memory_chart = new drawdountChart('Memory_chart');memory_chart.set(80, 70, 50, 40);memory_chart.draw(memory_data);
	}
	if(flag=='sysHome')
	{
		var userCount = (resp.users/resp.license.users)*100;
		userCount = userCount.toFixed(2);
		var licensedCount = 100-userCount;
		var usercount_data = {numberOfParts:2,parts:{"pt": [userCount,licensedCount]},colors:{"cs": colors[1]}};
		var usercount_chart = new drawdountChart('Usercount_Chart');usercount_chart.set(80, 70, 50, 40);usercount_chart.draw(usercount_data,true);
	}
}
/* The function expects values converted to percentage as input*/
function drawdountChart(id)
{
	var chart  = document.getElementById(id);
	var canvas = chart.getContext("2d");
//(60, 60, 40, 10)
	this.set = function( x, y, radius,lineWidth)
	{
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.lineWidth = lineWidth;
	 }
	this.clearCanvas = function(width,height){canvas.clearRect(0,0,width,height);}
	this.draw = function(data,half)
	{
		canvas.lineWidth = this.lineWidth;
		var numberOfParts = data.numberOfParts;
		var parts = data.parts.pt;
		var colors = data.colors.cs;
		var df = 0; var radians = Math.PI*2;//keep track of how far round the donut we are.
		if(half == true && half!= null && half!= undefined)
		{	
			df = Math.PI; radians = Math.PI;
		}	
		for(var i = 0; i<numberOfParts; i++) {
		  canvas.beginPath();
		  canvas.strokeStyle = colors[i];
		  canvas.arc(this.x, this.y, this.radius, df, df + radians * (parts[i] / 100)); 
		  canvas.stroke();
		  df += radians * (parts[i] / 100);
		}
	}
	this.drawCenter = function()
	{
		canvas.beginPath();
		canvas.fillStyle = '#000';
		canvas.arc(this.x, this.y,2, 0, Math.PI*2); 
		canvas.fill();
	}
	this.drawNiddle = function(angle,length)		/* Angle has to be passed in radians */
	{
		canvas.beginPath();
		canvas.save();
		canvas.translate(this.x,this.y);
		canvas.rotate(angle);
		canvas.moveTo(0,0); 
		canvas.lineTo(-3, 3); 
		canvas.lineTo(-length,0); 
		canvas.lineTo(0,-3 ); 
		canvas.lineTo(0, 0); 
		canvas.fillStyle = '#000';
		canvas.fill();
		canvas.restore();
	}
}

document.onmousedown = function(e)
{
	if(e.target.id == "bar_graph_nodes" || e.target.id == "bar_graph_requests" || e.target.id == "Nodes_Inner1" || e.target.id == "Requests_Inner2" )
	{
		var target_elm_id = e.target.id;
		var flg=true;
		var parent=e.target.parentNode;
		var pos = parent.offsetLeft + e.clientX;
		var data,parnt;
		if(target_elm_id == 'bar_graph_nodes' || target_elm_id == 'Nodes_Inner1')
			scroll_div = $('Nodes_Inner1');
		else
			scroll_div=$('Requests_Inner1'); 
		dragndrop(flg,pos,scroll_div);
	}
};

document.onmouseup = function()
{
	var flg=false;
	dragndrop(flg);
};

function dragndrop(flag,pos,parent)
{	
	if(flag)
	{
		document.onmousemove=function(e)
		{
			parent.scrollLeft += pos - (e.clientX);
			pos = e.clientX;			
		}
	}
	else
		document.onmousemove=function(){return false;};
}
function lineGraph(id,parent)
{
	var canvas = document.getElementById(id);
	var pointer=id+'pointer',maxY;
	this.context = canvas.getContext('2d');
	this.width = this.context.canvas.width;
	this.height = this.context.canvas.height;
	this.axisX = this.width;
	this.axisY = this.height;
	this.drawAxis = function(){this.context.beginPath();this.context.moveTo(0,0);this.context.lineTo(0,this.height);this.context.moveTo(0,this.height);this.context.lineTo(this.width,this.height);this.context.closePath();this.context.lineWidth = 2;this.context.strokeStyle = 'blue';this.context.stroke();}
	this.drawGraph= function(points,colors)
		{	
			this.clearCanvas();
			this.drawBackground();
			var data = [];
			maxY = points.max;
			for(var k=0;k<points.data.length;k++)
			{
				for(var m=0;m<(points.data[k].length-1);m++)
				{
					var x1 = ((m/(points.data[k].length-1))*this.axisX), y1 = this.height-((points.data[k][m]['bandwidth']/maxY)*this.axisY), x2 = (((m+1)/(points.data[k].length-1))*this.axisX), y2 = this.height-((points.data[k][m+1]['bandwidth']/maxY)*this.axisY);
					data.push({'bandwidth':points.data[k][m]['bandwidth'],'time1':points.data[k][m].time,'time2':points.data[k][m+1].time,'startX':x1,'startY':y1,'endX':x2,'endY':y2,'nextbandwidth':points.data[k][m+1]['bandwidth']});
					this.context.beginPath();
					this.context.lineWidth = 1.5;
					this.context.moveTo(x1,y1);
					this.context.lineTo(x2,y2);
					this.context.strokeStyle = colors[k];
					this.context.stroke();
					this.context.closePath();
					this.drawPoints(x1,y1,colors[k]);
					this.drawPoints(x2,y2,colors[k]);
				}
			}
		}
	this.drawPoints = function (x,y,color){this.context.beginPath();this.context.moveTo(x,y);this.context.arc(x,y,2,0,Math.PI*2);this.context.strokeStyle = color;this.context.stroke();}
	this.drawBackground = function(){var gap = Math.floor(this.height/5);var i=gap;while(i<this.height){this.context.beginPath();this.context.lineWidth = 0.5;this.context.moveTo(0,this.height-(i+0.5));this.context.lineTo(this.width,this.height-(i+0.5));this.context.strokeStyle ='grey';this.context.stroke();this.context.closePath();i+=gap;}};
	this.clearCanvas = function(){
		if(this.context)
		this.context.clearRect(0,0,this.width,this.height);	
	}
}
function drawProgressBar(resp)
{	
	var len = (resp.disk.length<=5)?resp.disk.length:5;//changed after release
	for(var j=0;j<len;j++)
	{
		var tot_disk = (resp.disk[j].totalDisk)*1024; //change to bytes from KB
		if(tot_disk>(1024*1024*1024)) tot_disk = (tot_disk/(1024*1024*1024)).toFixed(0)+' GB';
		else tot_disk = (tot_disk/(1024*1024)).toFixed(0)+' MB';
		$('Disk_Details').innerHTML += '<div id="parentDisk_'+j+'" style="position:relative;margin:1% auto;width:95%;height:6%;"><div class="Dash_Inner" style="position:relative;float:left;font:0.8em calibri;max-width:27%;width:27%;top:0px;text-align:left;">'+resp.disk[j].volumeName+'</div><div style="float:left;width:35%;top:5%;height:90%;border-radius:4px;overflow:hidden"><div id="usage'+j+'" style="float:left;width:'+resp.disk[j].usage+'%;height:100%;border-radius:3px 0px 0px 3px;background:#1f3a93"></div><div id="free'+j+'" style="position:relative;display:inline-block;width:'+(100-resp.disk[j].usage).toFixed(0)+'%;height:100%;background-color:#89c4f4;border-radius:0px 3px 3px 0px;"></div></div><span style="font:0.8em calibri;">&nbsp;'+resp.disk[j].usage+'% out of '+tot_disk+'</span></div><br>';
	if(resp.disk[j].usage==0) $('free'+j).style.borderRadius ='3px';
	}
	var marker1 = document.createElement('div');
	marker1.style.cssText = 'position:absolute;bottom:2%;left:27%';
	marker1.innerHTML = "<div style='width:7px;height:7px;background-color:#1f3a93'></div><span id='userCount' style='position:relative;left:17px;top:-12px;'>Occupied</span>";
	var marker2 = document.createElement('div');
	marker2.style.cssText = 'position:absolute;bottom:2%;left:63%';
	marker2.innerHTML = "<div style='width:7px;height:7px;background-color:#89c4f4;'></div><span id='userCount' style='position:relative;left:14px;top:-12px;'>Free</span>";
	$('Disk_Details').appendChild(marker1);
	$('Disk_Details').appendChild(marker2);
}