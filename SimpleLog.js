//-----------------------------------------------------------------------------
/*:
 * @plugindesc [2.0] This plugin adds a simple log to your game.
 * @url https://boosty.to/russhm
 * @target MZ
 * @author RusShm
 *
 * @help This plugin adds a simple log into your game.
 * Window can be custom placed, uses all standart MZ codes (i.e. \V[x] for variables).
 *
 * Plugin Parameters:
 *
 * Maximum Rows - determines the maximum number of rows used for the log. Optimal range is 1-4, but it can accept other values above 0.
 *
 * Obtain Message — Message added to log when item obtained. Type "NO" to turn off. Use "NAME" to show name of item, use "ICON" to show icon.
 *
 * Window position - specifies the location of the log window, with four positions in the corners of the screen and one formula-based position (see customFormula in the plugin file).
 * 
 * Open by Player - determines whether the player can open and close the log by pressing a key.
 *
 * Log Key - if the player can open the log by pressing a key, which key is used? Accepts values from 'a' to 'z'.
 *
 * Use Mouse System? — If toggled on - will use some Mouse System for enabling scroll by mouse wheel
 * 
 * Log Scroll Buttons — Buttons that used for scrolling log Window. First letter ups, second downs log. If you use Mouse System, you can enter "WHEEL" to use mouse wheel.
 * 
 * Plugin Commands:
 
 * Add to Log - adds text to the log.

 * Close Log - closes the log.

 * Clear Log - completely clears the log.
 *
 * @param maxRows
 * @text Maximum Rows
 * @desc The maximum number of rows to display in the log window.
 * @type number
 * @default 4
 *
 * @param itemMessage
 * @text Obtain Message
 * @desc Type "NO" to turn off. Use "NAME" to show name of item, use "ICON" to show icon.
 * @type String
 * @default New item: ICON NAME!  
 *
 * @param windowPosition
 * @text Window Position
 * @desc Select the position for the log window. If you use custom formula then ctrl + F and search for "customFormula" in plugin ile.
 * @type select
 * @option Left Bottom
 * @value leftBottom
 * @option Right Bottom
 * @value rightBottom
 * @option Left Top
 * @value leftTop
 * @option Right Top
 * @value rightTop
 * @option Custom Formula
 * @value customFormula
 * @default leftBottom
 *
 * @param UMS
 * @text Use mouse system? 
 * @desc If toggled on - will use some Mouse System for enabling scroll by mouse wheel
 * @type boolean
 * @default false
 *
 * @param logScrollButtons
 * @text Log Scroll Buttons
 * @desc Read help to know more 
 * @type String
 * @default i,o
 *
 * @param openByPlayer
 * @text Open by player
 * @desc Can the log be opened by player?
 * @type boolean
 * @default true
 * 
 * @param key
 * @text Log Key
 * @desc Key button that toggle Log Window (a-z)
 * @type String
 * @default L
 *
 * @command ClearLog
 * @text Clear Log
 * @desc Immediately clears Log window
 *
 * @command CloseLog
 * @text Close Log
 * @desc Immediately closes Log window
 *
 * @command addToLog
 * @text Add to Log
 * @desc Adds text to the log window.
 *
 * @arg text
 * @text Text
 * @desc The text to add to the log window.
 * @type multiline_string
 *
 */
//-----------------------------------------------------------------------------


(function () {
	
  var isLoaded = false;
  let LoggedLines = new Array();

  
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 26; i++) {
    Input.keyMapper[i + 65] = alphabet[i];
  }


  const params = PluginManager.parameters("SimpleLog");
  const uMS = String(params["UMS"]);
  const maxRows = Number(params["maxRows"]) || 4;
  const openByPlayer = String(params["openByPlayer"]);
  const logKey = String(params["key"]);
  const pluginName = "SimpleLog";
  const message = String(params["itemMessage"]);
  const lSB = String(params["logScrollButtons"]);
if (uMS == "true") {
	  
	const check = PluginManager.parameters("MouseSystem");
	console.log(check)
	const mSCompitability = String(check["contMenu"]);
	console.log(mSCompitability)
	if (!(mSCompitability == "true" || mSCompitability == "false")){
		
		alert("You have no MouseSystem! Download it here: https://boosty.to/russhm or Press F12 and find it there");
		window.open("https://forums.rpgmakerweb.com/index.php?threads/russhms-mouse-system-mz-1-1-clicks-and-cursor-graphic.165423/",'_blank').focus();
	}
}

var mouse = false;
if (lSB == "WHEEL" && uMS == "true"){ mouse = true;}
 
  PluginManager.registerCommand(pluginName, "ClearLog", function () {
    const scene = SceneManager._scene;
    const logWindow = scene._logWindow;
	LoggedLines = [];
    logWindow._text = [];
  });

  PluginManager.registerCommand(pluginName, "CloseLog", function () {
    const scene = SceneManager._scene;
    const logWindow = scene._logWindow;
    if (logWindow._showLog) {
      logWindow.toggleLog();
    }
  });

  PluginManager.registerCommand(pluginName, "addToLog", function (args) {
    const textToAdd = args.text;
    addToLog(textToAdd);
  });

  function addToLog(text) {
	
	
	const scene = SceneManager._scene;
    if (!scene._logWindow) {
      scene.createLogWindow();
    }

    const logWindow = scene._logWindow;
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
      logWindow.addText(line);
    }

    if (!logWindow._showLog) {
      logWindow.toggleLog();
    }
  }

  class Window_Log extends Window_Base {
    constructor(rect) {
        super(rect);
        this.opacity = 255;
        this.contentsOpacity = 255;
        this.createContents();
        this._text = [];
        this._maxRows = maxRows;
        this._showLog = false;
        this.hide();
        this._startIndex = 0; // Добавляем новое свойство для индекса начальной строки
    }
	scrollLog(direction) {
	var x = 1
    if (direction === 'up') {
		
        this._startIndex = Math.max(0, this._startIndex - x);
    } else if (direction === 'down') {
        this._startIndex = Math.min(LoggedLines.length - this._maxRows, this._startIndex + x);
    }
    this.refresh();
	}
    addText(text) {
		console.log(LoggedLines);
        const lines = this.processText(text);

        for (const line of lines) {
            LoggedLines.push(line); // Добавляем строку в массив LoggedLines
        }

        this._startIndex = Math.max(0, LoggedLines.length - this._maxRows); // Устанавливаем индекс начальной строки
				console.log(this._startIndex);
        this.refresh();
        this.show();
    }

    processText(text) {
        const lines = [];
        const maxWidth = this.contents.width - 8;
        const words = text.split(" ");
        let currentLine = "";

        for (const word of words) {
            const textWidth = this.textWidthEx(currentLine + " " + word);

            if (textWidth <= maxWidth) {
                currentLine += (currentLine === "" ? "" : " ") + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        return lines;
    }

    refresh() {
        this.contents.clear();

        if (this._showLog) {
            const endIndex = Math.min(LoggedLines.length, this._startIndex + this._maxRows);
            for (let i = this._startIndex; i < endIndex; i++) {
                const text = LoggedLines[i];
                const y = (i - this._startIndex) * this.lineHeight();
                if (text !== undefined) {
                    this.drawTextEx(text, 4, y);
                }
            }
        }
    }

    textWidthEx(text) {
        return this.drawTextEx(text, 0, this.contents.height);
    }

    toggleLog() {
        this._showLog = !this._showLog;
        this.refresh();
        this.visible = this._showLog;
    }
}

  Scene_Map.prototype.createLogWindow = function () {
    console.log(openByPlayer);
    const windowPosition = String(params["windowPosition"] || "leftBottom");
    let rect;
    console.log(windowPosition);
    switch (windowPosition) {
      case "rightBottom":
        rect = new Rectangle(
          Graphics.boxWidth - Graphics.boxWidth / 3,
          Graphics.boxHeight -
            Window_Base.prototype.lineHeight.call(this) * (maxRows + 1),
          Graphics.boxWidth / 3,
          Window_Base.prototype.lineHeight.call(this) * (maxRows + 0.5),
        );
        break;
      case "leftTop":
        rect = new Rectangle(
          0,
          0,
          Graphics.boxWidth / 3,
          Window_Base.prototype.lineHeight.call(this) * (maxRows + 0.5),
        );
        break;
      case "rightTop":
        rect = new Rectangle(
          Graphics.boxWidth - Graphics.boxWidth / 3,
          0,
          Graphics.boxWidth / 3,
          Window_Base.prototype.lineHeight.call(this) * (maxRows + 0.5),
        );
        break;
      case "customFormula":
        // Here's place for formula.
        // In example:
        rect = new Rectangle(
          0,
          Graphics.boxHeight -
            Window_Base.prototype.lineHeight.call(this) * (maxRows + 1),
          Graphics.boxWidth / 3,
          Window_Base.prototype.lineHeight.call(this) * (maxRows + 0.5),
        );
        break;
      default:
        rect = new Rectangle(
          0,
          Graphics.boxHeight -
            Window_Base.prototype.lineHeight.call(this) * (maxRows + 1),
          Graphics.boxWidth / 3,
          Window_Base.prototype.lineHeight.call(this) * (maxRows + 0.6),
        );
        break;
    }

    this._logWindow = new Window_Log(rect);
    this.addWindow(this._logWindow);
  };

  const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
  Scene_Map.prototype.createAllWindows = function () {
    _Scene_Map_createAllWindows.call(this);
    this.createLogWindow();
  };
  
	_Game_Map_setup = Game_Map.prototype.setup;
	Game_Map.prototype.setup = function(mapId) 
	{
		_Game_Map_setup.call(this,mapId);
			isLoaded = true;
};

//
const _GameParty_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip){
	const container = this.itemContainer(item);
    if (container) {
        const lastNumber = this.numItems(item);
        const newNumber = lastNumber + amount;
        container[item.id] = newNumber.clamp(0, this.maxItems(item));
        if (container[item.id] === 0) {
            delete container[item.id];
        }
        if (includeEquip && newNumber < 0) {
            this.discardMembersEquip(item, -newNumber);
        }
        $gameMap.requestRefresh();
    }
	if (message != "NO"){
		var itemText = message.replace("NAME", item.name);
		itemText = itemText.replace("ICON", '\\I['+item.iconIndex+"]");
		console.log(itemText);
		addToLog(itemText);
	}
	
	
}

const _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);

    if (Input.isTriggered(logKey.toLowerCase()) && openByPlayer == "true") {
        const logWindow = this._logWindow;
        if (logWindow) {
            logWindow.toggleLog();
        }
    }
	
	
	if (mouse)
	{ 
		console.log(deltaY)
		if (deltaY > 0) 
		{	
		this._logWindow.scrollLog('down');
		}
		else if (deltaY < 0) {
			this._logWindow.scrollLog('up');
		}
		deltaY = 0;
	}	
	
		
	var buttons = lSB.split(',')
	// Обработка нажатий клавиш для прокрутки лога
    if (this._logWindow && this._logWindow._showLog) {
        if (Input.isTriggered(buttons[0])) {
            this._logWindow.scrollLog('up');
        } else if (Input.isTriggered(buttons[1])) {
            this._logWindow.scrollLog('down');
        }
    }
};

})();
