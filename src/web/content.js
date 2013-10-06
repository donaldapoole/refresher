/**
 * Author: Tony Coculuzzi
 * Date: 2013-09-29
 * Time: 1:39 PM
 */

/* Messages */
var MESSAGE_LOAD = "refresher-load";
var MESSAGE_START = "refresher-start";
var MESSAGE_STOP = "refresher-stop";
var MESSAGE_CHECK = "refresher-check";
var MESSAGE_RESTART = "refresher-restart";
var MESSAGE_FOUND = "refresher-found";

var debug = false;
var debugString = "";
var debugVisible = false;

window.onload = function() {
	if (debug == true) {
		$("body").append(
			"<div id='refresher_debug'></div>"
		);
		debugVisible = true;
	}
	trace("content.js Loaded");
	trace(debugString);
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	trace("content.js :: received message: " + message.type);
	switch(message.type) {
		case MESSAGE_CHECK:
			var response = {tab: message.tab, found: checkForText(message.find)}
			sendResponse(response);
		break;
	}
});

function checkForText(find) {
	var found;
	var searches = find.split(",");
	trace("Looking for: " );
	for (var i = 0; i<searches.length; i+=1) {
		if (searches[i] == null || searches[i] == "") continue;
		trace(searches[i]);
		
		$('*', 'body').andSelf().contents().filter(function(){
			return this.nodeType === 3;
		}).filter(function(){
			// Only match when contains 'simple string' anywhere in the text
			return this.nodeValue.indexOf(searches[i]) != -1;
		}).each(function(){
			trace("Found " + searches[i] + " - " + this.nodeValue);
			//$(this).nodeValue.wrap("<span class='refresher_found'></span>")
			$(this).replaceWith("<span class='refresher_found'>" + this.nodeValue + "</span>");
			if (found == null) found = [];
			found[found.length] = searches[i];
		});
	}
	
	return found;
}

/* Debug */
function trace(s) {
	if (debugVisible == false) {
		debugString += s + "<hr />";
		return;
	}
	
	var d = document.getElementById('refresher_debug');
	if (d == null) return;
	d.innerHTML += s + "<hr />";
}