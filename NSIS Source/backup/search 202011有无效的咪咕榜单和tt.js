﻿//by Asion, mod for foobox http://blog.sina.com.cn/dream7180
ppt = {
	source: window.GetProperty("Search Source", 1),
	autosearch: window.GetProperty("Search Box: Auto-validation", false),
	scope: window.GetProperty("Search Box: Scope", 0),
	multiple: window.GetProperty("Search Box: Keep Playlist", true),
	historymaxitems: 10,
	historytext: window.GetProperty("Search Box: Search History", ""),
	showreset: window.GetProperty("Search Box: Always Show Reset Button", false),
	webnb: window.GetProperty("Search Source: Web: Number", 1),//1-KW, 2-TT
	webkqtradioarr: "",
	quality: window.GetProperty("Search Source: Quality", 1),
	pagesize: window.GetProperty("Search Results Per Page", 50)
};

var MGRankList = [["新歌速递","11248351"],["音乐榜","23603703"],["影视榜","23603721"],["华语榜(内地)","23603926"],["华语榜(港台)","23603954"],["欧美榜","23603974"],["日韩榜","23603982"],["彩铃榜","23604023"],["原创榜","23604032"],["KTV榜","23604040"],["网络榜","23604058"]];
//=================================================// 定义变量
var fso = new ActiveXObject("Scripting.FileSystemObject");
if (!fso.FolderExists(fb.ProfilePath + "cache")) fso.CreateFolder(fb.ProfilePath + "cache");
var xmlHttp = new ActiveXObject("Msxml2.XMLHTTP.6.0"),
xmlHttp2 = new ActiveXObject("Msxml2.XMLHTTP.6.0");
var debug = false;
var oldsearch = oldpid = 0;
var SearchListName, cachefile;
var qtfm_arr = fb.ProfilePath + "\\cache\\qtfm.arr";
if (fso.FileExists(qtfm_arr))
	ppt.webkqtradioarr = utils.ReadTextFile(qtfm_arr).split("|");
//=================================================// 搜索框
var g_searchbox = null;
searchbox = function() {
	var temp_bmp = gdi.CreateImage(1, 1);
	var temp_gr = temp_bmp.GetGraphics();
	var g_timer_cursor = false;
	var g_cursor_state = true;
	clipboard = {
		text: null
	};
	this.images = {
		resetIcon_off: null,
		resetIcon_ov: null,
		loupe_off: null,
		loupe_ov: null
	}

	this.repaint = function() {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}
	
	this.getTooltip = function(){
		switch (ppt.source){
			case 1:
				return "列表";
				break;
			case 2:
				return "媒体库";
				break;
			case 3:
				return "网络";
				break;
		}
	}

	this.getImages = function() {
		var gb;
		var x2 = 2 * zdpi, x4 = 4 * zdpi, x5 = 5 * zdpi, x11 = 11 * zdpi, x12 = 12 * zdpi, 
			x14 = Math.ceil(14 * zdpi), x17 = 17 * zdpi, x18 = Math.ceil(18 * zdpi);
		// 搜索图标
		var on_colour = RGB(220,220,220);
		var reset_off_color = RGB(220,220,220);

		this.images.resetIcon_off = gdi.CreateImage(x18, x18);
		gb = this.images.resetIcon_off.GetGraphics();
		gb.setSmoothingMode(2);
		gb.FillEllipse(0, 0, x17, x17, RGBA(0, 0, 0, 30));
		gb.DrawLine(x5, x5, x12, x12, 2.0, reset_off_color);
		gb.DrawLine(x5, x12, x12, x5, 2.0, reset_off_color);
		gb.setSmoothingMode(0);
		this.images.resetIcon_off.ReleaseGraphics(gb);

		this.images.resetIcon_ov = gdi.CreateImage(x18, x18);
		gb = this.images.resetIcon_ov.GetGraphics();
		gb.setSmoothingMode(2);
		gb.FillEllipse(0, 0, x17, x17, RGBA(0, 0, 0, 50));
		gb.DrawLine(x5, x5, x12, x12, 2.0, on_colour);
		gb.DrawLine(x5, x12, x12, x5, 2.0, on_colour);
		gb.setSmoothingMode(0);
		this.images.resetIcon_ov.ReleaseGraphics(gb);

		if (typeof(this.reset_bt) == "undefined") {
			this.reset_bt = new button(this.images.resetIcon_off, this.images.resetIcon_ov, this.images.resetIcon_ov);
		} else {
			this.reset_bt.img[0] = this.images.resetIcon_off;
			this.reset_bt.img[1] = this.images.resetIcon_ov;
			this.reset_bt.img[2] = this.images.resetIcon_ov;
		}
		
		this.images.source_switch = gdi.CreateImage(x18, x18);
		gb = this.images.source_switch.GetGraphics();
		this.images.source_switch.ReleaseGraphics(gb);
		
		this.images.source_pl = gdi.CreateImage(x14, x14);
		gb = this.images.source_pl.GetGraphics();
		gb.SetSmoothingMode(0);
		var _x2 = Math.ceil(x2);
		gb.DrawRect(x2, x2, x11, x11, 1, on_colour);
		gb.DrawLine(x4, x5, x11, x5, 1, on_colour);
		gb.DrawLine(x4,x5+_x2, x11, x5+_x2, 1, on_colour);
		gb.DrawLine(x4, x5+_x2*2, x11, x5+_x2*2, 1, on_colour);
		this.images.source_pl.ReleaseGraphics(gb);
		
		var img_arc = gdi.CreateImage(x14, x14);
		gb = img_arc.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(0, -3*zdpi, x11, x5, 1, on_colour);
		img_arc.ReleaseGraphics(gb);
		
		this.images.source_lib = gdi.CreateImage(x14, x14);
		gb = this.images.source_lib.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(0, x2, x11, x5, 1, on_colour);
		gb.DrawImage(img_arc, 0, 8*zdpi, x14, zoom(8,zdpi), 0, 0, x14, zoom(8,zdpi), 0, 255);
		gb.DrawImage(img_arc, 0, x11, x14, zoom(8,zdpi), 0, 0, x14, zoom(8,zdpi), 0, 255);
		gb.DrawLine(0, x4, 0, x11, 1, on_colour);
		gb.DrawLine(x11, x4, x11, x11, 1, on_colour);
		this.images.source_lib.ReleaseGraphics(gb);
		
		this.images.source_net = gdi.CreateImage(x14, x14);
		gb = this.images.source_net.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillEllipse(0, 10*zdpi, 3*zdpi, 3*zdpi,on_colour);
		gb.DrawEllipse(-8*zdpi, 6*zdpi, 15*zdpi, 15*zdpi, 1, on_colour);
		gb.DrawEllipse(-13*zdpi, x2, 24*zdpi, 24*zdpi, 1, on_colour);
		gb.SetSmoothingMode(0);
		this.images.source_net.ReleaseGraphics(gb);
		
		this.src_switch = new button(this.images.source_switch, this.images.source_switch, this.images.source_switch, this.getTooltip());
	}
	this.getImages();

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.on_init();
	};

	this.on_init = function() {
		this.inputbox = new oInputbox(this.w - 45 * zdpi, this.h - 4, "", "", g_color_normal_txt, g_color_normal_bg, 0, g_color_selected_txt, g_sendResponse, "g_searchbox");
		this.inputbox.autovalidation = (ppt.source == 3) ? false : ppt.autosearch;
	}

	this.reset_colors = function() {
		this.inputbox.backcolor = g_color_normal_bg;
		this.inputbox.textcolor = g_color_normal_txt;
		this.inputbox.backselectioncolor = g_color_selected_txt;
	};

	this.draw = function(gr) {
		// 绘制搜索框背景
		gr.SetSmoothingMode(0);
		gr.FillSolidRect(this.x, this.y, this.w, this.h, RGBA(0, 0, 0, 30));
		gr.FillSolidRect(this.x + 1, this.y + 1, this.w - 2, this.h - 2, g_color_normal_bg);
		gr.SetSmoothingMode(0);

		//if (this.inputbox.edit) {
		//}
		var g_z14 = Math.ceil(14 * zdpi);
		this.src_switch.draw(gr, this.x + 5, this.y + 3 * zdpi, 255);
		this.inputbox.draw(gr, this.x + g_z14 + 10, this.y + 2, 0, 0);
		var src_img = ((ppt.source == 1) ? this.images.source_pl : (ppt.source == 2) ? this.images.source_lib : this.images.source_net);
		gr.DrawImage(src_img, this.x + 5, this.y + 3 * zdpi + 1, g_z14, g_z14, 0, 0, g_z14, g_z14, 0, 255);
		if ((this.inputbox.text.length > 0 || ppt.showreset) && this.inputbox.edit) this.reset_bt.draw(gr, this.x + this.inputbox.w + 22 * zdpi, this.y + 3 * zdpi, 255);
	}

	this.historylist = Array();

	this.searchExist = function(search_item) {
		for (var i = 0; i < this.historylist.length; i++) {
			if (this.historylist[i][0] == search_item) return true;
		}
		return false;
	};

	this.historyadd = function(search_item, datetime) {
		if (!this.searchExist(search_item)) {
			var currentdate = new Date();
			datetime = typeof datetime !== 'undefined' ? datetime : currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
			this.historylist[this.historylist.length] = Array(search_item, datetime);
			if (this.historylist.length > ppt.historymaxitems) this.historylist.shift();
			return true;
		}
		return false;
	};

	this.historyreset = function() {
		this.historylist = Array();
		window.SetProperty("Search Box: Search History", "")
	}

	this.save_searchhistory = function(argSearchHistory) {
		var SearchHistory = "";
		if (argSearchHistory.length > 0) {
			try {
				for (var i = 0; i < argSearchHistory.length; i++) {
					if (i > 0) SearchHistory += " $$ ";
					SearchHistory += argSearchHistory[i][0] + " ## " + argSearchHistory[i][1];
					if (i == ppt.historymaxitems) break;
				}
				window.SetProperty("Search Box: Search History", SearchHistory)
			} catch (e) {}
		}
	}

	this.get_searchhistory = function() {
		if (ppt.historytext.length > 0) {
			historytext = ppt.historytext.split(" $$ ");
			try {
				for (var i = 0; i < historytext.length; i++) {
					arguments = historytext[i].split(" ## ");
					this.historyadd(arguments[0], arguments[1]);
				}
			} catch (e) {}
		}
		return this.historylist;
	}

	this.historylist = this.get_searchhistory();
	
	this.on_mouse = function(event, x, y, delta) {
		switch (event) {
		case "lbtn_down":
			this.src_switch.checkstate("down", x, y);
			this.inputbox.check("down", x, y);
			if (this.inputbox.text.length > 0 || ppt.showreset) this.reset_bt.checkstate("down", x, y);
			break;
		case "lbtn_up":
			if (this.src_switch.checkstate("up", x, y) == ButtonStates.hover) {
				ppt.source = ppt.source + 1;
				if (ppt.source > 3) ppt.source = 1;
				window.SetProperty("Search Source", ppt.source);
				if(ppt.source == 3){
					this.inputbox.autovalidation = false;
				} else{
					this.inputbox.autovalidation = ppt.autosearch;
				}
				this.inputbox.empty_text = "";
				this.src_switch.changeTooltip(this.getTooltip());
				
				this.repaint();
			}
			this.inputbox.check("up", x, y);
			if (this.inputbox.text.length > 0 || ppt.showreset) {
				if (this.reset_bt.checkstate("up", x, y) == ButtonStates.hover) {
					this.inputbox.text = "";
					this.inputbox.offset = 0;
					g_sendResponse();
					this.repaint();
				}
			}
			break;
		case "lbtn_dblclk":
			this.inputbox.check("dblclk", x, y);
			break;
		case "rbtn_down":
			if (this.src_switch.checkstate("up", x, y) == ButtonStates.hover) {
				Show_Menu_Searchbox(x, y);
			}
			this.inputbox.check("right", x, y);
			break;
		case "move":
			var bt_state_2 = this.src_switch.checkstate("move", x, y);
			this.inputbox.check("move", x, y);
			if (this.inputbox.text.length > 0 || ppt.showreset) var bt_state_3 = this.reset_bt.checkstate("move", x, y);
			return (this.inputbox.hover || bt_state_2 == ButtonStates.hover || bt_state_3 == ButtonStates.hover);
			break;
		case "leave":
			this.src_switch.checkstate("leave", 0, 0);
			this.inputbox.check("leave", 0, 0);
			this.reset_bt.checkstate("leave", 0, 0);
		}
	}

	this.on_key = function(event, vkey) {
		switch (event) {
		case "down":
			this.inputbox.on_key_down(vkey);
			break;
		}
	}

	this.on_char = function(code) {
		this.inputbox.on_char(code);
	}

	this.on_focus = function(is_focused) {
		this.inputbox.on_focus(is_focused);
	}
}

function g_sendResponse() {
	var s1 = g_searchbox.inputbox.text;
	var s2 = s1.toLowerCase();
	var pl_to_remove = new Array;

	// 空文本直接返回
	if (s2.length <= 0) return true;
	// 保存搜索记录
	g_searchbox.historyadd(s1);
	g_searchbox.save_searchhistory(g_searchbox.historylist);

	if (ppt.source == 1) {

		var handle_list = plman.GetPlaylistItems(plman.ActivePlaylist);
		var count = handle_list.Count;
		var pid = -1;
		var tf_artist = fb.TitleFormat("%artist%");
		var tf_album = fb.TitleFormat("%album%");
		var tf_title = fb.TitleFormat("%title%");
		var tf_genre = fb.TitleFormat("%genre%");
		var tf_date = fb.TitleFormat("%date%");
		var tf_comment = fb.TitleFormat("%comment%");
		var start = 0;

		if (oldsearch == s2) {
			start = oldpid;
		} else {
			oldsearch = s2;
			oldpid = 0;
		}

		for (var i = start; i < count; i++) {
			if ((ppt.scope == 0 || ppt.scope == 1) && tf_artist.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppt.scope == 0 || ppt.scope == 2) && tf_title.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppt.scope == 0 || ppt.scope == 3) && tf_album.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppt.scope == 0 || ppt.scope == 4) && tf_genre.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppt.scope == 0 || ppt.scope == 5) && tf_date.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if (ppt.scope == 6 && tf_comment.EvalWithMetadb(handle_list.Item(i)).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if (i == count - 1) {
				oldpid = 0;
			}
		}

		// 找到后选定项目
		if (pid >= 0) {
			var focusedTrackId = pid;
			plman.ClearPlaylistSelection(plman.ActivePlaylist);
			plman.SetPlaylistSelectionSingle(plman.ActivePlaylist, focusedTrackId, true);
			plman.SetPlaylistFocusItem(plman.ActivePlaylist, focusedTrackId);
		};

		handle_list.Dispose();
	} else if (ppt.source == 3) {
		if (oldsearch != s1) {
			oldsearch = s1;
		}
		NetSearch(s2, 1);
	} else if (ppt.source == 2) {
		// 搜索列表索引
		var isFound = false;
		var total = plman.PlaylistCount;
		for (var i = 0; i < total; i++) {
			if (plman.GetPlaylistName(i).substr(0, 4) == "搜索 [") {
				if (!ppt.multiple) {
					if (!isFound) {
						var plIndex = i;
						isFound = true;
					};
					pl_to_remove.push(i);
				}
			}
		}

		if (isFound && !ppt.multiple) {
			var r = pl_to_remove.length - 1;
			while (r >= 0) {
				plman.RemovePlaylist(pl_to_remove[r]);
				r--;
			}
			plIndex = plman.PlaylistCount;
		} else {
			plIndex = total;
		}

		var scopecases = {
			0: "",
			1: "%artist% HAS ",
			2: "%album% HAS ",
			3: "%title% HAS ",
			4: "%genre% HAS ",
			5: "%date% HAS ",
			6: "%comment% HAS "
		};
		if (scopecases[ppt.scope]) {
			fb.CreateAutoPlaylist(plIndex, "搜索 [" + s1 + "]", scopecases[ppt.scope] + s1, "", 0);
		} else {
			fb.CreateAutoPlaylist(plIndex, "搜索 [" + s1 + "]", s1, "", 0);
		};

		// 转换自动列表为普通列表
		plman.DuplicatePlaylist(plIndex, "搜索 [" + s1 + "]");
		plman.RemovePlaylist(plIndex);
		plman.ActivePlaylist = plIndex;
	}
}

//=================================================// 搜索框菜单

function Show_Menu_Searchbox(x, y) {
	var MF_SEPARATOR = 0x00000800;
	var MF_STRING = 0x00000000;
	var MF_GRAYED = 0x00000001;
	var MF_DISABLED = 0x00000002;
	var MF_POPUP = 0x00000010;
	var idx;

	var _menu = window.CreatePopupMenu();
	if (typeof x == "undefined") x = ww;
	if (typeof y == "undefined") y = 30;
	var SearchModeMenu = window.CreatePopupMenu();
	SearchModeMenu.AppendMenuItem(MF_STRING, 21, "列表");
	SearchModeMenu.AppendMenuItem(MF_STRING, 22, "媒体库");
	SearchModeMenu.AppendMenuItem(MF_STRING, 23, "网络");
	SearchModeMenu.CheckMenuRadioItem(21, 23, ppt.source + 20);
	SearchModeMenu.AppendTo(_menu, MF_STRING, "搜索模式");
	var SearchHistoryMenu = window.CreatePopupMenu();

	for (var i = g_searchbox.historylist.length - 1; i >= 0; i--) {
		SearchHistoryMenu.AppendMenuItem(MF_STRING, i + 51, g_searchbox.historylist[i][0].replace("&", "&&"));
	}
	if (g_searchbox.historylist.length == 0) {
		SearchHistoryMenu.AppendMenuItem(MF_GRAYED, 40, "无记录");
	} else {
		SearchHistoryMenu.AppendMenuSeparator();
		SearchHistoryMenu.AppendMenuItem(MF_STRING, ppt.historymaxitems + 60, "清除记录");
	}

	SearchHistoryMenu.AppendTo(_menu, MF_STRING, "搜索记录");

	_menu.AppendMenuSeparator();

	if (ppt.source == 1) {
		_menu.AppendMenuItem(MF_STRING, 1, "启用自动搜索");
		_menu.CheckMenuItem(1, ppt.autosearch ? 1 : 0);
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 2, "搜索:智能");
		_menu.AppendMenuItem(MF_STRING, 3, "搜索:艺术家");
		_menu.AppendMenuItem(MF_STRING, 4, "搜索:专辑");
		_menu.AppendMenuItem(MF_STRING, 5, "搜索:标题");
		_menu.AppendMenuItem(MF_STRING, 6, "搜索:流派");
		_menu.AppendMenuItem(MF_STRING, 7, "搜索:日期");
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 8, "搜索:注释");
		_menu.CheckMenuRadioItem(2, 8, ppt.scope + 2);
	} else if (ppt.source == 3) {
		_menu.AppendMenuItem(MF_STRING, 9, "保留之前的搜索列表");
		_menu.CheckMenuItem(9, ppt.multiple ? 1 : 0);
		_menu.AppendMenuSeparator();
		/*var SearchQualityMenu = window.CreatePopupMenu();
		SearchQualityMenu.AppendMenuItem(MF_STRING, 31, "有损格式");
		SearchQualityMenu.AppendMenuItem(MF_STRING, 32, "无损格式");
		SearchQualityMenu.AppendMenuItem(MF_STRING, 33, "全部");
		SearchQualityMenu.CheckMenuRadioItem(31, 33, ppt.quality + 30);
		SearchQualityMenu.AppendTo(_menu, MF_STRING, "搜索格式");*/

		var WebSearchMenu = window.CreatePopupMenu();
		WebSearchMenu.AppendMenuItem(MF_STRING, 11, "酷我音乐 (320K)");
		WebSearchMenu.AppendMenuItem(MF_STRING, 12, "千千音乐 (320K)");
		WebSearchMenu.AppendMenuItem(MF_STRING, 13, "咪咕音乐 (无损)");
		WebSearchMenu.AppendMenuItem(MF_STRING, 14, "咪咕音乐 (320K)");
		WebSearchMenu.CheckMenuRadioItem(11, 14, ppt.webnb + 10);
		WebSearchMenu.AppendTo(_menu, MF_STRING, "搜索来源");
		_menu.AppendMenuSeparator();
		
		var WebMGRanklistMenu = window.CreatePopupMenu();
		if(MGRankList.length > 1){
			for (var i = 0; i < MGRankList.length; i++) {
				WebMGRanklistMenu.AppendMenuItem(MF_STRING, 100+i, MGRankList[i][0]);
			}
		}
        WebMGRanklistMenu.AppendTo(_menu, MF_STRING, "咪咕音乐榜单");
		var SearchQualityMenu = window.CreatePopupMenu();
		SearchQualityMenu.AppendMenuItem(MF_STRING, 31, "320K MP3");
		SearchQualityMenu.AppendMenuItem(MF_STRING, 32, "无损格式");
		//SearchQualityMenu.AppendMenuItem(MF_STRING, 33, "全部");
		SearchQualityMenu.CheckMenuRadioItem(31, 32, ppt.quality + 30);
		SearchQualityMenu.AppendTo(_menu, MF_STRING, "榜单音质");
		
		_menu.AppendMenuSeparator();
		var WebQTRadioMenu = window.CreatePopupMenu();
		if(ppt.webkqtradioarr.length > 1){
			for (var k = 0; k < ppt.webkqtradioarr.length; k++) {
				WebQTRadioMenu.AppendMenuItem(MF_STRING, 501+k, ppt.webkqtradioarr[k].split(":")[0]);
			}
			WebQTRadioMenu.AppendMenuSeparator();
		}
		WebQTRadioMenu.AppendMenuItem(MF_STRING, 500, "更新蜻蜓FM菜单");
        WebQTRadioMenu.AppendTo(_menu, MF_STRING, "蜻蜓FM");
		
	} else if (ppt.source == 2) {
		var now_playing_track = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
		var quickSearchMenu = window.CreatePopupMenu();
		quickSearchMenu.AppendMenuItem(MF_STRING, 36, "相同艺术家");
		quickSearchMenu.AppendMenuItem(MF_STRING, 37, "相同专辑");
		quickSearchMenu.AppendMenuItem(MF_STRING, 38, "相同流派");
		quickSearchMenu.AppendMenuItem(MF_STRING, 39, "相同日期");
		quickSearchMenu.AppendTo(_menu, MF_STRING, "快速搜索...");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 1, "启用自动搜索");
		_menu.CheckMenuItem(1, ppt.autosearch ? 1 : 0);
		_menu.AppendMenuItem(MF_STRING, 9, "保留之前的搜索列表");
		_menu.CheckMenuItem(9, ppt.multiple ? 1 : 0);
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 2, "搜索:智能");
		_menu.AppendMenuItem(MF_STRING, 3, "搜索:艺术家");
		_menu.AppendMenuItem(MF_STRING, 4, "搜索:专辑");
		_menu.AppendMenuItem(MF_STRING, 5, "搜索:标题");
		_menu.AppendMenuItem(MF_STRING, 6, "搜索:流派");
		_menu.AppendMenuItem(MF_STRING, 7, "搜索:日期");
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 8, "搜索:注释");
		_menu.CheckMenuRadioItem(2, 8, ppt.scope + 2);
	}

	idx = _menu.TrackPopupMenu(search_x + 5, search_y + 20*zdpi);
	switch (true) {
	case (idx == 1):
		ppt.autosearch = !ppt.autosearch;
		g_searchbox.inputbox.autovalidation = ppt.autosearch;
		window.SetProperty("Search Box: Auto-validation", ppt.autosearch);
		break;
	case (idx >= 2 && idx <= 8):
		ppt.scope = idx - 2;
		window.SetProperty("Search Box: Scope", ppt.scope);
		break;
	case (idx == 9):
		ppt.multiple = !ppt.multiple;
		window.SetProperty("Search Box: Keep Playlist", ppt.multiple);
		break;
	case (idx >= 11 && idx <= 14):
		window.SetProperty("Search Source: Web: Number", ppt.webnb = idx - 10);
		if (ppt.source == 3) oldsearch = "";
		break;
	case (idx >= 21 && idx <= 23):
		window.SetProperty("Search Source", ppt.source = idx - 20);
		if(ppt.source == 3){
			g_searchbox.inputbox.autovalidation = false;
		} else{
			g_searchbox.inputbox.autovalidation = ppt.autosearch;
		}
		g_searchbox.inputbox.empty_text = "";
		g_searchbox.repaint();
		break;
	case (idx >= 31 && idx <= 32):
		window.SetProperty("Search Source: Quality", ppt.quality = idx - 30);
		break;
	case (idx == 36):
		quickSearch(now_playing_track, "artist");
		break;
	case (idx == 37):
		quickSearch(now_playing_track, "album");
		break;
	case (idx == 38):
		quickSearch(now_playing_track, "genre");
		break;
	case (idx == 39):
		quickSearch(now_playing_track, "date");
		break;
	case (idx >= 51 && idx <= ppt.historymaxitems + 51):
		g_searchbox.inputbox.text = g_searchbox.historylist[idx - 51][0];
		g_searchbox.on_char();
		g_searchbox.repaint();
		break;
	case (idx == ppt.historymaxitems + 60):
		g_searchbox.historyreset();
		break;
	case ((idx >= 100 && idx <= 100+MGRankList.length)):
		MGRankListid(MGRankList[idx-100][1],MGRankList[idx-100][0]);
		break;
	case (idx == 500):
		GetQTFMRadiolist();
		break;
	case ((idx >= 501 && idx <= 501+ppt.webkqtradioarr.length)):
		QTFMRadiolist(ppt.webkqtradioarr[idx-501].split(";"),ppt.webkqtradioarr[idx-501].split(":")[0]);
		break;
	}
	SearchHistoryMenu.Dispose();
	SearchModeMenu.Dispose();
	_menu.Dispose();
}

//=================================================// 快速搜索

function quickSearch(metadb, search_function) {
	var playlist_index = -1;
	for (i = 0; i < plman.PlaylistCount; i++) {
		if (plman.GetPlaylistName(i) == "搜索结果") {
			playlist_index = i;
			break;
		}
	}
	if (playlist_index < 0) {
		plman.CreatePlaylist(plman.PlaylistCount, "搜索结果");
		playlist_index = plman.PlaylistCount - 1
	}
	plman.ActivePlaylist = playlist_index;
	plman.ClearPlaylist(playlist_index);


	var album_items = str = "";
	var tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");

	switch (search_function) {
	case 'artist':
		str = fb.TitleFormat("%artist%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%artist% IS " + trimstr(str));
		break;
	case 'album':
		str = fb.TitleFormat("%album%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%album% IS " + trimstr(str));
		break;
	case 'genre':
		str = fb.TitleFormat("%genre%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%genre% IS " + trimstr(str));
		break;
	case 'date':
		str = fb.TitleFormat("%date%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%date% IS " + trimstr(str));
		break;
	}
	album_items.OrderByFormat(tfo, 1);
	plman.InsertPlaylistItems(playlist_index, 0, album_items);
}

function trimstr(str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

//=================================================// 网络搜索

function clean_name(n) {
	if (!n) return;
	return n.replace(/[\/\:\*\?\"\<\>\|]/g, '').replace(/^\s+|\s+$/g, "");
}

function NetSearch(searchtext, pageid, switchpage) {
	SearchListName = clean_name(searchtext);
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在搜索网络...");
	switch (ppt.webnb) {
		case 1:
			cachefile = fb.ProfilePath + "\\cache\\KWSearch.asx";
			try {fso.DeleteFile(cachefile);}catch(e) {};
			KWSearch(searchtext, pageid, switchpage);
			break;
		case 2:
			cachefile = fb.ProfilePath + "\\cache\\TTSearch.asx";
			try {fso.DeleteFile(cachefile);}catch(e) {};
			TTSearch(searchtext, pageid, switchpage);
			break;
		case 3:
			cachefile = fb.ProfilePath + "\\cache\\MGSearch.asx";
			try {fso.DeleteFile(cachefile);}catch(e) {};
			MGSearch(searchtext, pageid, switchpage, 1);
			break;
		case 4:
			cachefile = fb.ProfilePath + "\\cache\\MGSearch.asx";
			try {fso.DeleteFile(cachefile);}catch(e) {};
			MGSearch(searchtext, pageid, switchpage, 2);
			break;
		default:
			break;
	}
	Deltempfile(cachefile);
}

function KWSearch(searchtext, pageid, switchpage){
    var searchURL = "http://player.kuwo.cn/webmusic/getsjplayinfo?flag=6&pn=" + pageid + "&pr=" + ppt.pagesize + "&type=music&key=" + encodeURIComponent(StringFilter(searchtext));
	try {
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var songid = [];
					var filedata = '<asx version="3.0">\r\n\r\n';
					var ret = json(xmlHttp.responseText.replace(/'/g, '"'))["list"];
					if(!ret || ret.length == 0){UpdateDone("已经是最后一页");return;}
					for (var i = 0; i < ret.length; i++) {
						songid[i] = {
							artist:ret[i].artist,
							song:ret[i].songName,
							url:"http://antiserver.kuwo.cn/anti.s?type=convert_url&response=url&rid=" + ret[i].rid + "&br=320kmp3&format=mp3"
						};
					}
					l = 0;
					//debug && fb.trace(songid.length);
					if(songid.length == 0){UpdateDone("已经是最后一页");return;}
					url = songid[l].url;
					//debug && fb.trace(l,url);
					xmlHttp2.open("GET", url, true);
					xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
					xmlHttp2.send(null);
					xmlHttp2.onreadystatechange = function() {
						if (xmlHttp2.readyState == 4) {
							if (xmlHttp2.status == 200) {
								filedata = filedata + '<entry>\r\n'
								 + '<title>' + songid[l].song + '</title>\r\n'
								 + '<author>' + songid[l].artist + '</author>\r\n'
								 + '<ref href="' + xmlHttp2.responseText + '"/>\r\n'
								 + '</entry>\r\n\r\n';
								 //debug && fb.trace(l,songid[l].song,songid[l].artist,xmlHttp2.responseText)
							}
							l++;
							if (l < songid.length){
								var URL_Timer = window.SetTimeout(function () {
										url = songid[l].url;
										xmlHttp2.open("GET", url, true);
										xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
										xmlHttp2.send(null);
										URL_Timer && window.ClearTimeout(URL_Timer);
									}, 5);
							}	
							if (l == songid.length) {
								filedata = filedata + "</asx>";
								SaveAs(filedata, cachefile);
								DisposeList("网搜", 4, SearchListName, pageid, switchpage);
								SetBoxText(null);
							}
						}
					};
				}
			}
		}
	} catch(e) {
		fb.trace("搜索失败");
		SetBoxText(null);
		return;
	}
}

function MGSearch(searchtext, pageid, switchpage, quality){
	var searchURL = "http://140.143.30.148:88/index.php?key=VG&class=miguSearch&ID=" + encodeURIComponent(StringFilter(searchtext)) +  "&k=" + pageid;
	switch(quality){
		case 1:
			var toneFlag = "SQ";
			var resourceType = "E";
			break;
		case 2:
			var toneFlag = "HQ";
			var resourceType = "2";
			break;
		default:
			var toneFlag = "HQ";
			var resourceType = "2";
			break;
	}
	try {
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var songid = [];
					var filedata = '<asx version="3.0">\r\n\r\n';
					var ret = json(xmlHttp.responseText).songResultData.resultList;
					if(!ret || ret.length == 0){UpdateDone("已经是最后一页");return;}
					for (var i = 0; i < ret.length; i++) {
						if(ret[i][0].vipType == ""){
							filedata = filedata + '<entry>\r\n'
							 + '<title>' + ret[i][0].name + '</title>\r\n'
							 + '<author>' + ret[i][0].singers[0].name + '</author>\r\n'
							 + '<ref href="' + "http://app.pd.nf.migu.cn/MIGUM2.0/v1.0/content/sub/listenSong.do?toneFlag=" + toneFlag + "&netType=00&userId=15548614588710179085069&ua=Android_migu&version=5.1&copyrightId=0&contentId=" + ret[i][0].contentId + "&resourceType=" + resourceType + "&channel=0" + '"/>\r\n'
							 + '</entry>\r\n\r\n';
						}
					}
					filedata = filedata + "</asx>";
					SaveAs(filedata, cachefile);
					DisposeList("网搜", 4, SearchListName, pageid, switchpage);
					SetBoxText(null);
				}
			}
		}
	} catch(e) {
		fb.trace("搜索失败");
		SetBoxText(null);
		return;
	}
}

function TTSearch(searchtext, pageid, switchpage){
	var searchURL = 'http://tingapi.ting.baidu.com/v1/restserver/ting?method=baidu.ting.search.common&format=json&query='  + encodeURIComponent(StringFilter(searchtext)) + "&page_no=" + pageid + "&page_size=" + ppt.pagesize;
	var qt = "320";
	/*switch(ppt.quality){
		//case 1:
		//	var qt = "192";
		//	break;
		case 1:
			var qt = "320";
			break;
		case 2:
			var qt = "flac";
			break;
		default:
			var qt = "320";
			break;
	}*/
	
	try {
		var l= 0;
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var songid = [];
					var ret = json(reconvert(xmlHttp.responseText))["song_list"];
					//debug && fb.trace("搜索到的数量 > " + ret.length);
					if (ret && ret.length > 0) {
						for (var i = 0; i < ret.length; i++) {
							songid.push({
								artist:ret[i].author,
								song:ret[i].title,
								id:ret[i].song_id
							});
							//debug && fb.trace(ret[i].author,ret[i].title,ret[i].song_id);
						}
					}else{
						UpdateDone("已经是最后一页");
						return;
					}
					l = 0;
					//debug && fb.trace(songid.length);
					if(songid.length > 0){
						var filedata = '<asx version="3.0">\r\n\r\n';
						var rex = new RegExp("play_url\":\"(.*?)\",","g");
						url = "http://tingapi.ting.baidu.com/v1/restserver/ting?method=baidu.ting.song.getSongLink&format=json&from=bmpc&version=1.0.0&version_d=7&songid=" + songid[l].id + "&lebo=0&down=1&bit=" + qt;
						//debug && fb.trace(l,url);
						xmlHttp2.open("GET", url, true);
						xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
						xmlHttp2.send(null);
						xmlHttp2.onreadystatechange = function() {
							if (xmlHttp2.readyState == 4) {
								if (xmlHttp2.status == 200) {
									try {
										ret = json(xmlHttp2.responseText)["result"]["bitrate"][0].file_link;
										if(ret != null){
											filedata = filedata + '<entry>\r\n'
											 + '<title>' + json(xmlHttp2.responseText)["result"]["songinfo"].title + '</title>\r\n'
											 + '<author>' + json(xmlHttp2.responseText)["result"]["songinfo"].author + '</author>\r\n'
											 + '<ref href="' + ret + '"/>\r\n'
											 + '</entry>\r\n\r\n';
											 //debug && fb.trace(l,songid[l].song,songid[l].artist,ret[1].replace(/\\/g, ""));
										}
									} catch(e) {
										fb.trace("不正常的: ",songid[l].song,"http://tingapi.ting.baidu.com/v1/restserver/ting?method=baidu.ting.song.getSongLink&format=json&from=bmpc&version=1.0.0&version_d=7&songid=" + songid[l].id + "&lebo=0&down=1&bit=" + qt);
									};
								}
								l++;
								if (l < songid.length){
									//debug && fb.trace(l,url);
									var URL_Timer = window.SetTimeout(function () {
											url = "http://tingapi.ting.baidu.com/v1/restserver/ting?method=baidu.ting.song.getSongLink&format=json&from=bmpc&version=1.0.0&version_d=7&songid=" +  + songid[l].id + "&lebo=0&down=1&bit=" + qt;
											xmlHttp2.open("GET", url, true);
											xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
											xmlHttp2.send(null);
											URL_Timer && window.ClearTimeout(URL_Timer);
										}, 5);

								}
								if (l == songid.length) {
									filedata = filedata + "</asx>";
									SaveAs(filedata, cachefile);
									DisposeList("网搜", 4, SearchListName, pageid, switchpage);
									SetBoxText(null);
								}
							}
						}
					}else{
						UpdateDone("已经是最后一页");
						return;
					}
				}
			}
		}
	} catch(e) {
		fb.trace("搜索失败");
		SetBoxText(null);
		return;
	}
}

function MGRankListid(id, listname){
	//cachefile = fb.ProfilePath + "\\cache\\RankList.asx";
	cachefile = fb.ProfilePath + "\\cache\\" + listname + ".asx";
	SetBoxText("正在更新榜单...");
	var searchURL = "https://m.music.migu.cn/migu/remoting/cms_list_tag?nid=" + id + "&pageSize=800&pageNo=0";
	//debug && fb.trace(searchURL);
	
	switch(ppt.quality){
		case 1:
			var toneFlag = "HQ";
			var resourceType = "2";
			break;
		case 2:
			var toneFlag = "SQ";
			var resourceType = "E";
			break;
		default:
			var toneFlag = "HQ";
			var resourceType = "2";
			break;
	}
	try {
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var songid = [];
					var filedata = '<asx version="3.0">\r\n\r\n';
					if (xmlHttp.responseText == "") {SetBoxText(null);return;}
					var ret = json(xmlHttp.responseText).result.results;
					if(!ret || ret.length == 0){UpdateDone("已经是最后一页");return;}
					for (var i = 0; i < ret.length; i++) {
						try {
							filedata = filedata + '<entry>\r\n'
							 + '<title>' + ret[i].songData.songName + '</title>\r\n'
							 + '<author>' + ret[i].songData.singerName[0] + '</author>\r\n'
							 + '<ref href="' + "http://app.pd.nf.migu.cn/MIGUM2.0/v1.0/content/sub/listenSong.do?toneFlag=" + toneFlag + "&netType=00&userId=15548614588710179085069&ua=Android_migu&version=5.1&copyrightId=0&contentId=" + ret[i].songData.qq.productId + "&resourceType=" + resourceType + "&channel=0" + '"/>\r\n'
							 + '</entry>\r\n\r\n';
							//debug && fb.trace(ret[i].contentId,ret[i].songData.songName,ret[i].songData.singerName[0]);
						} catch(e) {};
					}
					filedata = filedata + "</asx>";
					SaveAs(filedata, cachefile);
					UpdateList("榜单 | " + listname);
					SetBoxText(null);
				}
			}
		}
	} catch(e) {
		fb.trace("搜索失败");
		SetBoxText(null);
		return;
	}
	Deltempfile(cachefile);
}

//=================================================// 蜻蜓FM

function GetQTFMRadiolist(){
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在更新电台菜单...");
    var searchURL = "http://rapi.qingting.fm/regions";
	try {
		var qtlistid = ""
		xmlHttp.open("GET", searchURL, true);
		xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var listid = "";
					var c = 0;
					var ret = json(xmlHttp.responseText)["Data"];
					if (ret.length > 0) {
						if(c == 0) c = ret.length + 1;
						l = 0;
						url = "http://rapi.qingting.fm/categories/" + 409 + "/channels?page=1&pagesize=50";
						xmlHttp2.open("GET", url, true);
						xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
						xmlHttp2.send(null);
						xmlHttp2.onreadystatechange = function() {
							if (xmlHttp2.readyState == 4) {
								if (xmlHttp2.status == 200) {
									//debug && fb.trace(l,url);
									var ret1 = json(xmlHttp2.responseText)["Data"];
									listid = (l==0?"国家台":ret[l-1].title) + ": g;";
									if(ret1 != null){
										for (var k = 0; k < ret1.length; k++) {
											listid += ret1[k].title + ":" + ret1[k].content_id + ";"
										}
										if(listid.charAt(listid.length-1) == ";") qtlistid += listid.slice(0,listid.length-1) + "|";
										if(l+1==c) {
											try {fso.DeleteFile(qtfm_arr);}catch(e) {};
											qtlistid = qtlistid.slice(0,qtlistid.length-1);
											SaveAs(qtlistid, qtfm_arr);
											ppt.webkqtradioarr = qtlistid.split("|");
										};
									}
								}
								l++;
								if (l > 0 && l < c){
									var URL_Timer = window.SetTimeout(function () {
										url = "http://rapi.qingting.fm/categories/" + ret[l-1].id + "/channels?page=1&pagesize=100";
										xmlHttp2.open("GET", url, true);
										xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
										xmlHttp2.send(null);
										URL_Timer && window.ClearTimeout(URL_Timer);
									}, 5);
								}
							}
						}
					}
				}
			}
		}
		UpdateDone("电台更新成功!");
	} catch(e) {
		fb.trace("更新失败");
		return;
	}
}

function QTFMRadiolist(id, listname){
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在获取电台列表...");
	//cachefile = fb.ProfilePath + "\\cache\\RadioList.asx";
	cachefile = fb.ProfilePath + "\\cache\\" + listname + ".asx";
	try {
		//debug && fb.trace(id,listname)
		var filedata = '<asx version="3.0">\r\n\r\n';
		//var ret = id.split(":");
		for (var i = 1; i < id.length; i++) {
			//debug && fb.trace(i,id[i].split(":")[0],id[i].split(":")[1]);
			filedata = filedata + '<entry>\r\n'
			 + '<title>' + id[i].split(":")[0] + '</title>\r\n'
			 + '<author>' + listname + '</author>\r\n'
			 + '<ref href="' + "https://lhttp.qingting.fm/live/" + id[i].split(":")[1] + "/64k.mp3" + '"/>\r\n'
			 + '</entry>\r\n\r\n';
		}
		filedata = filedata + "</asx>";
		SaveAs(filedata, cachefile);
		UpdateList("电台 | " + listname);
		SetBoxText(null);
	} catch(e) {
		fb.trace("获取电台失败");
		return;
	}
	Deltempfile(cachefile);
}

function SetBoxText(text){
	if(text == null) text ="";
	g_searchbox.inputbox.text = text;
	g_searchbox.repaint();
}

function UpdateDone(text){
	SetBoxText(text);
	var Done = window.SetTimeout(function() {
		SetBoxText(null);
		Done && window.ClearTimeout(Done);
		Done = false;
	}, 4000);
}

function DisposeList(typename, namelen, listname, pageid, switchpage){
	if (switchpage) {
		var playlistIndex = plman.ActivePlaylist;
		plman.ClearPlaylist(playlistIndex);
		plman.AddLocations(playlistIndex, [cachefile]);
		plman.RenamePlaylist(playlistIndex, typename + " | " + listname + " | " + pageid);
	} else {
		if(pageid != null) var addpageid = " | " + pageid;
		else var addpageid = "";
		var pl_to_remove = new Array;
		var isFound = false;
		var total = plman.PlaylistCount;
		for (var i = 0; i < total; i++) {
			if (plman.GetPlaylistName(i).substr(0, namelen) == typename + " |") {
				if (!ppt.multiple) {
					if (!isFound) {
						var plIndex = i;
						isFound = true;
					}
					pl_to_remove.push(i);
				}
			}
		}
		if (isFound && !ppt.multiple) {
			var r = pl_to_remove.length - 1;
			while (r >= 0) {
				plman.RemovePlaylist(pl_to_remove[r]);
				r--;
			}
			plIndex = plman.PlaylistCount;
		} else {
			plIndex = total;
		}
		fb.CreatePlaylist(plIndex, typename + " | " + listname + addpageid);
		plman.AddLocations(plIndex, [cachefile]);
		plman.ActivePlaylist = plIndex;
	}
}

function UpdateList(listname){
	var isFound = false;
	var total = plman.PlaylistCount;
	for (var i = 0; i < total; i++) {
		if (plman.GetPlaylistName(i).substr(0, listname.length) == listname) {
			if (!isFound) {
				var plIndex = i;
				isFound = true;
			}
			break;
		}
	}
	if (isFound) {
		plman.ClearPlaylist(plIndex);
	} else {
		plIndex = total;
		fb.CreatePlaylist(plIndex, listname);
	}
	plman.AddLocations(plIndex, [cachefile]);
	plman.ActivePlaylist = plIndex;
}

function Deltempfile(tmpfile){
	var DelFile = window.SetTimeout(function() {
		try {
			fso.DeleteFile(tmpfile);
		}; catch(e) {};
		DelFile && window.ClearTimeout(DelFile);
		DelFile = false;
	}, 6000);
}

function SaveAs(str, file) {
	var ado = new ActiveXObject("ADODB.Stream");
	ado.Type = 2;
	ado.mode = 3;
	ado.Charset = "UTF-8";
	ado.open();
	try {
		ado.WriteText(str);
		ado.SaveToFile(file);
	} catch (e) {
		fb.trace("ADODB.Stream:写入文件失败。");
	}
	ado.flush();
	ado.Close();
}

function StringFilter(s) {
	s = s.replace(/\'|·|\&|–/g, "");
	//truncate all symbols
	s = s.replace(/\(.*?\)|\[.*?]|{.*?}|（.*?/g, "");
	s = s.replace(/[-/:-@[-`{-~]+/g, "");
	s = s.replace(/[\u2014\u2018\u201c\u2026\u3001\u3002\u300a\u300b\u300e\u300f\u3010\u3011\u30fb\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff5e\uffe5]+/g, "");
	return s;
}

function json(text) {
	try {
		var data = JSON.parse(text);
		return data;
	} catch (e) {
		return false;
	}
}

function reconvert(str){ 
	str = str.replace(/(\\u)(\w{1,4})/gi,function($0){ 
		return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g,"$2")),16))); 
	}); 
	str = str.replace(/(&#x)(\w{1,4});/gi,function($0){ 
		return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g,"$2"),16)); 
	}); 
	str = str.replace(/(&#)(\d{1,6});/gi,function($0){ 
		return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g,"$2"))); 
	}); 
	return str; 
}