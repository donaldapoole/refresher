/**
 * Author: Tony Coculuzzi
 * Date: 2013-09-29
 * Time: 1:39 PM
 */

/* Tab States */
var TAB_STATE_ACTIVE = 0;
var TAB_STATE_INACTIVE = 1;

/* Messages */
var MESSAGE_LOAD = "refresher-load";
var MESSAGE_START = "refresher-start";
var MESSAGE_STOP = "refresher-stop";
var MESSAGE_CHECK = "refresher-check";
var MESSAGE_RESTART = "refresher-restart";
var MESSAGE_FOUND = "refresher-found";

var timer;
var tabs;
var notificationTabs;
var currentTab = 0;

window.onload = function() {
	// Init tabs array
	tabs = [];
	
	// Init notificationTabs array
	notificationTabs = [];
	
	// Start master clock
	timer = setInterval(tick, 1000);
}

// Add event listener for when the current tab changes
chrome.tabs.onHighlighted.addListener(function(tabInfo){
	// Store the new current tab's id for later reference
	currentTab = tabInfo.tabIds[0];
	
	// Update Refresher's badge for the new current tab
	updateCurrentBadge();
});

// Add event listener for when tabs load or change urls
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
	var tabRefresher = tabs[tabId];
	if (tabRefresher == null) return;
	
	switch(changeInfo.status){
		case "complete":
			console.log("Tab loaded: " + tabRefresher.tab.title);
			chrome.tabs.sendMessage(
				tabId,
				{type: MESSAGE_CHECK, tab: updatedTab, find: tabs[tabId].find},
				function(response){
					console.log("Response! from tab " + response.tab.id + ": " + response.tab.title);
					postRefresh(response);
				}
			);
			break;
		
		case "loading":
			console.log("Tab loading: " + tabRefresher.tab.title);
			if (tabRefresher.tab.url != updatedTab.url) {
				stopRefresher(updatedTab);
			}
			break;
	}
});

// Add event listener for when a tab is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	// If the closed tab was registered with Refresher, stop its refresher
	var tab = tabs[tabId]; 
	if (tab != null) {
		// Create dummy object because reference to actual tab object is no longer valid
		var tempTab = {id: tabId};
		stopRefresher(tempTab);
	}
});

// Add event listener for Chrome messages
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

// Called from a message, responds with the supplied tab's properties, and returns them to the BrowserAction
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

// Add tab info to refresher loop, creating a new one if one for that tab doesn't already exist
function startRefresher(tab, s, f){
	console.log("Timer Started:\n" + s + " seconds \nFind: " + f + " \nTab " + tab.title);
	tabs[tab.id] = {};
	tabs[tab.id].tab = tab;
	tabs[tab.id].state = TAB_STATE_ACTIVE;
	tabs[tab.id].seconds = s;
	tabs[tab.id].find = f;
	tabs[tab.id].ticks = 0;
	tabs[tab.id].url = tab.url;
	tabs[tab.id].badge = "";
	updateBadge(tab.id);
	updateCurrentBadge();
}

// Stop the tab's refresher by setting it's state to INACTIVE, also clear its badge
function stopRefresher(tab){
	//console.log("Timer Stopped \nTab: " + tab.title);
	tabs[tab.id].state = TAB_STATE_INACTIVE;
	tabs[tab.id].badge = "";
}

// Timer tick. Cycle through all tab refreshers and deal with them accordingly
function tick(){
	for (var i = 0; i<tabs.length; i+=1) {
		var tab = tabs[i];
		
		// Skip this iteration if it doesn't contain a tab object
		if (tab == null) continue;
		
		// Skip this tab if its state is INACTIVE
		if (tab.state == TAB_STATE_INACTIVE) continue;
		
		// If tab has reached its goal, refresh it, update badge, and skip
		if(tab.ticks == tab.seconds){
			updateBadge(i);
			refreshTab(i);
			continue;
		}
		updateBadge(i);
		
		// Add tick to tab object
		tab.ticks += 1;
		console.log("Tick: " + tab.tab.id + ": " + tab.tab.title);
	}
	updateCurrentBadge();
}

// Refreshes page, reset tab timer
function refreshTab(t){
	var tab = tabs[t];
	var details = {code:"location.reload();"};
	chrome.tabs.executeScript(t, details);
	tab.ticks = 0;
	tab.state = TAB_STATE_INACTIVE;
}

// deal with the newly loaded tab's response
function postRefresh(response){
	if (response.found != null && response.found.length > 0) {
		showNotification(response.tab, response.found);
		stopRefresher(response.tab);
	}else{
		tabs[response.tab.id].state = TAB_STATE_ACTIVE;
		updateBadge(response.tab.id);
	}
}

// Update the current tab's badge
function updateCurrentBadge() {
	if (tabs[currentTab] != null) {
		chrome.browserAction.setBadgeText({text: tabs[currentTab].badge});
		updateBadge(currentTab);
	}else{
		chrome.browserAction.setBadgeText({text: ""});
	}
}

// Update the tab's badge property, to be pulled from the updateCurrentBadge method
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

// Show a notification if supplied string is found
function showNotification(tab, found){
	document.getElementById('refresher-audio').play();
	
	var items = "";
	for(var i = 0; i<found.length; i+=1){
		items += " - "+found[i]+"\n";
	}
	
	var options = {
		type: "basic",
		title: "Refresher",
		message: "Tab contains the following text:\n\n" + items,
		iconUrl: "../images/icons/notification_80x80.png"
	}
	var id = "refresher-notification-" + guid();
	notificationTabs[id] = tab.id;
	console.log(id);
	chrome.notifications.create(id, options, function(notificationId){
		console.log("Notification response! " + notificationId + ": tab " + notificationTabs[notificationId]);
		chrome.tabs.update(notificationTabs[notificationId], {selected: true});
	});
}


/* GUID */
function s4() {
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

function guid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

