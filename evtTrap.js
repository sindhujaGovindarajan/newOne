function $(tag){return document.getElementsByTagName(tag);}
window.onload = function()
{
	var elemConfig = elemSpot();
	if(elemConfig.getAttribute('onclick')||elemConfig.getAttribute('onmousedown')||elemConfig.			getAttribute('onsubmit'))
	{
		var evtTargetStr = (elemConfig.getAttribute('onclick'))?elemConfig.getAttribute('onclick'):(elemConfig.getAttribute('onmousedown')?elemConfig.getAttribute('onmousedown'):elemConfig.getAttribute('onsubmit'));
		if(evtTargetStr.indexOf('alert')==-1) 
		{
			evtTargetStr = evtTargetStr.split('(')[0];
			var evtTarget = window[evtTargetStr];
		}
		elemConfig.onclick = function(){trap();}
		elemConfig.onmousedown = function(){trap();}
		elemConfig.onsubmit = function(){trap();}
		function trap()
		{
			alert('trapped');
			if(typeof evtTarget==="function") evtTarget();
			else alert(evtTargetStr);
		};
	}
};

function elemSpot()
{
	var elemType = '';
	var elemVal = "submit";
	var element = {};
	if($('form').length)
	{
		var formName='';
		for(var i=0;i<$('form').length;i++)
		{
			if($('form')[i].elements.length)
			{
				for(var j=0;j<$('form')[i].elements.length;j++)
				{
					if($('form')[i].elements[j].value == elemVal) 
					{
						elemType = 'form';
						formName=$('form')[i].name;element=$('form')[i];
						break;
					}
				}
			}
		}
	}
	if($('button').length || $('a').length)
	{
		var len = ($('button').length)?$('button').length:$('a').length;
		var	elem = ($('button').length)?'button':'a';
		
		for(var i=0;i<len;i++)
		{
			if($(elem)[i].value == elemVal) 
			{
				elemType=elem;
				element = $(elem)[i];
				break;
			}
		}
	}
	return element;
}