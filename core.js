/*   ======================================================
 *	Constants
 */

var CURRENT_VERSION = 103;
var UNSAFEWINDOWSUPPORT = unsafeWindow.toString().indexOf("[object Window]") != -1;
var SCRIPTSURL = "https://jobmine-plus.googlecode.com/svn/trunk/scripts";

//Pages 
var INTERVIEW_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STU_INTVS&RL=&target=main0&navc=5170";
var JOB_SEARCH_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOBSRCH&RL=&target=main0&navc=5170";
var DOCUMENT_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STUDDOCS&RL=&target=main0&navc=5170";
var JOB_SHORT_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOB_SLIST&RL=&target=main0&navc=5170";
var RANKING_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STU_RNK2&RL=&target=main0&navc=5170";
var PROFILE_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STUDENT&RL=&target=main0&navc=5170";
var WORK_REPORT_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_WORKRPRT&RL=&target=main0&navc=5170";
var APPLICATION_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_APP_SUMMARY&RL=&target=main0&navc=5170";

//White overlay
var WHITE_OVERLAY = 	"<div id='popupWhiteContainer' style='display:none;'><div id='whiteOverlay' style='display:block;position:fixed;width:100%;height:100%;background-color:white;opacity:0.8;z-index:1;left:0px;top:125px;'></div><div id='popupWrapper' style='position:fixed;width:50%;height:50%;bottom:0px;right:0px;'><div id='popupWhiteContent' style='position:relative;width:450px; font-weight:bold; height:180px;top:-90px;font-size:30px;left:-225px;z-index:49;font-family:Arial,Verdana;text-align:center;text-shadow:-2px -2px 5px #777, 2px 2px 5px #777;'><span style='font-size:50px;'>Please be Patient.</span><br/><div id='whitePopupMsg'>Jobmine has been programmed to load pages really slowly.</div><br/><img alt='' style='position:relative;top:-125px;' src='"+SCRIPTSURL+"/images/loading.gif'></div></div></div>";

                                   

/*   ======================================================
 *	Functions
 * 			runJS and injectFunction are ugly, workarounds for unsafeWindow that does not exist in Chome, runJS after injectFunctions are done 
 */
//Able get cookies, -1 means it does not exist
function getCookieValue(name){
	var cookies = document.cookie;
	var lookup = cookies.indexOf(name+'=');
	if(lookup == -1){return -1;}
	
	lookup += name.length + 1;
	var end = cookies.indexOf(';',lookup);
	if(end == -1){end = cookies.length}
	var value = cookies.substring(lookup,end);
	if(value != null){
		return value;
	}else{
		return null;	
     }
}
function showLoadingPopup(){
	$("#popupWhiteContainer").css("display","block");
        $("html").css("overflow","hidden");
}
function loadPopupMsg(msg){
	$("#whitePopupMsg").html(msg);
}
function resetGlobalTimer(){
	if(GLOBAL_TIMER){
        	clearTimeout(GLOBAL_TIMER);
     	GLOBAL_TIMER  = setTimeout(function(){window.location.href = window.location.href;},getCookieValue('AUTO_REFRESH')*60*1000);
     }
}

function insertCustomHeader(){
     var header = '<div id="updateInfo" style="display:none;background-color: #f1f8fe; width: 100%; text-align: center;"><a popup="false" href="http://userscripts.org/scripts/source/80771.user.js">There is a newer version of Jobmine Plus, click to install.</a></div>';
     
     header +=     '<div id="jobminepanel" style="width:100%; height:125px; background-repeat: repeat-x;';
     header +=     'background-image: url(data:image/gif;base64,R0lGODlhAQB9AOYAAFdXmlhYm+3v+mBgoF1dnmRkorW10nJyq1panGhopWpqpnZ2rW1tqPHx9/T0+IWFtoeHt4mJuPr6/JmZwpubw7Cw0KSkyLm51WdnpKKix8PD21xcncHB2s/P4qyszdfX566uz9nZ6OXl8Nzc6tXV5qioy/X1+f39/qamybe31Ozs83t7sL2915OTvltbnZWVv2xsp8nJ34GBs4+PvOjo8Xl5r9PT5W9vqJGRvXR0rIuLuaqqzH19sbKy0bu71p2dxHh4rnFxqs3N4dvb6WNjof7+/uDg7J+fxo2NumFhoOfn8FZWmllZm39/smVlo/n5+/j4++rq8r+/2fPz+HeAt/z8/YODtO3t9OLi7ff3+t7e619fn/v7/cvL4JeXwe/v9fDw9uPj7tHR5FVVmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAABAH0AAAdsgGOCg4SFhoVLAAFMCC4bBFsDSUQFThgJCjAMN0EHOQtANSs8TTJWDxAROkgzOC0vXhMUP0cZFiglOx4gFT0GKRc+LFIcGlQCMV1CHWI2JB8hQyNaRlhhIko0USpXX2ANUw4mWVBPElxVJ0WBADs=);';
     header +=     '"><table cellspacing="0" cellpadding="0" style="background-repeat: repeat-x;';
     header +=     'background-image: url(data:image/gif;base64,R0lGODlhAQB9AOYAAFdXmlhYm+3v+mBgoF1dnmRkorW10nJyq1panGhopWpqpnZ2rW1tqPHx9/T0+IWFtoeHt4mJuPr6/JmZwpubw7Cw0KSkyLm51WdnpKKix8PD21xcncHB2s/P4qyszdfX566uz9nZ6OXl8Nzc6tXV5qioy/X1+f39/qamybe31Ozs83t7sL2915OTvltbnZWVv2xsp8nJ34GBs4+PvOjo8Xl5r9PT5W9vqJGRvXR0rIuLuaqqzH19sbKy0bu71p2dxHh4rnFxqs3N4dvb6WNjof7+/uDg7J+fxo2NumFhoOfn8FZWmllZm39/smVlo/n5+/j4++rq8r+/2fPz+HeAt/z8/YODtO3t9OLi7ff3+t7e619fn/v7/cvL4JeXwe/v9fDw9uPj7tHR5FVVmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAABAH0AAAdsgGOCg4SFhoVLAAFMCC4bBFsDSUQFThgJCjAMN0EHOQtANSs8TTJWDxAROkgzOC0vXhMUP0cZFiglOx4gFT0GKRc+LFIcGlQCMV1CHWI2JB8hQyNaRlhhIko0USpXX2ANUw4mWVBPElxVJ0WBADs=);';
     header +=     '"><tr><td valign="top"><div style="width:208px;color:white;height:88px;padding:15px;padding-left:30px;text-shadow: black -2px -2px 5px, black 2px 2px 5px;font-family:Verdana,Arial;background-image:url('+SCRIPTSURL+'/images/left.png);background-repeat:no-repeat;"><span style="font-size:30px;">Jobmine Plus</span><br/><div style="margin-left:20px;">Browse jobs your way.</div></div></td>';
     header +=     '<td valign="top"><div class="links" style="margin-top:30px;width:940px;color:#CCCCCC;font-family: Arial, Verdana;outline: none; text-decoration:none;">'; 
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+PROFILE_PAGE+'>Profile</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+DOCUMENT_PAGE+'>Documents</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+JOB_SEARCH_PAGE +'>Job Search</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+JOB_SHORT_PAGE+'>Job Short List</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+APPLICATION_PAGE+'>Applications</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+INTERVIEW_PAGE+'>Interviews</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+RANKING_PAGE+'>Rankings</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+WORK_REPORT_PAGE+'>Work Report Evalutions</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" popup="false" href="javascript:showPopup(\'Settings\')">Settings</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" popup="false" href="javascript:showPopup(\'About\')">About</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href="javascript:saveWarning(\'main\',null,\'_top\',\'/servlets/iclientservlet/SS/?cmd=logout\')">Logout</a>';
     header +=     '</div></td><td width="100%" valign="top"><img style="float:right;" alt="" src="'+SCRIPTSURL+'/images/waterloo_logo.png"/></td></tr></table></div>';
     
     header +=     "<div id='popupContainer' style='display:none;'><div id='overlay'></div><div id='popupWrapper'><div id='popupContent'><div id='popupTitle' class='title'></div><br/><span id='panelWrapper'>";
     
     //Settings Popup
     header +=     "<span class='panels' style='display:none;' id='Settings'><span style='color:red'>This uses cookies to save the following. </span><br/><br/>";
     header +=     "<table cellspacing='0' cellpadding='0'><tr><td valign='top'>Login Default Page:</td><td valign='top'>";
     header +=     "<select id='popupSelect'><option value='ap'>Applications</option><option value='in'>Interviews</option><option value='js'>Job Search</option><option value='dc'>Documents</option><option value='jl'>Job Short List</option><option value='rk'>Rankings</option><option value='pr'>Profile</option><option value='wr'>Work Report Evaluations</option></select>";
     header +=     "</td></tr><tr><td valign='top'>Load Message Off:</td><td valign='top'><input id='loadCheckbox' class='chkbox' type='checkbox'/></td></tr>";
     header +=     "<tr><td valign='top'>Do not Show Updates:</td><td valign='top'><input id='updateCheckbox' class='chkbox' type='checkbox'/></td></tr>";
     header +=     "<tr><td valign='top'>Remove Timer:</td><td valign='top'><input id='popupCheckbox' class='chkbox' type='checkbox' onchange='toggleRemoveTimer(this)'/></td></tr><tr>";
     header +=     "<td valign='top'>Auto-Refresh Duration (min):<br/><span id='removeTimerDetails' class='details'>The time specified (minutes) would allow the page to refresh when the page is on idle. If 0 or any time above 19 minutes is specified, there will be a timer for 19 minutes to avoid the php timer.</span></td><td valign='top'><input onkeypress='return decimalOnly(event)' id='popupText' type='text'/></td></tr></table>";
     header +=     "<button class='button PSPUSHBUTTON' onclick='saveSettings()'>Save and Refresh</button><button style='float:right;' class='button PSPUSHBUTTON' onclick='hidePopup();'>Cancel</button></span>";
     
     //About Popup
     header +=     "<span style='display:none;' class='panels' id='About'><b>Jobmine Plus v"+CURRENT_VERSION/100+"</b><br/><br/><span class='details'>Written by Matthew Ng<br/><br/>Website: <a href='http://userscripts.org/scripts/show/80771' target='_blank'>http://userscripts.org/scripts/show/80771</a><br/><br/>Any problems/issues/wanted features email me at <a href='mailto:jobmineplus@gmail.com'>jobmineplus@gmail.com</a></span><br/><br/><br/><br/><br/><br/><br/><br/><br/><button style='float:right;' class='button PSPUSHBUTTON' onclick='hidePopup();'>Cancel</button></span>";
     
     header +=     "</span></div></div></div>";
     
     header +=     WHITE_OVERLAY;
     $("body").prepend(header);    
}

/*   ======================================================
 *   Functions that are not for Firefox
 */
function isChrome(){
     return navigator.userAgent.indexOf("Chrome") != -1;
}
//run js code, its ugly, runs after page loads,		RUN THIS LAST
function runJS(code){	
     window.location.href = "javascript:"+code;
}
	//Able to inject functions into the page or rewrite functions, DOES NOT RUN IF runJS IS EXECUTED BEFORE, bruteforce forces the function to be set even if unsafeWindow is supported
function injectFunction(_function,bruteforce){
     $('body').append('<script language="javascript">function '+_function+'</script>');
}

/*   ======================================================
 * 	Start Operation
 */                                
function startOperation()
{
     if(window.location.href == 'https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=start&')
     {	           
          //On load, please redirect to start page
          $('html').html("<body>"+WHITE_OVERLAY+"</body>");	
          document.getElementById('popupWhiteContainer').style.display = "block";
          
          var default_page = getCookieValue('DEFAULT_PAGE');
          switch(default_page){
                    case 'in':
                         window.location = INTERVIEW_PAGE;
                         break;
                    case 'js':
                         window.location = JOB_SEARCH_PAGE;
                         break;
                    case 'dc':
                         window.location = DOCUMENT_PAGE;
                         break;
                    case 'jl':
                         window.location = JOB_SHORT_PAGE;
                         break;
                    case 'rk':
                         window.location = RANKING_PAGE;
                         break;
                    case 'pr':
                         window.location = PROFILE_PAGE;
                         break;
                    case 'wr':
                         window.location = WORK_REPORT_PAGE;
                         break;
                    default:
                         window.location = APPLICATION_PAGE;
                         break;
               }
     }
     else
     {
          //Get page type and add a class to body
          var pagetype = $('title').html() ? $('title').html().toLowerCase().replace(/\s|-/gi,"_").replace(/_+/gi,"_") : "none";
          $("body").addClass(pagetype);

          // Insert navigation header at the top and overlays
          if(pagetype != "jobmine_|_university_of_waterloo"){insertCustomHeader();}
          
          // Add a CSS stylesheets
          var style = document.createElement( "style" ); 
          style.appendChild( document.createTextNode("@import '"+SCRIPTSURL+"/css/style.css';") );
          if(getCookieValue('HIDE_UPDATES') == 0){style.appendChild( document.createTextNode("@import '"+SCRIPTSURL+"/css/update.css';") );};
          document.getElementsByTagName( "body" ).item(0).appendChild( style );	
          
          //Adds current version to the body class
          $('body').addClass("v"+CURRENT_VERSION);
          
          //Removing useless parts
          $("#WAIT_main0").remove();
          
     //SPECIFIC PAGE LAYOUTS
          $(".PSLEVEL1GRID.tablesorter").attr("cellpadding",0);
          $('.PSLEVEL1GRID').parent().addClass("tablepanel");
          $("table a.PTBREADCRUMB").parents("table").remove();

          if(pagetype != "student_data" ){$(".PSACTIVETAB").parents().eq(2).remove();}
          if(pagetype == "job_search_component")            //JOB INQUIRY PAGE
          {
               if(!$("form > span").html() || $("form > span").html().search(/Lookup/i) == -1)
               {
                    $('form > table > tbody > tr:first-child > td:first-child').html("<div style='margin-bottom:30px;' class='PAPAGETITLE'><span style='position:absolute;margin-left:10px;'>Job Search Criteria</span></div>");
                    //Fix the width of the page
                    $('form > table').css('width',0);
                    $('form > table').removeAttr('width');
                    $('form > table > tbody > tr:first-child > td').eq(-2).remove();
                    //move the application text to the second table
                    var searchTable = $('form > table > tbody > tr').eq(-2).html();
                    var appsRemaining = "<span class='PSEDITBOXLABEL'>"+$('form > table > tbody > tr').eq(21).html().replace(/<.*?>|\n/gi,"");    
                    var number = $('form > table > tbody > tr').eq(22).html().replace(/<.*?>|\n/gi,"");
                    appsRemaining = "<div class='PSTEXT' style='margin-bottom:15px;'><span style='position:absolute;margin-left:10px;'>"+appsRemaining.replace("(","</span>  "+number+"  (")+"</span></div>";
                    //Remove left over tr's and fix layouts
                    $('form > table > tbody > tr').eq(21).remove();
                    $('form > table > tbody > tr').eq(21).remove();    
                    $('form > table > tbody > tr').eq(-2).remove();
                    $('form > table > tbody > tr').eq(-2).remove();
                    $('form > table > tbody > tr:last-child').remove();
                    $('table.PSGROUPBOX').parent().prev().attr("colspan",2).parent().prev().children(":first-child").attr("height","30");
                    $('form:last').append("<table id='searchTable' cellspacing='0' cellpadding='0'><tr><td>"+appsRemaining+"</td></tr>"+searchTable+"</table>").css("margin-bottom","30px");              //full width table
                    
                    // Grab the tables of interest
                    var tables = $("table table table.PSLEVEL1GRID");
                    if (tables.size()) {
                         $("#searchTable table").css("width","100%");
                         $("#searchTable").css("width","100%");
                         tables.css("width","100%");
                         tables.each(function() {$(this).prepend($("<thead></thead>").append($(this).find("tr:first").remove()));	});
                         tables.addClass("tablesorter");
                         tables.tablesorter();
                         tables.find("td, th").css("border-bottom","1px solid #999").css("width","auto");
                    }
               }else{
                    $("form").css("margin-bottom","20px");
               }
          }
          //PROFILE PAGE
          else if(pagetype == "student_data" && $("form > table:last-child").html()) 
          {
               // Grab the tables of interest
               var tables = $("table table table.PSLEVEL1GRID");
               if (tables.size()) {
                    $("table").css("width","100%");
                    tables.css("width","100%");
                    tables.each(function() {$(this).prepend($("<thead></thead>").append($(this).find("tr:first").remove()));	});
                    tables.addClass("tablesorter");
                    tables.tablesorter();
                    tables.find("td, th").css("border-bottom","1px solid #999").css("width","auto");
               }
               var bottomNav = $("form > table:last-child").html();
               //TERM CARDS
               if(bottomNav.indexOf("Term Cards |") != -1){
                    $("form > table > tbody >tr:first-child > td:last-child").attr("width",1);
                    $("form > table > tbody >tr:first-child > td:last-child > img").attr("width",1);
                    $("form > table > tbody >tr:first-child > td:first-child").attr("width",1);
                    $("form > table > tbody >tr:first-child > td:first-child > img").attr("width",1);
                    $("body form table").eq(1).children().children().eq(2).children(":first-child").attr("height",1);        
                    $("body form table").css("width","100%");
               }
               //STUDENT PERSONAL INFO & ACADEMIC INFO
               else if(bottomNav.indexOf("Student Personal Info |") != -1 || bottomNav.indexOf("Acad Info. |") != -1){
                    $("body form table").css("margin","0 auto");
                    $("body form table").eq(-2).css("width","auto");          
               }
               //SKILLS INVENTORY
               else if(bottomNav.indexOf("| \nSkills Inventory") != -1){
                    $("form table td").find("label:contains('Student ID:')").parent().attr("colspan",3).css("padding-left","10px");			
                    $("form table td.tablepanel table").css("margin","0 auto").css("width","auto");
                    $("form table.PSLEVEL1GRIDLABEL").css("width","100%");
                    $("body form table").eq(-2).css("text-align","center");
                    $("textarea").css("width","100%").attr("cols","").parent().append("<br/><br/>");
                    if(UNSAFEWINDOWSUPPORT){
                         $("form table td.tablepanel").attr("colspan",20);
                    }else{
                         $("body > form:last > table > tbody > tr").eq('11').children(':last').attr("colspan","14");
                    }
               }
               //LOOKUP PAGES
               if($("form span").html() && $("form span").html().search(/Lookup.*ID/ig) == -1){
                    $("body form table:first").css("width","auto").css("margin","0 auto");
               }else{
                    $("form:last").css("margin-bottom","20px");
               }
          }
          //DOCUMENTS PAGE
          else if(pagetype == "resumes"){                
               $("form table tr:eq(3)").children().eq(1).attr("colspan",20);
               $("form > table > tbody > tr:last-child > td:first-child").attr("height",10);    
               var resumeTable = $("form table tr:eq(5)").remove().children().eq(1).html();
               $("form:last").append(resumeTable);
               $("table.PSLEVEL1GRID").css("width","100%");

               // Grab the tables of interest
               var tables = $("table table.PSLEVEL1GRID");
               if (tables.size()) {
                    tables.each(function() {$(this).prepend($("<thead></thead>").append($(this).find("tr:first").remove()));	});
                    tables.addClass("tablesorter");
                    tables.tablesorter();
                    tables.find("td, th").css("border-bottom","1px solid #999").css("width","auto");
               }
          }
          //JOB SHORT LIST PAGE
          else if(pagetype == "job_short_list")
          { 
               window.scrollTo(0,0);
               $(".PAERRORTEXT").html("(You can remove multiple jobs by checking the rows off and clicking 'Delete Selected' or use the minus button ( - ) to remove jobs from your list.)");
               
               var numOfChkbx = 0;
               //Add another column
               $('table table table.PSLEVEL1GRID > tbody > tr').not(':first-child').each(function(index){
                    $(this).prepend('<td align="center" height="19" class="PSLEVEL1GRIDODDROW"><input id=chkbx'+index+' type="checkbox"></td>');
                    numOfChkbx = index+1;
               });
               $('table table table.PSLEVEL1GRID tbody tr:first-child').prepend('<th align="LEFT" class="PSLEVEL1GRIDCOLUMNHDR" scope="col">&nbsp;</th>');
               $("#UW_CO_JSLIST_VW_").parent().parent().html("<td valign='top' height='30' colspan='13'><button class='deleteSelectedButton PSPUSHBUTTON' total='"+numOfChkbx+"' onclick='return returnFalse()'>Delete Selected</button><button onclick='return selectAllChkbx(false,"+numOfChkbx+")' class='PSPUSHBUTTON'>Unselected All</button><button onclick='return selectAllChkbx(true,"+numOfChkbx+")' class='PSPUSHBUTTON'>Select All</button></td>");
               $("form > table > tbody > tr").eq(7).after("<tr><td valign='top' height='30' colspan='13'><button class='deleteSelectedButton PSPUSHBUTTON' total='"+numOfChkbx+"' onclick='return returnFalse()'>Delete Selected</button><button onclick='return selectAllChkbx(false,"+numOfChkbx+")' class='PSPUSHBUTTON'>Unselected All</button><button onclick='return selectAllChkbx(true,"+numOfChkbx+")' class='PSPUSHBUTTON'>Select All</button></td></tr>");
               //Add invisible iframe
               $("body").append("<iframe style='display:none;' name='hiddenIframe' id='hiddenIframe' width='100%' height='400' src=''></iframe>");     		
               $("body").append("<script language='javascript'>function runIframeFunction(name,_function){window.frames[name].eval(_function);}</script>");
               
               //Functions for the buttons to do stuff     		
               if(UNSAFEWINDOWSUPPORT){
                    unsafeWindow.selectAllChkbx = function(flag,numChkbx){for(var i=0;i<numChkbx;i++){$("#chkbx"+i).attr("checked",flag);}return false;};
                    unsafeWindow.returnFalse= function(){return false;};
               }
               else               
               {
                    injectFunction("selectAllChkbx(flag,numChkbx){for(var i=0;i<numChkbx;i++){document.getElementById('chkbx'+i).checked = flag;}return false;}");
                    injectFunction("returnFalse(){return false;}");               
               }
               
               $('.deleteSelectedButton').click(function(){                 //Mulitple job removal function
                    var numChkbx = $(this).attr('total');
                    var iframeArray = new Array();
                    for(var i=0;i<numChkbx;i++){
                         if($("#chkbx"+i).attr("checked")){iframeArray.push(i);}
                    }
                    var iframeCounter = iframeArray.length;
                    if(iframeCounter == 0){return false;}    //if nothing is selected
                    var answer = confirm (iframeCounter < 10 ? "Do you wish to delete the checked rows from this page? The page itself will refresh after the transaction is saved." : "Do you wish to delete the checked rows from this page? You have "+iframeCounter+" rows to delete and this may take a while. The page itself will refresh after the transaction is saved.");
                    if(!answer){return false;}    //if nothing is selected
                    $("#hiddenIframe").attr("src","servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOB_SLIST&RL=&target=main0&navc=5170"); 
                    loadPopupMsg("Each job removed needs to be refreshed, this will take a while because of Jobmine slowness.<br/><span style='color:blue;font-size:20px;'>*Refresh to Cancel*</span><br/>Starting...");
                    $("#popupWhiteContainer").css("display","block");
                    $("#popupWhiteContent").css("top","-150px");
                    $("#whiteOverlay").css("top","0px");
                    $("html").css("overflow","hidden");
                    $("#hiddenIframe").load(function(){          //Refresh recursive function
                         if(iframeArray.length != 0){   //Start counting and removing
                              loadPopupMsg("Each job removed needs to be refreshed, this will take a while because of Jobmine slowness.<br/><span style='color:blue;font-size:20px;'>*Refresh to Cancel*</span><br/>Progress: "+(iframeCounter - iframeArray.length+1)+"/"+iframeCounter);
                              if(UNSAFEWINDOWSUPPORT){
                                   unsafeWindow.runIframeFunction("hiddenIframe","submitAction_main0(document,'main0','UW_CO_STUJOBLST$delete$"+(iframeArray.pop())+"$$0')");				
                              }else{
                                   runJS('runIframeFunction("hiddenIframe","submitAction_main0(document.main0,\'UW_CO_STUJOBLST$delete$'+(iframeArray.pop())+'$$0\')")');	
                              }
                         }
                         else if(iframeCounter > 0){     //Save 
                              loadPopupMsg("Each job removed needs to be refreshed, this will take a while because of Jobmine slowness. <br/><span style='color:red'>Saving now... Do not refresh.</span>");
                              iframeCounter = -1;      // go to next step
                              if(UNSAFEWINDOWSUPPORT){
                                   unsafeWindow.runIframeFunction("hiddenIframe","submitAction_main0(document,'main0', '#ICSave')");
                              }else{
                                   runJS('runIframeFunction("hiddenIframe","submitAction_main0(document.main0, \'#ICSave\')")');
                              }
                         }
                         else if(iframeCounter == -1){       //Just refresh the page itself
                              window.location = JOB_SHORT_PAGE;                              
                         }
                    });
                    return false;
               });
               // Grab the tables of interest
               var tables = $("table table table.PSLEVEL1GRID");
               if (tables.size()) {
                    $("table").css("width","100%");
                    tables.css("width","100%");
                    tables.each(function() {$(this).prepend($("<thead></thead>").append($(this).find("tr:first").remove()));});
                    tables.addClass("tablesorter");
                    tables.tablesorter();
                    tables.find("td, th").css("border-bottom","1px solid #999").css("width","auto");
               }
          }
          else
          //OTHER PAGES
          {
               var tables = $("table table table.PSLEVEL1GRID");
               if (tables.size()) {
                    $("table").css("width","100%");
                    tables.css("width","100%");
                    tables.each(function() {$(this).prepend($("<thead></thead>").append($(this).find("tr:first").remove()));	});
                    tables.addClass("tablesorter");
                    tables.tablesorter();
                    tables.find("td, th").css("border-bottom","1px solid #999").css("width","auto");
               }
          }
          
         
          //Setting Popup Specifics
          /* LEAVING HERE FOR READING PURPOSES.*/
          if(UNSAFEWINDOWSUPPORT)
          {
               unsafeWindow.showPopup = function(panelName){
                    if($("#"+panelName))
                    {
                         $("#"+panelName).css("display","block");
                         $('#popupTitle').html(panelName);
                         $("#popupContainer").css("display","block");
                         $("html").css("overflow","hidden");
                         if(panelName == "Settings")   //Other pages don't need this
                         {
                              $("#popupSelect").attr("value",unsafeWindow.getCookieValue('DEFAULT_PAGE'));
                              $("#popupText").attr("value",(unsafeWindow.getCookieValue('AUTO_REFRESH') != -1 ? unsafeWindow.getCookieValue('AUTO_REFRESH') : 0));
                              $('#popupCheckbox').attr("checked",(unsafeWindow.getCookieValue('DISABLE_TIMER') == 1 ? true : false));  
                              $('#updateCheckbox').attr("checked",(unsafeWindow.getCookieValue('HIDE_UPDATES') == 1 ? true : false));  
                              $('#loadCheckbox').attr("checked",(unsafeWindow.getCookieValue('LOAD_SCREEN') == 1 ? true : false));  
                              unsafeWindow.toggleRemoveTimer(document.getElementById("popupCheckbox"));
                         }
                    }
               };
               unsafeWindow.toggleRemoveTimer = function(obj){
                    if(obj.checked){                    
                         $("#popupText").removeAttr("disabled").css("background-color","white").css("color","black").parent().prev().css("color","black").removeClass("disabled");
                    }else{
                         $("#popupText").attr("disabled","disabled").css("background-color","#EEE").css("color","#CCC").parent().prev().addClass('disabled').css("color","#CCC");
                    }
               };
               unsafeWindow.saveSettings = function(){
                    var autorefresh = $("#popupText").attr("value");
                    if(autorefresh && autorefresh.search(/^[0-9]+(\.[0-9]+$)?/g) == -1){alert("Please make sure that the Auto Refresh Duration is a positive decimal or integer number (numbers and a period).");return;};
                    var date = new Date();
                    date.setTime(date.getTime()+(4*31*24*60*60*1000));     //4 months
                    var remove_load = $('#loadCheckbox').attr("checked");
                    var remove_timer = $('#popupCheckbox').attr("checked");
                    var hideupdates = $('#updateCheckbox').attr("checked");
                    var default_page = $("#popupSelect").attr("value");
                    var expires =  'expires='+date.toGMTString()+'; path/';
                    document.cookie = 'LOAD_SCREEN='+(remove_load ? 1 : 0)+';'+expires;
                    document.cookie = 'DISABLE_TIMER='+(remove_timer ? 1 : 0)+';'+expires;
                    document.cookie = 'HIDE_UPDATES='+(hideupdates ? 1 : 0)+';'+expires;
                    document.cookie = 'DEFAULT_PAGE='+default_page+';'+expires;
                    document.cookie = 'AUTO_REFRESH='+autorefresh+';'+expires;  
                    unsafeWindow.hidePopup();
                    unsafeWindow.showLoadingPopup();
                    window.location.reload();
               };
               unsafeWindow.hidePopup = function(){$("#popupContainer").css("display","none");$("html").css("overflow","auto");$("#panelWrapper").children().each(function(){$(this).css("display","none");});};
               unsafeWindow.decimalOnly = function(evt){var charCode = (evt.which) ? evt.which : event.keyCode;if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46){return false;}return true;};        
               unsafeWindow.showLoadingPopup = function(){if(unsafeWindow.getCookieValue('LOAD_SCREEN') != 1){$("#popupWhiteContainer").css("display","block");$("html").css("overflow","hidden");}}
          }
          else
          {
               injectFunction("showPopup(panelName){if(document.getElementById(panelName)){document.getElementById(panelName).style.display = 'block';document.getElementById('popupTitle').innerHTML = panelName;document.getElementById('popupContainer').style.display = 'block';document.getElementsByTagName('html')[0].style.overflow = 'hidden';if(panelName == 'Settings'){document.getElementById('popupSelect').value = getCookieValue('DEFAULT_PAGE');document.getElementById('popupText').value = getCookieValue('AUTO_REFRESH') != -1 ? getCookieValue('AUTO_REFRESH') : 0;document.getElementById('popupCheckbox').checked = getCookieValue('DISABLE_TIMER') == 1 ? true : false;document.getElementById('updateCheckbox').checked = getCookieValue('HIDE_UPDATES') == 1 ? true : false;document.getElementById('loadCheckbox').checked = getCookieValue('LOAD_SCREEN') == 1 ? true : false;toggleRemoveTimer(document.getElementById('popupCheckbox'));}}}");
               injectFunction("toggleRemoveTimer(obj){var textfield = document.getElementById('popupText');if(obj.checked){textfield.disabled = '';textfield.style.backgroundColor = 'white';textfield.style.color = 'black';document.getElementById('removeTimerDetails').disabled = '';document.getElementById('removeTimerDetails').style.color= 'black';}else{textfield.disabled = 'disabled';textfield.style.backgroundColor = '#EEE';textfield.style.color = '#CCC';document.getElementById('removeTimerDetails').disabled = 'disabled';document.getElementById('removeTimerDetails').style.color= '#CCC';}}");
               injectFunction("hidePopup(){document.getElementById('popupContainer').style.display='none';document.getElementsByTagName('html')[0].style.overflow = 'auto';for(var p=0;p<document.getElementById('panelWrapper').childNodes.length;p++){document.getElementById('panelWrapper').childNodes[p].style.display = 'none';}}");
               injectFunction("decimalOnly(evt){var charCode = (evt.which) ? evt.which : event.keyCode;if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46){return false;}else{return true;}}");
               injectFunction("showLoadingPopup(){if(getCookieValue('LOAD_SCREEN') != 1){document.getElementById('popupWhiteContainer').style.display = 'block';document.getElementsByTagName('html')[0].style.overflow = 'hidden';}}");
               injectFunction("saveSettings(){var autoRefresh = document.getElementById('popupText').value;if(autoRefresh && autoRefresh.search(/^[0-9]+(\.[0-9]+$)?/g) == -1){alert('Please make sure that the Auto Refresh Duration is a positive decimal or integer number (numbers and a period).');return -1;}var date = new Date();date.setTime(date.getTime()+(4*31*24*60*60*1000));var remove_load = document.getElementById('loadCheckbox').checked;var remove_timer = document.getElementById('popupCheckbox').checked;var hideupdates = document.getElementById('updateCheckbox').checked;var default_page = document.getElementById('popupSelect').value;var expires =  'expires='+date.toGMTString()+'; path/';document.cookie = 'LOAD_SCREEN='+(remove_load ? 1 : 0)+';'+expires;document.cookie = 'DISABLE_TIMER='+(remove_timer ? 1 : 0)+';'+expires;document.cookie = 'HIDE_UPDATES='+(hideupdates ? 1 : 0)+';'+expires;document.cookie = 'DEFAULT_PAGE='+default_page+';'+expires;document.cookie = 'AUTO_REFRESH='+autoRefresh+';'+expires;hidePopup();showLoadingPopup();window.location.href = window.location.href;}");
          }
          
          //When to run the white overlay
          $("a").click(function(){
               if(getCookieValue('LOAD_SCREEN') != 1 && $(this).attr("target")!= "_blank" && $(this).attr("target") != "new" && $(this).attr("popup")!= "false" && $(this).parent().html().indexOf('onclick="return ') == -1  && $(this).attr('href').indexOf('mailto') == -1)
                    showLoadingPopup();
          });

          $("input").click(function(){
               if(getCookieValue('LOAD_SCREEN') != 1 && $(this).attr("type") == "button")
                    showLoadingPopup();
          });
          
          //Remove Timer	
          var GLOBAL_TIMER = null;
          if(getCookieValue('DISABLE_TIMER') == 1){    
               if(UNSAFEWINDOWSUPPORT){
                    unsafeWindow.setupTimeout = function(){return false;};
                    unsafeWindow.displayTimeoutMsg = function(){return false;};
                    unsafeWindow.displayTimeoutWarningMsg = function(){return false;};
               }else{
                    injectFunction('displayTimeoutMsg(){return false;}');
                    injectFunction('displayTimeoutWarningMsg(){return false;}');
                    runJS("clearInterval(timeoutID)");
                    runJS("clearInterval(timeoutWarningID)");
               }
               if(getCookieValue('AUTO_REFRESH') <= 0  || getCookieValue('AUTO_REFRESH') > 19){
                    setTimeout(function(){window.location = window.location;},19*60*1000);
               }else{
                    document.addEventListener('click',resetGlobalTimer,true);
                    resetGlobalTimer();
               }
          }
          
          // Set syntax highlighting colours for various statuses
          var VERYGOOD = "#9f9";
          var GOOD = "#96f0b1";
          var MEDIOCRE = "#faf39a";
          var BAD = "#fdaaaa";
          var WORST = "#b5bbc1";

          if (pagetype == "student_app_summary") {
               tables.find("tr").find("td:first, th:first").remove();
               tables.find("tr:contains('Ranking')").find("td").css("background-color",MEDIOCRE);
               tables.find("tr:contains('Alternate')").find("td").css("background-color",MEDIOCRE);
               tables.find("tr:contains('Selected')").find("td").css("background-color",VERYGOOD);	
               tables.find("tr:contains('Scheduled')").find("td").css("background-color",VERYGOOD);
               tables.find("tr:contains('Employed')").find("td").css("background-color",VERYGOOD);
               tables.find("tr:contains('Not Selected')").find("td").css("background-color",WORST);
               tables.find("tr:contains('Cancelled')").find("td").css("background-color",BAD);
               tables.find("tr:contains('Filled')").find("td").css("background-color",BAD);
               tables.find("tr:contains('Not Ranked')").find("td").css("background-color",WORST);
          } else if (pagetype == "student_sel.interview_schedule") {
               tables.find("tr:contains('Break')").find("td").css("background-color",MEDIOCRE);
          } else if (pagetype == "job_short_list") {
               tables.find("tr:contains('Already Applied')").find("td").css("background-color",VERYGOOD);
               tables.find("tr:contains('Not Posted')").find("td").css("background-color",BAD);
               tables.find("tr:contains('Not Authorized to Apply')").find("td").css("background-color",WORST);
          } else if (pagetype == "student_interviews") {
               tables.find("tr:contains('Ranking')").find("td").css("background-color",MEDIOCRE);
               tables.find("tr:contains('Scheduled')").find("td").css("background-color",VERYGOOD);
               tables.find("tr:contains('Selected')").find("td").css("background-color",VERYGOOD);
               tables.find("tr:contains('Filled')").find("td").css("background-color",WORST);
               tables.find("tr:contains('Unfilled')").find("td").css("background-color",WORST);
          } else if (pagetype == "student_ranking_open") {
               tables.find("tr:contains('Offer')").find("td").css("background-color",VERYGOOD);
               tables.find("tr:contains('Ranked')").find("td").css("background-color",GOOD);
               tables.find("tr:contains('Not Ranked')").find("td").css("background-color",WORST);
          }else if(pagetype == 'job_search_component'){
               tables.find("tr:contains('On Short List')").find("td").css("background-color",WORST);
               tables.find("tr:contains('Already Applied')").find("td").css("background-color",WORST);
          }
     }   
}  