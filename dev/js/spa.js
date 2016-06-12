(function() {
	// generic globals
	window.isDefined = function(object) { return (typeof object !== 'undefined'); }; // specially to check for defined, may be falsy - but defined
	window.isNull = function(object) { return (object === null); }; // specially to check for null
	window.isEmpty = function(object) { return (object === ""); }; // specially to check for empty
	window.isFunction = function(object) { return (typeof object === 'function'); }; // if truthy and function
	window.isObject = function(object) { return (typeof object === 'object'); }; 
	window.isArray = function(object) { return (Object.prototype.toString.call(object) === '[object Array]'); }; // if truthy and an array
	window.isString = function(object) { return (typeof object === 'string' || object instanceof String); };
	window.isNumber = function(object) { return (typeof object === 'number' || object instanceof Number); };
	window.isBoolean = function(object) { return (typeof object === 'boolean' || object instanceof Boolean); };
	window.isDate = function(object) { return (object instanceof Date); };
	window.isLiteral = function(object) { return (object && !isString(object) && !isNumber(object) && !isBoolean(object) && !isDate(object) && !isArray(object) && !isFunction(object) && !object.prototype); };
	String.prototype.repeat = function(times) {
	   return (new Array(times + 1)).join(this);
	};
	
	// specific globals
	window._d = function(encryptedText) {
		// return
		var key = spa.app.state.pin;
		if (CryptoJS && key) {
			return CryptoJS.AES.decrypt(encryptedText.replace(/{CR}/g, "\n"), key).toString(CryptoJS.enc.Utf8);
		} else {
			return encryptedText;
		};			
	};
	window._e = function(clearText) {
		// return
		if (CryptoJS) {
			var key = spa.app.state.pin;
			return CryptoJS.AES.encrypt(clearText, key).toString().replace(/\n/g, "{CR}");		
		} else {
			return clearText;
		};			
	};
	window._a = function(uri) { 
		var gui = require('nw.gui');
		gui.Shell.openExternal(uri); 
	}
	window.newSPAdata = {
		settings: {
			title: "",
			pin: "",
			encrypt: "no",
			searchDepth: "",
			lastUpdate: "",
			appVersionId: "",
			dataFormatVersionId: "",
			passwordTypes: [
				"Login",
				"Transaction",
				"PIN",
				"TIN",
			],
			categories: [
				{
					id: "a837d30e-2584-c67c-d19c-3f7a6b3a0bc6",
					title: "Category 1",
					desc: "",
					groups: [
						{
							id: "32e275f6-27b8-431f-b3d8-5340059544a3",
							title: "Group 1",
							desc: "",
						},
						{
							id: "85737917-40de-4ef5-ab01-990081a0ba2b",
							title: "Group 2",
							desc: "",
						},
					],
				},
				{
					id: "fe52c992-426e-4445-9534-1ddd0c2aa1c1",
					title: "Category 2",
					desc: "",
					groups: [
						{
							id: "413a3b3e-99d1-4d43-8576-03cec9f70f80",
							title: "Group 1",
							desc: "",
						},
						{
							id: "9876f653-ed96-4680-abb8-a447454e2a89",
							title: "Group 2",
							desc: "",
						},
					],
				},
			],
		},
		items: [
			{
				id: "6399e9bb-6c3c-4b62-b2f8-bdfd44803c4a",
				title: "Sample Password",
				desc: "",
				fav: "no",
				trash: "no",
				cat: [
					{
						id: "a837d30e-2584-c67c-d19c-3f7a6b3a0bc6",
						groups: [
							"32e275f6-27b8-431f-b3d8-5340059544a3",
						],
					},
				],
				tags: [
					"tag 1",
				],
				url: "http://mail.yahoo.com",
				login: "abc",
				pwds: [
					{
						date: "2013/01/01",
						exp: "90",
						pwd: [
							{
								name: "Login",
								value: "1234",
							},
						],
					},
				],
				info: "",
				moreInfo: [
				],
				ref: [
				],
				notes: [
				],
			},
		],
	};
	
	// private classes
	var stateManagerClass = function() {
		// in-browser state management among all SxA series applications
		this.set = function(key, value) {
			var allState = {};
			if (window.name !== "") {
				try {
					allState = JSON.parse(window.name);
				} catch (ex) {
					allState = {};
				};
			};
			allState[key] = value;
			try {
				window.name = JSON.stringify(allState);
			} catch(ex) {
				window.name = "";
			};
		};
		this.get = function(key) {
			var state = null;
			if (window.name !== "") {
				try {
					var allState = JSON.parse(window.name);
					if (typeof allState[key] !== 'undefined') {
						state = allState[key];
					};
				} catch (ex) {
					state = null;
				};
			};	
			return state;
		};
	};
	var fileSystemClass = function() {
		// in-browser local file system access
		var fs = (typeof nw !== 'undefined' ? require('fs') : null);
						
		this.getRoot = function() {
			var a = $('<a>').prop('href', document.location.href);
			var root = a.prop('pathname');
			root = root.substring((fs !== null ? 1 : 0), root.lastIndexOf("/") + 1);
			return decodeURIComponent(root);
		};
		this.ensureExtension = function(file, ext) {
			if (file === file.replace('.' + ext, '')) {
				// means no extension is defined
				file = file + '.' + ext;
			};
			return file;
		};
		this.isFileExists = function(completeFilePath) {
			return fs.existsSync(completeFilePath);
		};
		this.saveFile = function(completeFilePath, fileContent) {
			var isSuccess = false;
			try {
				completeFilePath = (completeFilePath.substring(0, 1) === "/" ? 
									completeFilePath.substring(1) : completeFilePath);
				fs.writeFileSync(completeFilePath, fileContent);
				isSuccess = true;
			} catch (ex) {
				alert("Error writing to file. Error:'" + ex.toString() + "'");
				isSuccess = false;
			};	
			return isSuccess;
		};
	};
	var utilsClass = function() {
		this.guid = function() { 
			// generate four random hex digits
			var S4 = function() {
				return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
			};

			// generate a pseudo-GUID by concatenating random hexadecimal
			return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
		};			
		this.serializeToJS = function(jsObject, rootName) {
			// create js file
			var jsFile = "";
			var crlf = "\n";
			var tab = "\t";
			var tabLevel = 0;
			var tabs = "";
			
			var getValue = function(value) {
				if (spa.data.settings.encrypt === "yes") {
					return "_d('" + _e(value) + "')";
				} else {
					return '"' + value + '"';
				};
			};
			
			// add all simple, deep and array objects
			var writeObject = function(value, name) {
				var jsFilePart = "";
				tabs = tab.repeat(tabLevel);

				// function
				if (isFunction(value)) {
					// ignore
				// array
				} else if (isArray(value)) {
					if (name) {
						jsFilePart += tabs + name + ": [" + crlf;
					} else {
						jsFilePart += tabs + " [" + crlf;
					};
					tabLevel++;
					tabs = tab.repeat(tabLevel);
					$.each(value, function(i, value2) {
						jsFilePart += writeObject(value2, "");
					});
					tabLevel--;
					tabs = tab.repeat(tabLevel);
					jsFilePart += tabs + "]"; 
				// string
				} else if (value instanceof String || typeof value === 'string') {
					if (name) {
						jsFilePart += tabs + name + ': ' + getValue(value.toString());
					} else {
						jsFilePart += tabs + getValue(value.toString());
					};
				// number
				} else if (value instanceof Number || typeof value === 'number') { 
					if (name) {
						jsFilePart += tabs + name + ': ' + getValue(value.toString());
					} else {
						jsFilePart += tabs + getValue(value.toString());
					};						
				// boolean
				} else if (value instanceof Boolean || typeof value === 'boolean') { 
					if (name) {
						jsFilePart += tabs + name + ': ' + getValue(value.toString());
					} else {
						jsFilePart += tabs + getValue(value.toString());
					};						
				// date
				} else if (value instanceof Date) { 
					if (name) {
						jsFilePart += tabs + name + ': ' + 'new Date("' + getValue(value.toString()) + '")';
					} else {
						jsFilePart += tabs + 'new Date("' + getValue(value.toString()) + '")';
					};						
				// literal
				} else if (isLiteral(value)) {
					if (name) {
						jsFilePart += tabs + name + ": {" + crlf;
					} else {
						jsFilePart += tabs + "{" + crlf;
					};
					tabLevel++;
					tabs = tab.repeat(tabLevel);
					$.each(value, function(name2, value2) {
						jsFilePart += writeObject(value2, name2);
					});
					tabLevel--;
					tabs = tab.repeat(tabLevel);
					jsFilePart += tabs + "}"; 
				// null
				} else if (isNull(value)) {
					if (name) {
						jsFilePart += tabs + name + ": null";
					} else {
						jsFilePart += tabs + "null";
					};
				} else {
					// ignore
				};
				
				if (jsFilePart) {
					if (tabLevel === 0) {
						jsFilePart += ";" + crlf;
					} else {
						jsFilePart += "," + crlf;
					};
				};
					
				// return
				return jsFilePart;
			};
			
			// call recursively and add to root name
			jsFile = writeObject(jsObject, "");
			jsFile = rootName + " = " + jsFile;
			
			// return 
			return jsFile;
		};
		this.loadJS = function(path, callback) {
			try {
				var done = false;
				var scr = document.createElement('script');
				function handleLoad() {
					if (!done) {
						done = true;
						callback();
					};
				};
				function handleReadyStateChange() {
					var state;
					if (!done) {
						state = scr.readyState;
						if (state === "complete") {
							handleLoad();
						};
					};
				};
				function handleError() {
					if (!done) {
						done = true;
						callback(true);
					};
				};
				scr.onload = handleLoad;
				scr.onreadystatechange = handleReadyStateChange;
				scr.onerror = handleError;
				scr.src = path;
				document.getElementsByTagName('head')[0].appendChild(scr);
			} catch (ex) {
				callback(true);
			};
		};		
		this.getNowAsString = function() {
			var d = new Date();
			return d.toJSON().replace(/-/g, '/').split('T')[0] + " " + d.toTimeString().split('GMT')[0].trim();
		};
	};
	var spaClass = function() {
		// private support variables
		var stateManager = new stateManagerClass();
		var fileSystem = new fileSystemClass();
		var utils = new utilsClass();
		var isEditingNew = false;
		var newDataId = "";
		var isDataLoaded = false;
		var editItem = null;
		var isEditingNewCat = false;
		var isEditingSettings = false;
		var editCatId = "";
		var editCatItem = null;	
		var dataFileType = "";
		var prevDataId = "";
		var displayDataId = "";
		var nextDataId = "";
		
		// private support functions
		function saveState() {
			stateManager.set(spa.app.settings.stateKey, spa.app.state);
		};
		function loadState() {
			var state = stateManager.get(spa.app.settings.stateKey);
			if (isNull(state)) {
				spa.app.state = {
					screen: "",
					lastScreen: "",
					pin: "",
					catId: "",
					grpId: "",
					dataId: "",
					searchText: "",
					searchType: 0,
					dataFile: "",
					editDataId: "",
					isNewFile: false,
					settings: {
						searchDepth: "",
					}
				};					
			} else {
				spa.app.state = state;
			};
		};			
		function saveData(completeFilePath, jsObject, rootObjectName) {
			// serialize to JS
			var jsFile = utils.serializeToJS(jsObject, rootObjectName);
			
			// save to file
			return fileSystem.saveFile(completeFilePath, jsFile);
		};
		function navigate(to, needHeaderFooter) { 
			// get to
			if (!to) {
				to = spa.app.state.screen;
				if (!to) {
					to = "home";
					spa.app.state.lastScreen = "home";
				};
			}
			$('#' + to).show().siblings().hide();
			
			// save state (except for login screen)
			if (to !== "login") {
				if (to !== spa.app.state.screen) {
					spa.app.state.lastScreen = spa.app.state.screen;
				};
				spa.app.state.screen = to; 
				saveState();
			};
				
			// header and footer
			if (needHeaderFooter) {
				$('#appHeader').show();
				$('#appFooter').show();
			} else {
				$('#appHeader').hide();
				$('#appFooter').hide();
			};
			if (["search", "print"].indexOf(to) !== -1) {
				$("#leftMenu").children().removeClass("active");
				$('#' + to + "Menu").parent().addClass("active").siblings().removeClass("active");
			} else {
				$("#rightMenu").children().removeClass("active");
				$('#' + to + "Menu").parent().addClass("active").siblings().removeClass("active");
			};
			$('#' + to + "Menu2").parent().addClass("active").siblings().removeClass("active");
		};
		function resetEnvironmentWithDataLoadOrChanges() {
			// sort by name as default
			spa.data.items.sort(function(a, b){ 
				var a1= a.title, b1= b.title; if(a1== b1) return 0; return a1> b1? 1: -1;
			});
			
			// edting features
			if (!spa.app.canEdit) {
				$("#editItemMenu").hide(); $("#editItemMenu2").hide();
				$("#settingsMenu").hide(); $("#settingsMenu2").hide();
				$("#settingsMenuDivider").hide(); $("#settingsMenuDivider2").hide();
				$("#viewOnly2").show();
			} else {
				if (spa.app.state.editDataId.length > 0 || isEditingNew) {
					setEditButton();
				} else {
					setNewButton();
				};
			};
			
			// fill sorted categories list in select section
			refillCategoriesMenu();

			// fill password types list (again)
			refreshPasswordTypes();
			
			// show data title
			var dataTitle = spa.app.state.dataFile.toLowerCase();
			$('#dataTitle').html(spa.data.settings.title).attr('title', dataTitle + " (" + spa.data.items.length.toString() + " items)");

			// update search as per setting
			var searchButtonText = "Search";
			switch(spa.app.state.settings.searchDepth) {
				case "min":
					searchButtonText += " (quick)";
					break;
				case "max":
					searchButtonText += " (full)";
					break;
			};
			$("#searchButton").text(searchButtonText);					
			$("#dataFileName").text(dataTitle);
			$("#_file_name").val(spa.app.state.dataFile.toLowerCase());
			$("#_file_last_update").val(spa.data.settings.lastUpdate);
			$("#_file_data_format").val(spa.data.settings.dataFormatVersionId);
			$("#_file_saved_by_app").val(spa.data.settings.appVersionId);			
		};
		function tagCloud(tags) {
			//set max and min font-size
			var maxsize = 40;
			var minsize = 9;
		
			// default items in cloud
			var allTags = $('<div>').append(
				$('<span>').attr('style', 'font-size:25px;').append(
					$('<a>').attr('href', '#').on('click', function() { onSearch(null, 1); }).append("Favorites").attr('title', 'Marked as favorite')).append(" "));
			allTags.append(		
				$('<span>').attr('style', 'font-size:20px;').append(
					$('<a>').attr('href', '#').on('click', function() { onSearch(null, 2); }).append("Uncategorized").attr('title', 'Not yet categorized')).append(" "));
			allTags.append(		
				$('<span>').attr('style', 'font-size:18px;').append(
					$('<a>').attr('href', '#').on('click', function() { onSearch(null, 3); }).append("Expiring").attr('title', 'Expiring soon')).append(" "));
			allTags.append(		
				$('<span>').attr('style', 'font-size:16px;').append(
					$('<a>').attr('href', '#').on('click', function() { onSearch(null, 4); }).append("Expired").attr('title', 'Already expired')).append(" "));
			allTags.append(		
				$('<span>').attr('style', 'font-size:14px;').append(
					$('<a>').attr('href', '#').on('click', function() { onSearch(null, 5); }).append("Trashed").attr('title', 'Deleted, but can be restored')).append(" "));
			allTags.append(		
				$('<span>').attr('style', 'font-size:12px;').append(" | ").append(
					$('<a>').attr('href', '#').on('click', function() { onSearch(null, 6); }).append("(all)").attr('title', 'All except which are trashed')).append(" "));
			allTags.append("<br /><hr>");
			
			//preset variables as to create no confusion
			var tag=new Array(), ta=new Array();
			var h=0, val=0, i=0;
			//proccess given tag array
			//counting the accurances of tags
			tags.forEach(function(t){
				//current tag has already been recognized
				if (tag[t]) {tag[t]++;}
				//current tag hasn't been recognized
				else{tag[t]=1;ta[i++]=t;}
			});
			
			//find the highest amount of tag accurances in the form of a number
			ta.forEach(function(g){
			//if the current tag count is higher than the current highest, it is the current highest.
				if (tag[g] > h) {h=tag[g];}
			});
			val=(maxsize/h);//get the font-size interval needed to vary sizes
			ta.forEach(function(r){//set the size of the current tag by multiplying the interval by the amount of times the tag is used.
				//set the size, if it is smaller than the minimum font-size, it is the minimum font-size.
				var s=(Math.round(val*tag[r])>minsize) ? Math.round(val*tag[r]) : minsize;
				//concatenate finished styled tag into cloud
				allTags.append(
					$('<span>').attr('style', 'font-size:' + s + 'px;').append(
						$('<a>').attr('href', '#').on('click', function() { onSelectTag(r); }).append(r)).append(" "));
			});
			
			//return cloud 
			return allTags;
		};	
		function setNewButton() {
			$("#editItemMenu").attr('title', 'New');
			$("#editItemMenu2").attr('title', 'New');
			$("#editItemMenuName").text("New");
			$("#editItemMenuName2").text("New");
			$("#newImage").show(); $("#editImage").hide();
			$("#newImage2").show(); $("#editImage2").hide();
		};
		function setEditButton() {
			$("#editItemMenu").attr('title', 'Edit')
			$("#editItemMenu2").attr('title', 'Edit')
			$("#editItemMenuName").text("Edit");
			$("#editItemMenuName2").text("Edit");
			$("#editImage").show(); $("#newImage").hide();
			$("#editImage2").show(); $("#newImage2").hide();
		};
		function getFixedTitle(title) {
			var i = title.indexOf("=");
			if (i !== -1) {
				return title.substring(i + 1); 
			} else {
				return title;
			};
		};
		function refillCategoriesMenu() {
			var cats = $("#cats"); 
			cats.empty();
			spa.data.settings.categories.sort(function(a, b){ 
				var a1= a.title, b1= b.title; if(a1== b1) return 0; return a1> b1? 1: -1;
			});
			$.each(spa.data.settings.categories, function(index, cat) {
				cats.append(
					$('<li>').attr('id', 'cat_' + cat.id).append(
						$('<a>').attr('href','#').on('click', function() { onSelectCategory(cat.id); }).append(
							getFixedTitle(cat.title)
				)));   
			});
		};
		function getExpiry(date, exp) {
			var state = 0; // 0 = valid, 1 = expiring, 2 = expired
			if (date && exp) {
				date = new Date(date);
				exp = parseInt(exp);
				var today = new Date();
				var expiryDate = new Date(date.getTime() + (exp*24*60*60*1000));
				var warningDate = new Date(date.getTime() + ((exp - spa.app.settings.expiryWarningBeforeDays)*24*60*60*1000));
				if (today > warningDate && today < expiryDate) {
					state = 1;
				} else if (today >= expiryDate) {
					state = 2;
				};
			};
			// return
			return state;
		};
		function getExpiryText(date, exp) {
			var expText = "";
			var state = getExpiry(date, exp);
			if (state === 1) {
				expText = '<small><span style="margin-left: 10px;" class="label label-warning">Expiring</span></small>';
			} else if (state === 2) {
				expText = '<small><span style="margin-left: 10px;" class="label label-important">Expired</span></small>';
			};
			
			// return
			return expText;
		};
		function refreshPasswordTypes() {
			var pwdNCtrl = null;
			for (var i=0; i<spa.app.settings.maxPasswords; i++) {
				pwdNCtrl = $("#" + "_pwd_name_" + i.toString());
				pwdNCtrl.empty();
				pwdNCtrl.append($('<option>').attr('value', "").append(""));
				$.each(spa.data.settings.passwordTypes, function(i, pTyp) {					
					pwdNCtrl.append($('<option>').attr('value', pTyp).append(pTyp));
				});	
			};
			var pwdTCtrl = null;	
			for (var i=0; i<spa.app.settings.maxPasswordTypes; i++) {
				pwdTCtrl = $("#" + "_pwd_type_" + i.toString());
				if (spa.data.settings.passwordTypes[i]) {
					pwdTCtrl.val(spa.data.settings.passwordTypes[i]);
				} else {
					pwdTCtrl.val("");
				};
			};
		};
		function refreshCategories(item) {
			if (!item) {
				// when called from categories edit screen
				item = editItem;
				if (!item) {
					// no editing was done, 
					// so go back - no need to refresh
					return;
				};
			};
			var isSelected = false;
			var isSelected2 = false;
			var theItemCat = null;
			$('#_categories').empty();
			$("#_edit_cat").empty().append("<option value=''>(Select)</option>").attr('value', '');
			$.each(spa.data.settings.categories, function(i, cat) {
				// on organize screen //
				isSelected = false;
				theItemCat = null;
				if (isArray(item.cat)) {
					$.each(item.cat, function(ii, itemCat) {
						if (itemCat.id === cat.id) {
							isSelected = true;
							theItemCat = itemCat;
							return false;
						};
					});
				};
				$('#_categories').append(
								 $('<label>').attr('class', 'checkbox dataEntry')
								 .append(
									$('<input>').attr('type', 'checkbox').attr('id', "__cat_" + cat.id)
									.prop('checked', isSelected)
								 )
								 .append("<b>" + getFixedTitle(cat.title) + "</b>")
								 );
				if (isArray(cat.groups)) {
					$.each(cat.groups, function(ii, grpItem) {
						isSelected2 = (isSelected && theItemCat.groups && theItemCat.groups.indexOf(grpItem.id) !== -1);
						$('#_categories').append(
										 $('<label>').attr('class', 'checkbox').attr('style', 'margin-left: 30px;')
										 .append(
											$('<input>').attr('type', 'checkbox').attr('id', "__cat_" + cat.id + "_grp_" + grpItem.id)
											.prop('checked', isSelected2)
										 )
										 .append(getFixedTitle(grpItem.title))
										 );								
					});
				};
				
				// on categories screen (here title will not be fixed)
				$("#_edit_cat").append(
									$('<option>').attr('value', cat.id).append(cat.title)
								);
			});
		};
		function dataObjectToHTML(item) {
			// load values
			$("#_dataTitle").html(item.title);
			$("#_itemId").val(item.id);
			
			// #BASIC# //

			// title
			if (item.title) { 
				$("#_title").val(item.title); 
			} else {
				$("#_title").val("");
			};
			// favorite
			if (item.fav) { 
				$("#_fav").val(item.fav); 
			} else {
				$("#_fav").val("no"); 
			};
			// desc
			if (item.desc) { 
				$("#_desc").val(item.desc); 
			} else {
				$("#_desc").val(""); 
			};
			// info
			if (item.info) { 
				$("#_info").val(item.info.replace(/{CR}/g, "\n")); 
			} else {
				$("#_info").val("");
			};
			// url
			if (item.url) { 
				$("#_url").val(item.url); 
			} else {
				$("#_url").val(""); 
			};
			// login
			if (item.login) { 
				$("#_login").val(item.login); 
			} else {
				$("#_login").val(""); 
			};
			// password types
			refreshPasswordTypes();

			// passwords (latest password by date)
			var pwdNameCtrl = "";
			var pwdCtrl = "";
			for (var i=0; i<spa.app.settings.maxPasswords; i++) {
				pwdNameCtrl = "_pwd_name_" + i.toString();
				pwdCtrl = "_pwd_" + i.toString();
				$("#" + pwdNameCtrl).val("");
				$("#" + pwdCtrl).val("");
			};
			var today = new Date();
			var year = today.getFullYear().toString();
			var month = (today.getMonth() + 1).toString();
			var date =  today.getDate().toString();
			if (month.length === 1) { month = "0" + month; }
			if (date.length === 1) { date = "0" + date; }
			$("#_pwd_as_on").val(year + "/" + month + "/" + date);
			$("#_pwd_exp_days").val("");
			$("#_new_pwd").val("");
			if (isArray(item.pwds) && item.pwds.length > 0) {
				item.pwds.sort(function(a, b){ 
					var a1= a.date, b1= b.date; if(a1== b1) return 0; return a1> b1? 1: -1;
				});
				item.pwds.reverse();
				var pwd = item.pwds[0];
				if (pwd.date) {
					$("#_pwd_as_on").val(pwd.date);
				};
				if (pwd.exp) {
					$("#_pwd_exp_days").val(pwd.exp);
				};
				if (isArray(pwd.pwd)) {
					$.each(pwd.pwd, function(i, pwdItem) {
						pwdNameCtrl = "_pwd_name_" + i.toString();
						pwdCtrl = "_pwd_" + i.toString();
						if(pwdItem.name) { $("#" + pwdNameCtrl).val(pwdItem.name); };
						if(pwdItem.value) { $("#" + pwdCtrl).val(pwdItem.value); };
					});
				};
				
				// history
				var pwdHistory = '<table class="table dataEntry">';
				$.each(item.pwds, function(i, pswd) {
					pwdHistory += '<tr><td>';
					pwdHistory += pswd.date;
					if (i === 0) {
						pwdHistory += '(Current)';
					}; 
					pwdHistory += '<br />';
					if (pswd.pwd.length === 1) {
						pwdHistory += pswd.pwd[0].value;
					} else {
						pwdHistory += "<ul>";
						$.each(pswd.pwd, function(i, pd) {
							pwdHistory += '<li>' + pd.name + ': ' + pd.value + '</li>';
						});	
						pwdHistory += "</ul>";							
					};
					pwdHistory += '<tr>'
				});
				pwdHistory += '</table>';
				$("#_passwordHistory").empty().append(pwdHistory);
			};
			
			// #DETAILS# //
			
			// #MORE INFO# //
			var nameCtrl = "";
			var secNameCtrl = "";
			var ctrl = "";
			for (var i=0; i<spa.app.settings.maxMoreInfo; i++) {
				nameCtrl = "_more_info_name_" + i.toString();
				secNameCtrl = "_more_info_sec_name_" + i.toString();
				ctrl = "_more_info_" + i.toString();
				$("#" + nameCtrl).val("");
				$("#" + ctrl).val("");
				$("#" + secNameCtrl).text("More Information #" + (i+1).toString());
			};
			if (isArray(item.moreInfo)) {
				$.each(item.moreInfo, function(i, infoItem) {
					nameCtrl = "_more_info_name_" + i.toString();
					secNameCtrl = "_more_info_sec_name_" + i.toString();
					ctrl = "_more_info_" + i.toString();
					if(infoItem.name) { 
						$("#" + nameCtrl).val(infoItem.name); 
						$("#" + secNameCtrl).text(infoItem.name);
					};
					if(infoItem.details) { $("#" + ctrl).val(infoItem.details.replace(/{CR}/g, "\n")); };
				});
			};				
			
			// #ORGANIZE# //
			refreshCategories(item);
			
			// #TAGS# //
			var ctrl = "";
			for (var i=0; i<spa.app.settings.maxTags; i++) {
				ctrl = "_tag_" + i.toString();
				$("#" + ctrl).val("");
			};	
			if (isArray(item.tags)) {
				$.each(item.tags, function(i, tag) {
					ctrl = "_tag_" + i.toString();
					if(tag) { $("#" + ctrl).val(tag); };
				});
			};
			
			// #NOTES# //
			var nameCtrl = "";
			var ctrl = "";
			for (var i=0; i<spa.app.settings.maxNotes; i++) {
				nameCtrl = "_note_date_" + i.toString();
				ctrl = "_note_" + i.toString();
				$("#" + nameCtrl).val("");
				$("#" + ctrl).val("");
			};	
			if (isArray(item.notes)) {
				$.each(item.notes, function(i, noteItem) {
					nameCtrl = "_note_date_" + i.toString();
					ctrl = "_note_" + i.toString();
					if(noteItem.date) { $("#" + nameCtrl).val(noteItem.date); };
					if(noteItem.note) { $("#" + ctrl).val(noteItem.note); };
				});
			};				
			
			// #SEE ALSO# //
			var isSelected3 = false;
			$("#_see_also").empty();
			$.each(spa.data.items, function(i, itm) {
				if (itm.id !== item.id) {
					isSelected3 = (item.ref && item.ref.indexOf(itm.id) !== -1);
					$("#_see_also").append(
											$('<option>').attr('value', itm.id).prop('selected', isSelected3)
												.append(itm.title)
										  );
				};
			});
			
			// set focus
			$("#_title").focus();
		};
		function htmlToDataObject() {
			// validate and load into a new item
			var item = createNewItem();
			
			// id
			if (isEditingNew) {
				item.id = newDataId;
			} else {
				item.id = spa.app.state.editDataId;
			};				
			// title
			var itemTitle = $("#_title").val();
			if (!itemTitle) { 
				alert("Name cannot be empty."); 
				$("#_title").focus(); 
				return null;
			} else {
				item.title = itemTitle;
			};
			// favorite
			item.fav = $("#_fav").val();
			// desc
			item.desc = $("#_desc").val(); 
			// url
			item.url = $("#_url").val();
			// login
			item.login = $("#_login").val();
			// passwords
			var pwdNameCtrl = "";
			var pwdCtrl = "";
			var newPwd = {};
			item.pwds = [];
			var pwdOfDate = $("#_pwd_as_on").val();
			if (!pwdOfDate) { 
				alert("Passwords as on date cannot be empty."); 
				$("#_pwd_as_on").focus(); 
				return null;
			};
			var pwdItem = {};
			var name = "";
			var value = "";
			pwdItem.date = pwdOfDate;
			pwdItem.exp = $("#_pwd_exp_days").val();
			pwdItem.pwd = [];
			for (var i=0; i<spa.app.settings.maxPasswords; i++) {
				pwdNameCtrl = "_pwd_name_" + i.toString();
				pwdCtrl = "_pwd_" + i.toString();
				name = $("#" + pwdNameCtrl).val();
				value = $("#" + pwdCtrl).val();
				if (name && value) {
					var newPwd = {};
					newPwd.name = name;
					newPwd.value = value;
					pwdItem.pwd.push(newPwd);
				};
			};
			if (pwdItem.pwd.length > 0) {
				if (isEditingNew) {
					// there is no history, add it
					item.pwds.push(pwdItem);
				} else {
					// get complete list by original item
					item.pwds = editItem.pwds;
					// find pwd by matching date and update it
					// if not found, add it
					var foundAt = -1;
					$.each(item.pwds, function(i, p) {
						if (p.date && p.date === pwdOfDate) {
							foundAt = i;
							return false;
						};
					});
					if (foundAt !== -1) {
						item.pwds[foundAt] = pwdItem;
					} else {
						// not found in history, so add
						item.pwds.push(pwdItem);						
					};
					// finally, keep only last X passwords in history as per setting
					item.pwds.sort(function(a, b){ 
						var a1= a.date, b1= b.date; if(a1== b1) return 0; return a1> b1? 1: -1;
					});		
					item.pwds.reverse();
					item.pwds = item.pwds.slice(0, spa.app.settings.maxPasswordHistory);
				};
			} else {
				if (!isEditingNew) {
					// get complete list by original item
					item.pwds = editItem.pwds;
				};
			};
			// info
			item.info = $("#_info").val().replace(/\n/g, "{CR}");
			// more info
			item.moreInfo = [];
			var nameCtrl = "";
			var ctrl = "";
			var name = "";
			var details = "";
			var miItem = {};
			for (var i=0; i<spa.app.settings.maxMoreInfo; i++) {
				nameCtrl = "_more_info_name_" + i.toString();
				ctrl = "_more_info_" + i.toString();
				name = $("#" + nameCtrl).val();
				details = $("#" + ctrl).val().replace(/\n/g, "{CR}");
				if (name && details) {
					miItem = {};
					miItem.name = name;
					miItem.details = details;
					item.moreInfo.push(miItem);
				};
			};
			// categories and groups
			item.cat = [];
			var catId = "";
			var catGrpId = "";
			var theCat = {};
			$.each(spa.data.settings.categories, function(i, cat) {
				// check if this is checked
				catId = "__cat_" + cat.id;
				theCat = {};
				if ($("#" + catId).prop('checked')) {
					theCat.id = cat.id;
					theCat.groups = [];
					if (isArray(cat.groups)) {
						$.each(cat.groups, function(ii, grpItem) {
							catGrpId = catId + "_grp_" + grpItem.id;
							if ($("#" + catGrpId).prop('checked')) {
								theCat.groups.push(grpItem.id);
							};
						});
					};
					item.cat.push(theCat);
				};
			});
			
			// tags
			item.tags = [];
			var ctrl = "";
			var tag = "";
			for (var i=0; i<spa.app.settings.maxTags; i++) {
				ctrl = "_tag_" + i.toString();
				tag = $("#" + ctrl).val();
				if (tag) {
					item.tags.push(tag);
				};
			};
			// notes
			item.notes = [];
			var nameCtrl = "";
			var ctrl = "";
			var date = "";
			var note = "";
			var noteItem = {};
			for (var i=0; i<spa.app.settings.maxNotes; i++) {
				nameCtrl = "_note_date_" + i.toString();
				ctrl = "_note_" + i.toString();
				date = $("#" + nameCtrl).val();
				note = $("#" + ctrl).val();
				if (date && note) {
					noteItem = {};
					noteItem.date = date;
					noteItem.note = note;
					item.notes.push(noteItem);
				};
			};	
			// see also
			item.ref = [];
			 $("#_see_also option:selected").each(function() {
				item.ref.push($(this).val());
			});
			
			// return
			return item;
		};
		function createNewItem() {
			// put this new item in current category and group
			var theCat = [];
			if (spa.app.state.catId && spa.app.state.grpId) {
				theCat = [
					{	
						id: spa.app.state.catId, 
						groups: 
						[ 
							spa.app.state.grpId,
						],
					},
				];
			};
			// return
			return {
				id: utils.guid(),
				title: "New Data",
				desc: "",
				fav: "",
				cat: theCat,
				tags: [],
				url: "",
				login: "",
				pwds: [],
				info: "",
				moreInfo: [],
				ref: [],
				notes: [],					
			};
		};
		function catObjectToHTML(catItem) {
			// title
			if (catItem.title) { 
				$("#_cat_name").val(catItem.title); 
			} else {
				$("#_cat_name").val("");
			};				
			// desc
			if (catItem.desc) { 
				$("#_cat_desc").val(catItem.desc); 
			} else {
				$("#_cat_desc").val("");
			};				
			// groups
			var grpTitleCtrl = "";
			var grpDescCtrl = "";
			var grpIdCtrl = "";
			for (var i=0; i<spa.app.settings.maxCatGroups; i++) {
				grpTitleCtrl = "_grp_name_" + i.toString();
				grpDescCtrl = "_grp_desc_" + i.toString();
				grpIdCtrl = "_grp_id_" + i.toString();
				$("#" + grpTitleCtrl).val("");
				$("#" + grpDescCtrl).val("");
				$("#" + grpIdCtrl).val("");
			};
			if (isArray(catItem.groups) && catItem.groups.length > 0) {
				$.each(catItem.groups, function(i, catGrp) {
					grpTitleCtrl = "_grp_name_" + i.toString();
					grpDescCtrl = "_grp_desc_" + i.toString();
					grpIdCtrl = "_grp_id_" + i.toString();
					if (catGrp.title) { $("#" + grpTitleCtrl).val(catGrp.title); };
					if (catGrp.desc) { $("#" + grpDescCtrl).val(catGrp.desc); };
					if (catGrp.id) { $("#" + grpIdCtrl).val(catGrp.id); };
				});
			};
			
			// set focus
			$("#_cat_name").focus();
		};
		function htmlToCatObject() {
			// validate and load into a new item
			var item = createNewCatItem();
			
			// id
			if (isEditingNewCat) {
				item.id = utils.guid();
			} else {
				item.id = editCatId;
			};
			// name
			var catName = $("#_cat_name").val();
			if (!catName) { 
				alert("Category name cannot be empty."); 
				$("#_cat_name").focus(); 
				return null;
			} else {
				item.title = catName;
			};
			// desc
			item.desc = $("#_cat_desc").val();
			// groups
			var catGroups = [];
			var grpTitleCtrl = "";
			var grpDescCtrl = "";
			var grpIdCtrl = "";
			var grpId = "";
			var grpName = "";
			var grpDesc = "";
			for (var i=0; i<spa.app.settings.maxCatGroups; i++) {
				grpTitleCtrl = "_grp_name_" + i.toString();
				grpDescCtrl = "_grp_desc_" + i.toString();
				grpIdCtrl = "_grp_id_" + i.toString();
				grpId = $("#" + grpIdCtrl).val();
				grpName = $("#" + grpTitleCtrl).val();
				grpDesc = $("#" + grpDescCtrl).val();
				if (grpId) { 
					// this is an old group
					if (!grpName) {
						// this is now deleted, so don't include it
					} else {
						// this might be updated
						catGroups.push({id: grpId, title: grpName, desc: grpDesc});
					};
				} else {
					// this is an new group
					if (!grpName) {
						// this is now defined, so don't include it
					} else {
						// this needs to be added
						catGroups.push({id: utils.guid(), title: grpName, desc: grpDesc});
					};
				};
			};
			if (catGroups.length === 0) { 
				alert("At least one group must be defined."); 
				$("#_grp_name_0").focus(); 
				return null;
			} else {
				item.groups = catGroups;
			};
			
			// return
			return item;
		};
		function createNewCatItem() {
			// return
			return {
				id: utils.guid(),
				title: "New Category",
				desc: "",
				groups: [
					{
						id: utils.guid(),
						title: "New Group",
						desc: ""
					},
				],
			};
		};
		function getDefaultDataFolder() {
			return fileSystem.getRoot() + spa.app.settings.dataFolder + "/".toLowerCase();
		};
		function getDefaultFileName() {
			var a = $('<a>').attr('href', document.location.href);
			var fullFileName = a.prop('pathname').replace(".html", "." + spa.app.settings.dataFileExtension);
			return fullFileName.substring(fullFileName.lastIndexOf("/") + 1);
		};
		function getDemoFileName() {
			return spa.app.settings.demoDataFile + "." + spa.app.settings.dataFileExtension;
		};
		function getFileNameToSave() {
			var fileName = "";
			if (spa.app.state.dataFile) {
				fileName = spa.app.state.dataFile;
			} else {
				fileName = getDefaultDataFolder() + getDefaultFileName();
			};	
			return fileName;
		};
		function refillCategoriesList() {
			$("#_edit_cat").empty().append("<option value=''>(Select)</option>").attr('value', '');
			$.each(spa.data.settings.categories, function(i, cat) {
				$("#_edit_cat").append(
									$('<option>').attr('value', cat.id).append(cat.title)
								);
			});
		};
		function listItems(items, includeTrashed) {
			var data = "";
			if (isArray(items) && items.length > 0) {
				items.sort(function(a, b){ 
					var a1= a.title, b1= b.title; if(a1== b1) return 0; return a1> b1? 1: -1;
				});	
				data = $('<table>').attr('class', 'table table-striped table-hover');
				var isShow = true;
				$.each(items, function(index, item) {
					isShow = true;
					if (item.trash === "yes" && !includeTrashed) { isShow = false; }
					if (isShow) {
						data.append(
							$('<tr>').append(
								$('<td>').append(
									$('<a>').attr('href', '#').on('click', function() { onSelectData(item.id); }).append(
										item.title)).append(' ').append(
											(item.fav === "yes" ? $('<span>').append('&#9734;') : ''))).append(
								$('<td>').append(item.desc)));
					};
				});
			};	
			return data;
		};
		
		// properties
		this.title = "Simple Passwords App";
		this.version = "0.9.4";
		this.versionId = 0.94;
		this.dataFormatVersionId = 1;
		this.copyright = "&copy; 2013-2016, Vikas Burman. All rights reserved.";
		this.tagline = "Simple, smart, secure, and sufficient portable app to store all your passwords.";
		this.url = "https://github.com/vikasburman/spa";
		this.newVersionDefinitionUrl = "https://raw.github.com/vikasburman/spa/master/updates.js"; 
		this.server = {
			// latest version info (this gets updated by loading a version info file from server)
			latestVersion: {
				versionId: 0.93,
				url: "https://github.com/vikasburman/spa",
				title: "Version 0.9.4",
			}
		};
		this.settings = {
			maxPasswords: 5,
			maxPasswordHistory: 10,
			maxPasswordTypes: 12,
			maxMoreInfo: 12,
			maxTags: 15,
			maxNotes: 20,
			maxCatGroups: 10,
			expiryWarningBeforeDays: 15,
			dataFileExtension: "pjs",
			stateKey: "spa",
			demoDataFile: "demo",
			demoDataFilePassword: "1234",
			dataFolder: "data",
			dataFileRootObject: "spaData",
		};
		this.state = {};
		this.canEdit = (typeof nw !== 'undefined');
	
		// event handlers
		function onCheckForUpdate() {
			// look for new version availability
			if (spa.app.newVersionDefinitionUrl) {
				utils.loadJS(spa.app.newVersionDefinitionUrl, function(isError) {
					if (!isError && window.spaLatestVersion) {
						spa.app.server.latestVersion = window.spaLatestVersion;
						if (spa.app.server.latestVersion.versionId > spa.app.versionId) {
							$("#checkForUpdate")
								.off('click')
								.on('click', function() { _a(spa.app.server.latestVersion.url); event.preventDefault(); })			
								.text('Download')
								.addClass('badge badge-success')
								.prop('target', '_blank')
								.prop('href', '#')
								.prop('title', "A new version (" + spa.app.server.latestVersion.title + ") is available now. Click here to download.");
						} else {
							$("#checkForUpdate")
								.off('click')
								.text('No Updates')
								.addClass('badge')
						};							
					};
				});
			};
		};
		function onSelectDataFile(selectedType) {
			var dataFile = "";
			dataFileType = "";
			switch(selectedType) {
				case 'default':
					dataFile = getDefaultFileName();
					$("#dataFolderGroup").show();
					$("#dataFolder").val(getDefaultDataFolder());
					$("#dataFolder").attr("readonly", 'readonly');
					$("#changeDataFolder").hide();
					$("#dataFile").attr("disabled", "disabled");
					$("#dataFileDialogTitle").text("Open Default");
					$("#dataFileTitleGroup").hide();
					$("#dataFileDialog").on('shown', function () { 
						$("#pwd").focus(); 
					});	
					$("#demoPassword").hide();
					dataFileType = selectedType;
					break;
				case 'demo':
					dataFile = getDemoFileName();
					$("#dataFile").attr("disabled", "disabled");
					$("#dataFolderGroup").show();
					$("#dataFolder").val(getDefaultDataFolder());
					$("#changeDataFolder").hide();
					$("#dataFileTitleGroup").hide();
					$("#dataFileDialogTitle").text("Open Demo");
					$("#dataFileDialog").on('shown', function () { 
						$("#pwd").focus(); 
					});	
					$("#demoPassword").text("Use '" + spa.app.settings.demoDataFilePassword + "' as password.").show();
					dataFileType = selectedType;
					break;
				case 'select':
					dataFile = "";
					$("#dataFile").removeAttr("disabled");
					$("#dataFolder").val(getDefaultDataFolder());
					$("#dataFolder").attr("readonly", 'readonly');
					$("#dataFolderGroup").show();
					$("#changeDataFolder").show();
					$("#dataFileTitleGroup").hide();
					$("#dataFileDialogTitle").text("Open...");
					$("#dataFileDialog").on('shown', function () { 
						$("#dataFile").focus(); 
					});	
					$("#demoPassword").hide();
					dataFileType = selectedType;
					break;
				case 'new':
					dataFile = "";
					$("#dataFile").removeAttr("disabled");
					$("#dataFolder").val(getDefaultDataFolder());
					$("#dataFolder").attr("readonly", 'readonly');
					$("#dataFolderGroup").show();
					$("#changeDataFolder").show();
					$("#dataFileTitleGroup").show();
					$("#dataFileDialogTitle").text("New...");
					$("#dataFileDialog").on('shown', function () { 
						$("#dataFile").focus(); 
					});	
					$("#demoPassword").hide();
					dataFileType = selectedType;							
					break;
			};
			
			// set value
			$("#dataFile").val(dataFile.toLowerCase());
			$('#dataFileDialog').modal('show'); 
		};
		function onDataFileDefine() {
			$('#dataFileDialog').modal('hide');
			var dataFolder = $("#dataFolder").val();
			var dataFile = dataFolder + (dataFolder.substring(dataFolder.length - 1) === "/" ? "" : "/") + $("#dataFile").val().toLowerCase();
			dataFile = fileSystem.ensureExtension(dataFile, spa.app.settings.dataFileExtension);
			var definedType = dataFileType;
			dataFileType = "";
			if (definedType === "new") {
				onNewDataFile(dataFile);
				return;
			};
			$("#dataFile").val("");
			$("#dataFolder").val("");

			// pin
			if (!spa.app.state.pin) {
				spa.app.state.pin = $("#pwd").val();
				saveState();
				$("#pwd").val("");
			};
			
			// load data file
			utils.loadJS((typeof nw !== 'undefined' ? './' : 'file://') + dataFile, function(isError) {
				if (!isError) {
					onDataFileLoad(dataFile);
				} else {
					if (definedType === "default" && spa.app.canEdit) {
						if (!fileSystem.isFileExists(dataFile)) {
							if (confirm("Your default passwords file does not exists. Do you want to create it now?")) {
								// define default
								$("#dataFile").val(dataFile);
								$("#dataFileTitle").val("My Passwords");
								$("#pwd").val("1234");
								dataFileType = 'new';
								onDataFileDefine();
								return;
							};
						} else {
							alert("File '" + dataFile.toLowerCase() + "' could not be opened.");
						};
					} else {
						alert("File '" + dataFile.toLowerCase() + "' could not be located/opened.");
					};
					
					// clean-up
					onLogout();
				};
			});
		};
		function onDataFileLoad(dataFile) {
			// load data
			dataFile = dataFile.replace("//", "/");
			spa.data = null;
			var isSuccess = false;
			try {
				spa.data = window[spa.app.settings.dataFileRootObject];
				data = null;
				isSuccess = true;
				if (dataFile) {
					spa.app.state.dataFile = dataFile;
					saveState();
				};
			} catch (ex) {
				isSuccess = false;
			};
			
			if (isSuccess) {
				// when data file loaded
				resetEnvironmentWithDataLoadOrChanges();
		
				// try and login to go back to same place
				onLogin();
			} else {
				// inform
				alert("Failed to load data file.");
				
				// perform a logout to clear up
				onLogout();
			};
		};
		function onGoBack() {
			// go back
			switch (spa.app.state.lastScreen) {
					case "home":
						onHome();
						break;
					case "search":
						onSearch();
						break;
					case "print":
						onPrint();
						break;
					case "dataItem":
						onSelectData();
						break;
					case "settings":
						onEditSettings();
						break;								
					case "editItem":
						onEditData("", false, true);
						break;
			};
		};
		function onHome() {
			// go home section
			navigate("home", true);

			// show tags (including favorites and uncategorized links)
			var tags = [];
			$.each(spa.data.items, function(i, item) {
				if (item.tags) {
					tags = tags.concat(item.tags);
				};
			});
			var tagsData = tagCloud(tags);
			$("#tags").empty().append(tagsData);
			
			// select category
			onSelectCategory();
		};
		function onSearch(searchDepth, searchType) {
			// go search section
			navigate("search", true);
			
			if (typeof searchType === 'undefined') {
				searchType = spa.app.state.searchType; // 0-Default, 1-favorites, 2-uncategorized, 3-Expiring, 4-Expired, 5-Trashed, 6-All, 7-A specific tagged items
			};
			
			// if something is there to search
			var	searchText = "";
			switch (searchType) {
				case 0: // default
					// update setting
					if (searchDepth !== 'undefined' && searchDepth !== null && (searchDepth === "" || searchDepth === "min" || searchDepth === "max")) {
						spa.app.state.settings.searchDepth = searchDepth;
						saveState();
					};
					var searchButtonText = "Search";
					switch(spa.app.state.settings.searchDepth) {
						case "min":
							searchButtonText += " (quick)";
							break;
						case "max":
							searchButtonText += " (full)";
							break;
					};		
					$("#searchButton").text(searchButtonText);
					// search what
					searchText = $("#searchWhat").val();
					if (searchText.length === 0) {
						searchText = $("#searched").val();
						if (searchText.length === 0) {
							searchText = spa.app.state.searchText;
							if (searchText.length === 0) {
								return false;
							};
						};
					};
					$("#searchWhat").val("");
					$("#searched").val(searchText).css('color', 'black');
					break;
				case 1: // favorites
					searchText = "favorites";
					$("#searched").val(searchText).css('color', 'red');						
					break;
				case 2: // uncategorized
					searchText = "uncategorized";
					$("#searched").val(searchText).css('color', 'red');
					break;
				case 3: // expiring
					searchText = "expiring";
					$("#searched").val(searchText).css('color', 'red');
					break;
				case 4: // expired
					searchText = "expired";
					$("#searched").val(searchText).css('color', 'red');
					break;
				case 5: // trashed
					searchText = "trashed";
					$("#searched").val(searchText).css('color', 'red');
					break;
				case 6: // all
					searchText = "all";
					$("#searched").val(searchText).css('color', 'red');
					break;					
				case 7: // specific tag
					searchText = $("#searched").val();
					if (searchText.length === 0) {
						searchText = spa.app.state.searchText;
						if (searchText.length === 0) {
							return false;
						};
					};
					$("#searched").val(searchText).css('color', 'blue');
					break;
			};
			
			// save in state
			spa.app.state.searchText = searchText;
			spa.app.state.searchType = searchType;
			saveState();
			
			// search
			var items = [];
			var isMatched = false;
			var searchLevel = 1; // default
			var isIncludeTrashed = false;
			switch(searchType) {
				case 0: // default
					switch(spa.app.state.settings.searchDepth) {
						case "min":
							searchLevel = 0; // min (title, desc)
							break;
						case "max":
							searchLevel = 2; // max (title, desc, info, moreInfo, tags, login, url, pwds, notes)
							break;
						default:
							searchLevel = 1; // default (title, desc, info, moreInfo, tags)
					};
					searchText = searchText.toLowerCase();
					$.each(spa.data.items, function(i, item) {
						isMatched = false;
						if (item.title && item.title.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; };
						if (!isMatched && item.desc && item.desc.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; };
						if (!isMatched && searchLevel >= 1) {
							if (!isMatched && item.info && item.info.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; };
							if (!isMatched && item.moreInfo) {
								$.each(item.moreInfo, function(i, mi) {
									if (mi.name && mi.name.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; return false; };
									if (mi.details && mi.details.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; return false; };
								});
							};
							if (!isMatched && item.tags) {
								$.each(item.tags, function(i, tag) {
									if (tag.toLowerCase() === searchText) { isMatched = true; return false; };
								});
							};
							if (!isMatched && searchLevel >= 2) {
								if (!isMatched && item.login && item.login.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; };
								if (!isMatched && item.url && item.url.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; };
								if (!isMatched && item.ref) {
									$.each(item.ref, function(i, ref) {
										if (ref.name && ref.name.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; return false; };
									});
								};
								if (!isMatched && item.pwds) {
									$.each(item.pwds, function(i, pwd) {
										if (pwd.date && pwd.date === searchText) { isMatched = true; return false; };
										if (!isMatched && pwd.pwd) {
											$.each(pwd.pwd, function(i, p) {
												if (p.name && p.name.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; return false; };
												if (p.value && p.value.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; return false; };
											});
										};
										if (isMatched) { return false; };
									});
								};	
								if (!isMatched && item.notes) {
									$.each(item.notes, function(i, note) {
										if (note.date && note.date === searchText) { isMatched = true; return false; };
										if (note.note && note.note.toLowerCase().indexOf(searchText) !== -1) { isMatched = true; return false; };
									});
								};								
							};
						};
						
						// add to search list
						if (isMatched) { 
							items.push(item); 
						};
					});
					break;
				case 1: // favorites
					$.each(spa.data.items, function(i, item) {
						if (item.fav && item.fav.toLowerCase() === "yes") {
							items.push(item); 
						};
					});
					break;
				case 2: // uncategorized
					$.each(spa.data.items, function(i, item) {
						if (!item.cat || item.cat.length === 0) {
							items.push(item); 
						};
					});
					break;
				case 3: // expiring
					$.each(spa.data.items, function(i, item) {
						// pick latest password by date
						if (isArray(item.pwds) && item.pwds.length > 0) {
							item.pwds.sort(function(a, b){ 
								var a1= a.date, b1= b.date; if(a1== b1) return 0; return a1> b1? 1: -1;
							});
							item.pwds.reverse();
							if (getExpiry(item.pwds[0].date, item.pwds[0].exp) === 1) {
								items.push(item); 
							};
						};
					});
					break;
				case 4: // expired
					$.each(spa.data.items, function(i, item) {
						// pick latest password by date
						if (isArray(item.pwds) && item.pwds.length > 0) {
							item.pwds.sort(function(a, b){ 
								var a1= a.date, b1= b.date; if(a1== b1) return 0; return a1> b1? 1: -1;
							});
							item.pwds.reverse();
							if (getExpiry(item.pwds[0].date, item.pwds[0].exp) === 2) {
								items.push(item); 
							};
						};
					});
					break;	
				case 5: // trashed
					$.each(spa.data.items, function(i, item) {
						if (item.trash === "yes") {
							items.push(item); 
						};
					});
					isIncludeTrashed = true;
					break;							
				case 6: // all
					$.each(spa.data.items, function(i, item) {
						if (item.trash !== "yes") {
							items.push(item); 
						};
					});
					break;							
				case 7: // a specific tag
					searchText = searchText.toLowerCase();
					$.each(spa.data.items, function(i, item) {
						if (item.tags) {
							$.each(item.tags, function(i, tag) {
								if (tag.toLowerCase() === searchText) { items.push(item); return false; };
							});
						};
					});
					break;
			};
			$("#searchContent").empty().append(listItems(items, isIncludeTrashed));
			$("#searchItemsCount").text(items.length.toString());
		};
		function onPrint() {
			// go search section
			navigate("print", true);

			// build clean html for print
			var html = $("#printContent");
			html.empty();
			html.append(
				$('<span>').attr('class', 'pull-right').attr('style', 'margin-top: 13px;').append(
				'(as on ' + spa.data.settings.lastUpdate + ')'));
			html.append($('<h3>').append(spa.data.settings.title));
			var table = $('<table>').attr('class', 'table table-striped');
			var itemPwds = null;
			$.each(spa.data.items, function(index, item) {
				if (item.trash !== "yes") {
					itemPwds = $('<span>');
					if (isArray(item.pwds) && item.pwds.length > 0) {
						var pwd = "";
						item.pwds.sort(function(a, b){ 
							var a1= a.date, b1= b.date; if(a1== b1) return 0; return a1> b1? 1: -1;
						});
						item.pwds.reverse();
						var pwd = item.pwds[0].pwd;
						var expText = getExpiryText(item.pwds[0].date, item.pwds[0].exp);
						if (pwd.length === 1) {
							itemPwds.append("<b>Password</b>: <span class='plainData'>" + pwd[0].value + "</span> " + expText);
						} else {
							itemPwds.append("<b>Passwords</b>: " + expText + "<br />");
							$.each(pwd, function(i, p) {
								itemPwds.append("<i>" + p.name + "</i>: <span class='plainData'>" + p.value + "</span><br />");
							});
						};
					};
					table.append(
						$('<tr>').append(
							$('<td>').append(
								$('<span>').append("<b>" + item.title + "</b><br />" + item.url + '<br /><br />' + item.desc))).append(
							$('<td>').append("<b>Login</b>: <span class='plainData'>" + item.login + "</span><br />").append(itemPwds)));
				};
			});
			html.append(table);
			html.append($('<hr>'));
		};
		function onHideHeaderFooter() {
			$("#printMessage").hide();
			$('#appHeader').hide();
			$('#appFooter').hide();
			$('#extraTopSpaces').hide();
			$('#showHeaderFooterDiv').show();
		};
		function onShowHeaderFooter() {
			$("#printMessage").show();
			$('#appHeader').show();
			$('#appFooter').show();
			$('#extraTopSpaces').show();
			$('#showHeaderFooterDiv').hide();
		};
		function onBeginPrint() {
			window.print();
		};
		function onSelectCategory(catId) { 
			// get category
			if (!catId) {
				catId = spa.app.state.catId;
				if (!catId) {
					catId = spa.data.settings.categories[0].id;
				};
			};
			
			// find category and sort its groups, if found
			var cat = { id: "xxx1", title: "Category not found.", groups: [] };
			$.each(spa.data.settings.categories, function(index, c) {
				if (c.id === catId) { 
					cat = c;
					if (!cat.isSorted) {
						cat.groups.sort(function(a, b){ 
							var a1= a.title, b1= b.title; if(a1== b1) return 0; return a1> b1? 1: -1;
						});
					};
					cat.isSorted = true;
					return false; 
				};
			});
			
			// show category header including pills for category groups
			$("#catTitle").html(getFixedTitle(cat.title));
			$("#catDesc").html(cat.desc);
			$("#cat_grps").empty();
			$("#grpData").empty();
			var grps = $("#cat_grps");
			$.each(cat.groups, function(index, grp) {
				grps.append(
					$('<li>').attr('id', 'cat_' + cat.id + "_grp_" + grp.id).append(
						$('<a>').attr('href','#').on('click', function() { onSelectGroup(cat.id, grp.id); }).append(
							getFixedTitle(grp.title)
				)));   
			});					
			
			// select category
			$("#cat_" + cat.id).addClass("active").siblings().removeClass("active");
			
			// select group (as applicable)
			onSelectGroup(cat.id, "");
		};
		function onSelectGroup(catId, grpId) {
			// get cat 
			if (!catId) {
				catId = spa.app.state.catId;
				if (!catId) {
					catId = spa.data.settings.categories[0].id;
				};
			};
		
			// find category and group
			var cat = { id: "xxx1", title: "Category not found.", groups: [] };
			var grp = { id: "xxx2", title: "Group not found.", desc: "" };
			$.each(spa.data.settings.categories, function(index, c) {
				if (c.id === catId) { 
					cat = c;
					
					// get group
					if (!grpId) {
						if (spa.app.state.catId === catId) {
							grpId = spa.app.state.grpId;
						};
						if (!grpId) {
							grpId = cat.groups[0].id;
						};							
					};
					
					if (c.groups) {
						$.each(c.groups, function(index2, g) {
							if (g.id === grpId) {
								grp = g;
								return false;
							};
						});
					};
					return false; 
				};
			});

			// save to state
			spa.app.state.catId = catId;
			spa.app.state.grpId = grpId;
			saveState();
			
			// select group
			$("#cat_" + cat.id + "_grp_" + grp.id).addClass("active").siblings().removeClass("active");
			
			// show group description and sorted data items
			$("#grpDesc").html(grp.desc);
			if (grp.desc.length !== 0) {
				$("#pageHeader").css("margin-bottom", "10px");
			} else {
				$("#pageHeader").css("margin-bottom", "30px");
			};
			var items = [];
			$.each(spa.data.items, function(index, item) {
				$.each(item.cat, function(i, itemCat) {
					if (itemCat.id === cat.id && itemCat.groups.indexOf(grp.id) !== -1) {
						items.push(item);
						return false;
					};
				});
			});
			$("#grpData").empty().append(listItems(items));
		};
		function onSelectPrevData() {
			if (prevDataId) {
				onSelectData(prevDataId);
			};
		};
		function onSelectNextData() {
			if (nextDataId) {
				onSelectData(nextDataId);
			};
		};
		function onSelectData(dataId) {
			// go to data item section
			navigate("dataItem", true);
			
			// get data 
			if (!dataId) {
				dataId = spa.app.state.dataId;
				if (!dataId) {
					displayDataId = "";
					$("#dataItemContent").hide();
					$("#noDataLoaded").show();
					return false; // don't do anything
				};
			};
			
			// find data item and prev and next
			var item = { id:"xxx3", title:"Data not found.", desc: "" };
			prevDataId = "";
			nextDataId = "";
			var lastDataId = "";
			$.each(spa.data.items, function(index, itm) {
				if (itm.id === dataId) {
					item = itm;
					prevDataId = lastDataId;
					if (index < spa.data.items.length - 1) {
						for (var ii=index+1; ii< spa.data.items.length; ii++) {
							if (spa.data.items[ii].trash !== "yes") {
								nextDataId = spa.data.items[ii].id;
								break;
							};
						};
					};
					return false;
				};
				if (itm.trash !== "yes") {
					lastDataId = itm.id;
				};
			});
			
			// save state
			spa.app.state.dataId = dataId; 
			displayDataId = dataId;
			saveState();
			
			// prev, next and show see also, etc. links
			if (prevDataId.length === 0) { 
				$("#previousDataButton").addClass('disabled');
			} else {
				$("#previousDataButton").removeClass('disabled');
			};
			if (nextDataId.length === 0) { 
				$("#nextDataButton").addClass('disabled');
			} else {
				$("#nextDataButton").removeClass('disabled');
			};
			if (spa.app.canEdit) {
				$("#editDeleteButtons").show();
			} else {
				$("#editDeleteButtons").hide();
			};
			if (item.trash === "yes") {
				$("#inTrashMessage").show();
				$("#trashDataButton").hide();
				$("#restoreDataButton").show();
				$("#deleteDataButton").show();
				$("#editDataButton").hide();
				$("#nextDataButton").hide();
				$("#previousDataButton").hide();
			} else {
				$("#inTrashMessage").hide();
				$("#trashDataButton").show();
				$("#restoreDataButton").hide();
				$("#deleteDataButton").hide();
				$("#editDataButton").show();
				$("#nextDataButton").show();
				$("#previousDataButton").show();
			};
			var seeAlsoList = $("#seeAlsoList");
			seeAlsoList.empty();
			if (isArray(item.ref) && item.ref.length > 0) {
				$("#seeAlsoButton").removeClass('disabled');
				// all links that are defined
				$.each(spa.data.items, function(i, itm) {
					if (item.ref.indexOf(itm.id) !== -1) {
						seeAlsoList.append(
							$('<li>').append(
								$('<a>').attr('href', '#').attr('tabindex', '-1').on('click', 
									function() { onSelectData(itm.id); }).append(itm.title)));
					};
				});
			} else {
				$("#seeAlsoButton").addClass('disabled');
			};

			// show other header information
			$("#itemTitle").html(item.title);
			if (item.fav === "yes") {
				$("#itemFav").show();
			} else {
				$("#itemFav").hide();
			};
			$("#itemUrl").off('click');
			if (item.url && item.url.length > 0) {
				var a = $('<a>').prop('href', item.url);
				var favicon = a.prop("protocol") + "//" + a.prop("hostname") + "/favicon.ico";
				if (spa.app.canEdit) {
					// shell
					$("#itemUrl").text(item.url).show().on('click', function() { _a(item.url); event.preventDefault(); });
				} else {
					// browser
					$("#itemUrl").attr('href', item.url).text(item.url).show();
				}
				$("#itemUrlFavIcon").attr('src', favicon).show();				
			} else {
				$("#itemUrl").hide();
				$("#itemUrlFavIcon").hide();
			};
			
			// login name
			var isLoginOrPwdShown = true;
			if (item.login) {
				$("#itemLoginNameText").show();
				$("#itemLoginName").html(item.login).show();
			} else {
				$("#itemLoginNameText").hide();
				$("#itemLoginName").hide();
				isLoginOrPwdShown = false;
			};
		
			// pick and show latest password(s) by date
			if (isArray(item.pwds) && item.pwds.length > 0) {
				$("#itemPasswords").show();
				isLoginOrPwdShown = true;
				var pwd = "";
				item.pwds.sort(function(a, b){ 
					var a1= a.date, b1= b.date; if(a1== b1) return 0; return a1> b1? 1: -1;
				});
				item.pwds.reverse();
				var pwd = item.pwds[0].pwd;
				var expText = getExpiryText(item.pwds[0].date, item.pwds[0].exp);
				if (pwd.length === 1) {
					$("#itemPasswordText").html("Password:");
					$("#itemPassword").html(pwd[0].value).show();
					$("#itemPasswordsList").hide();
					$("#itemPasswordExpiryText").html(expText);
					if (item.pwds.length > 1) {
						$("#passwordHistoryLink").show();
					} else {
						$("#passwordHistoryLink").hide();
					};
				} else {
					$("#itemPasswordText").html("Passwords:");
					$("#itemPassword").empty().hide();
					if (item.pwds.length > 1) {
						$("#passwordHistoryLink").show();
					} else {
						$("#passwordHistoryLink").hide();
					};
					$("#itemPasswordExpiryText").html(expText);
					var pwdList = $("#itemPasswordsList");
					pwdList.empty().show();
					$.each(pwd, function(i, p) {
						pwdList.append(
							$('<li>').append(
								$('<i>').append(p.name + ': ').append(
									$('<span>').attr('class', 'keyData').append(p.value))));
					});
				};
			} else {
				$("#itemPasswords").hide();
			};
			if (isLoginOrPwdShown) {
				$("#currentPwdBox").show();
			} else {
				$("#currentPwdBox").hide();
			};
				
			// description
			if (item.desc) {
				$("#itemDesc").html(item.desc);
			} else {
				$("#itemDesc").empty();
			};
			
			// tags
			var itemTags = $("#itemTags");
			itemTags.empty().show();
			if (isArray(item.tags) && item.tags.length > 0) {
				$("#tagsArea").show();
				var isFirst = true;
				$.each(item.tags, function(i, tag) {
					if (!isFirst) {
						itemTags.append(", ");
					};
					itemTags.append(
						$('<a>').attr('href', '#').on('click', function() { onSelectTag(tag); }).append(tag));
					isFirst = false;
				});
			} else {
				itemTags.hide();
				$("#tagsArea").hide();
			};
			
			// details
			if (item.info) {
				$('#itemDetails').html(item.info.replace(/{CR}/g, "<br />") + "<br /><br />").show();
			} else {
				$('#itemDetails').hide();
			};
			
			// additional details
			var itemAdditionalDetails = $("#itemAdditionalDetails");
			itemAdditionalDetails.empty().show();
			if ((isArray(item.moreInfo) && item.moreInfo.length > 0)) {
				itemAdditionalDetails.append(
					$('<h4>').text("Additional Details"));
				var ad = $('<table>').attr('class', 'table');
				$.each(item.moreInfo, function(i, info) {
					ad.append(
						$('<tr>').append(
							$('<td>').append(
								$('<b>').append(info.name)).append(": " + info.details.replace(/{CR}/g, "<br />"))));
				});
				itemAdditionalDetails.append(ad);
			} else {
				itemAdditionalDetails.hide();
			};

			// notes
			var itemNotes = $('#itemNotes');
			itemNotes.empty().show();
			if (isArray(item.notes) && item.notes.length > 0) {
				itemNotes.append(
					$('<h4>').text("Notes"));
				item.notes.sort(function(a, b){ 
					var a1= a.date, b1= b.date; if(a1== b1) return 0; return a1> b1? 1: -1;
				});		
				var nd = $('<table>').attr('class', 'table');
				$.each(item.notes, function(i, note) {
					nd.append(
						$('<tr>').append(
							$('<td>').append(
								$('<b>').append(note.date)).append(": " + note.note)));
				});
				itemNotes.append(nd);
			} else {
				itemNotes.hide();
			};
			
			// password(s) history
			var pwdHistory = $('#pwdHistory');
			pwdHistory.empty().hide();
			if (isArray(item.pwds) && item.pwds.length > 0) {
				pwdHistory.append(
					$('<h4>').text("Password History"));
				var phd = $('<table>').attr('class', 'table');
				var pwdata = "";
				$.each(item.pwds, function(i, pswd) {
					if (pswd.pwd.length === 1) {
						pwdata = $('<span>').append(" " + pswd.pwd[0].value);
					} else {
						pwdata = $('<ul>');
						$.each(pswd.pwd, function(i, pd) {
							pwdata.append(
								$('<li>').append(
									$('<i>').append(pd.name + ': ' + pd.value)));
						});	
					};
					phd.append(
						$('<tr>').append(
							$('<td>').append(
								$('<b>').append(pswd.date)).append(": ").append(pwdata)));
				});
				pwdHistory.append(phd);
			};
		
			// show
			$("#noDataLoaded").hide();
			$("#dataItemContent").show();
		};
		function onSelectTag(tag) {
			$("#searched").val(tag);
			onSearch(null, 7);
		};
		function onShowPwdHistory() {
			// toggle password(s) history
			$("#pwdHistory").toggle();
			if ($("#pwdHistory").attr('display') !== "none") {
				$('html, body').animate({
				 scrollTop: $("#pwdHistory").offset().top
				}, 2000);
			 };
		};
		function onLogin() { 
			// consider session
			var pin = ""
			if (spa.app.state.pin !== "") {
				pin = spa.app.state.pin;
			} else {
				pin = $("#pwd").val();
			};
			
			// check
			if (pin === spa.data.settings.pin) {
				spa.app.state.pin = pin;
				saveState();
				
				// go to last screen (before refresh)
				navigate("", true);
				
				// take apt action
				if (spa.app.state.isNewFile) {
					// go to edit settings
					onEditSettings();
				} else {
					switch (spa.app.state.screen) {
						case "home":
							onHome();
							break;
						case "search":
							onSearch();
							break;
						case "print":
							onPrint();
							break;
						case "dataItem":
							onSelectData();
							break;
						case "settings":
							onEditSettings();
							break;								
						case "editItem":
							onEditData("", false, true);
							break;
					};
				};
			} else {
				if (pin.length > 0) {
					alert('Incorrect pin.');
					
					// perform a logout to clean-up
					onLogout();
				};
			}; 
			$("#pwd").val("");
		};
		function onLogout() { 
			// clear state
			window.name = "";
			
			// clear data
			spaData = null;
			
			// reload without cache
			window.location.reload(true);
			// NOTE: On Safari this does not work, therefore Browser cache must be disabled
			//       so that edits are reflected instantly and a manual Refresh is not required.
			//       Tested on IE and Chrome, works fine.
		};
		function onNewDataFile(dataFile) {
			// get basics
			var pin = $("#pwd").val();
			var title = $("#dataFileTitle").val();
			if (!dataFile || !pin || !title) {
				alert("Please specify complete information.");
				return;
			};
			$("#dataFile").val("");	
			$("#pwd").val("");
			$("#dataFileTitle").val("");
			
			// load new data and then update
			spa.data = newSPAdata; // predefined set bundled in here
			spa.data.settings.pin = pin;
			spa.data.settings.title = title;
			spa.data.settings.lastUpdate = utils.getNowAsString();
			spa.data.settings.dataFormatVersionId = spa.app.dataFormatVersionId.toString();
			spa.data.settings.appVersionId = spa.app.versionId.toString();

			// save file
			var isSuccess = saveData(dataFile, spa.data, spa.app.settings.dataFileRootObject);
			if (isSuccess) {
				// update state
				spa.app.state.pin = pin;
				spa.app.state.catId = "";
				spa.app.state.grpId = "";
				spa.app.state.dataId = "";
				spa.app.state.searchText = "";
				spa.app.state.searchType = 0;
				spa.app.state.dataFile = dataFile;
				spa.app.state.editDataId = "";
				spa.app.state.isNewFile = true;
				spa.app.state.settings.searchDepth = "";
				saveState();
			
				// reload
				resetEnvironmentWithDataLoadOrChanges();

				// set ui
				setNewButton();

				// go home
				onHome();
				
				// open settings afterwards
				onEditSettings();
			} else {
				// clean-up by logging out
				onLogout();
			};
		};
		function onAddData() {
			// forward
			onEditData("", true, false);
		};
		function onAddEditData() {
			if (spa.app.state.editDataId === "" && isEditingNew === false) {
				onAddData();
			} else {
				onEditData();
			};
		};
		function onEditDisplayData() {
			if (displayDataId) {
				onEditData(displayDataId, false, false);
			};
		};
		function onRestoreDisplayData() {
			if (displayDataId) {
				onRestoreData(displayDataId);
			};	
		};
		function onTrashDisplayData() {
			if (displayDataId) {
				onTrashData(displayDataId);
			};				
		};
		function onDeleteDisplayData() {
			if (displayDataId) {
				onDeleteData(displayDataId);
			};				
		};
		function onEditData(dataId, isNew, isReload) {
			var isLoadAFresh = false;
			if (isNew) {
				// if new being asked
				isLoadAFresh = true;
				dataId = utils.guid();
				isEditingNew = true;
				newDataId = dataId;
			} else if (isReload) {
				// if it is a reload (after refresh)
				if (spa.app.state.editDataId) {
					dataId = spa.app.state.editDataId;
					isEditingNew = false;
				} else {
					// since id was not there and this is a reload of a new scenario, means 
					// this was a new unsaved record
					dataId = utils.guid(); // regenerate
					isEditingNew = true;
					newDataId = dataId;
				};
				isLoadAFresh = true;
			} else if (dataId) {
				// this is coming from Edit button of data screen for a new edit request
				if (spa.app.state.editDataId) {
					if (spa.app.state.editDataId !== dataId) {
						// if something was already being edited which is not what is being asked now
						if (confirm("Another data item was being edited. Discard those changes?")) {
							// discard previous editing scenario
							spa.app.state.editDataId = "";
							saveState();
							isLoadAFresh = true;
						} else {
							// stop loading, go back
							return;
						};
					} else {
						// take this data id as is
						isLoadAFresh = true;
					};
				} else if (isEditingNew) {
					// if a new record was being edited earlier
					if (confirm("A new data item was being edited. Discard those changes?")) {
						// discard previous editing scenario
						isEditingNew = false;
						newDataId = "";
						isLoadAFresh = true;
					} else {
						// stop loading, go back
						return;
					};
				} else {
					// no editing was being done earlier
					// take this data id as is
					isLoadAFresh = true;
				};
			} else {
				// no data id is defined
				if (spa.app.state.editDataId) {
					// something was being edited already
					dataId = spa.app.state.editDataId;
					isLoadAFresh = false;
				} else if (isEditingNew) {
					// if coming to screen back in a new record editing scenario
					dataId = newDataId;
					isLoadAFresh = false;								
				};
			};						
			
			// one last check
			if (!isLoadAFresh && !isDataLoaded) {
				isLoadAFresh = true;
			};
			
			// go edit data section
			setEditButton();
			navigate("editItem", true);						

			// save to state - only if not a new record
			if (!isNew && !isEditingNew) {
				spa.app.state.editDataId = dataId;
				saveState();
			};
			
			// load data, if required
			var item = { id:"", title:"Data not found.", desc: "" };
			if (isNew) {
				// fill default values
				item = createNewItem();
				dataObjectToHTML(item);
				
				// set
				editItem = item;
			} else if (isEditingNew) {
				if (isLoadAFresh) {
					// fill default values, since this is a refresh in a new scenario
					item = createNewItem();
					dataObjectToHTML(item);
					
					// set
					editItem = item;
				} else {
					// default values were already loaded in a new record
				};
			} else {
				if (isLoadAFresh) {
					// find data item
					$.each(spa.data.items, function(index, itm) {
						if (itm.id === dataId) {
							item = itm;
							return false;
						};
					});
					
					// load fresh values
					dataObjectToHTML(item);
					
					// set
					editItem = item;
				} else {
					// values were already loaded in an old record
				};
			};
			
			// set (till a reload happens)
			isDataLoaded = true;
		};
		function onDeleteData(dataId) {
			if (dataId) {
				// find
				var index = -1;
				var item = null;
				$.each(spa.data.items, function(idx, itm) {
					if (itm.id === dataId) {
						index = idx;
						item = itm;
						return false;
					};
				});	
				
				// confirm
				if (confirm("Are you sure, you want to permanently delete '" + item.title + "'?")) {
					// delete
					spa.data.items.splice(index, 1);
					
					// save changes
					onSaveData(true);
				};
			};
		};
		function onTrashData(dataId) {
			if (dataId) {
				// find
				var index = -1;
				var item = null;
				$.each(spa.data.items, function(idx, itm) {
					if (itm.id === dataId) {
						index = idx;
						item = itm;
						return false;
					};
				});	
				
				// confirm
				if (confirm("Are you sure, you want to delete '" + item.title + "'?")) {
					// mark item to be in trash
					item.trash = "yes";
					
					// save changes
					onSaveData(true);
				};
			};
		};
		function onRestoreData(dataId) {
			if (dataId) {
				// find
				var index = -1;
				var item = null;
				$.each(spa.data.items, function(idx, itm) {
					if (itm.id === dataId) {
						index = idx;
						item = itm;
						return false;
					};
				});	
				
				// confirm
				if (confirm("Are you sure, you want to restore '" + item.title + "'?")) {
					// mark item to NOT to be in trash
					item.trash = "no";
					
					// save changes
					onSaveData(true);
				};
			};
		};
		function onSaveData(isDeletedTrashedOrRestored) {
			// validate and load data in object
			var isSuccess = false;
			if (isDeletedTrashedOrRestored) {
				isSuccess = true;
			} else {
				var item = htmlToDataObject();
				isSuccess = (item !== null);
				
				// add/update data in object
				if (isSuccess) {
					// data
					if (isEditingNew) {
						// add to array
						spa.data.items.push(item);
					} else {
						// find data item
						var index = -1;
						$.each(spa.data.items, function(idx, itm) {
							if (itm.id === spa.app.state.editDataId) {
								index = idx;
								isSuccess = true;
								return false;
							};
						});
						
						// update in array
						if (isSuccess) {
							spa.data.items[index] = item;
						} else {
							// although will not happen unless some tampering is done
							// still, make it add it as new data
							spa.data.items.push(item);
							isSuccess = true;
						};
					};
				};
			};
			
			// remove isSorted flag from categories
			// so it does not get serialized
			if (isSuccess) {
				$.each(spa.data.settings.categories, function(index, c) {
					if (c.isSorted) {
						delete c["isSorted"];
					};
				});
			};
			
			// update some settings
			if (isSuccess) {
				spa.data.settings.lastUpdate = utils.getNowAsString();
				spa.data.settings.dataFormatVersionId = spa.app.dataFormatVersionId.toString();
				spa.data.settings.appVersionId = spa.app.versionId.toString();				
			};
			
			// save to file
			if (isSuccess) {
				isSuccess = saveData(getFileNameToSave(), spa.data, spa.app.settings.dataFileRootObject);
				if (isSuccess) {
					// clear state
					isEditingNew = false;
					newDataId = ""
					spa.app.state.editDataId = "";
					saveState();
					
					// reset
					resetEnvironmentWithDataLoadOrChanges();

					// set ui
					setNewButton();

					// go home
					onHome();
				};
			};
		};
		function onCancelData() {
			if (confirm("Discard changes?")) {
				if (isEditingNew) {
					isEditingNew = false;
					newDataId = "";
				} else {
					spa.app.state.editDataId = "";
					saveState();								
				};
				
				// set ui
				setNewButton();

				// go home
				onHome();
			};
		};
		function onNewPwd() {
			var g = utils.guid();
			var newPwd = g.substr(15, 8).toUpperCase() + g.substr(23, 8);
			$("#_new_pwd").val(newPwd);
		};
		function onNewCat() {
			// set ui
			$("#_edit_cat").val("");
			$("#_cat_new").hide();
			$("#_cat_edit_delete").hide();
			$("#_cat_save_cancel").show();
			
			// load default data
			var catItem = createNewCatItem();
			catObjectToHTML(catItem);
			
			// set
			isEditingNewCat = true;
			editCatId = "";
			editCatItem = null;
				
			// set focus
			$("#_cat_selector").hide();
			$("#_cat_content").show();
			$("#_cat_name").focus();
		};
		function onEditCat() {
			var catId = $("#_edit_cat").val();
			var theCat = null;
			var isSuccess = false;
			if (catId) {
				// find cat
				$.each(spa.data.settings.categories, function(i, cat) {
					if (cat.id === catId) {
						isSuccess = true;
						theCat = cat;
						return false;
					};
				});

				if (isSuccess) {
					// set ui
					$("#_cat_new").hide();
					$("#_cat_edit_delete").hide();
					$("#_cat_save_cancel").show();
					
					// load category data
					catObjectToHTML(theCat);
					
					// set
					isEditingNewCat = false;
					editCatId = catId;
					editCatItem = theCat;
					
					// set focus and show
					$("#_cat_selector").hide();
					$("#_cat_content").show();
					$("#_cat_name").focus();
				} else {
					alert("Category not found.");
				};
			} else {
				alert("Please select a category to edit.");
			};
		};
		function onDeleteCat() {
			var catId = $("#_edit_cat").val();
			if (catId) {
				// find cat
				var theCat = null;
				var catIndex = -1;
				var isSuccess = false;
				$.each(spa.data.settings.categories, function(i, cat) {
					if (cat.id === catId) {
						catIndex = i;
						theCat = cat;
						isSuccess = true;
						return false;
					};
				});
				
				if (isSuccess) {
					if (confirm("Are you sure, you want to delete '" +  theCat.title + "' category?")) {
						// delete in data
						spa.data.settings.categories.splice(catIndex, 1);
						
						// update links in all records for this deleted category
						var theItemCatToRemoveIndex = -1;
						$.each(spa.data.items, function(i, item) {
							if (isArray(item.cat)) {
								theItemCatToRemoveIndex = -1;
								$.each(item.cat, function(ii, theCatToRemove) {
									if (theCatToRemove.id === catId) {
										theItemCatToRemoveIndex = ii;
										return false;
									};
								});
								if (theItemCatToRemoveIndex !== -1) {
									item.cat.splice(theItemCatToRemoveIndex, 1);
								};
							};
						});
						
						// refresh
						refillCategoriesList();
						refreshCategories();
				
						// fix state
						if (spa.app.state.catId === catId) {
							spa.app.state.catId = "";
							spa.app.state.grpId = "";
						};
					};
				} else {
					alert("Category not found.");
				};
			} else {
				alert("Please select the category to delete.");
			};
		};
		function onSaveCat() {
			// validate and load into item
			var catItem = htmlToCatObject();
			if (catItem) {
				// add or update
				if (isEditingNewCat) {
					// add
					spa.data.settings.categories.push(catItem);
				} else {
					var indexToUpdate = -1;
					$.each(spa.data.settings.categories, function(i, cat) {
						if (cat.id === editCatId) {
							indexToUpdate = i;
							return false;
						};
					});	
					if (indexToUpdate !== -1) {
						// update
						spa.data.settings.categories[indexToUpdate] = catItem;
						
						// fix state
						if (spa.app.state.catId === editCatId) {
							spa.app.state.catId = catItem.id;
							spa.app.state.grpId = "";
						};
					};
				};
			
				// set
				isEditingNewCat = false;
				editCatId = "";
				editCatItem = null;
			
				// refresh
				refillCategoriesList();
				refreshCategories();
				
				// set ui
				$("#_cat_new").show();
				$("#_cat_edit_delete").show();
				$("#_cat_save_cancel").hide();
				$("#_cat_content").hide();
				$("#_cat_selector").show();
			};
		};
		function onCancelCat() {
			// set ui
			$("#_edit_cat").val("");
			$("#_cat_new").show();
			$("#_cat_edit_delete").show();
			$("#_cat_save_cancel").hide();
			$("#_cat_content").hide();
			$("#_cat_selector").show();
			
			// set
			isEditingNewCat = false;
			editCatId = "";
			editCatItem = null;
		};
		function onEditSettings() {
			// show/hide messages
			if (spa.app.state.isNewFile) {
				$("#newFileMessage").show();
			} else {
				$("#newFileMessage").hide();
			};
			if (spa.data.settings.encrypt !== "yes") {
				$("#noEncryptionMessage").show();
			} else {
				$("#noEncryptionMessage").hide();
			};
			
			// go settings section
			navigate("settings", true);
			
			// load data into html, if settings are not already being edited
			if (!isEditingSettings) {
				// set
				isEditingSettings = true;
				
				// #DATA FILE# //	
				
				// file title
				$("#_file_title").val(spa.data.settings.title);
				// password
				$("#_file_password").val(spa.data.settings.pin);
				// encrypt
				$("#_file_encrypt").val(spa.data.settings.encrypt);
				
				// #PREFERENCES# //	
				$("#_search_depth").val(spa.app.state.settings.searchDepth);
				
				// #CATEGORIES# //	
				refillCategoriesList();
			};
		};
		function onSaveSettings() {
			// validate and update
			// #FILE# //
			var fileTitle = $("#_file_title").val();
			if (!fileTitle) {
				alert("Data file title cannot be empty."); 
				$("#_file_title").focus(); 
				return;					
			} else {
				spa.data.settings.title = fileTitle;
			};
			// last update
			spa.data.settings.lastUpdate = utils.getNowAsString();
			$("#_file_last_update").val(spa.data.settings.lastUpdate);
			// data format
			spa.data.settings.dataFormatVersionId = spa.app.dataFormatVersionId.toString();
			// saved by
			spa.data.settings.appVersionId = spa.app.versionId.toString();
			// password
			var filePassword = $("#_file_password").val();
			if (!filePassword) {
				alert("Data file password cannot be empty."); 
				$("#_file_password").focus(); 
				return;					
			} else {
				spa.data.settings.pin = filePassword;
				// also update in state
				spa.app.state.pin = filePassword;
			};
			// encrypt
			spa.data.settings.encrypt = $("#_file_encrypt").val();
			
			// #PREFERENCES# //	
			spa.data.settings.searchDepth = $("#_search_depth").val();
			// also update in state
			spa.app.state.settings.searchDepth = spa.data.settings.searchDepth;
			saveState();

			// #CATEGORIES # //
			// categories are saved then and there in memory (so ready to save)
			
			// #PASSWORD TYPES# //
			var pwdTCtrl = null;
			var pwdType = [];
			var pwdTypeValue = "";
			for (var i=0; i<spa.app.settings.maxPasswords; i++) {
				pwdTameCtrl = "_pwd_type_" + i.toString();
				pwdTCtrl = $("#" + pwdTameCtrl);
				pwdTypeValue = pwdTCtrl.val();
				if (pwdTypeValue) {
					pwdType.push(pwdTypeValue);
				};
			};
			spa.data.settings.passwordTypes = pwdType;
			
			// remove isSorted flag from categories
			// so it does not get serialized
			$.each(spa.data.settings.categories, function(index, c) {
				if (c.isSorted) {
					delete c["isSorted"];
				};
			});
			
			// no longer a new file, it it was
			spa.app.state.isNewFile = false;
			
			// save to file
			isSuccess = saveData(getFileNameToSave(), spa.data, spa.app.settings.dataFileRootObject);
			if (isSuccess) {
				// clear state
				isEditingSettings = false;

				// reset
				resetEnvironmentWithDataLoadOrChanges();

				// go home
				onHome();
			};
		};
		function onCancelSettings() {
			if (confirm("Discard setting changes?")) {
				// reset
				isEditingSettings = false;
				
				// go home
				onHome();
			};
		};
		function onAllowChangeDataFolder() {
			$("#dataFolder").removeAttr("readonly").focus();
			$("#changeDataFolder").hide();
		};
		
		// constructor
		(function(theApp) { 
			// set
			window.spa = {};
			window.spa.app = theApp;
			
			// configure header/footer ui elements
			$('#copyright2').html(spa.app.copyright);
			$('#appName').text(spa.app.title + " - Version " + spa.app.version);
			if (spa.app.canEdit) {
				// in shell
				$('#appNameLink').on('click', function() { _a(spa.app.url); event.preventDefault(); });
				$('#aboutLink').on('click', function() { _a(spa.app.url + "/wiki/about"); event.preventDefault(); });
				$('#faqLink').on('click', function() { _a(spa.app.url + "/wiki/faq"); event.preventDefault(); });
				$('#helpLink').on('click', function() { _a(spa.app.url + "/wiki/help"); event.preventDefault(); });					

				$('#facebook').on('click', function() { _a("http://www.facebook.com/sharer.php?u=" + spa.app.url); event.preventDefault(); });
				$('#twitter').on('click', function() { _a("http://twitter.com/share?url=" + spa.app.url + "&text=" + spa.app.title); event.preventDefault(); });
				$('#googlePlus').on('click', function() { _a("https://plus.google.com/share?url=" + spa.app.url); event.preventDefault(); });
				$('#digg').on('click', function() { _a("http://www.digg.com/submit?url=" + spa.app.url); event.preventDefault(); });
				$('#linkedin').on('click', function() { _a("http://www.linkedin.com/shareArticle?mini=true&url=" + spa.app.url); event.preventDefault(); });
				$('#reddit').on('click', function() { _a("http://reddit.com/submit?url=" + spa.app.url + "&title=" + spa.app.title); event.preventDefault(); });
				$('#stumbleUpon').on('click', function() { _a("http://www.stumbleupon.com/submit?url=" + spa.app.url + "&title=" + spa.app.title); event.preventDefault(); });
				$('#linkedin').on('click', function() { _a("http://www.linkedin.com/shareArticle?mini=true&url=" + spa.app.url); event.preventDefault(); });
			} else {
				// in browser
				$('#appNameLink').attr('href', spa.app.url);	
				$('#aboutLink').attr('href', spa.app.url + "/wiki/about");
				$('#faqLink').attr('href', spa.app.url + "/wiki/faq");
				$('#helpLink').attr('href', spa.app.url + "/wiki/help");
				
				$('#facebook').attr('href', "http://www.facebook.com/sharer.php?u=" + spa.app.url);
				$('#twitter').attr('href', "http://twitter.com/share?url=" + spa.app.url + "&text=" + spa.app.title);
				$('#googlePlus').attr('href', "https://plus.google.com/share?url=" + spa.app.url);
				$('#digg').attr('href', "http://www.digg.com/submit?url=" + spa.app.url);
				$('#linkedin').attr('href', "http://www.linkedin.com/shareArticle?mini=true&url=" + spa.app.url);
				$('#reddit').attr('href', "http://reddit.com/submit?url=" + spa.app.url + "&title=" + spa.app.title);
				$('#stumbleUpon').attr('href', "http://www.stumbleupon.com/submit?url=" + spa.app.url + "&title=" + spa.app.title);
				$('#linkedin').attr('href', "http://www.linkedin.com/shareArticle?mini=true&url=" + spa.app.url);
			}
			$('#email').attr('href', "mailto:?Subject=" + spa.app.title + "&Body=I%20saw%20this%20and%20thought%20of%20you!%20Check%20out%20" + spa.app.url);
			
			$('#checkForUpdate').on('click', function() { onCheckForUpdate(); });
			document.title = spa.app.title;
			$('#spaIconLink').attr('href', spa.app.url)
			$('#spaIcon').attr('title', spa.app.title);					
			if (!spa.app.canEdit) {
				$("#newFileButton").hide();
				$("#newFileButtonLine").hide();
				$("#editDeleteButtons").hide();
			};

			// initialize event handlers
			// header
				$("#homeMenu").on('click', function() { onHome(); });
				$("#homeMenu2").on('click', function() { onHome(); });
				$("#dataItemMenu").on('click', function() { onSelectData(''); });
				$("#dataItemMenu2").on('click', function() { onSelectData(''); });
				$("#editItemMenu").on('click', function() { onAddEditData(); });
				$("#editItemMenu2").on('click', function() { onAddEditData(); });
				$("#settingsMenu").on('click', function() { onEditSettings(); });
				$("#settingsMenu2").on('click', function() { onEditSettings(); });
				$("#searchWhat").on('keydown', function() { if (event.keyCode == 13) { onSearch(null, 0); } });
				$("#searchMenu").on('click', function() { onSearch(null, 0); });
				$("#searchMenu2").on('click', function() { onSearch(null, 0); });
				$("#printMenu").on('click', function() { onPrint(); });
				$("#printMenu2").on('click', function() { onPrint(); });
				$("#logoutMenu").on('click', function() { onLogout(); });
				$("#logoutMenu2").on('click', function() { onLogout(); });
			// footer
				// none
			// login
				$("#defaultOpenButton").on('click', function() { onSelectDataFile('default'); });
				$("#defaultDataButton").on('click', function() { onSelectDataFile('default'); });
				$("#demoDataButton").on('click', function() { onSelectDataFile('demo'); });
				$("#dataFileButton").on('click', function() { onSelectDataFile('select'); });
				$("#newFileButton").on('click', function() { onSelectDataFile('new'); });
				$("#pwd").on('keydown', function() { if (event.keyCode == 13) { onDataFileDefine(); }; });
				$("#dataFileDialogOK").on('click', function() { onDataFileDefine(); });
				$("#changeDataFolder").on('click', function() { onAllowChangeDataFolder(); });
			// home
				// none
			// search
				$("#searched").on('keydown', function() { if (event.keyCode == 13) { onSearch(null, 0); }; });
				$("#defaultSearch").on('click', function() { onSearch('', 0); });
				$("#minSearch").on('click', function() { onSearch('min', 0); });
				$("#maxSearch").on('click', function() { onSearch('max', 0); });
				$("#goBack1").on('click', function() { onGoBack(); });
			// print
				$("#hideHeaderFooter").on('click', function() { onHideHeaderFooter(); });
				$("#showHeaderFooter").on('click', function() { onShowHeaderFooter(); });
				$("#print1").on('click', function() { onBeginPrint(); });
				$("#print2").on('click', function() { onBeginPrint(); });
			// dataItem
				$("#previousDataButton").on('click', function() { onSelectPrevData(); });
				$("#nextDataButton").on('click', function() { onSelectNextData(); });
				$("#editDataButton").on('click', function() { onEditDisplayData(); });
				$("#deleteDataButton").on('click', function() { onDeleteDisplayData(); });
				$("#trashDataButton").on('click', function() { onTrashDisplayData(); });
				$("#restoreDataButton").on('click', function() { onRestoreDisplayData(); });
				$("#passwordHistoryLink").on('click', function() { onShowPwdHistory(); });
			// editItem
				$("#saveDataChanges").on('click', function() { onSaveData(); });
				$("#cancelDataChanges").on('click', function() { onCancelData(); });
				$("#newPwdLink").on('click', function() { onNewPwd(); });
			// settings
				$("#startAtHome").on('click', function() { onHome(); });
				$("#saveSettings").on('click', function() { onSaveSettings(); });
				$("#cancelSettings").on('click', function() { onCancelSettings(); });
				$("#newCatButton").on('click', function() { onNewCat(); });
				$("#editCatButton").on('click', function() { onEditCat(); });
				$("#deleteCatButton").on('click', function() { onDeleteCat(); });
				$("#saveCatChanges").on('click', function() { onSaveCat(); });
				$("#cancelCatChanges").on('click', function() { onCancelCat(); });
					
			// load state
			loadState();

			// goto login
			navigate("login", false); 
			
			// login or select data file
			if (spa.app.state.dataFile.length > 0) {
				$("#dataFile").val(spa.app.state.dataFile); // it may also be newly created and save file, default file, demo file or any selected file
				dataFileType = "select";  //this is a defined file in all these cases
				onDataFileDefine();
			} else {
				// no data was loaded, stay here
				// update login window content
				$('#copyright').html(spa.app.copyright);
				if (spa.app.canEdit) {
					// in shell
					$('#copyrightLink').on('click', function() { _a(spa.app.url); event.preventDefault(); });
					$('#aboutLink2').on('click', function() { _a(spa.app.url + "/wiki/about"); event.preventDefault(); });
					$('#faqLink2').on('click', function() { _a(spa.app.url + "/wiki/faq"); event.preventDefault(); });
					$('#helpLink2').on('click', function() { _a(spa.app.url + "/wiki/help"); event.preventDefault(); });					
				} else {
					// in browser
					$('#copyrightLink').attr('href', spa.app.url);
					$('#aboutLink2').attr('href', spa.app.url + "/wiki/about");
					$('#faqLink2').attr('href', spa.app.url + "/wiki/faq");
					$('#helpLink2').attr('href', spa.app.url + "/wiki/help");						
				}
				$('#version').html("Version " + spa.app.version);
				$('#tagline').html(spa.app.tagline);
				if (!spa.app.canEdit) {
					$("#viewOnly2").show();
				};

				// show login content
				$("#loginContent").show();		
			};			
		})(this);
	};
	
	// create app and initialize
	$(document).ready(function() {
		// initialize new class and let it take control
		new spaClass(); 
	});
})();