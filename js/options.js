"use strict";

// yeah ik this js is terrible

let scripts;
let dialogPurpose = 0;
let editingId = "";

function loadScripts() {
	chrome.storage.sync.get((res) => {
		document.querySelector("#noScripts").style.display = "none";
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
				// el.addEventListener("click", () => {editScript(scripts[i].id);});
				list.appendChild(el);
			}
		} else {
			document.querySelector("#noScripts").style.display = "block";
		}
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

window.addEventListener("load", () => {
	document.querySelector("#scriptsTab").addEventListener("click", () => {
		document.querySelector("#scriptsContent").style.display = "block";
		document.querySelector("#aboutContent").style.display = "none";
		document.querySelector("#scriptsTab").className = "selected";
		document.querySelector("#aboutTab").className = "";
	});
	document.querySelector("#aboutTab").addEventListener("click", () => {
		document.querySelector("#aboutContent").style.display = "block";
		document.querySelector("#scriptsContent").style.display = "none";
		document.querySelector("#aboutTab").className = "selected";
		document.querySelector("#scriptsTab").className = "";
	});
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
	loadScripts();
});