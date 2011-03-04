// ==UserScript==
// @name           Jobmine Plus
// @namespace      http://eatthis.iblogger.org/
// @description    Makes jobmine even better and looks good too!
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=*
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/ES/*
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=*
// @exclude        *IScript_ShowStuDocument*
// @exclude        *FieldFormula.IScript_ShowAllDocuments*
// @exclude        *TIMEOUT*
// @exclude        *GetMenuHeader*
// @exclude	   *WEBLIB_UW_DOCS.UW_CO_DOC_TEXT*
// ==/UserScript==

/*
 *   Constants
 */
var CURRENT_VERSION=107;
var UNSAFEWINDOWSUPPORT=unsafeWindow.toString().indexOf("[object Window]")!=-1;
var SCRIPTSURL="https://jobmine-plus.googlecode.com/svn/trunk/scripts";
var GLOBAL_TIMER = null;

/*
 * Handle Cookies
 */ 
function getCookieValue(name){var cookies=document.cookie;var lookup=cookies.indexOf(name+'=');if(lookup==-1){return-1;}lookup+=name.length+1;var end=cookies.indexOf(';',lookup);if(end==-1){end=cookies.length}var value=cookies.substring(lookup,end);if(value!=null){return value;}else{return null;}}function writeCookie(name,value){var date=new Date();date.setTime(date.getTime()+(3*31*24*60*60*1000));document.cookie=name+'='+value+';expires='+date.toGMTString()+'; path/';}

/*
 *   White Overlay
 */
function white_overlay(text,fontSize,includeImg){var image=includeImg==false?"":"<img alt='' style='position:relative;top:-125px;' src='"+SCRIPTSURL+"/images/loading.gif'/>";fontSize=fontSize!=null?fontSize+"px":"30px";text=text!=null?text:"Jobmine has been programmed to load pages really slowly.";return"<div id='popupWhiteContainer' style='display:none;'><div id='whiteOverlay' style='display:block;position:fixed;width:100%;height:100%;background-color:white;opacity:0.5;z-index:1;left:0px;top:125px;'></div><div id='popupWrapper' style='position:fixed;width:50%;height:50%;bottom:0px;right:0px;'><div id='popupWhiteContent' style='position:relative;width:450px; font-weight:bold; height:180px;top:-90px;font-size:"+fontSize+";left:-225px;z-index:49;font-family:Arial,Verdana;text-align:center;text-shadow:-2px -2px 5px #777, 2px 2px 5px #777;'><span style='font-size:50px;'>Please be Patient.</span><br/><div id='whitePopupMsg'>"+text+"</div><br/>"+image+"</div></div></div>";}

/*
 *Pages 
 */
var INTERVIEW_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STU_INTVS&RL=&target=main0&navc=5170";
var JOB_SEARCH_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOBSRCH&RL=&target=main0&navc=5170";
var DOCUMENT_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STUDDOCS&RL=&target=main0&navc=5170";
var JOB_SHORT_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOB_SLIST&RL=&target=main0&navc=5170";
var RANKING_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STU_RNK2&RL=&target=main0&navc=5170";
var PROFILE_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STUDENT&RL=&target=main0&navc=5170";
var WORK_REPORT_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_WORKRPRT&RL=&target=main0&navc=5170";
var APPLICATION_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&PanelGroupName=UW_CO_APP_SUMMARY";

/*
 *   Redirects
 */
function focusPass(){document.getElementById("userid").removeEventListener("focus",focusPass,false);document.getElementById('pwd').focus();}if(window.location.href.indexOf("jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/ES/")!=-1){window.location.href="https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=login";return;}else if(document.getElementById("search")){var newNode=document.createElement("div");newNode.style.left="212px";newNode.style.position="relative";newNode.innerHTML="<input id='autoCheckID' type='checkbox' title='Click to auto input user ID next time. Cannot save password for security reasons.'/><span style='font-size:11px;'>Save User ID<span>";document.getElementById("pwd").parentNode.parentNode.parentNode.insertBefore(newNode,document.getElementById("pwd").parentNode.parentNode.nextSibling.nextSibling);document.getElementById("autoCheckID").addEventListener("click",function(){writeCookie('LASTUSER',this.checked?+"1|"+getCookieValue('LASTUSER').split("|")[1]:0);},false);var user=getCookieValue('LASTUSER');if(user!="NaN"&&user!=-1&&user[0]!=0&&document.getElementById("userid")){document.getElementById("userid").value=user.substr(2);document.getElementById("userid").addEventListener("focus",focusPass,false);document.getElementById("autoCheckID").checked="checked";}return;}else if(window.location.href=='https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=start&'){document.getElementsByTagName("html")[0].innerHTML="<body>"+white_overlay("<div style='text-align:justify;'>Welcome to Jobmine Plus! No Jobmine Plus is not slower than Jobmine (well only by a bit since it does extra enhancements after), it is about the same timing. If you don't like this because it is slower, then you will miss out on all the great features. By the time you read this, the next page would have loaded.</div>",21,false)+"</body>";document.getElementById('popupWhiteContainer').style.display="block";document.getElementById('popupWhiteContent').style.top="-130px";window.stop();var user=getCookieValue('LASTUSER');if(user[0]!=0&&user!=-1){writeCookie("LASTUSER","1|"+getCookieValue("SignOnDefault").toLowerCase());}setTimeout(function(){var default_page=getCookieValue('DEFAULT_PAGE');switch(default_page){case'in':window.location.href=INTERVIEW_PAGE;break;case'js':window.location.href=JOB_SEARCH_PAGE;break;case'dc':window.location.href=DOCUMENT_PAGE;break;case'jl':window.location.href=JOB_SHORT_PAGE;break;case'rk':window.location.href=RANKING_PAGE;break;case'pr':window.location.href=PROFILE_PAGE;break;case'wr':window.location.href=WORK_REPORT_PAGE;break;default:window.location.href=APPLICATION_PAGE;break;}},1);return;}

/*======================================*\
l*        JQUERY AND TABLESORTER                           |
\*======================================*/



/*======================================*\
l*        JOBMINE CODE IN CORE.JS                            |
\*======================================*/

/*
 *   Start running code
 */
startOperation();