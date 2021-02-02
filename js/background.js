"use strict";

const notificationActions = {};

chrome.runtime.onMessage.addListener((message) => {
	if (!message) {return;}
	if (message.action == "notify") {
		if (typeof message.text == "string" && message.text.length > 0 && (!message.notificationAction || /^[a-zA-Z][a-zA-z\d+.-]*:.*$/.test(message.notificationAction) || ["<options>"].indexOf(message.notificationAction) >= 0)) {
			chrome.notifications.create({
				type: "basic",
				title: "Script Notification – Miniscripts",
				message: message.text,
				iconUrl: "res/icon_128.png"
			}, (id) => {
				if (message.notificationAction) {notificationActions[id] = message.notificationAction;}
			});
		} else {
			chrome.notifications.create({
				type: "basic",
				title: "Error – Miniscripts",
				message: "The script notification data is not valid.",
				iconUrl: "res/icon_128.png"
			}, (id) => {
				notificationActions[id] = "<options>";
			});
		}
	}
});

chrome.notifications.onClicked.addListener((id) => {
	if (notificationActions[id]) {
		switch (notificationActions[id]) {
			case "<options>":
				window.open(chrome.runtime.getURL("options.html"));
				break;
			default:
				window.open(notificationActions[id]);
		}
	}
});