/**
 * Author: Tony Coculuzzi
 * Date: 2013-09-29
 * Time: 1:39 PM
 */

var TAB_STATE_ACTIVE = 0;
var TAB_STATE_INACTIVE = 1;

var MESSAGE_LOAD = "refresher-load";
var MESSAGE_START = "refresher-start";
var MESSAGE_STOP = "refresher-stop";
var MESSAGE_RESTART = "refresher-restart";
var MESSAGE_FOUND = "refresher-found";

var timer;
var tabs;
var currentTab = 0;

window.onload = function() {
	tabs = new Array();
	timer = setInterval(tick, 1000);
}

chrome.tabs.onHighlighted.addListener(function(tabInfo){
	currentTab = tabInfo.tabIds[0];
	updateCurrentTab();
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	var tab = tabs[tabId];
	if (tab != null) {
		var tempTab = {id: tabId};
		stopRefresher(tempTab);
	}
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch(message.type) {
	case MESSAGE_LOAD:
            getTabInfo(message.tab, sendResponse);
            break;
        case MESSAGE_START:
            startRefresher(message.tab, message.seconds, message.find);
            break;
        case MESSAGE_STOP:
            stopRefresher(message.tab);
            break;
    }
    return true;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.greeting == "hello")
		sendResponse({farewell: "goodbye"});
});

function getTabInfo(t, sendResponse){
	var tab = tabs[t.id];
	if (tab != null) {
		sendResponse({
			seconds: tab.seconds,
			find: tab.find,
			state: tab.state
		});
	}
}

function startRefresher(tab, s, f){
	console.log("Timer Started:\n" + s + " seconds \nFind: " + f + " \nTab " + tab.title);
	tabs[tab.id] = {};
	tabs[tab.id].tab = tab;
	tabs[tab.id].state = TAB_STATE_ACTIVE;
	tabs[tab.id].seconds = s;
	tabs[tab.id].find = f;
	tabs[tab.id].ticks = 0;
	tabs[tab.id].badge = "";
	updateBadge(tab.id);
	updateCurrentTab();
}

function stopRefresher(tab){
	//console.log("Timer Stopped \nTab: " + tab.title);
	tabs[tab.id].state = TAB_STATE_INACTIVE;
	tabs[tab.id].badge = "";
}

function tick(){
	for (var i = 0; i<tabs.length; i+=1) {
		var tab = tabs[i];
		if (tab == null) continue;
		if (tab.state == TAB_STATE_INACTIVE) continue;
		
		if(tab.ticks == tab.seconds){
			updateBadge(i);
			checkForText(i);
			continue;
		}
		updateBadge(i);
		tab.ticks += 1;
		console.log("Tick: " + tab.tab.title);
	}
	updateCurrentTab();
}

function checkForText(t){
	var tab = tabs[t];
	var details = {code:"location.reload();"};
	chrome.tabs.executeScript(t, details);
	tab.ticks = 0;
}

function updateCurrentTab() {
	if (tabs[currentTab] != null) {
		chrome.browserAction.setBadgeText({text: tabs[currentTab].badge});
		updateBadge(currentTab);
	}else{
		chrome.browserAction.setBadgeText({text: ""});
	}
}

function updateBadge(tabIndex){
	
	if (tabs[tabIndex].state == TAB_STATE_INACTIVE){
		tabs[tabIndex].badge = "";
		return;
	}
	
	if ((tabs[tabIndex].seconds - tabs[tabIndex].ticks) < 1) {
		tabs[tabIndex].badge = "";
		return;
	}
	
	var zero = ((tabs[tabIndex].seconds-tabs[tabIndex].ticks) < 10) ? "0" : "" ;
	var newString = "0:" + zero + (tabs[tabIndex].seconds - tabs[tabIndex].ticks);
	tabs[tabIndex].badge = newString;
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

