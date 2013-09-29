/**
 * Author: Tony Coculuzzi
 * Date: 2013-09-29
 * Time: 1:39 PM
 */

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	console.log("content.js :: received message: " + message.type);
	switch(message.type) {
		case "refresher-start":
		/*
			var divs = document.querySelectorAll("div");
			if(divs.length === 0) {
				alert("There are no any divs in the page.");
			} else {
				for(var i=0; i<divs.length; i++) {
					divs[i].style.backgroundColor = message.color;
				}
			}
		*/
		console.log("START");
		break;
	}
});