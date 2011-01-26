/*
     BLock new tabs DOESNT WORK ON CHROME
     javascript   =    function open(){//do stuff}
     unsafewindow   =    unsafeWindow.window.open = function(){//do stuff}
     
    
     
     https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&Market=GBL&Page=UW_CO_STU_JOBDTLS&Action=U&target=Transfer19&UW_CO_JOB_TITLE=Software%20Design%20Engineering&UW_CO_PARENT_NAME=A9.com%20Inc&UW_CO_WT_SESSION=1115
          One way: use this in iframe for applications and it will search for it, 
          
          https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS && everything else<--- manditory
          
          &UW_CO_JOB_TITLE= <--- copy job name
          
          &UW_CO_PARENT_NAME= <--- copy company name
       
          &UW_CO_WT_SESSION= <--- copy from cookies, this will be set from job search anomysly
          
     shortlist & work has this but not applications page
          https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Action=U&UW_CO_JOB_ID=###### <---opens the page dependent on the number
*/


/*var headID = document.getElementsByTagName("head")[0];         
var newScript = document.createElement('script');
newScript.type = 'text/javascript';

var tnode = document.createTextNode("function alert(){confirm('i own u')}")
newScript.appendChild(tnode)
headID.appendChild(newScript);*/

/*
 *   Constants
 */
var CURRENT_VERSION=105;
var UNSAFEWINDOWSUPPORT=unsafeWindow.toString().indexOf("[object Window]")!=-1;
var SCRIPTSURL="https://jobmine-plus.googlecode.com/svn/trunk/scripts";
var GLOBAL_TIMER = null;

/*
 *   White Overlay
 */
function white_overlay(text, fontSize, includeImg)
{
     var image = includeImg == false  ? "" : "<img alt='' style='position:relative;top:-125px;' src='"+SCRIPTSURL+"/images/loading.gif'/>"; 
     fontSize = fontSize != null ? fontSize+"px" : "30px";
     text = text != null ? text : "Jobmine has been programmed to load pages really slowly.";
     return "<div id='popupWhiteContainer' style='display:none;'><div id='whiteOverlay' style='display:block;position:fixed;width:100%;height:100%;background-color:white;opacity:0.5;z-index:1;left:0px;top:125px;'></div><div id='popupWrapper' style='position:fixed;width:50%;height:50%;bottom:0px;right:0px;'><div id='popupWhiteContent' style='position:relative;width:450px; font-weight:bold; height:180px;top:-90px;font-size:"+fontSize+";left:-225px;z-index:49;font-family:Arial,Verdana;text-align:center;text-shadow:-2px -2px 5px #777, 2px 2px 5px #777;'><span style='font-size:50px;'>Please be Patient.</span><br/><div id='whitePopupMsg'>"+text+"</div><br/>"+image+"</div></div></div>";
}

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
if(window.location.href.indexOf("jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/ES/") != -1){window.location.href = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=login";return;}
else if(document.getElementById("search")){return;}
else if(window.location.href == 'https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=start&')
{try{
     document.getElementsByTagName("html")[0].innerHTML = "<body>"+white_overlay("Welcome to Jobmine Plus! No Jobmine Plus is not slower than Jobmine (well only by a bit since it does extra enhancements after), it is about the same timing. If you don't like this because it is slower, then you will miss out on all the great features. By the time you read this, the next page would have loaded.",21,false)+"</body>";	
     document.getElementById('popupWhiteContainer').style.display = "block";
     document.getElementById('popupWhiteContent').style.top = "-130px";
     window.stop();
     setTimeout(function(){
          var default_page = getCookieValue('DEFAULT_PAGE');
          switch(default_page){
               case 'in':
                    window.location.href = INTERVIEW_PAGE;
                    break;
               case 'js':
                    window.location.href = JOB_SEARCH_PAGE;
                    break;
               case 'dc':
                    window.location.href = DOCUMENT_PAGE;
                    break;
               case 'jl':
                    window.location.href = JOB_SHORT_PAGE;
                    break;
               case 'rk':
                    window.location.href = RANKING_PAGE;
                    break;
               case 'pr':
                    window.location.href = PROFILE_PAGE;
                    break;
               case 'wr':
                    window.location.href = WORK_REPORT_PAGE;
                    break;
               default:
                    window.location.href = APPLICATION_PAGE;
                    break;
          }
     },1);
     return;
}catch(e){alert(e)}}



/*======================================*\
l*        JQUERY AND TABLESORTER                           |
\*======================================*/


/*
 *   Jobmine plus code
 */ 
/*======================================*\
l*        CONSTANTS                                               |
\*======================================*/
 var SETTINGS_GENERAL = '<table id="settings_general" cellpadding="0" cellspacing="0"><tbody><tr><td valign="top">Login Default Page:</td><td valign="top"><select id="popupSelect"><option selected="selected" value="ap">Applications</option><option value="in">Interviews</option><option value="js">Job Search</option><option value="dc">Documents</option><option value="jl">Job Short List</option><option value="rk">Rankings</option><option value="pr">Profile</option><option value="wr">Work Report Evaluations</option></select></td></tr><tr><td valign="top">Load Message Off:</td><td valign="top"><input id="loadCheckbox" class="chkbox" type="checkbox"></td></tr><tr><td valign="top">Do not Show Updates:</td><td valign="top"><input id="updateCheckbox" class="chkbox" type="checkbox"></td></tr><tr><td valign="top">Remove Timer:</td><td valign="top"><input checked="checked" id="removeTimerChkbx" class="chkbox" type="checkbox"></td></tr><tr><td class="" style="color: black;" valign="top">Auto-Refresh Duration (min):<br><span id="removeTimerDetails" class="details">The time specified (minutes) would allow the page to refresh when the page is on idle. If 0 or any time above 19 minutes is specified, there will be a timer for 19 minutes to avoid the php timer.</span></td><td valign="top"><input value="0" style="background-color: white; color: black;" onkeypress="return decimalOnly(event)" id="popupText" type="text"></td></tr></tbody></table>';
/*======================================*\
l*        FUNCTIONS                                                |
\*======================================*/

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
function writeCookie(name, value){
     var date = new Date();
     date.setTime(date.getTime()+(3*31*24*60*60*1000));     //3 months
     document.cookie = name+'='+value+';expires='+date.toGMTString()+'; path/';
}
function showLoadingPopup(){
     //Fix chrome overlay problem
     if($("body").scrollTop() != 0){$("#whiteOverlay").css("top",0);};
	$("#popupWhiteContainer").css("display","block");	
     $("body").css("overflow","hidden");
}
function loadPopupMsg(msg){
	$("#whitePopupMsg").html(msg);
}
function resetGlobalTimer(){
	if(GLOBAL_TIMER)
        	clearTimeout(GLOBAL_TIMER);        	
     GLOBAL_TIMER  = setTimeout(function(){window.location.href = window.location.href;},getCookieValue('AUTO_REFRESH')*60*1000);
}
function applyTableSorting(path){
     var tables = $(path);
     if (tables.size()) {
          $("table:not('.PSGROUPBOX')").css("width","100%");
          tables.each(function() {$(this).prepend($("<thead></thead>").append($(this).find("tr:first").remove()));	});
          tables.addClass("tablesorter");
          tables.tablesorter();
          tables.find("td, th").css("border-bottom","1px solid #999").css("width","auto");
     }
     return tables;
}

//Runs the function when CSS is ready, very customized
function cssReady(the_function){var style = window.getComputedStyle(document.getElementById('cssLoadTest'), null).getPropertyValue("display");if(window.getComputedStyle(document.getElementById('cssLoadTest'), null).getPropertyValue("display") == "none"){the_function();}else{setTimeout(function(){cssReady(the_function)},300);}}

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
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href="javascript:void(0)" width="500" height="400" class="popupOpen" id="settings_nav" popup="false">Settings</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href="javascript:void(0)" width="360" height="400" class="popupOpen" popup="false">About</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href="javascript:saveWarning(\'main\',null,\'_top\',\'/servlets/iclientservlet/SS/?cmd=logout\')">Logout</a>';
     header +=     '</div></td><td width="100%" valign="top"><img style="float:right;" alt="" src="'+SCRIPTSURL+'/images/waterloo_logo.png"/></td></tr></table></div>';
     
     //Popup
     header +=     "<div id='popupContainer' style='display:none;'><div id='overlay'></div><div id='popupWrapper'><div id='popupContent' style='padding: 0px !important'><span id='panelWrapper'>";
     header +=     '<div class="panels" id="Settings" style="display: block; height: 100%;"><table style="width: 100%;" cellpadding="0" cellspacing="0" height="100%"><tr><td id="settingsLeft" valign="top"><div id="settingsNav" style="padding: 30px 0px; height: 100%;"></div></td><td id="settingsRight" valign="top"><div id="popupTitle" class="title">General Settings</div><div style="color: red; margin: 10px 0pt;">This uses cookies to save the following.</div><div id="settingsContent">';
     header +=      '</div><button class="button PSPUSHBUTTON" id="saveSettings">Save and Refresh</button><button style="float: right;" class="button PSPUSHBUTTON closePopup">Cancel</button></td></tr></table></div></span></div></div></div>';
     
     //About Popup
     header +=     "<span style='display:none;' style='padding:20px;' class='panels' id='About'><b>Jobmine Plus v"+CURRENT_VERSION/100+"</b><br/><br/><span class='details'>Written by Matthew Ng<br/><br/>Website: <a href='http://userscripts.org/scripts/show/80771' target='_blank'>http://userscripts.org/scripts/show/80771</a><br/><br/>Any problems/issues/wanted features email me at <a href='mailto:jobmineplus@gmail.com'>jobmineplus@gmail.com</a></span><br/><br/><br/><br/><br/><br/><br/><br/><br/><button style='float:right;' class='button closePopup PSPUSHBUTTON'>Cancel</button></span>";
     
     //White overlay
     header +=     white_overlay();
     
     //Hint Popup
     header +=     "<div id='hintmsg' style='display:none;visibility:hidden;position:absolute;' class=''><a style='cursor:pointer;' popup='false'></a><div id='description'></div><input type='checkbox' id='preventShowingChkbx'  /><div id='preventShowingText'>Never show me this again.</div></div>";
     header +=     "<div id='cssLoadTest' style='visibility:hidden;display:block;'></div>";
     $("body").prepend(header);    
}

function addSettingsItem(name, html)
{
     if(!document.getElementById("general_"+name.toLowerCase()))
     {
          $("#settingsNav").append('<a popup="false" href="javascript:void(0)">'+name+'</a>');
          $("#settingsContent").append(html);
     }
}


/*======================================*\
l*        ALTERNATIVE UNSAFEWINDOW FUCNTIONS      |
\*======================================*/
//run js code, its ugly, runs after page loads,		RUN THIS LAST
function runJS(code){	
     window.location.href = "javascript:"+code;
}
	//Able to inject functions into the page or rewrite functions, DOES NOT RUN IF runJS IS EXECUTED BEFORE, bruteforce forces the function to be set even if unsafeWindow is supported
function injectFunction(_function,bruteforce){
     $('body').append('<script language="javascript">function '+_function+'</script>');
}

/*======================================*\
l*        START OPERATION                                      |
\*======================================*/                      
function startOperation()
{try{
     //if(this page and do stuff)
     {
/*======================================*\
l*        PAGE CLEAN UP                                           |
\*======================================*/
          //Get page type and add a class to body
          var pagetype = $('title').html() ? $('title').html().toLowerCase().replace(/\s|-/gi,"_").replace(/_+/gi,"_") : "none";
          $("body").addClass(pagetype);

          // Insert navigation header at the top and overlays
          if(pagetype != "jobmine_|_university_of_waterloo"){insertCustomHeader();}
          
          // Add a CSS stylesheets
          var style = document.createElement( "style" ); 
          style.appendChild( document.createTextNode("@import '"+SCRIPTSURL+"/css/style.css';") );
          if(getCookieValue('HIDE_UPDATES') != 1){style.appendChild( document.createTextNode("@import '"+SCRIPTSURL+"/css/update.css';") );};
          document.getElementsByTagName( "body" ).item(0).appendChild( style );	
          
          //Adds current version to the body class
          $('body').addClass("v"+CURRENT_VERSION);
          
          //Removing useless parts
          $("#WAIT_main0").remove();
          $("#WAIT_main").remove();
          
          //Makes all View buttons to the next tab
          $("a.PSHYPERLINK:contains('View')").attr("target","_blank");
          
     //SPECIFIC PAGE LAYOUTS
          $(".PSLEVEL1GRID.tablesorter").attr("cellpadding",0);
          $('.PSLEVEL1GRID').parent().addClass("tablepanel");
          $("table a.PTBREADCRUMB").parents("table").remove();

          if(pagetype != "student_data" ){$(".PSACTIVETAB").parents().eq(2).remove();}
          
/*======================================*\
l*        JOB SEARCH PAGE                                       |
\*======================================*/
          if(pagetype == "job_search_component")            
          {
               var tableBody = null;
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
                    
                    //Playing with the table
                    tableBody = $("#searchTable tr tr:eq(1) td.tablepanel table.PSLEVEL1GRID tr");
                    if(tableBody.length > 2)
                    {
                         tableBody.each(function(row){                                                
                              var obj = $(this).children();                         
                              if(row == 0)   //Header
                              {
                                   //Adds a changes column
                                   obj.eq(8).after("<th title='You must be skilled to get the job, this is equation does not included your skill level.' class='PSLEVEL1GRIDCOLUMNHDR' align='left' scope='col'>Hiring Chances*</th>");
                              }
                              else      //Body
                              {
                                   //Adds a changes column
                                   var numApps = obj.eq(8);
                                  /*   Reading Purposes
                                        var openings = parseInt(obj.eq(5).html());
                                        var applications = parseInt(isNaN(parseInt(numApps.html()+1)) ? 1 : parseInt(numApps.html()+1));
                                   */
                                   numApps.after("<td title='You must be skilled to get the job, this is equation does not included your skill level.' class='PSLEVEL1GRIDODDROW' align='left'>"+Math.round((parseInt(obj.eq(5).html())/parseInt(isNaN(parseInt(numApps.html()+1)) ? 1 : parseInt(numApps.html()+1)))*10000)/100+"%</td>");
                                   
                                   if(obj.eq(7).children().html().trim() == "&nbsp;")
                                   {
                                        obj.eq(7).children().html("Not Able to Shortlist").attr("title","Jobmine has a thing where if you delete a job from shortlist, you cannot shortlist the job again. Sorry.");
                                   }
                              }         
                         });
                    }
                    var tables = applyTableSorting("table table table.PSLEVEL1GRID");
                    $("body > form > table").css("width","auto");
               }else{
                    $("form").css("margin-bottom","20px");
               }
              
               //Alter the tables by column and row, there needs to be at least 1 result
               if(tableBody && tableBody.length > 2)
               {
                    tableBody.each(function(num){
                         if(num != 0)   //Avoid headers
                         {
                              var obj = $(this).children();
                              var company = obj.eq(2).html();
                              var location = obj.eq(4).html();
                              
                              //This is the Google search for the company
                              obj.eq(2).wrapInner("<a title='Google Search that Company!!!'  target='_blank' href='http://www.google.ca/#hl=en&q="+company.replace(/\s/g,"+")+"'/>");            
                              //This is for google map the location
                              obj.eq(4).wrapInner("<a title='Google Maps that Company!!!'  target='_blank' href='http://maps.google.ca/maps?hl=en&q="+location.replace(/\s/g,"+")+"+"+$("#UW_CO_JOBSRCH_UW_CO_LOCATION").attr("value").replace(/\s/g,"+")+"'/>"); 
                         }
                    });
               }
          }
/*======================================*\
l*        PROFILE PAGE                                            |
\*======================================*/
          else if(pagetype == "student_data" && $("form > table:last-child").html()) 
          {
               applyTableSorting("table table table.PSLEVEL1GRID");
               var bottomNav = $("form > table:last-child").html();
               /*======================================*\
               l*        TERM CARDS                                              |
               \*======================================*/
               if(bottomNav.indexOf("Term Cards |") != -1){
                    $("form > table > tbody >tr:first-child > td:last-child").attr("width",1);
                    $("form > table > tbody >tr:first-child > td:last-child > img").attr("width",1);
                    $("form > table > tbody >tr:first-child > td:first-child").attr("width",1);
                    $("form > table > tbody >tr:first-child > td:first-child > img").attr("width",1);
                    $("body form table").eq(1).children().children().eq(2).children(":first-child").attr("height",1);        
               }
               /*======================================*\
               l*        STUDENT PERSONAL INFO & ACADEMIC INFO    |
               \*======================================*/
               else if(bottomNav.indexOf("Student Personal Info |") != -1 || bottomNav.indexOf("Acad Info. |") != -1){
                    $("body form table").css("margin","0 auto");
                    $("body form table").eq(-2).css("width","auto");          
               }
               /*======================================*\
               l*        SKILLS INVENTORY                                      |
               \*======================================*/
               else if(bottomNav.indexOf("| \nSkills Inventory") != -1){
                    $("form table td").find("label:contains('Student ID:')").parent().attr("colspan",3).css("padding-left","10px");			
                    $("form table td.tablepanel table").css("margin","0 auto").css("width","auto");
                    $("body form table").eq(-2).css("text-align","center");
                    $("textarea").css("width","100%").attr("cols","").parent().append("<br/><br/>");
                    if(UNSAFEWINDOWSUPPORT){
                         $("form table td.tablepanel").attr("colspan",20);
                    }else{
                         $("body > form:last > table > tbody > tr").eq('11').children(':last').attr("colspan","14");
                    }
               }
               /*======================================*\
               l*        LOOK UP PAGESS                                        |
               \*======================================*/
               if($("form span").html() && $("form span").html().search(/Lookup.*ID/ig) == -1){
                    $("body form table:first").css("width","auto").css("margin","0 auto");
               }else{
                    $("form:last").css("margin-bottom","20px");
               }
          }
/*======================================*\
l*        DOCUMENTS PAGE                                       |
\*======================================*/
          else if(pagetype == "resumes"){                
               $("form table tr:eq(3)").children().eq(1).attr("colspan",20);
               $("form > table > tbody > tr:last-child > td:first-child").attr("height",10);    
               var resumeTable = $("form table tr:eq(5)").remove().children().eq(1).html();
               $("form:last").append(resumeTable);

               applyTableSorting("table table.PSLEVEL1GRID");
               $("body > form > table").eq(0).css("width","auto");
          }
/*======================================*\
l*        JOB SHORT LIST PAGE                                  |
\*======================================*/
          else if(pagetype == "job_short_list")
          { 
               window.scrollTo(0,0);
               $(".PAERRORTEXT").html("(You can remove multiple jobs by checking the rows off and clicking 'Delete Selected' or use the minus button ( - ) to remove jobs from your list.)");
               
               var numOfChkbx = 0;
               //Adding columns to tables:
               //   Added checkboxes 
               //   Added the google search and map feature
               $("body > form > table td.tablepanel table.PSLEVEL1GRID tr:last-child td tr").each(function(row){        
                    var obj = $(this);
                    var child = obj.children();
                    if(row == 0)   //Header
                    {   
                         obj.prepend('<th align="LEFT" class="PSLEVEL1GRIDCOLUMNHDR" scope="col">&nbsp;</th>');
                    }
                    else      //Body
                    {
                         //Add checkboxes
                         obj.prepend('<td align="center" height="19" class="PSLEVEL1GRIDODDROW"><input class="editChkbx" row="'+numOfChkbx+'" id=chkbx'+(numOfChkbx++)+' type="checkbox"></td>');
                         
                         //Add company and location href
                         var company = child.eq(2).html();
                         var location = child.eq(4).html();                         
                         child.eq(2).wrapInner("<a title='Google Search that Company!!!' target='_blank' href='http://www.google.ca/#hl=en&q="+company.replace(/\s/g,"+")+"'/>");            
                         child.eq(4).wrapInner("<a title='Google Maps that Company!!!' target='_blank' href='http://maps.google.ca/maps?hl=en&q="+location.replace(/\s/g,"+")+"'/>"); 
                    }    
               });
               //Add invisible iframe
               $("body").append("<iframe style='display:none;' name='hiddenIframe' id='hiddenIframe' width='100%' height='400' src=''></iframe>");     		
               $("body").append("<script language='javascript'>function runIframeFunction(name,_function){window.frames[name].eval(_function);}</script>");
               
               //Add the buttons that auto select/deselect the checkboxes
               $("#UW_CO_JSLIST_VW_").parent().parent().html("<td valign='top' height='30' colspan='13'><button class='deleteSelectedButton PSPUSHBUTTON' total='"+numOfChkbx+"' onclick='return false'>Delete Selected</button><button onclick='return selectAllChkbx(false,"+numOfChkbx+")' class='PSPUSHBUTTON'>Unselected All</button><button onclick='return selectAllChkbx(true,"+numOfChkbx+")' class='PSPUSHBUTTON'>Select All</button></td>");
               $("form > table > tbody > tr").eq(7).after("<tr><td valign='top' height='30' colspan='13'><button class='deleteSelectedButton PSPUSHBUTTON' total='"+numOfChkbx+"' onclick='return false'>Delete Selected</button><button onclick='return selectAllChkbx(false,"+numOfChkbx+")' class='PSPUSHBUTTON'>Unselected All</button><button onclick='return selectAllChkbx(true,"+numOfChkbx+")' class='PSPUSHBUTTON'>Select All</button></td></tr>");
               
               /*======================================*\
               l*        MULTISELECT CHECKBOXES                           |
               \*======================================*/
               var anchorChkbox = null;
               var shiftDown = false;
               $(document).keydown(function(evt){if(evt.shiftKey){evt.preventDefault();shiftDown = true;}});
               $(document).keyup(function(evt){if(evt.keyCode == '16'){evt.preventDefault();shiftDown = false;}});
               $(".editChkbx").click(function(evt)
               {
                    var obj = $(this);
                    var row = parseInt(obj.attr("row"));         
                    //If shift held, the anchor is set, and the checkbox is not the same as the last clicked
                    if(shiftDown && anchorChkbox != null && row != anchorChkbox)
                    {
                         if(anchorChkbox < row)        //Sees if you are going from down up or up down
                              for(var i=anchorChkbox; i<=row;i++)
                                   $("#chkbx"+i).attr("checked",obj.is(':checked'));
                         else
                              for(var i=anchorChkbox; i>row;i--)
                                   $("#chkbx"+i).attr("checked",obj.is(':checked'));
                    }   
                    anchorChkbox = row;                   
               });
               
               //Functions for the buttons to do stuff     		
               if(UNSAFEWINDOWSUPPORT){
                    unsafeWindow.selectAllChkbx = function(flag,numChkbx){for(var i=0;i<numChkbx;i++){$("#chkbx"+i).attr("checked",flag);}return false;};
               }else{
                    injectFunction("selectAllChkbx(flag,numChkbx){for(var i=0;i<numChkbx;i++){document.getElementById('chkbx'+i).checked = flag;}return false;}");
               }
               
               /*======================================*\
               l*        MULTIJOB REMOVAL                                     |
               \*======================================*/
               $('.deleteSelectedButton').click(function(){                 
                    var numChkbx = $(this).attr('total');
                    var iframeArray = new Array();
                    //Get the checkboxes in an array
                    for(var i=0;i<numChkbx;i++){
                         if($("#chkbx"+i).attr("checked")){iframeArray.push(i);}
                    }
                    var iframeCounter = iframeArray.length;
                    if(iframeCounter == 0){return false;}    //if nothing is selected
                    var answer = confirm (iframeCounter < 10 ? "Do you wish to delete the checked rows from this page? The page itself will refresh after the transaction is saved." : "Do you wish to delete the checked rows from this page? You have "+iframeCounter+" rows to delete and this may take a while. The page itself will refresh after the transaction is saved.");
                    if(!answer){return false;}    //if nothing is selected
                    $("#hiddenIframe").attr("src","servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOB_SLIST&RL=&target=main0&navc=5170"); 
                    loadPopupMsg("Each job removed needs to be refreshed, this will take a while because of Jobmine slowness.<br/><span style='color:blue;font-size:20px;'>*Refresh to Cancel*</span><br/>Starting...");
                    $("title").html("Job Short List | Starting...");
                    $("#popupWhiteContainer").css("display","block");
                    $("#popupWhiteContent").css("top","-150px");
                    $("#whiteOverlay").css("top","0px");
                    $("body").css("overflow","hidden");
                    $("#hiddenIframe").load(function(){          //Refresh recursive function
                         if(iframeArray.length != 0){   //Start counting and removing
                              var progress = (iframeCounter - iframeArray.length+1)+"/"+iframeCounter;
                              $("title").html("Job Short List | Removing: "+progress);
                              loadPopupMsg("Each job removed needs to be refreshed, this will take a while because of Jobmine slowness.<br/><span style='color:blue;font-size:20px;'>*Refresh to Cancel*</span><br/>Progress: "+progress);
                              if(UNSAFEWINDOWSUPPORT){
                                   unsafeWindow.runIframeFunction("hiddenIframe","submitAction_main0(document,'main0','UW_CO_STUJOBLST$delete$"+(iframeArray.pop())+"$$0')");				
                              }else{
                                   runJS('runIframeFunction("hiddenIframe","submitAction_main0(document.main0,\'UW_CO_STUJOBLST$delete$'+(iframeArray.pop())+'$$0\')")');	
                              }
                         }
                         else if(iframeCounter > 0){     //Save 
                              loadPopupMsg("Each job removed needs to be refreshed, this will take a while because of Jobmine slowness. <br/><span style='color:red'>Saving now... Do not refresh.</span>");
                              $("title").html("Job Short List | Saving...");
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
               var tables = applyTableSorting("table table table.PSLEVEL1GRID");
          }
/*======================================*\
l*        APPLICATIONS PAGE                                    |
\*======================================*/
          else if(pagetype == "student_app_summary")
          {
               var tables = applyTableSorting("table table table.PSLEVEL1GRID");
               tables.find("div.PSHYPERLINKDISABLED:contains('Edit Application')").html("Cannot Edit Application");
          }
          else
/*======================================*\
l*        OTHER PAGES                                             |
\*======================================*/
          {
               var tables = applyTableSorting("table table table.PSLEVEL1GRID");
          }
/*======================================*\
l*        HINT SYSTEM                                             |
\*======================================*/
          var hintArray = new Array();
          var commonHintArray = new Array();
          
          //Closes and fades out the hint box
          $("#hintmsg a").bind("click",function(){
               $(this).unbind("click");
               $(this.parentNode).fadeOut(500);
          });
                    
          //Common hints for all pages
          commonHintArray.push({percentage: 0.5,obj:$("#settings_nav")[0], text : "Check out the settings tab to customize your experience. You can remove the timer and set the default page Jobmine Plus loads."});
          commonHintArray.push({percentage: 0.1,obj:$(".PSHYPERLINK a")[0], text : "Hint 2"});
          commonHintArray.push({percentage: 0.3,obj:$(".PSHYPERLINK a")[1], text : "Hint 3"});
          commonHintArray.push({percentage: 0.8,obj:$(".PSHYPERLINK a")[2], text : "Hint 4"});
          
          
          function showHint(description, objPoint, num)
          {
               var orientation = null;
               
               //Dimensions of Orientations, HARDCODED
               var VERTICALHINT = new Array(218, 157);
               var HORIZONTALHINT    = new Array(235, 138);
               
               var marginPercentage = 0.2;
               
               var offsets = $(objPoint).offset();
               var objLeft = parseInt(offsets.left);
               var objTop = parseInt(offsets.top);
             
               //Find the best orientation for the hint box
               if(objTop < $("body").height()/2)
               {
                    if((objLeft+VERTICALHINT[0]/2)*parseInt(1+marginPercentage) > window.innerWidth)
                         orientation = "right";
                    else if(objLeft-VERTICALHINT[0]/2 < window.innerWidth*marginPercentage)
                         orientation = "left";
                    else
                         orientation = "up";
               }
               else
               {
                    if((objLeft+VERTICALHINT[0]/2)*parseInt(1+marginPercentage) > window.innerWidth)
                         orientation = "right";
                    else if(objLeft-VERTICALHINT[0]/2 < window.innerWidth*marginPercentage)
                         orientation = "left";
                    else
                         orientation = "down";
               }
               
               //Position the hint box
               switch(orientation)   
               {
                    case "up":     
                         objLeft += parseInt(-VERTICALHINT[0]/2+$(objPoint).outerWidth(true)/2);
                         objTop += parseInt($(objPoint).outerHeight(true));
                         break;
                    case "down":
                         objLeft += parseInt(-VERTICALHINT[0]/2+$(objPoint).outerWidth(true)/2);
                         objTop -= VERTICALHINT[1];
                         break;
                    case "left":
                         objLeft += $(objPoint).outerWidth(true);
                         objTop -= parseInt(HORIZONTALHINT[1]/2-$(objPoint).outerHeight(true)/2);
                         break;
                    case "right":
                         objLeft -= HORIZONTALHINT[0];
                         objTop -= parseInt(HORIZONTALHINT[1]/2-$(objPoint).outerHeight(true)/2);
                         break;
                    default:
                         return;
                         break;
               }
               $("#hintmsg")[0].className = orientation;
               $("#hintmsg #description").html(description);
               $("#hintmsg").css("left",objLeft+"px").css("top",objTop+"px").fadeIn(1200);
          }
          
          function randomizeHints(array)
          {try{
               //Choose a random hint
               var randomIndex = Math.floor(Math.random()*array.length+1)-1;
               var hint = array[randomIndex];
               var chosenIndex = Math.floor(Math.random()*101);
         
               //See if we display it based on the percentage probability
               var probability = hint.percentage*100;
               
               //Show it
               if(chosenIndex <= probability && hint.obj)   //also check if user blocked this hint
                    showHint(hint.text, hint.obj,1);
               
          }catch(e){alert(e)}}
      
          
          //When the DOM is loaded
          $(document).ready(function(){
               //When CSS is loaded
               cssReady(function(){
                    //showHint(commonHintArray[0], $(".PSHYPERLINK a")[0],1);
                    randomizeHints(commonHintArray);
               });
          });
          
          //Hints for specific pages         
          
/*======================================*\
l*        SETTINGS                                                  |
\*======================================*/          
          addSettingsItem("General",SETTINGS_GENERAL);
          
          $("#settingsNav a").click(function(){
               var name = $(this).html();
               $("#popupTitle").html(name+" Settings");
               $("#settingsContent").children().each(function(){$(this).css("display","none");});
               $("#settings_"+name.toLowerCase()).css("display","block");
          });
          
          //Mainly only for settings
          $("#saveSettings").click(function(){
               var autorefresh = $("#popupText").attr("value");
               if(autorefresh && autorefresh.search(/^[0-9]+(\.[0-9]+$)?/g) == -1){alert("Please make sure that the Auto Refresh Duration is a positive decimal or integer number (numbers and a period).");return;};
               var remove_load = $('#loadCheckbox').attr("checked");
               var remove_timer = $('#removeTimerChkbx').attr("checked");
               var hideupdates = $('#updateCheckbox').attr("checked");
               var default_page = $("#popupSelect").attr("value");
               //Write Cookies
               writeCookie('LOAD_SCREEN', remove_load ? 1 : 0);
               writeCookie('DISABLE_TIMER', remove_timer ? 1 : 0);
               writeCookie('HIDE_UPDATES', hideupdates ? 1 : 0);
               writeCookie('DEFAULT_PAGE', default_page);
               writeCookie('AUTO_REFRESH', autorefresh);
               hidePopup();
               showLoadingPopup();
               window.location.href = window.location.href;
          });
          
          //Bind the change event listener to the checkbox
          $("#removeTimerChkbx").change(function(){toggleRemoveTimer(this);});
          
          //Shows the text description if checked
          function toggleRemoveTimer(obj){
               if(obj.checked){                    
                    $("#popupText").removeAttr("disabled").css("background-color","white").css("color","black").parent().prev().css("color","black").removeClass("disabled");
               }else{
                    $("#popupText").attr("disabled","disabled").css("background-color","#EEE").css("color","#CCC").parent().prev().addClass('disabled').css("color","#CCC");
               }
          };
/*======================================*\
l*        POPUP SPECIFIC FUNCTIONS                         |
\*======================================*/          
          //Opening the popup
          $("#jobminepanel a.popupOpen").click(function(){
               showPanel($(this).html().trim(),$(this).attr("width"),$(this).attr("height"));
          });
          
          //Closing the popup
          $("#panelWrapper button.closePopup").click(function(){
               hidePopup();
          });
          
          //When the popup is shown, the panel is shown based off the name
          function showPanel(panelName, width, height)
          {
               if($("#"+panelName))
               {
                    $("#"+panelName).css("display","block");
                    $('#popupTitle').html(panelName);
                    $("#popupContainer").css("display","block");
                    $("body").css("overflow","hidden");
                    
                    //Resize
                    $("#popupContent").css("width",width+"px").css("height",height+"px").css("left",-width/2+"px").css("top",-height/2+"px");
                    
                    //Custom to Panels
                    if(panelName == "Settings")  
                    {    //Load all the settings from cookies
                         $("#popupSelect").attr("value",getCookieValue('DEFAULT_PAGE'));
                         $("#popupText").attr("value",(getCookieValue('AUTO_REFRESH') != -1 ? getCookieValue('AUTO_REFRESH') : 0));
                         $('#removeTimerChkbx').attr("checked",(getCookieValue('DISABLE_TIMER') == 1 ? true : false));  
                         $('#updateCheckbox').attr("checked",(getCookieValue('HIDE_UPDATES') == 1 ? true : false));  
                         $('#loadCheckbox').attr("checked",(getCookieValue('LOAD_SCREEN') == 1 ? true : false));  
                         toggleRemoveTimer(document.getElementById("removeTimerChkbx"));
                    }
               }
          }
          
          function hidePopup(){$("#popupContainer").css("display","none");$("body").css("overflow","auto");$("#panelWrapper").children().each(function(){$(this).css("display","none");});};
          
          //When to run the white overlay
          if(getCookieValue('LOAD_SCREEN') != 1)
          {
               $("a").click(function(){
                    if($(this).attr("target")!= "_blank" && $(this).attr("target") != "new" && $(this).attr("popup")!= "false" && $(this).parent().html().indexOf('onclick="return ') == -1  && $(this).attr('href').indexOf('mailto') == -1){
                         $("#hintmsg").css("display","none");
                         showLoadingPopup();
                    }
               });

               $("input").click(function(){
                    if($(this).attr("type") == "button"){
                         $("#hintmsg").css("display","none");
                         showLoadingPopup();
                    }
               });
          }
          
          //For decimals and numbers
          injectFunction("decimalOnly(evt){var charCode = (evt.which) ? evt.which : event.keyCode;if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46){return false;}else{return true;}}");
          
/*======================================*\
l*        REMOVING THE TIMER                                  |
\*======================================*/       
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
/*======================================*\
l*        HIGHLIGHTING                                            |
\*======================================*/         
          // Set syntax highlighting colours for various statuses
          var VERYGOOD = "#9f9";
          var GOOD = "#96f0b1";
          var MEDIOCRE = "#faf39a";
          var BAD = "#fdaaaa";
          var WORST = "#b5bbc1";
          
          if(tables)
          {
               switch(pagetype)
               {
                    case "student_app_summary":
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
                         tables.find("tr:contains('Approved')").find("td").css("background-color",BAD);
                         break;
                    case "student_sel.interview_schedule":
                         tables.find("tr:contains('Break')").find("td").css("background-color",MEDIOCRE);
                         break;
                    case "job_short_list":
                         tables.find("tr:contains('Already Applied')").find("td").css("background-color",VERYGOOD);
                         tables.find("tr:contains('Not Posted')").find("td").css("background-color",BAD);
                         tables.find("tr:contains('Not Authorized to Apply')").find("td").css("background-color",WORST);
                         break;
                    case "student_interviews":
                         tables.find("tr:contains('Ranking')").find("td").css("background-color",MEDIOCRE);
                         tables.find("tr:contains('Scheduled')").find("td").css("background-color",VERYGOOD);
                         tables.find("tr:contains('Selected')").find("td").css("background-color",VERYGOOD);
                         tables.find("tr:contains('Filled')").find("td").css("background-color",WORST);
                         tables.find("tr:contains('Unfilled')").find("td").css("background-color",WORST);
                         break;
                    case "student_ranking_open":
                         tables.find("tr:contains('Offer')").find("td").css("background-color",VERYGOOD);
                         tables.find("tr:contains('Ranked')").find("td").css("background-color",GOOD);
                         tables.find("tr:contains('Not Ranked')").find("td").css("background-color",WORST);
                         break;
                    case 'job_search_component':
                         tables.find("tr:contains('On Short List')").find("td").css("background-color",WORST);
                         tables.find("tr:contains('Not Able to Shortlist')").find("td").css("background-color",WORST);
                         tables.find("tr:contains('Have Already Applied')").find("td").css("background-color",WORST);
                         break;
               }
          }
     } 
}catch(e){alert(e)}}  

/*
 *   Start running code
 */
startOperation();