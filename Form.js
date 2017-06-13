var imgBase64;
function formSubmission(frm)
{
	var formObj={};
	for(var i=0;i<frm.elements.length-1;i++)
	{
		var inputType=frm.elements[i].type;
		switch(inputType)
		{
			case "text":
						formObj[frm.elements[i].name]=frm.elements[i].value;
						break;
			case "number":
						formObj[frm.elements[i].name]=frm.elements[i].valueAsNumber;
						break;
			case "checkbox":
							if(frm.elements[i].checked==true)
								formObj[frm.elements[i].name]=frm.elements[i].value;
						break;
			case "email":
						formObj[frm.elements[i].name]=frm.elements[i].value;
						break;
			case "radio":
						if(frm.elements[i].checked==true)
							formObj[frm.elements[i].name]=frm.elements[i].value;
						break;
			case "textarea":
						formObj[frm.elements[i].name]=frm.elements[i].value;
						break;
			case "file":
						formObj[frm.elements[i].name]=imgBase64;
						break;
		}
	}
	var jsonObj=JSON.stringify(formObj);
	alert(jsonObj);
	return false;
} 
function listFiles(e)
{
	var file=e[0];
	var reader = new FileReader();
	reader.onload = function(event)
	{
		imgBase64=btoa(event.target.result);
	};
	reader.readAsBinaryString(file);
}
