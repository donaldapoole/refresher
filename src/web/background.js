/**
 * Author: Tony Coculuzzi
 * Date: 2013-09-29
 * Time: 1:39 PM
 */

var timer;
var ticks = 0;
var seconds = 10;

window.onload = function() {
	
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	console.log("background.js :: received message: " + message.type);
    switch(message.type) {
        case "refresher-start":
            startRefresher(message.seconds);
            break;
        case "refresher-stop":
            stopRefresher();
            break;
    }
    return true;
});

function startRefresher(s){
	console.log("Timer Started: " + s + " seconds");
	seconds = s;
	ticks = 0;
	timer = clearInterval(timer);
	timer = setInterval(tick, 1000);
	tick();
}

function stopRefresher(){
	console.log("Timer Stopped");
	clearBadge();
	timer = clearInterval(timer);
}

function tick(){
	if(ticks == seconds){
		updateBadge();
		check();
		return;
	}
	console.log("Ticks: " + ticks.toString());
	updateBadge();
	
	ticks += 1;
}

function updateBadge(){
	var zero = ((seconds-ticks) < 10) ? "0" : "" ;
	var newString = "0:" + zero + (seconds - ticks);
	chrome.browserAction.setBadgeText({text: newString});	
}

function clearBadge(){
	chrome.browserAction.setBadgeText({text: ""});
}

function check(){
	stopRefresher();
	showNotification();
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
	chrome.notifications.create(id, options, notificationCallback);
}

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

function guid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function notificationCallback(id){
	// nothing
}