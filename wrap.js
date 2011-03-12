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
          https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID=######          <---opens the page dependent on the number
          
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
var CURRENT_VERSION=107;
var UNSAFEWINDOWSUPPORT=unsafeWindow.toString().indexOf("[object Window]")!=-1;
var SCRIPTSURL="https://jobmine-plus.googlecode.com/svn/trunk/scripts";
var GLOBAL_TIMER = null;

/*
 * Handle Cookies
 */
 
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
function focusPass(){
     document.getElementById("userid").removeEventListener("focus",focusPass,false);
     document.getElementById('pwd').focus();
}
//Redirect all ES's to SS
if(window.location.href.indexOf("jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/ES/") != -1){
     window.location.href = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=login";
     return;
}
//If we are on the normal login page
else if(document.getElementById("search")){

     //input checkbox and add an eventlistener
     var newNode = document.createElement("div");
     newNode.style.left = "212px";
     newNode.style.position = "relative";
     newNode.innerHTML = "<input id='rememberUser' type='checkbox'/><span style='font-size:11px;'>Remember User<br/> <span style='color:red;'>(DO NOT CHECK ON PUBLIC PC)</span></span>";     
     document.getElementById("pwd").parentNode.parentNode.parentNode.insertBefore(newNode,document.getElementById("pwd").parentNode.parentNode.nextSibling.nextSibling);
     document.getElementById("rememberUser").addEventListener("click",function(){writeCookie('REMEMBERUSER', this.checked ? 1 : 0);},false);
     
     //If the user wants to save passwords
     var user = getCookieValue('REMEMBERUSER');
     if(user == 1 && document.getElementById("userid")){
          document.getElementById("login").setAttribute("autocomplete","on");
          document.getElementById("rememberUser").checked = "checked";
     }
     else
     {
          document.getElementById("userid").setAttribute("autocomplete","off");
          document.getElementById("pwd").setAttribute("autocomplete","off");
     }
   
     return;
}
/*
 *   Searches for the ID for a job description when clicking the jobs in applications list
 */
else if(IS_IN_IFRAME && document.title == "Job Details" )
{
     var foundJobID = 0;                                                   //Holds the id if found on the page, if not it is 0

     //We hit the search page and we want to hurry and press the button
     if(window.location.href.indexOf("https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&Page=UW_CO_STU_JOBDTLS&UW_CO_JOB_TITLE=") != -1){
          //Firefox or Chrome?
          window.location = UNSAFEWINDOWSUPPORT ? "javascript:submitAction_main(document,'main', '#ICSearch')" : "submitAction_main(document.main, '#ICSearch')";
          return;
          //After this it will run one of the two if else statements below
     }
     //1. Check if the page is a search page (lookup for jobs)
     else if(document.body.className.indexOf("PSSRCHPAGE") != -1){
          //Init Variables
          var nextNode = {};                                               //Cycles through later on and holds the current object     
          var index =  0;                                                     //Cycling index
          var term = getCurrentTerm();                                 //Gets the term
          var nodes = document.getElementsByTagName("a");   //Holds all the a-tags on the page, we look in this
             
          //Look for a link (a-tag) for the hyperlink of the correct term
          while (foundJobID == 0 && nodes[++index])
          {    //If we find the term in the text of an a-tag, we have found it!
               if(nodes[index].firstChild && term == nodes[index].firstChild.nodeValue){
                    foundJobID = nodes[index-1].firstChild.nodeValue;    //We set the previous a-tag's value which is the id and not the term                         
               }
          }
          //We found it, if we haven't then it is Jobmine's fault, we now can make a new tab
          if(foundJobID != 0){
               window.open("https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID=" + foundJobID);
          }else{
               alert("CANNOT FIND ID");
               return;
          }
     }
     //2. This is when the search for the lookup jobs loads a description instead of a list of indexes
     else if(window.location.href.indexOf("?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOBDTLS") != -1)
     {
          //This page is the job details page with a specific url, we grab the job ID and run
          foundJobID = document.getElementsByTagName("div")[6].firstChild.nodeValue;             //6 is the location of the jobID, jobmine loads this as a template, it will hopefully never change
          
          //Make sure it is a number
          if(isNumeric( foundJobID )){
               window.open("https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID=" + foundJobID);
          }else{
               alert("GRABBED THE WRONG THING: you got "+ foundJobID);
               return;
          }
     }
     
     //Write the job id in a cookie
     writeCookie("APP_LAST_ID", foundJobID);
     
     //Go to a blank page when finished
     window.location = "about:blank";
     return;
}
//Right when Jobmine logins in
else if(window.location.href == 'https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=start&')
{
     document.getElementsByTagName("html")[0].innerHTML = "<body>"+white_overlay("<div style='text-align:justify;'>Welcome to Jobmine Plus! No Jobmine Plus is not slower than Jobmine (well only by a bit since it does extra enhancements after), it is about the same timing. If you don't like this because it is slower, then you will miss out on all the great features. By the time you read this, the next page would have loaded.</div>",21,false)+"</body>";	
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
}





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