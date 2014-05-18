/*================================*\
|*        __PREFERENCES__         *|
\*================================*/
{/*Expand to see the preferences*/
var PREF = {
   DEFAULT : {
      KILLTIMER            : false,
      HIGHLIGHT_LAST_ROW   : true,
      LAST_PAGE            : PAGES.APPLICATIONS,
      LAST_ACCESSED_SEARCH : new Date().getTime(),
      SHOW_WELCOME_MSG     : true,
      WORK_TERM_URL        : null,
      RESUMES              : "",
      PAGE : {
         HIDDEN_HEADERS : [],
      },
   },
   onSave   : function(){},
   onLoad   : function(){},
   onClear  : function(){},
   onRemove : function(){},
   commonPrefix   : "COMMON",
   /**
    *    Load Preferences
    *       Implementation:
    *          [name]: can be any name but most be a key in DEFAULT (except PAGE)
    *          [index]: an int that gets added to the name of the key, it is used to separate incremental objects like tables
    *          [default]: a value that is returned if the name cannot be found
    *
    *       PREF.load([name]);
    *       PREF.load([name], [index]);
    *       PREF.load([name], [index], [default]);    
    */
   load : function(name, index, defaultInputVal) {
      if (name == null || name == "") {
         return;
      }
      var key = "";
      var defaultValue = "";
      var nameIsSettings = name.startsWith("SETTINGS_");
      var nameIsPagePref = this.DEFAULT.PAGE.hasOwnProperty(name);
      var nameIsPref = this.DEFAULT.hasOwnProperty(name) && name != "PAGE";
      if(nameIsSettings) {
         key = name;
         defaultValue = 0;
      } else {
         name = name.toUpperCase().underscorize();
         if (nameIsPagePref) {
            Assert(PAGEINFO.TYPE != null, "This page has no type, cannot load");
            key = index == null ? PAGEINFO.TYPE + "_" + name : PAGEINFO.TYPE + "_" + index + "_" + name;
            defaultValue = this.DEFAULT.PAGE[name];
         } else {
            key = index == null ? this.commonPrefix+ "_" +name : this.commonPrefix+"_" + index + "_" +name;
            defaultValue = this.DEFAULT[name];
         }
      }
      //Try to load
      try{
         var value = OBJECTS.STORAGE.getItem(key);
      }catch(e){"Cannot load preferences because there is an error with localStorage! :(";}
      if (value == undefined) {
         //If there is no value, return the default, if this is null, it returns null
         return defaultInputVal != null ? defaultInputVal : defaultValue;      
      } else if(!nameIsPagePref && !nameIsPref && !nameIsSettings) {
         Throw("Failed to load: "+name+" because the name specified was not part of the object list for this.DEFAULT.");
      }
      
      //Parse Return
      if (value*1 == parseInt(value)) {    //Is numerical number?
         return value*1;
      }
      switch(value) {         //Is boolean?
         case "TRUE":
         case "true":
            return true;
         case "FALSE":
         case "false":
            return false;
      }
      this.onLoad(value);
      return value;
   },
   /**
    *    Save Preferences
    *       Implementation:
    *          [name]: can be any name but most be a key in DEFAULT (except PAGE)
    *          [index]: an int that gets added to the name of the key, it is used to separate incremental objects like tables
    *          [value]: a value of any type that can be a string that is saved
    *
    *       PREF.save([name], [value]);
    *       PREF.save([name], [index], [value]);    
    */
   save : function(name, arg1, arg2) {
      if (name == null || name == "") {
         return;
      }
      var value, index;
      //Parse Arguments
      switch(arguments.length) {
         case 1:
            value = "";
            break;
         case 2:
            value = arg1;
            break;
         case 3:
            Assert(UTIL.isNumeric(arg1), "Given index to save is not an integer!");
            value = arg2;
            index = arg1;
            break;
         default:
            Throw(MESSAGE.INVALID_ARGUMENTS);
            return;
            break;
      }
      var key = "";
      if(name.startsWith("SETTINGS_")) {
         key = name;
      } else {
         name = name.toUpperCase().underscorize();
         if (this.DEFAULT.PAGE.hasOwnProperty(name)) {
            Assert(PAGEINFO.TYPE != null, "This page has no type, cannot save");
            key = index == null ? PAGEINFO.TYPE + "_" + name : PAGEINFO.TYPE + "_" + index + "_" + name;
         } else if (this.DEFAULT.hasOwnProperty(name) && name != "PAGE") {
            key = index == null ? this.commonPrefix+ "_" +name : this.commonPrefix+"_" + index + "_" +name;
         } else {
            Throw("Failed to save: "+name+" because the name specified was not part of the object list for this.DEFAULT.");
         }
      }
      //Try to save
      try{
         OBJECTS.STORAGE.setItem(key, value);
      }catch(e){Throw("Cannot save settings because there is an error with localStorage! :(");}
      this.onSave();
   },
    /**
    *    Remove Preferences
    *       Implementation:
    *          [name]: can be any name but most be a key in DEFAULT (except PAGE)
    *          [index]: an int that gets added to the name of the key, it is used to separate incremental objects like tables
    *
    *       PREF.remove([name]);
    *       PREF.remove([name], [index]);
    */
   remove : function(name, index) {
      if (name == null || name == "") { return false; }
      var key = "";
      name = name.toUpperCase().underscorize();
      var nameIsPagePref = this.DEFAULT.PAGE.hasOwnProperty(name);
      var nameIsPref = this.DEFAULT.hasOwnProperty(name) && name != "PAGE";
      if (nameIsPagePref) {
         Assert(PAGEINFO.TYPE != null, "This page has no type, cannot remove");
         key = index == null ? PAGEINFO.TYPE + "_" + name : PAGEINFO.TYPE + "_" + index + "_" + name;
      } else if(name.startsWith == "SETTINGS_") {
         key = name;
      } else {
         key = index == null ? this.commonPrefix+ "_" +name : this.commonPrefix+"_" + index + "_" +name;
      }
      try{
         var value = OBJECTS.STORAGE.removeItem(key);
      }catch(e){"Cannot remove preference: "+key+", because there is an error with localStorage! :(";return false;}
      this.onRemove();
      return true;
   },
   clear : function(){
      if(confirm("You are about to delete all the saved data for Jobmine Plus, is this what you want to do?")) {
         OBJECTS.STORAGE.clear();
         this.onClear();
      }
   }
};
}