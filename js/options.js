"use strict";

// yeah ik this js is terrible

let scripts;
let dialogPurpose = 0;
let editingId = "";

function loadScripts() {
	chrome.storage.sync.get((res) => {
		document.querySelector("#noScripts").style.display = "none";
		document.querySelector("#sortButton").disabled = false;
		scripts = res.scripts;
		if (!scripts) {scripts = [];}
		const list = document.querySelector("#list");
		list.innerHTML = "";
		if (scripts.length > 0) {
			for (let i = 0; i < scripts.length; i++) {
				const el = document.createElement("div");
				const editButton = document.createElement("button");
				editButton.className = "editButton";
				editButton.appendChild(document.createTextNode(scripts[i].title));
				editButton.addEventListener("click", () => {
					dialogPurpose = 1;
					editingId = scripts[i].id;
					document.querySelector("dialog input").value = scripts[i].title;
					document.querySelector("dialog textarea").value = scripts[i].code;
					setupDialog();
					document.querySelector("dialog").showModal();
				});
				el.appendChild(editButton);
				const upButton = document.createElement("button");
				upButton.innerHTML = "<i class=\"fas fa-angle-up\"></i>";
				if (i == 0) {
					upButton.disabled = true;
				} else {
					upButton.addEventListener("click", () => {
						const newScripts = scripts.slice();
						const movedItem = newScripts.splice(i, 1)[0];
						newScripts.splice(i - 1, 0, movedItem);
						chrome.storage.sync.set({scripts: newScripts});
					});
				}
				const downButton = document.createElement("button");
				downButton.innerHTML = "<i class=\"fas fa-angle-down\"></i>";
				if (i == scripts.length - 1) {
					downButton.disabled = true;
				} else {
					downButton.addEventListener("click", () => {
						const newScripts = scripts.slice();
						const movedItem = newScripts.splice(i, 1)[0];
						newScripts.splice(i + 1, 0, movedItem);
						chrome.storage.sync.set({scripts: newScripts});
					});
				}
				const deleteButton = document.createElement("button");
				deleteButton.innerHTML = "<i class=\"fas fa-trash\"></i>";
				deleteButton.addEventListener("click", () => {
					if (confirm("Delete \"" + scripts[i].title + "\"?")) {
						const newScripts = scripts.slice();
						newScripts.splice(i, 1);
						chrome.storage.sync.set({scripts: newScripts});
					}
				});
				upButton.ariaLabel = "Move up";
				downButton.ariaLabel = "Move down";
				deleteButton.ariaLabel = "Delete";
				el.appendChild(upButton);
				el.appendChild(downButton);
				el.appendChild(deleteButton);
				list.appendChild(el);
			}
		} else {
			document.querySelector("#noScripts").style.display = "block";
			document.querySelector("#sortButton").disabled = true;
		}
		const exp = [];
		scripts.forEach((item) => {
			exp.push({
				title: item.title,
				code: item.code
			});
		});
		document.querySelector("#exportTA").value = JSON.stringify(exp);
	});
}

function setupDialog() {
	const one = document.querySelector("dialog input").value.trim().length > 0;
	const two = document.querySelector("dialog textarea").value.trim().length > 0;
	if (dialogPurpose == 2) {
		document.querySelector("dialog h3").innerHTML = "Convert from bookmarklet";
		document.querySelector("dialog #textareaLabel").innerHTML = "Bookmarklet link";
		document.querySelector("dialog button[type=submit]").innerHTML = "Add";
	} else if (dialogPurpose == 1) {
		document.querySelector("dialog h3").innerHTML = "Edit script";
		document.querySelector("dialog #textareaLabel").innerHTML = "JavaScript";
		document.querySelector("dialog button[type=submit]").innerHTML = "Save";
	} else {
		document.querySelector("dialog h3").innerHTML = "Add script";
		document.querySelector("dialog #textareaLabel").innerHTML = "JavaScript";
		document.querySelector("dialog button[type=submit]").innerHTML = "Add";
	}
	document.querySelector("dialog button[type='submit']").disabled = !(one && two);
}

chrome.storage.onChanged.addListener(loadScripts);

function setTab(tabName) {
	document.querySelectorAll("main > div").forEach((item) => {item.style.display = "none";});
	document.querySelector("#" + tabName + "Content").style.display = "block";
	document.querySelectorAll("nav > button").forEach((item) => {item.className = "";});
	document.querySelector("#" + tabName + "Tab").className = "selected";
};

window.addEventListener("load", () => {
	document.querySelector("#scriptsTab").addEventListener("click", () => {setTab("scripts");});
	document.querySelector("#importExportTab").addEventListener("click", () => {
		document.querySelector("#importTA").value = "";
		document.querySelector("#importButton").disabled = true;
		setTab("importExport");
	});
	document.querySelector("#aboutTab").addEventListener("click", () => {setTab("about");});
	document.querySelector("#addButton").addEventListener("click", () => {
		dialogPurpose = 0;
		document.querySelector("dialog input").value = "";
		document.querySelector("dialog textarea").value = "";
		setupDialog();
		document.querySelector("dialog").showModal();
	});
	document.querySelector("#convertButton").addEventListener("click", () => {
		dialogPurpose = 2;
		document.querySelector("dialog input").value = "";
		document.querySelector("dialog textarea").value = "";
		setupDialog();
		document.querySelector("dialog").showModal();
	});
	document.querySelector("#sortButton").addEventListener("click", () => {
		if (confirm("Sort scripts alphabetically by title? The current order will be discarded.")) {
			const newScripts = scripts.slice();
			newScripts.sort((a, b) => {return a.title.localeCompare(b.title);});
			chrome.storage.sync.set({scripts: newScripts});
		}
	});
	document.querySelector("#copyExportButton").addEventListener("click", () => {
		document.querySelector("#exportTA").select();
		document.execCommand("copy");
	});
	document.querySelector("#importTA").addEventListener("input", (e) => {
		document.querySelector("#importButton").disabled = e.target.value.trim().length == 0;
	});
	document.querySelector("#importButton").addEventListener("click", () => {
		let importScripts;
		try {
			importScripts = JSON.parse(document.querySelector("#importTA").value);
			if (!Array.isArray(importScripts)) {throw new Error();}
			importScripts.forEach((item) => {
				if (!(typeof item.title == "string" && item.title.length > 0)) {throw new Error();}
				if (!(typeof item.code == "string" && item.code.length > 0)) {throw new Error();}
			});
		} catch (err) {
			alert("Import data is invalid");
			return;
		}
		let newScripts = scripts.slice();
		importScripts.forEach((item) => {
			newScripts.push({
				id: uuidv4(),
				title: item.title.trim(),
				code: item.code.trim()
			});
		});
		chrome.storage.sync.set({scripts: newScripts});
		setTab("scripts");
	});
	document.querySelector("#deleteAllButton").addEventListener("click", () => {
		if (prompt("All scripts will be deleted! If you're sure you want to do this, type \"DELETE\" (case sensitive):") == "DELETE") {
			chrome.storage.sync.set({scripts: []});
			setTab("scripts");
		}
	});
	document.querySelector("dialog input").addEventListener("input", setupDialog);
	document.querySelector("dialog textarea").addEventListener("input", setupDialog);
	document.querySelector("dialog form").addEventListener("submit", (e) => {
		e.preventDefault();
		const newScripts = scripts.slice();
		const newOne = {
			id: dialogPurpose == 1 ? editingId : uuidv4(),
			title: document.querySelector("dialog input").value.trim(),
			code: document.querySelector("dialog textarea").value.trim()
		};
		if (dialogPurpose == 2) {
			if (newOne.code.substring(0, 11) != "javascript:") {
				alert("Bookmarklet link is invalid");
				return;
			}
			newOne.code = decodeURIComponent(newOne.code.substring(11));
			if (newOne.code.length == 0) {
				alert("Bookmarklet link is invalid");
				return;
			}
		}
		if (newOne.title.length > 0 && newOne.code.length > 0) {
			if (dialogPurpose == 1) {
				const index = newScripts.findIndex((item) => {return item.id == editingId;});;
				if (index == -1) {
					document.querySelector("dialog").close();
					return;
				}
				newScripts[index] = newOne;
			} else {
				newScripts.push(newOne);
			}
			chrome.storage.sync.set({scripts: newScripts});
			document.querySelector("dialog").close();
		}
	});
	document.querySelector("dialog button[type='button']").addEventListener("click", () => {
		document.querySelector("dialog").close();
	});
	document.querySelector("#versionNumber").appendChild(document.createTextNode(chrome.runtime.getManifest().version));
	loadScripts();
});