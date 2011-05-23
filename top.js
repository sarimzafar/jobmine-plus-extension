// ==UserScript==
// @name           Jobmine Plus
// @namespace      http://eatthis.iblogger.org/
// @description    Makes jobmine even better and looks good too!
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=*
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/ES/*
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&Page=UW_CO_STU_JOBDTLS&UW_CO_JOB_TITLE=*
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID=*
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&Market=GBL&Page=UW_CO_STU_JOBDTLS&Action=U&target=Transfer*
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=*
// @exclude        *IScript_ShowStuDocument*
// @exclude        *FieldFormula.IScript_ShowAllDocuments*
// @exclude        *TIMEOUT*
// @exclude        *GetMenuHeader*
// @exclude	       *WEBLIB_UW_DOCS.UW_CO_DOC_TEXT*
// ==/UserScript==

/*   Table of contents
 *   -----------------
 *    _CONTANTS
 *    _FUNCTIONS
 *       |--_COOKIES_
 *       |--_UTILITIES_
 *       |--_LOADING_POPUP_
 *       |--_REMOVING_THE_TIMER_
 *       |--_INSERTING_HTML_
 *       |--_SETTING_
 *       |--_HINTS_TOOLTIP_
 *       |--_PANEL_POPUP_
 *
 *    _DEBUG_UNIT
 *    _JQUERY_PLUGINS
 *    _JQUERY_FUNCTION
 *    _REDIRECTION
 *    _PAGE_CLEAN_UP
 *    _JOB_DESCRIPTION
 *    _JOB_SEARCH_PAGE
 *    _PROFILE_PAGE
 *    _DOCUMENTS_PAGE
 *    _JOB_SHORT_LIST_PAGE
 *    _APPLICATIONS_PAGE
 *    _INTERVIEW_PAGE
 *    _OTHER_PAGES
 *    _HINT_SYSTEM
 *    _SETTINGS
 *    _POPUP_PANEL
 *    _REMOVING_THE_TIMER
 *    _HIGHLIGHTING
 
 
 ERRORS - What to fix
 --------
 //General
 
 //Chrome
 
 
 */

//Check to see if we can use storage
if(localStorage == null) {
   alert("Sorry, storage (html5) not supported by the browser, please update your browser.");
   return;
}

/*======================================*\
l*        _CONSTANTS                     |
\*======================================*/

/*
 *    Contents used all over the script
 */
   var CURRENT_VERSION = 1.09;                                                                                                 //Current version of Jobmine Plus
   var GLOBAL_TIMER    = null;                                                                                                //Global timer id, used to stop the Jobmine timer
   var SCRIPTSURL      = "https://jobmine-plus.googlecode.com/svn/trunk/scripts";                                             //URL location of scripts folder
   var ISFIREFOX       = unsafeWindow.toString().indexOf("[object Window]")!=-1;                                              //Is firefox?
   var IS_IN_IFRAME    = (self != top);                                                                                       //Checks to see if the page is loaded inside an iframe
   var PAGE_TYPE       = document.title ? document.title.toLowerCase().replace(/\s|-/gi,"_").replace(/_+/gi,"_") : "none";    //Gives the script a sense of what page we are on
   var HINT_ARRAY      = [];                                                                                                  //Holds all the hints
   var TABLES_OBJ      = {};                                                                                                  //Holds the elements of tables on the page
   
/*
 *    Page URLs
 */
   var INTERVIEW_PAGE   = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STU_INTVS&RL=&target=main0&navc=5170";
   var JOB_SEARCH_PAGE  = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOBSRCH&RL=&target=main0&navc=5170";
   var DOCUMENT_PAGE    = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STUDDOCS&RL=&target=main0&navc=5170";
   var JOB_SHORT_PAGE   = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOB_SLIST&RL=&target=main0&navc=5170";
   var RANKING_PAGE     = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STU_RNK2&RL=&target=main0&navc=5170";
   var PROFILE_PAGE     = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STUDENT&RL=&target=main0&navc=5170";
   //var WORK_REPORT_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_WORKRPRT&RL=&target=main0&navc=5170";
   var APPLICATION_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&PanelGroupName=UW_CO_APP_SUMMARY";
   var LOGIN_PAGE       = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=login";

/* 
 *    Settings Layout
 */   
   var SETTINGS_GENERAL = '<table cellpadding="0" cellspacing="0"><tbody><tr><td valign="top">Login Default Page:</td><td valign="top"><select id="popupSelect"><option selected="selected" value="ap">Applications</option><option value="in">Interviews</option><option value="js">Job Search</option><option value="dc">Documents</option><option value="jl">Job Short List</option><option value="rk">Rankings</option><option value="pr">Profile</option><!-- <option value="wr">Work Report Evaluations</option> --></select></td></tr><tr><td valign="top">Load Message Off:</td><td valign="top"><input id="loadCheckbox" class="chkbox" type="checkbox"></td></tr><tr><td valign="top">Do not Show Updates:</td><td valign="top"><input id="updateCheckbox" class="chkbox" type="checkbox"></td></tr><tr><td valign="top">Remove Timer:</td><td valign="top"><input checked="checked" id="removeTimerChkbx" class="chkbox" type="checkbox"></td></tr><tr><td class="" style="color: black;" valign="top">Auto-Refresh Duration (min):<br><span id="removeTimerDetails" class="details">The time specified (minutes) would allow the page to refresh when the page is on idle. If 0 or any time above 19 minutes is specified, there will be a timer for 19 minutes to avoid the php timer.</span></td><td valign="top"><input value="0" style="background-color: white; color: black;" onkeypress="return decimalOnly(event)" class="textField" id="popupText" type="text"></td></tr></tbody></table>';
   
  var SETTINGS_PAGES    = "<span class='heading'>Job Details Page</span><div class='cell'><div class='label'>Show Old Job Details Page</div><div class='field'><input id='pgSettings_showOldPage' type='checkbox'/></div></div>";
      SETTINGS_PAGES   += "<br/><br/><span class='heading'>Job Search Page</span><div class='cell'><div class='label'>Autorun last saved search</div><div class='field'><input id='pgSettings_runLastSrch' type='checkbox'/></div></div>";
 