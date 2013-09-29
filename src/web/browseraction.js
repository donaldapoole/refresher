/**
 * Author: Tony Coculuzzi
 * Date: 2013-09-29
 * Time: 1:39 PM
 */

var MESSAGE_START = "refresher-start";
var MESSAGE_STOP = "refresher-stop";

window.onload = function() {
	
	console.log("shit");

	document.getElementById("button_start").onclick = function() {
		var s = 5;//document.getElementById("field_seconds");
		console.log("sendMessage: " + MESSAGE_START + s + " seconds");
		chrome.runtime.sendMessage({
	        type: MESSAGE_START,
	        seconds: s
	    });
	}
	
	document.getElementById("button_stop").onclick = function() {
		console.log("sendMessage: " + MESSAGE_STOP);
		chrome.extension.sendMessage({
	        type: MESSAGE_STOP
	    });
	}
}