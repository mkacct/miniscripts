"use strict";

function execScript(id) {
	chrome.storage.sync.get((res) => {
		chrome.tabs.executeScript({code: res.scripts.find((item) => {return item.id == id;}).code});
		window.close();
	});
}

window.addEventListener("load", () => {
	document.querySelector("#optionsButton").addEventListener("click", () => {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			window.open(chrome.runtime.getURL("options.html"));
		}
	});
	chrome.storage.sync.get((res) => {
		const scripts = res.scripts;
		if (scripts && scripts.length > 0) {
			const list = document.querySelector("#list");
			for (let i = 0; i < scripts.length; i++) {
				const el = document.createElement("button");
				el.appendChild(document.createTextNode(scripts[i].title));
				el.addEventListener("click", () => {execScript(scripts[i].id);});
				list.appendChild(el);
			}
		} else {
			document.querySelector("#noScripts").style.display = "block";
		}
	});
});