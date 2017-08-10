personalSettings={
	"auth":null,
	"linenum":4,        // 固定
	"date":(new Date()).getTime(),
	"containers":[
		{
			"order":0,
			"lineid":0,
			"name":"Twitter",
			"design":0,
			"items":[
				{
					"order":0,
					"initial":"T",
					"name":"Twitter",
					"iconbgcolor":"#4AF",
					"iconfontcolor":"#FFF",
					"addr":"https://twitter.com/"
				},{
					"order":1,
					"initial":"mT",
					"name":"Mai Twitter",
					"iconbgcolor":"#4AF",
					"iconfontcolor":"#FFF",
					"addr":"https://twitter.com/m_buyoh/"
				}
			]
		}
	]
};

selectedElement=null;
selectMode="view";

$(document).ready(function(){
	$('#settingsBox').hide();

	initBindEvent();

	loadPersonalSettingsFromLocal();
	containersFlush();
});

$(window).on("unload",function(){
	storePersonalSettingsToLocal();
	storePersonalSettingsToWeb();

});

function loadPersonalSettingsFromLocal(){
	try{
		var r=JSON.parse(localStorage.personalSettings);
		personalSettings=r;
		personalSettings.date=(new Date()).getTime();
		logwriteln("Success loading local settings");
	}catch(e){
		logwriteln("!!Failed loading local settings ->"+e);
	}
}

function storePersonalSettingsToLocal(){
	try{
		personalSettings.date=(new Date()).getTime();
		localStorage.personalSettings=JSON.stringify(personalSettings);
		logwriteln("Success storing local settings");
		storePersonalSettingsToWeb();
	}catch(e){
		logwriteln("!!Failed storing local settings ->"+e);
	}
}

function clearLocalStorageAll(){
	localStorage.clear();
}

function loadPersonalSettingsFromWeb(){

}

function storePersonalSettingsToWeb(){ // TODO:古いなら保存しない+force実装
	return;

	if (!chrome) return;
	try{
		chrome.storage.StorageArea.set(JSON.stringify(personalSettings));
		logwriteln("Success storing local settings");
		storePersonalSettingsToWeb();
	}catch(e){
		logwriteln("!!Failed storing local settings ->"+e);
	}

}

function authorizeGoogle(){

}

function logoutGoogle(){
	
}

function appendContainer(){
	var line=$("#ec_line").val();
	var name=$("#ec_name").val();
	var cont={};
	cont.order=personalSettings.containers.length;
	cont.lineid=line;
	cont.name=name;
	cont.design=0;
	cont.items=[];
	personalSettings.containers.push(cont);
	containersFlush();
}

function appendItem(){
	if (selectedElement===null){
		alert("You have to select a container.");
		return ;
	}
	var target=$(selectedElement.currentTarget);
	if (target.is(".iconItem")){
		alert("You have to select a container.");
		return ;
	}

	var name=$("#ia_name").val();
	var init=$("#ia_init").val();
	var addr=$("#ia_addr").val();
	var bg_c=$("#ia_bgc").val();
	var tx_c=$("#ia_ftc").val();
	var parentContainer=selectedElement.data.order;

	if (name===""){
		return ;
	}

	var order=personalSettings.containers[parentContainer].items.length;

	var json = {
		"order":order,
		"initial":init,
		"name":name,
		"iconbgcolor":bg_c,
		"iconfontcolor":tx_c,
		"addr":addr
	}

	personalSettings.containers[parentContainer].items.push(json);

	containersFlush();

}
function removeSelected(){
	if (selectedElement===null) return;

	if (!confirm("Are you sure this component will be removed?")) return;

	var target=$(selectedElement.currentTarget);
	var order=selectedElement.data.order;

	if (target.is(".containerName")){
		personalSettings.containers.splice(order,1);
		for (var i=0;i<personalSettings.containers.length;i++){
			personalSettings.containers[i].order=i;
		}
	}else if (target.is(".iconItem")){
		if (target.data("parent")===undefined) return;
		var parentOrder=target.data("parent");
		personalSettings.containers[parentOrder].items.splice(order,1);
		for (var i=0;i<personalSettings.containers[parentOrder].items.length;i++){
			personalSettings.containers[parentOrder].items[i].order=i;
		}
		
	}
	selectedElement=null;
	containersFlush();
	selectedFlush();
}

function containersFlush(){
	var domroot=$("#linkSet");
	domroot.empty();

	var domlines=new Array(personalSettings.linenum);
	for (var i=0;i<domlines.length;i++){
		domlines[i] = $('<div class="border flexcontainer center"></div>').data("index",i);
	}

	personalSettings.containers.sort(function(l,r){return (l.order-r.order);});

	for (var i=0;i<personalSettings.containers.length;i++){
		var cont = personalSettings.containers[i];
		var contline = cont.lineid-0;
		domlines[contline].append(generateContainer(cont));
	}

	for (var i=0;i<domlines.length;i++){
		domroot.append(domlines[i]);
	}
}


function iconSampleFlush(){
	var inin = $("#ia_init").val();
	var name = $("#ia_name").val();
	var addr = $("#ia_addr").val();
	var bg_c = $("#ia_bgc").val();
	var tx_c = $("#ia_ftc").val();

	if (inin=="")
		inin="T";
	if (name=="")
		name="Twitter";

	var json = {
		"initial":inin,
		"name":name,
		"iconbgcolor":bg_c,
		"iconfontcolor":tx_c,
		"addr":null,
		"order":null
	}
	$("#ia_sampleView > .iconItem").replaceWith(generateIconItem(json));
}

function generateContainer(json){
	var contname = json.name;
	var domcont = $('<div class="container border notext"></div>');

	domcont.append($('<div class="lightHeader"></div>').append($('<a class="containerName">'+contname+'</a>').click({"order":json.order},containerAction)));
	domcont.addClass("design"+json.design);

	if (json.items!=null && json.items.length>0){
		json.items.sort(function(l,r){return l.order-r.order;});
		for (var j=0;j<json.items.length;j++){
			var item = json.items[j];
			domcont.append(generateIconItem(item).data("parent",json.order));
		}
	}
	return domcont;
}

function generateIconItem(json){
	var item = $('<div class="iconItem"></div>');
	var icon = $('<div class="ii_icon"></div>');
	var text = $('<div class="ii_name"></div>');

	item.data("addr",json.addr).click({"addr":json.addr,"order":json.order},iconAction).on("contextmenu",{"addr":json.addr},iconContextmenu);
	icon.append(json.initial).css("background-color",json.iconbgcolor).css("color",json.iconfontcolor);
	text.append(json.name);
	item.append(icon).append(text);
	return item;
}

function iconContextmenu(obj){

	if (obj.data.addr==null){
		return ;
	}

	switch(selectMode){
		case "view":
		case "select":
			window.open(obj.data.addr);
			obj.stopImmediatePropagation();
		case "swap":
			break;
	}
}

function iconAction(obj){
	if (obj.data.addr==null){
		return ;
	}

	switch(selectMode){
		case "view":
			location.href=obj.data.addr;
			break;
		case "swap":
			if (selectedElement!==null){
				var target=$(selectedElement.currentTarget);
				if (target.is(".iconItem")){
					swapItem(selectedElement,obj);
				}else{
					moveItem(selectedElement,obj);
				}
				selectedElement=null;
				selectedFlush();
				break;
			}
			selectedElement=obj;
			selectedFlush();
			break;
		case "select":
			selectedElement=obj;
			selectedFlush();
			$("#button_removeSelected").removeAttr("disabled");
			$("#button_cancelSelected").removeAttr("disabled");
			$("#button_editSelected").removeAttr("disabled");
			$("#button_cntTypeTglSelected").attr("disabled","disabled");
			break;
	}
}

function containerAction(obj){
	switch(selectMode){
		case "view":
			break;
		case "swap":
			if (selectedElement!==null){
				var target=$(selectedElement.currentTarget);
				if (target.is(".containerName")){
					swapContainer(selectedElement,obj);
				}else{
					moveItem(obj,selectedElement);
				}
				selectedElement=null;
				selectedFlush();
				break;
			}
			selectedElement=obj;
			selectedFlush();
			break;
		case "select":
			selectedElement=obj;
			selectedFlush();
			$("#button_removeSelected").removeAttr("disabled");
			$("#button_cancelSelected").removeAttr("disabled");
			$("#button_editSelected").removeAttr("disabled");
			$("#button_cntTypeTglSelected").removeAttr("disabled");
			break;
	}
}

function selectedFlush(){
	var dom=$("#modeDetail");
	dom.empty();
	if (selectedElement===null){
		$("#button_removeSelected").attr("disabled","disabled");
		$("#button_cancelSelected").attr("disabled","disabled");
		$("#button_editSelected").attr("disabled","disabled");
		$("#button_cntTypeTglSelected").attr("disabled","disabled");
		return ;
	}
	var target=$(selectedElement.currentTarget);

	if (target.is(".containerName")){
		dom.append("[container] - "+target.text());
	}else if (target.is(".iconItem")){
		dom.append("[icon] - "+target.find(".ii_name").text());
	}
}

function swapContainer(objl,objr){

	//var targetl=$(objl.currentTarget);
	var orderl =objl.data.order;
	//var targetr=$(objr.currentTarget);
	var orderr =objr.data.order;

	if (orderl==orderr) return;

	personalSettings.containers[orderl].order=orderr;
	personalSettings.containers[orderr].order=orderl;

	var tline=personalSettings.containers[orderl].lineid;
	personalSettings.containers[orderl].lineid=personalSettings.containers[orderr].lineid;
	personalSettings.containers[orderr].lineid=tline;

	var tjson=personalSettings.containers[orderl];
	personalSettings.containers[orderl] = personalSettings.containers[orderr];
	personalSettings.containers[orderr] = tjson;

	containersFlush();
}

function swapItem(objl,objr){

	var targetl     =$(objl.currentTarget);
	var orderl      =objl.data.order;
	var parentOrderl=targetl.data("parent");
	var targetr     =$(objr.currentTarget);
	var orderr      =objr.data.order;
	var parentOrderr=targetr.data("parent");

	personalSettings.containers[parentOrderl].items[orderl].order=orderr;
	personalSettings.containers[parentOrderr].items[orderr].order=orderl;

	var tjson=personalSettings.containers[parentOrderl].items[orderl];
	personalSettings.containers[parentOrderl].items[orderl] = personalSettings.containers[parentOrderr].items[orderr];
	personalSettings.containers[parentOrderr].items[orderr] = tjson;

	containersFlush();

}

function moveItem(cont,item){
	//var targetc     =$(cont.currentTarget);
	var orderc      =cont.data.order;
	var targeti     =$(item.currentTarget);
	var orderi      =item.data.order;
	var parentOrderi=targeti.data("parent");

	personalSettings.containers[orderc].items.push(personalSettings.containers[parentOrderi].items[orderi]);
	personalSettings.containers[parentOrderi].items.splice(orderi,1);

	for (var i=0;i<personalSettings.containers[parentOrderi].items.length;i++){
		personalSettings.containers[parentOrderi].items[i].order=i;
	}
	for (var i=0;i<personalSettings.containers[orderc].items.length;i++){
		personalSettings.containers[orderc].items[i].order=i;
	}
	containersFlush();
}

function modeChanged(){
	var selected=$("input[name='radioModeSel']:checked").val();

	selectedElement=null;
	selectedFlush();
	selectMode=selected;

	$("#button_removeSelected").attr("disabled","disabled");
}

function cancelSelected(){
	selectedElement=null;
	selectedFlush();
}

function editSelected(){
	if (selectedElement===null) return;

	var target=$(selectedElement.currentTarget);
	var order=selectedElement.data.order;

	if (target.is(".containerName")){
		var elem=personalSettings.containers[order];

		var res=prompt("change a new name here.",elem.name);
		if (res!==null){
			elem.name=res;
			containersFlush();
		}

	}else if (target.is(".iconItem")){
		var parentOrder=target.data("parent");
		var elem=personalSettings.containers[parentOrder].items[order];

		$("#ia_init").val(elem.initial);
		$("#ia_name").val(elem.name);
		$("#ia_addr").val(elem.addr);
		$("#ia_bgc").val(elem.iconbgcolor);
		$("#ia_ftc").val(elem.iconfontcolor);
		iconSampleFlush();
	}

	return 0;
}

function toggleContainerType(){
	if (selectedElement===null) return;

	var target=$(selectedElement.currentTarget);
	var order=selectedElement.data.order;

	if (target.is(".containerName")){
		var elem=personalSettings.containers[order];
		elem.design=(++elem.design)%3;
	}
	containersFlush();
}

function editJsonDirectly(){
	if (!confirm("Are you sure override this json?")) return;
	try{
		var r=JSON.parse($('#textboxjson').val());
		personalSettings=r;
		containersFlush();
	}catch(e){
		alert("failed -> "+e);
	}
}

function logwriteln(text){
	$("#statusbar").prepend($("<div></div>").text(text));
}

function arrayClone(arr){
	return [].concat(arr);
}

function searching(l,r){
	location.href=l+encodeURI($("#search").val())+r;
}


function initBindEvent(){
	$("#btn_search_google").click(function(){searching('https://www.google.co.jp/search?q=','');});
	$("#btn_search_twitter").click(function(){searching('https://twitter.com/search?q=','');});
	$("#btn_search_alc").click(function(){searching('http://eow.alc.co.jp/search?q=','');});

	$("#btn_appearsettings").click(function(){$('#settingsBox').slideToggle();});

	$("#appendIconDivision input").on("change",iconSampleFlush);

	$("#btn_ia_append").click(appendItem);

	$("#mc_radio input").on("change",modeChanged);

	$("#button_removeSelected").click(removeSelected);
	$("#button_cancelSelected").click(cancelSelected);
	$("#button_editSelected").click(editSelected);
	$("#button_cntTypeTglSelected").click(toggleContainerType);

	$("#btn_ec_append").click(appendContainer);

	$("#btn_ctrl_save").click(storePersonalSettingsToLocal);
	$("#btn_ctrl_reload").click(function(){if(confirm('Are you sure reloading?')){loadPersonalSettingsFromLocal();containersFlush();}});

	$("#btn_json_update").click(function(){$('#textboxjson').val(JSON.stringify(personalSettings,null,'  '));});
	$("#btn_json_push").click(editJsonDirectly);
}