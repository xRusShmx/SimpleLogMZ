//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.0) This plugin adds a simple log to your game.
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
 * Window position - specifies the location of the log window, with four positions in the corners of the screen and one formula-based position (see customFormula in the plugin file).
 * 
 * Open by Player - determines whether the player can open and close the log by pressing a key.
 *
 * Log Key - if the player can open the log by pressing a key, which key is used? Accepts values from 'a' to 'z'.
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
 */
//-----------------------------------------------------------------------------


(function () {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 26; i++) {
    Input.keyMapper[i + 65] = alphabet[i];
  }

  const params = PluginManager.parameters("SimpleLog");
  const maxRows = Number(params["maxRows"]) || 4;
  const openByPlayer = String(params["openByPlayer"]);
  const logKey = String(params["key"]);
  const pluginName = "SimpleLog";

  PluginManager.registerCommand(pluginName, "ClearLog", function () {
    const scene = SceneManager._scene;
    const logWindow = scene._logWindow;
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
    }

    addText(text) {
      const lines = this.processText(text);

      for (const line of lines) {
        this._text.push(line);

        if (this._text.length > this._maxRows) {
          this._text.shift();
        }
      }

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
        for (let i = 0; i < this._text.length; i++) {
          const text = this._text[i];
          const y = i * this.lineHeight();
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
          Window_Base.prototype.lineHeight.call(this) * (maxRows + 0.5),
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

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    //console.log(logKey);
    if (Input.isTriggered(logKey.toLowerCase()) && openByPlayer == "true") {
      const logWindow = this._logWindow;
      if (logWindow) {
        logWindow.toggleLog();
      }
    }
  };
})();
