var mygraph = {
  'xValues':['Oct-16','Nov-16','Dec-16','Jan-17','Feb-17','Mar-17'],
  'yValues':[[216.26,416.26,1516.26,596.26,916.26,316.26]],
  'graphWithoutWebworker':function()
  {
    mygraph.setInnerHTML('container_1');
  },
  'graphWithWebworker':function(content)
  {
    $('container_2').innerHTML = content;
  },
  'setInnerHTML':function(containerId)
  {
    var graphCont = $(containerId);
    graphCont.innerHTML = makeStackedBar({'width':graphCont.offsetWidth,'height':graphCont.offsetHeight, 'xvalues':mygraph.xValues,'graphstroke':'#2c58ff', 'values':mygraph.yValues,'xlabel':{fontSize:'13px',fontWeight:'normal',fontFamily:"Helvetica",color:'#404040',text:'Last 6 Months	&rarr;'},'ylabel':{fontSize:'13px',fontWeight:'normal',fontFamily:"Helvetica",color:'#404040',text:'Amount (Rs.)	&rarr;'},'yDivisionCount':4,'graphdimensions':[graphCont.offsetWidth*0.12,graphCont.offsetHeight *0.08,graphCont.offsetWidth * 0.8, graphCont.offsetHeight * 0.55],'colors':['#72b0ff']});
  }
};
function init()
{
  var worker = new Worker("worker.js");
  var graphCont = $('container_2');
  var obj = {'width':graphCont.offsetWidth,'height':graphCont.offsetHeight, 'xvalues':mygraph.xValues,'graphstroke':'#2c58ff', 'values':mygraph.yValues,'xlabel':{fontSize:'13px',fontWeight:'normal',fontFamily:"Helvetica",color:'#404040',text:'Last 6 Months	&rarr;'},'ylabel':{fontSize:'13px',fontWeight:'normal',fontFamily:"Helvetica",color:'#404040',text:'Amount (Rs.)	&rarr;'},'yDivisionCount':4,'graphdimensions':[graphCont.offsetWidth*0.12,graphCont.offsetHeight *0.08,graphCont.offsetWidth * 0.8, graphCont.offsetHeight * 0.55],'colors':['#72b0ff']};
  worker.postMessage({'subject':'plotGraph','graphInputObj':obj});
  worker.onmessage = function(e)
  {
    var data = e.data;
    if(data.data.subject=='setGraph')
      mygraph.graphWithWebworker(data.data.content);
  };
  mygraph.graphWithoutWebworker();
}
function $(id)
{
  return document.getElementById(id);
}