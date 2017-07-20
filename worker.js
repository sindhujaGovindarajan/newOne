self.addEventListener('message',function(e) {
  var workerdata = e.data;
  var worker_svgContent = {
    'makeStackedBar':function(params,callback)
    {
      var defaultColors = ['#078823','#b82223','#6495ED','#FF1493'];
      var xstart,ystart,graphwidth,graphheight;
      var yDivisionCount = (params.yDivisionCount)?params.yDivisionCount:4;
      var colors = params.colors || defaultColors;

      //every array in the values should be of the same length..
      var sums = [];
      var aggregates = [];
      var maxrange= 0;
      for(var i=0;i<params.values.length;i++)
      {
        for(var j=0;j<params.values[0].length;j++)
        {
          sums[j] = sums[j] || 0;
          sums[j] += (params.values[i][j] || 0);
          aggregates[j] = aggregates[j] || [];
          aggregates[j].push(params.values[i][j]);
        }
      }
      var max = Math.max.apply(null,sums);
      var height = params.height;
      var width = params.width;	
      if(params.hasOwnProperty('graphdimensions'))
      {
        xstart =params.graphdimensions[0];
        ystart =params.graphdimensions[1];
        graphwidth =params.graphdimensions[2];
        graphheight = params.graphdimensions[3];
        //}		
      }	
      else
        [xstart,ystart,graphwidth,graphheight] = [width*0.1,height * 0.1,width * 0.8, height * 0.8];

      if(max <=10)
      {
        if(max%yDivisionCount != 0)
          maxrange = max+(yDivisionCount-(max%yDivisionCount));
        else maxrange =max;
      }
      else
      {
        var maxrange = Math.pow(10,Math.round(worker_svgContent.getBaseLog(10,max)));
        if(maxrange < max)
          maxrange = Math.ceil(max/maxrange)*maxrange;
      }	
      var maxbarheight = (params.maxbarheight * graphheight) || (height * 0.7);	// Where the max of value range will lie on the graph
      var heightCoeff = maxbarheight/maxrange;
      var barinterval = (graphwidth/aggregates.length);
      var barwidth = barinterval * 2/3;

      // Now let us do the graph
      var svgstr = '<svg width="'+width+'" height="'+height+'" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">';
      //svgstr += '<title>Stacked Bar Graph</title>';

      // X and Y axes

      svgstr += '<path fill="none" stroke="'+params.graphstroke+'" stroke-width="2px" d="M'+xstart+','+ystart+' L'+(xstart)+','+(ystart+graphheight)+' '+(xstart+graphwidth)+','+(ystart+graphheight)+'" />';
      svgstr += '<text x="'+(xstart-25)+'" y="'+(height/2)+'" text-anchor="middle" style="text-anchor: middle; color:"'+params.ylabel.color+'" ;font:"'+params.ylabel.fontWeight+' '+params.ylabel.fontSize+' '+params.ylabel.fontFamily+'" font="'+params.xlabel.fontSize+'&quot;'+params.xlabel.fontFamily+'&quot;" stroke="none" fill="'+params.ylabel.color+'" transform="rotate(-90 '+(xstart-45)+' '+(height/2)+')" font-family='+params.ylabel.fontFamily+' font-size='+params.ylabel.fontSize+' font-weight='+params.ylabel.fontWeight+' >'+params.ylabel.text+'</text>';

      svgstr += '<text x="'+(width/2)+'" y="'+(ystart+graphheight+40)+'" text-anchor="middle" style="text-anchor: middle; color:"'+params.xlabel.color+'" ; font:"'+params.xlabel.fontWeight+' '+params.xlabel.fontSize+' '+params.xlabel.fontFamily+'" font="'+params.xlabel.fontSize+'&quot;'+params.xlabel.fontFamily+'&quot;" stroke="none" fill="'+params.xlabel.color+'" font-family='+params.xlabel.fontFamily+' font-size='+params.xlabel.fontSize+' font-weight='+params.xlabel.fontWeight+'>'+params.xlabel.text+'</text>';	
      var yOrigin = ystart+graphheight;

      var Labels = '';
      for(var i=1;i<=yDivisionCount;i++)
      {
        var yReading = (i*(maxrange/yDivisionCount)>=10000000)?((i*(maxrange/yDivisionCount))/10000000+"Cr"):(i*(maxrange/yDivisionCount)>=100000)?((i*(maxrange/yDivisionCount))/100000+"L"):(i*(maxrange/yDivisionCount)>=1000)?((i*(maxrange/yDivisionCount))/1000+"k"):Math.round(i*(maxrange/yDivisionCount));
        svgstr += '<path fill="none" style="stroke:'+params.ylabel.color+'; stroke-width;2px; stroke-linejoin:round; stroke-linecap:round;" d="M'+xstart+','+(yOrigin-((maxrange/yDivisionCount)*heightCoeff*(i)))+' L'+(xstart-5)+','+(yOrigin-((maxrange/yDivisionCount)*heightCoeff*(i)))+ '"/>';
        Labels += '<text x="'+(xstart-25)+'" y="'+(yOrigin+2-((maxrange/yDivisionCount)*heightCoeff*(i)))+'" text-anchor="middle" style="text-anchor: middle; font: bold 10px ;" font="10px &quot;'+params.ylabel.fontFamily+'&quot;" stroke="none" fill="'+params.ylabel.color+'"  font-family="'+params.ylabel.fontFamily+'" font-size="10px" font-weight="bold">'+yReading+'</text>';
      }
      svgstr += Labels;

      Labels = '';
      currentX = xstart+(barinterval)/2;
      for(var i=0;i<params.xvalues.length;i++)
      {
        Labels += '<text x="'+(currentX)+'" y="'+(yOrigin+15)+'" text-anchor="middle" style="text-anchor: middle; font: bold 10px '+params.ylabel.fontFamily+';" font="10px &quot;'+params.ylabel.fontFamily+'" stroke="none" fill="#000000"  font-family="'+params.ylabel.fontFamily+'" font-size="10px" font-weight="bold">'+params.xvalues[i]+'</text>';
        currentX += barinterval;
      }
      svgstr += Labels;

      currentX = xstart+(barinterval-barwidth)/2;
      //  var fname = 'bgcb';
      var count = 0;
      // while(window[fname]) {fname = fname.slice(0,4)+count;count++};

      // if(callback) window[fname] = callback;
      for(var i=0;i<aggregates.length;i++)
      {
        var ypos = ystart+graphheight;
        //if(callback) svgstr += '<g onClick="'+fname+'(\''+params.xvalues[i]+'\');">';
        //else if(callback===undefined) svgstr += '<g>';
        if(callback===undefined) svgstr += '<g>';

        for(var j=0;j<aggregates[i].length;j++)
        {
          var bubble = 
              svgstr += '<title>'+aggregates[i]+'</title><rect x="'+currentX+'" y="'+(ypos-(aggregates[i][j]*heightCoeff))+'" width="'+barwidth+'" height="'+(aggregates[i][j]*heightCoeff)+'" style="fill:'+colors[j]+'; stroke:none;"  /><text text-anchor="middle" x="'+(currentX+(barwidth/2))+'" y="'+(ypos-(aggregates[i][j]*heightCoeff)-5)+'" font-size="0.7em" fill="#404040">'+aggregates[i]+'</text>';
          ypos -= (aggregates[i][j]*heightCoeff);
        }
        svgstr += '<rect x="'+currentX+'" y="'+(ystart+graphheight-(sums[i]*heightCoeff))+'" width="'+barwidth+'" height="'+(sums[i]*heightCoeff)+'" style="fill:none;cursor:default;" /> </g>'
        currentX = currentX+barinterval;
      }

      svgstr += '</svg>';
      return svgstr;
    },
    'getBaseLog':function(x, y) {
      return Math.log(y) / Math.log(x);
    }
  };

  switch(workerdata.subject)
      {
    case 'plotGraph':
      self.postMessage({'data':{'subject':'setGraph','content':worker_svgContent.makeStackedBar(workerdata.graphInputObj)}});
      break;
    default:
      break;
  }
});