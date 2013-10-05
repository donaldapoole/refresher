/**
 * Author: Tony Coculuzzi
 * Date: 2013-09-29
 * Time: 1:39 PM
 */

var MESSAGE_START = "refresher-start";
var MESSAGE_STOP = "refresher-stop";
var MESSAGE_RESTART = "refresher-restart";
var MESSAGE_FOUND = "refresher-found";

var START_BUTTON_ID = "start_button";
var INPUT_SECONDS_ID = "seconds";
var INPUT_FIND_ID = "find";

var STATE_START = 0;
var STATE_STOP = 1;

var state = 0;

var tab;

window.onload = function() {
	
	// Set title
	chrome.tabs.getSelected(function(t){
		tab = t;
		document.getElementById('title').innerHTML = tab.title;
	});
	
	
	document.getElementById(START_BUTTON_ID).onclick = function() {
		var t = tab;
		switch(state){
			case STATE_START:
				setStateStop();
				var s = parseInt(document.getElementById("seconds").value);
				if (isNaN(s))s = 5;
				//var f = document.getElementById("find").value;
				var f = "find this";
				chrome.runtime.sendMessage({
					type: MESSAGE_START,
					tab: t,
					seconds: s,
					find: f
				});
				break;
			
			case STATE_STOP:
				setStateStart();
				chrome.extension.sendMessage({
					type: MESSAGE_STOP,
					tab: t
				});
			break;
		}
	}
	
	document.getElementById(INPUT_SECONDS_ID).onblur = validateSeconds;
	document.getElementById(INPUT_FIND_ID).onblur = validateFind;
	
	validateSeconds();
	validateFind();
}

function setStateStart(){
	document.getElementById(START_BUTTON_ID).innerHTML = "Start";
	state = STATE_START;
}

function setStateStop(){
	document.getElementById(START_BUTTON_ID).innerHTML = "Stop";
	state = STATE_STOP;
}

function validateSeconds() {
	var s = parseInt(document.getElementById("seconds").value);
	if (isNaN(s)) {
		s = 5;
		document.getElementById("seconds").value = s;
	}
	
	document.getElementById("seconds_info").value = "Every " + s + " seconds";
}

function validateFind() {
	var f = document.getElementById("find").value;
	var out = "nothing";
	
	if (f != "") {
		out = f;
	}
	
	document.getElementById("find_info").value = out;
}