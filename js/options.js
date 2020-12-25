"use strict";

window.addEventListener("load", () => {
	// yeah ik it's bad
	document.querySelector("#scriptsTab").addEventListener('click', () => {
		document.querySelector("#scriptsContent").style.display = "block";
		document.querySelector("#aboutContent").style.display = "none";
		document.querySelector("#scriptsTab").className = "selected";
		document.querySelector("#aboutTab").className = "";
	});
	document.querySelector("#aboutTab").addEventListener('click', () => {
		document.querySelector("#aboutContent").style.display = "block";
		document.querySelector("#scriptsContent").style.display = "none";
		document.querySelector("#aboutTab").className = "selected";
		document.querySelector("#scriptsTab").className = "";
	});
});