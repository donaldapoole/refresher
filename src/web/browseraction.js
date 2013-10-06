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
var MESSAGE_CHECK = "refresher-check";
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
	
	trace("browseraction.js Loaded");
	
	// Set title
	chrome.tabs.getSelected(function(t){
		tab = t;
		document.getElementById('title').innerHTML = tab.title;
		chrome.runtime.sendMessage(
			{type: MESSAGE_LOAD,tab: t},
			function(response){
				setSeconds(response.seconds);
				setFind(response.find);
				if (response.state == STATE_START) {
					setStateStop();
				}else if (response.state == STATE_STOP) {
					setStateStart();
				}
				validateSeconds();
				validateFind();
			}
		);
	});
	
	
	document.getElementById(START_BUTTON_ID).onclick = function() {
		var t = tab;
		switch(state){
			case STATE_START:
				setStateStop();
				var s = getSeconds();
				var f = getFind();
				var message = {type: MESSAGE_START, tab: t, seconds: s, find: f};
				chrome.runtime.sendMessage(message);
				break;
			
			case STATE_STOP:
				setStateStart();
				var message = {type: MESSAGE_STOP, tab: t};
				chrome.extension.sendMessage(message);
				break;
		}
	}
	
	document.getElementById(INPUT_SECONDS_ID).onblur = function(){validateSeconds();};
	document.getElementById(INPUT_FIND_ID).onblur = function(){validateFind();};
	
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

/* Seconds */
function validateSeconds() {
	var s = parseInt(document.getElementById("seconds").value);
	if (isNaN(s)) {
		s = 10;
		setSeconds(s);
	}
	document.getElementById("seconds_info").value = "Every " + s + " seconds";
}

function getSeconds() {
	validateSeconds();
	return parseInt(document.getElementById("seconds").value);
}

function setSeconds(s) {
	trace("Set seconds to " + s);
	if (isNaN(s)) {
		console.log("That is not a number");
		s = 5;
	}
	document.getElementById("seconds").value = s;
}

/* Find */
function validateFind() {
	var f = document.getElementById("find").value;
	var out = "-";
	
	if (f != "") {
		out = f;
	}
	
	document.getElementById("find_info").value = out;
}

function getFind() {
	validateFind();
	return document.getElementById("find").value;
}

function setFind(f) {
	document.getElementById("find").value = f;
}

/* Data */
/*
function saveData(){
	//var dataObject = {seconds: parseInt(document.getElementById("seconds").value), find: document.getElementById("find").value};
	var dataObject = {seconds: getSeconds()};
	chrome.storage.sync.set({ DATA_TAB: dataObject});
	chrome.storage.sync.set({"refresher__last" : getSeconds()});
}
*/

/* Debug */
function trace(s) {
	var debug = document.getElementById("debug");
	if (debug == null) return;
	debug.innerHTML += s + "<br /> ------------------------------ <br />";
}