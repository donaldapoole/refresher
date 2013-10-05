/**
 * Author: Tony Coculuzzi
 * Date: 2013-09-29
 * Time: 1:39 PM
 */

var TAB_STATE_ACTIVE = 0;
var TAB_STATE_INACTIVE = 1;

var MESSAGE_START = "refresher-start";
var MESSAGE_STOP = "refresher-stop";
var MESSAGE_RESTART = "refresher-restart";
var MESSAGE_FOUND = "refresher-found";

var timer;
var tabs;

window.onload = function() {
	tabs = new Array();
	timer = setInterval(tick, 1000);
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	//console.log("background.js :: received message: " + message.type);
    switch(message.type) {
        case "refresher-start":
            startRefresher(message.tab, message.seconds, message.find);
            break;
        case "refresher-stop":
            stopRefresher(message.tab);
            break;
    }
    return true;
});

function startRefresher(tab, s, f){
	console.log("Timer Started:\n" + s + " seconds \nFind: " + f + " \nTab " + tab.title);
	tabs[tab.id] = {};
	tabs[tab.id].tab = tab;
	tabs[tab.id].state = TAB_STATE_ACTIVE;
	tabs[tab.id].seconds = s;
	tabs[tab.id].find = f;
	tabs[tab.id].ticks = 0;
	tabs[tab.id].badge = "";
}

function stopRefresher(tab){
	console.log("Timer Stopped \nTab: " + tab.title);
	tabs[tab.id].state = TAB_STATE_INACTIVE;
	tabs[tab.id].badge = "";
	//clearBadge();
	//timer = clearInterval(timer);
}

function tick(){
	
	for (var i = 0; i<tabs.length; i+=1) {
		var tab = tabs[i];
		if (tab == null) continue;
		if (tab.state == TAB_STATE_INACTIVE) continue;
		
		if(tab.ticks == tab.seconds){
			updateBadge(i);
			//checkForText();
			continue;
		}
		updateBadge(i);
		tab.ticks += 1;
		console.log("Tick: " + tab.tab.title);
	}
	
	/*
	if(ticks == seconds){
		updateBadge();
		checkForText();
		return;
	}
	console.log("Ticks: " + ticks.toString());
	updateBadge();
	
	ticks += 1;
	*/
}

function updateBadge(tabIndex){
	
	if (tabs[tabIndex].state == TAB_STATE_INACTIVE){
		tabs[tabIndex].badge = "";
		return;
	}
	
	var zero = ((tabs[tabIndex].seconds-tabs[tabIndex].ticks) < 10) ? "0" : "" ;
	var newString = "0:" + zero + (tabs[tabIndex].seconds - tabs[tabIndex].ticks);
	tabs[tabIndex].badge = newString;
	//chrome.browserAction.setBadgeText({text: newString});	
}

function showNotification(){
	document.getElementById('refresher-audio').play();
	var options = {
		type: "basic",
		title: "Found text!",
		message: "Text [text] was found!",
		iconUrl: "../images/icons/notification_80x80.png"
	}
	var id = "refresher-notification-" + guid();
	console.log(id);
	chrome.notifications.create(id, options, function(id){});
}


/* GUID */
function s4() {
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

function guid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

