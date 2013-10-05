/**
 * Author: Tony Coculuzzi
 * Date: 2013-09-29
 * Time: 1:39 PM
 */

var MESSAGE_START = "refresher-start";
var MESSAGE_STOP = "refresher-stop";

var START_BUTTON_ID = "start_button";
var ADVANCED_BUTTON_ID = "advanced_button";

var STATE_START = 0;
var STATE_STOP = 1;

var state = 0;

var advanced = false;

var bodyHeight = 0;


window.onload = function() {
	
	bodyHeight = document.getElementsByTagName('body')[0].style.height;
	
	document.getElementById(START_BUTTON_ID).onclick = function() {
		switch(state){
			case STATE_START:
				setStateStop();
				var s = parseInt(document.getElementById("seconds").value);
				if (isNaN(s))s = 5;
				console.log("sendMessage: " + MESSAGE_START + s + " seconds");
				chrome.runtime.sendMessage({
					type: MESSAGE_START,
					seconds: s
				});
				break;
			
			case STATE_STOP:
				setStateStart();
				console.log("sendMessage: " + MESSAGE_STOP);
				chrome.extension.sendMessage({
					type: MESSAGE_STOP
				});
			break;
		}
	}
	
	/*
	document.getElementById(ADVANCED_BUTTON_ID).onclick = function() {
		var body = document.getElementsByTagName('body')[0];
		if (advanced) {
			body.style.height = bodyHeight;
			advanced = false;
		}else{
			body.style.height = 300;
			advanced = true;
		}
	}
	*/
}


function setStateStart(){
	document.getElementById(START_BUTTON_ID).innerHTML = "Start";
	state = STATE_START;
}

function setStateStop(){
	document.getElementById(START_BUTTON_ID).innerHTML = "Stop";
	state = STATE_STOP;
}