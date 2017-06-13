function otlCommon(){
	otlObj=this;
}
otlCommon.prototype={
	ajaxRequest : function(url, data, callback){
		var xmlhttp;
		if(window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
		else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		xmlhttp.open('POST',url, true);
		xmlhttp.onreadystatechange = function() 
		{
			if(xmlhttp.readyState==4)
			{
				if(xmlhttp.status==200)
				{
					var resp = JSON.parse(xmlhttp.responseText);
					if(resp.success == false && resp.hasOwnProperty("errorString") && resp.errorString.toLowerCase() == 'Invalid Session')
						ajaxError(resp);
					callback(resp);
				}
			}
		};
		xmlhttp.setRequestHeader("Content-Type", "application/json");
		xmlhttp.setRequestHeader("Connection", "close");
		var dat = JSON.stringify(data);
		xmlhttp.send(dat);
		return;
	},
	encryptPassword:function(resp,passwordValue)
	{
		if(resp.success)
		{
			var decNonce = B64.decode(resp.nonce);
			var key = decNonce.slice(0,32); 
			var iv = decNonce.slice(32,48);
			var password = passwordValue;
			var input = [];
			for(var i=0;i<password.length;i++)
				input.push(password.charCodeAt(i));
			var pad = 16-(input.length%16);
			var padbuf = [];
			for(var i=0;i<pad;i++)
				padbuf.push(pad);
			input = input.concat(padbuf);
			//encryption
			var aes = new AES();
			var ks = aes.AESEncKeySched(key);
			output = aes.AES_Encrypt(input,ks,iv);
			var encipherPass = B64.encode(output);
			return encipherPass;
		}
		else ajaxError(resp);
	},
	getNonce:function(url,callbck)
	{
		var data = {'request':'getNonce'};
		otlObj.ajaxRequest(url,data, function(nonceResp)
		{
			callbck(nonceResp);
		});
	},
	populateLoginDetails:function(url,data,elemObj)
	{
		otlObj.ajaxRequest(url,data, function(resp)
		{
			if(resp.success)
			{
				$(elemObj.loginname).innerHTML = 'Logged in as: '+resp.adminName;
				$(elemObj.logintime).innerHTML = 'Logged in time: '+DatetoString(resp.loginTime,0);
			}
			else ajaxError(resp);
		});
	},
	logout:function(url,data,navigateTo)
	{
		otlObj.ajaxRequest(url,data, function(resp)
		{
			if(resp.success) window.location.replace(navigateTo);
		});
	}
}
function cancelEvent(ev)
{
	var ev = ev || window.event;
	ev.stopPropagation();
	ev.cancelBubble = true;
	ev.preventDefault();
}
function $(id)
{
	return document.getElementById(id);
}
function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}
function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}
function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}
function displayStyle(obj,sty)
{
	for(var i=0;i<obj.length;i++)
		$(obj[i]).style.display =sty;
}
function DatetoString(ttdate,formatflag)//to convert epoch time into normal date format
{
	if((ttdate === undefined) || (ttdate=='undefined')) return '-';
    else if( ttdate == 0 && formatflag )
        return '--/--/----';
    else if( (ttdate == 0))
        return '--/--/---- --:--:--';
	
    var dt=new Date(parseInt(ttdate*1000));
	var tempDate='',tempMonth='',tempHour='',tempMin='',tempSec='';
 
    tempDate = SetPrefixZero(dt.getDate());
    tempMonth = SetPrefixZero(dt.getMonth()+1);
    tempHour = SetPrefixZero(dt.getHours());
    tempMin = SetPrefixZero(dt.getMinutes());
    tempSec = SetPrefixZero(dt.getSeconds());
 
    if( formatflag )
        var tempDateStr = tempDate +"/"+tempMonth+"/"+dt.getFullYear();
    else
        var tempDateStr = tempDate +"/"+tempMonth+"/"+dt.getFullYear()+"  "+ tempHour + ":" + tempMin + ":" + tempSec ;
    return tempDateStr;
} 
function SetPrefixZero(strval)
{
    return ((strval < 10) ? '0'+ strval : strval);
}
function readFile(fileobj,callback)  //  readCert file
{    
    var tmp = '';
    var datastr = '';
    var fr = new FileReader();
    fr.onload = function(e)
    {
        var data = e.target.result;
        var data2 = data;
        if(typeof data == 'string')
            data = Util.toArray(data);
        else if(data instanceof ArrayBuffer)
            data = new Uint8Array(data);
        if(ASN.isDER(data))
        {
            datastr = B64.encode(data);
            callback(datastr);
        }
        else
        {
            for(var i=0; i<data.length; i++) tmp += String.fromCharCode(data[i]);
            var pem = new RegExp(/-----BEGIN[^-]+-----([A-Za-z0-9+\/=\s]+)-----END[^-]+-----|begin-base64[^\n]+\n([A-Za-z0-9+\/=\s]+)====/);
            if(pem.test(tmp))
            {
                var pem1 = new RegExp(/-----BEGIN [^-]+-----|-----END [^-]+-----|\s|\n|\r/g);
                datastr = tmp.replace(pem1,"");
                callback(datastr);
            }
            else
            {
                fr.onload = function(e2){
                    datastr = e2.target.result;
                    callback(datastr);
                }
                fr.readAsText(fileobj);
            }
        }
    }
    if(fr.readAsArrayBuffer)
        fr.readAsArrayBuffer(fileobj);
    else
        fr.readAsBinaryString(fileobj);
    return;    
}
function ValidatePort(field,fieldname)
{
	if(!field.value.trim().length)
	{
		showAlert('Insufficient data',"Enter "+fieldname);
		return false;
	}
	else
	{
		if(field.value.indexOf(".")!=-1)
		{
			showAlert('Invalid data',fieldname+" should be an integer value");
			return false;
		}
		else if(isNaN(field.value))
		{
			showAlert('Invalid data',fieldname+" should be an integer value");
			return false;
		}
		else if(field.value <= 0 || field.value > 65535)
		{
			showAlert('Invalid data',"Valid "+fieldname+" range is 1-65535");
			return false;
		}
	}
	return true;
}
function ValidateExt(field,Type,fieldname)
{
	if(!field.value.trim().length)
	{
		showAlert('Insufficient data',"Upload the "+fieldname);
		return false;
	}
	var GetExtension = field.value.split(".");
	var Type = parseInt( Type );
	var FileExt = GetExtension[GetExtension.length-1].toLowerCase();
	switch( Type )
	{
		case 1	:	if(FileExt != 'cer' && FileExt != 'crt' && FileExt != 'der')
					{
						showAlert('Invalid certificate',"Select .cer/.crt/.der file");
						return false;
					}
				break;
		case 2	:	if(FileExt != 'p12' && FileExt != 'pfx')
				{
					showAlert('Invalid certificate',"Select .p12/.pfx file");
					return false;
				} 
				break;
		case 3	:	if(FileExt != 'crl')
				{
					showAlert('Invalid certificate',"Select .crl File");
					return false;
				}
				break;
		case 4 : 
				if(FileExt != 'zip')
				{
					showAlert('Invalid certificate',"Select .zip File");
					return false;
				}
				break;
		case 5 :	if(FileExt != 'cer' && FileExt != 'oac' && FileExt != 'crt')
					{
						ShowError('Invalid certificate',"Select .cer/.oac file");
						return false;
					} 
				break;
		default	:	break;
	}
	return true;
}
function calculateDate(str)
{
	var monthObt ='',day='';
	var month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
	var arr1 = str.split(' ');
	for(var i=0;i<arr1.length;i++)
	{
		if(arr1[i].length == 4 && !isNaN(arr1[i]))
			var year = arr1[i];
		if(arr1[i].length == 3)
		{
			for(j=0;j<month.length;j++)
			{
				var temp = arr1[i].toLowerCase();
				if(temp.indexOf(month[j]))
				{
					monthObt = arr1[i];
					break;
				}	
			}
		}
		if((arr1[i].length == 2)&&(Number(arr1[i])<32))
		{
			day= arr1[i];
		}
	}
	var date = 	day+'  '+monthObt+'  '+year;
	return date;
}
function formatChange(str) {
	var n = (str.indexOf("+"))?str.split('+'):str.split('-');
	var m = n[1].split(' ');
	var x=n[1].split('(');
	m[0]= m[0].charAt('0')+m[0].charAt('1')+'.'+m[0].charAt('2')+m[0].charAt('3');
	str = (str.indexOf("+"))?str.split('+'):str.split('-');
	str= str[0]+'+'+m[0]+' ('+x[1];
	return str;
}
function checkIfUndefined(val)
{
	return ((typeof val===undefined) || val=='undefined')?'-':val;
}
function ShowDiv(id)
{
	$(id).style.display="block";
	var pos = otlVLGetPos(dateField);
	$("calendarDiv").style.top = pos[3]+"px";
	$("calendarDiv").style.left = pos[0]+"px";
}
function otlVLGetPos(elem)
{
	var x = elem.offsetLeft;
	var y = elem.offsetTop;
	var xo = elem.offsetWidth;
	var yo = elem.offsetHeight;
	elem = elem.offsetParent;
	while(elem)
	{
		x += elem.offsetLeft;
		y += elem.offsetTop;
		elem = elem.offsetParent;
	}
	return [x, y, x+xo, y+yo];
}
function emptyDiv(id)
{
	$(id).innerHTML="";
}
function HideDiv(id)
{
	$(id).style.display="none";
}