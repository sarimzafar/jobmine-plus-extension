/*================================*\
|*         __CLEAN_UP__           *|
\*================================*/
{/*===== Expand to see the cleanup code =====*/
//Append the version on the webpage
$("body").addClass("v_"+CONSTANTS.VERSION.replace(/\./g,"_"));

//Removes the timer
if(PREF.load("SETTINGS_GENERAL_KILL_TIMER", null, false)) {
   removeTimer();
}

//DESTROY IFRAMES
if(PAGEINFO.TYPE != PAGES.SKILLS) {
   $("iframe").remove();
}

//Disallow highlighting last row if requested
if (!PREF.load("HIGHLIGHT_LAST_ROW")) {
   $("body").addClass("doNotHighlightLastRow");
}

//Elimate their highlight methods
BRIDGE.addFunction("HighLightTR");

//Destory keypressings and use it for my purposes
BRIDGE.addJS(function(){window.doKeyPress_win0 = function(){}});
}