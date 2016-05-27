class Dialog{
    public static removeEventHandler(elem,eventType,handler){
        if (elem.removeEventListener)
            elem.removeEventListener (eventType,handler,false);
        if (elem.detachEvent)
            elem.detachEvent ('on'+eventType,handler);
    }
    public static addEventHandler(elem,eventType,handler) {
        if (elem.addEventListener)
            elem.addEventListener (eventType,handler,false);
        else if (elem.attachEvent)
            elem.attachEvent ('on'+eventType,handler);
    }

    public static Close(){
    	try{
    		var button = document.getElementById("closeDialogButton");
    		button.onclick(null);
    	}catch(error){}
    }
    public static _close(){
    	try{
    		var dialog = document.getElementById("dialog");
    		document.body.removeChild(dialog);
    	}catch(error){}
    }

    public static AddElement(element){
    	var dialogBody = document.getElementById("dialogBody");
    	dialogBody.appendChild(element);
    }

    public static Alert(content, title = "", close_callback = function(){}){
    	Dialog.Close();

    	var dialog = document.createElement("div");
    	dialog.id = "dialog";

    	var dialogTitle = document.createElement("div");
    	dialogTitle.id = "dialogTitle";
    	var titleText = document.createElement("span");
    	titleText.id = "titleText";
    	titleText.innerHTML = title;
    	var closeDialogButton = document.createElement("div");
    	closeDialogButton.id = "closeDialogButton";
    	closeDialogButton.title = "Close the dialog";
    	closeDialogButton.innerHTML = " X ";
    	dialogTitle.appendChild(titleText);
    	dialogTitle.appendChild(closeDialogButton);
    	dialog.appendChild(dialogTitle);

    	var dialogBody = document.createElement("div");
    	dialogBody.id = "dialogBody";
    	dialogBody.innerHTML = content;
    	dialog.appendChild(dialogBody);

    	var dialogButton = document.createElement("div");
    	dialogButton.id = "dialogConfirm";
    	dialogButton.innerHTML = "OK";
    	dialog.appendChild(dialogButton);

    	//set up event handlers
    	dialogTitle.onmousedown = function(e){
    		document.getElementsByTagName("html")[0].style.cursor = "default";
    		document.getElementsByTagName("body")[0].style.cursor = "default";

    		dialog['offY'] = e.clientY-parseInt(dialog.offsetTop.toString());
    		dialog['offX'] = e.clientX-parseInt(dialog.offsetLeft.toString());
    		Dialog.addEventHandler(window, "mousemove", Dialog.move);
    	};
    	dialogTitle.onmouseup = function(e){
    		document.getElementsByTagName("html")[0].style.cursor = "";
    		document.getElementsByTagName("body")[0].style.cursor = "";
    		Dialog.removeEventHandler(window, "mousemove", Dialog.move);
    	};
    	var keyupHandler = function(e){
    		/*if (e.keyCode === 13 || e.keyCode === 27){
    			closeDialogButton.onclick();
    		}*/
    	}
    	closeDialogButton.onclick = function(e){
    		Dialog._close();
    		Dialog.removeEventHandler(window, 'keyup', keyupHandler);
    		if (typeof(close_callback) === "function")
    			close_callback();
    	}
    	dialogButton.onclick = function(e){
    		closeDialogButton.onclick(e);
    	}
    	Dialog.addEventHandler(window, 'keyup', keyupHandler);

    	document.body.appendChild(dialog);
    }

    public static Confirm(content, confirm_callback, title = "", confirm_text = "OK", close_callback = function(){}){
    	Dialog.Close();

    	var dialog = document.createElement("div");
    	dialog.id = "dialog";

    	var dialogTitle = document.createElement("div");
    	dialogTitle.id = "dialogTitle";
    	var titleText = document.createElement("span");
    	titleText.id = "titleText";
    	titleText.innerHTML = title;
    	var closeDialogButton = document.createElement("div");
    	closeDialogButton.id = "closeDialogButton";
    	closeDialogButton.title = "Close the dialog";
    	closeDialogButton.innerHTML = " X ";
    	dialogTitle.appendChild(titleText);
    	dialogTitle.appendChild(closeDialogButton);
    	dialog.appendChild(dialogTitle);

    	var dialogBody = document.createElement("div");
    	dialogBody.id = "dialogBody";
    	dialogBody.innerHTML = content;
    	dialog.appendChild(dialogBody);

    	var dialogButton = document.createElement("div");
    	dialogButton.id = "dialogButton";
    	dialogButton.innerHTML = "Cancel";
    	dialog.appendChild(dialogButton);

    	var dialogConfirm = document.createElement("div");
    	dialogConfirm.id = "dialogConfirm";
    	dialogConfirm.innerHTML = confirm_text;
    	dialog.appendChild(dialogConfirm);

    	//set up event handlers
    	dialogTitle.onmousedown = function(e){
    		document.getElementsByTagName("html")[0].style.cursor = "default";
    		document.getElementsByTagName("body")[0].style.cursor = "default";

    		dialog['offY'] = e.clientY-parseInt(dialog.offsetTop.toString());
    		dialog['offX'] = e.clientX-parseInt(dialog.offsetLeft.toString());
    		Dialog.addEventHandler(window, "mousemove", Dialog.move);

    	};
    	dialogTitle.onmouseup = function(e){
    		document.getElementsByTagName("html")[0].style.cursor = "";
    		document.getElementsByTagName("body")[0].style.cursor = "";
    		Dialog.removeEventHandler(window, "mousemove", Dialog.move);
    	};
    	var keyupHandler = function(e){
    		/*if (e.keyCode === 13){
    			dialogConfirm.onclick();
    		}
    		if (e.keyCode === 27){
    			closeDialogButton.onclick();
    		}*/
    	}
    	closeDialogButton.onclick = function(e){
    		Dialog._close();
    		Dialog.removeEventHandler(window, 'keyup', keyupHandler);
    		if (typeof(close_callback) === "function")
    			close_callback();
    	}
    	dialogButton.onclick = function(e){
    		closeDialogButton.onclick(e);
    	}
    	dialogConfirm.onclick = function(e){
    		if (typeof(confirm_callback) === "function")
    			confirm_callback();
    		closeDialogButton.onclick(e);
    	}
    	Dialog.addEventHandler(window, 'keyup', keyupHandler);

    	document.body.appendChild(dialog);
    }

    public static move(e){
    	var dialog = document.getElementById("dialog");
    	dialog.style.position = "absolute";
    	dialog.style.top = (e.clientY - dialog['offY']) + "px";
    	dialog.style.left = (e.clientX - dialog['offX']) + 'px';
    }
}
