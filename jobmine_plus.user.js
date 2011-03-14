// ==UserScript==
// @name           Jobmine Plus
// @namespace      http://eatthis.iblogger.org/
// @description    Makes jobmine even better and looks good too!
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?cmd=*
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/ES/*
// @include        https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&Page=UW_CO_STU_JOBDTLS&UW_CO_JOB_TITLE=*
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
var ISFIREFOX = unsafeWindow.toString().indexOf("[object Window]")!=-1;
var IS_IN_IFRAME = (self != top);
var SCRIPTSURL="https://jobmine-plus.googlecode.com/svn/trunk/scripts";
var GLOBAL_TIMER = null;

/*
 * Handle Cookies
 */ 
function getCookieValue(name){var cookies=document.cookie;var lookup=cookies.indexOf(name+'=');if(lookup==-1){return-1;}lookup+=name.length+1;var end=cookies.indexOf(';',lookup);if(end==-1){end=cookies.length}var value=cookies.substring(lookup,end);if(value!=null){return value;}else{return null;}}function writeCookie(name,value){var date=new Date();date.setTime(date.getTime()+(3*31*24*60*60*1000));document.cookie=name+'='+value+';expires='+date.toGMTString()+'; path/';}

/*
 *   White Overlay
 */
function white_overlay(text, fontSize, includeImg){var image = includeImg == false  ? "" : "<img alt='' style='position:relative;top:-125px;' src='"+SCRIPTSURL+"/images/loading.gif'/>";fontSize = fontSize != null ? fontSize+"px" : "30px";text = text != null ? text : "Jobmine has been programmed to load pages really slowly.";return "<div id='popupWhiteContainer' style='display:none;'><div id='whiteOverlay' style='display:block;position:fixed;width:100%;height:100%;background-color:white;opacity:0.5;z-index:1;left:0px;top:125px;'></div><div id='popupWrapper' style='position:fixed;width:50%;height:50%;bottom:0px;right:0px;'><div id='popupWhiteContent' style='position:relative;width:450px; font-weight:bold; height:180px;top:-90px;font-size:"+fontSize+";left:-225px;z-index:49;font-family:Arial,Verdana;text-align:center;text-shadow:-2px -2px 5px #777, 2px 2px 5px #777;'><span style='font-size:50px;'>Please be Patient.</span><br/><div id='whitePopupMsg'>"+text+"</div><br/>"+image+"</div></div></div>";}

/*
 *Pages 
 */
var INTERVIEW_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STU_INTVS&RL=&target=main0&navc=5170";
var JOB_SEARCH_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOBSRCH&RL=&target=main0&navc=5170";
var DOCUMENT_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STUDDOCS&RL=&target=main0&navc=5170";
var JOB_SHORT_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOB_SLIST&RL=&target=main0&navc=5170";
var RANKING_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STU_RNK2&RL=&target=main0&navc=5170";
var PROFILE_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_STUDENT&RL=&target=main0&navc=5170";
//var WORK_REPORT_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_WORKRPRT&RL=&target=main0&navc=5170";
var APPLICATION_PAGE = "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&PanelGroupName=UW_CO_APP_SUMMARY";

/*
 *        FUNCTIONS
 */
//Parses an abrevation of a month into a number (1-12)
function parseMonth(givenMonth)
{
     var months = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
     var i = 0;
     while(months[i] && months[i].indexOf(givenMonth) == -1 && months[i++]);
     //If month cannot be found
     if(i == 12) return false;
     return (parseInt(i+1)+"").length < 2 ? "0"+parseInt(i+1) : parseInt(i+1);
}

function getCurrentTerm()          //returns eg, March 09, 2011 -> 1115
{     
     var date         = new Date();
     var year         = date.getFullYear() + "";
     var firstDigit    = parseInt( year[0] ) - 1;
     var middleDigit = parseInt(year.substr( 2, 2 ));
     var month = parseInt(date.getMonth() + 1);
     
     //Get the last digit dependent on the month
     var lastDigit;
     if(       month >= 1 && month <= 4){         //Jan - April
          lastDigit = "5";
     }else if(month <= 8){                             //May - August
          lastDigit = "9";
     }else{                                                 //September - December
          lastDigit = "1";
          middleDigit++;                                  //Add one more for the next year
     }
     var guessTerm = firstDigit+""+middleDigit+""+lastDigit;
   
     //Algorithm to return the correct term
     var curTermInCookie = getCookieValue("CURTERM");
     if(curTermInCookie != -1)          //Cookie exists
     {
          //See if the student is looking for a job during the first month of coop term only if the cookie and the guess are not the same
          var cookieLastDigit = parseInt(curTermInCookie[3]);          
          if(curTermInCookie != guessTerm                   //They are not equal
          &&(cookieLastDigit == 5 && month == 5          //If a Jan-April but applying in May
          ||  cookieLastDigit == 9 && month == 9          //If a May-August but applying in Sept
          ||  cookieLastDigit == 1 && month == 1))       //If a Sept-Dec but applying in Jan
          {return curTermInCookie;}                          //It is acceptable to return the search value if they are still looking for a coop job but are not finding one
     }
     /*This is the best choice
     *    - Cookie doesnt exist
     *    - The month doesnt collide with the first month of their coop term; they have yet to find a job
     *    - Cookie and the guess are the same
     */
     return guessTerm;
}

function isNumeric( number )
{
     return  (number - 0) == number && number.length > 0
}


/*
 *   Debug Window For cookies
 */
 

if(true){try{
     var dContainer = document.createElement("div");
     dContainer.id = "debugContainer";
     document.body.appendChild(dContainer);
     
     var fields = new Array();
     var dropdown = "<select id='debugDD'>";
     
     function refreshDD()
     {
          var options = "";
          var cookie = document.cookie.split(";");
          for(var i=0;i< cookie.length;i++)
          {
               var splitLocation = cookie[i].indexOf("=");
               //var name_value = new Array(cookie[i].substring(0, cookie[i].indexOf("=")))
               var name = cookie[i].substring(0, splitLocation).replace(/^\s+|\s+$/g,"");
               var value = cookie[i].substr(parseInt(splitLocation+1)).replace(/^\s+|\s+$/g,"");
               options += "<option id='"+name+"' value='"+name+"'>"+name.substring(0, 25)+"</option>";        
               fields[name] = value;
          }
          return options;
     }
     
     dropdown += refreshDD();
     dropdown += "</select>";
     
     dContainer = document.getElementById("debugContainer");
     dContainer.innerHTML += "<style>#debugContainer{position:fixed;width:300px;min-height:100px;right:0px;top:0px;background:rgba(0,0,0,0.6) none;padding:10px;color:white;}</style>";
     dContainer.innerHTML += "<button onclick='window.location=window.location;'>Refresh</button>";
     dContainer.innerHTML += "<br/><br/>Cookies:<br/>";
     dContainer.innerHTML += dropdown;
     dContainer.innerHTML += "<button id='alertCookie'>Read Cookie</button>";
    
    //STORAGE STUFF
     var items = new Array();
     var ddStorage = "<select id='debugDDStorage'>";
     
     function refreshDDStore()
     {
          var options = "";
          if(localStorage.getItem("KEYBASE_NAME_APPLICATION"))
          {
               listOfKeys = localStorage.getItem("KEYBASE_NAME_APPLICATION").split(" ");
               
               for(var i=0;i< listOfKeys.length;i++)
               {
                    var name = listOfKeys[i];
                    var value = localStorage.getItem(name);
                    options += "<option id='"+name+"' value='"+name+"'>"+name.substring(0, 22)+"</option>";        
                    items[name] = value;
               }
               return options;
              
               return options;
          }
          return "<option>Nothing in here</option>";
     }
     ddStorage += refreshDDStore();
     ddStorage += "</select>";
   
     dContainer.innerHTML += "<br/><br/>Storage:<br/>";
     dContainer.innerHTML += ddStorage;
     dContainer.innerHTML += "<button id='DDStore'>Read Storage</button><br/><br/>";     
     dContainer.innerHTML += "<button id='deleteStorage'>Clear Storage</button>";
     dContainer.innerHTML += "<button onclick='alert(localStorage.getItem(\"KEYBASE_NAME_APPLICATION\").replace(/\\s/g, \"\\n\"))'>Alert Keys</button><br/>";
      dContainer.innerHTML += "<b>Output</b><div style='overflow:auto;' id='dOutput'></div>";
      
     var storeAlert = document.getElementById("DDStore");
     var debugDDStorage = document.getElementById("debugDDStorage");
     var deleteStorage = document.getElementById("deleteStorage");
     var dOutput = document.getElementById("dOutput");
   
     setTimeout(function(){
          if($("#hiddenIframe").length > 0){
               $("#hiddenIframe").load(function(){
                    if(this.getAttribute("src") != "")
                    {
                         debugDDStorage.innerHTML = refreshDDStore();
                    }
               });
          }
     }, 500);
    
    
     if(storeAlert){
          storeAlert.addEventListener("click",function(){try{var value = debugDDStorage.value; debugDDStorage.innerHTML = refreshDDStore(); dOutput.innerHTML = items[value];document.getElementById(value).setAttribute("selected","true");}catch(e){alert(e)}},false);
     }
     
     if(deleteStorage){
          deleteStorage.addEventListener("click",function(){try{ if(confirm("Delete Storage?")){localStorage.clear();debugDDStorage.innerHTML = refreshDDStore();}}catch(e){alert(e)}},false);
     }

     var debugDD = document.getElementById("debugDD");
     var doSomething = document.getElementById("doSomething");
     var alertCookie = document.getElementById("alertCookie");
     if(alertCookie){
          alertCookie.addEventListener("click",function(){try{var value = debugDD.value; debugDD.innerHTML = refreshDD(); dOutput.innerHTML = fields[value];document.getElementById(value).setAttribute("selected","true");}catch(e){alert(e)}},false);
     }
   
}catch(e){alert(e)}
}



/*
 *   Redirects
 */
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
     document.getElementById("pwd").parentNode.parentNode.parentNode.insertBefore(newNode,document.getElementById("pwd").parentNode.parentNode.nextSibling.nextSibling);
     
     //FIREFOX - saves the password and username like any other login
     if(ISFIREFOX)
     {
          newNode.innerHTML = "<input id='rememberUser' type='checkbox'/><span style='font-size:11px;'>Remember User<br/> <span style='color:red;'>(DO NOT CHECK ON PUBLIC PC)</span></span>";     
          document.getElementById("rememberUser").addEventListener("click",function(){writeCookie('REMEMBERUSER', this.checked ? 1 : 0);},false);
          
          //If the user wants to save passwords
          if(getCookieValue('REMEMBERUSER') == 1 && document.getElementById("userid")){
               document.getElementById("login").setAttribute("autocomplete","on");
               document.getElementById("rememberUser").checked = "checked";
          }
     }
     //CHROME - because of how Chrome handles userscripts, it will not allow me to save passwords (that you will have to use an external extension and uncheck "Save User ID")
     else
     {
          newNode.innerHTML = "<input id='autoCheckID' type='checkbox' title='Click to auto input user ID next time. Cannot save password for security reasons.'/><span style='font-size:11px;'>Save User ID<span>";     
           document.getElementById("autoCheckID").addEventListener("click",function(){writeCookie('LASTUSER', this.checked ? "1|"+ getCookieValue('LASTUSER').split("|")[1] : 0);},false);
     
          var user = getCookieValue('LASTUSER');
          if(user != "NaN" && user != -1 && user[0] != 0 && document.getElementById("userid")){
               document.getElementById("userid").value = user.substr(2);
               document.getElementById("autoCheckID").checked = "checked";
          }
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
          window.location = ISFIREFOX ? "javascript:submitAction_main(document,'main', '#ICSearch')" : "submitAction_main(document.main, '#ICSearch')";
          return;
          //After this it will run one of the two if else statements below
     }
     //1. Check if the page is a search page (lookup for jobs)
     else if(document.body.className.indexOf("PSSRCHPAGE") != -1){try{
          //Init Variables
          var nextNode = {};                                               //Cycles through later on and holds the current object     
          var index =  0;                                                     //Cycling index
          var term = getCurrentTerm();                                 //Gets the term
          var nodes = document.getElementsByTagName("a");   //Holds all the a-tags on the page, we look in this
             
          //Look for a link (a-tag) for the hyperlink of the correct term
          while (foundJobID == 0 && nodes[++index])
          {    //If we find the term in the text of an a-tag, we have found it!
               if(nodes[index].firstChild && term == nodes[index].firstChild.nodeValue){
                    //Grab the job Title
                    var jobTitle = nodes[index+1].firstChild.nodeValue;
                    
                     //If the next row has the same term and job title, then the first one is a template version
                    if(nodes[index+6] && nodes[index+6].firstChild && jobTitle == nodes[index+6].firstChild.nodeValue        //Check if the job titles are the same     
                    &&nodes[index+5] && term == nodes[index+5].firstChild.nodeValue)                                               //Then check if the terms are the same
                    {
                         foundJobID = nodes[index+4].firstChild.nodeValue;
                    }
                    //We only have one correct term job listed
                    else
                    {
                         foundJobID = nodes[index-1].firstChild.nodeValue;    //We set the previous a-tag's value which is the id and not the term                         
                    }
               }
          }
          //We found it, if we haven't then it is Jobmine's fault, we now can make a new tab
          if(foundJobID != 0){
               window.open("https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID=" + foundJobID);
          }else{
               alert("CANNOT FIND ID");
               return;
          }
          }catch(e){alert(e)}
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

/*
 * jQuery JavaScript Library v1.3.2
 */
(function(){var l=this,g,y=l.jQuery,p=l.$,o=l.jQuery=l.$=function(E,F){return new o.fn.init(E,F)},D=/^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,f=/^.[^:#\[\.,]*$/;o.fn=o.prototype={init:function(E,H){E=E||document;if(E.nodeType){this[0]=E;this.length=1;this.context=E;return this}if(typeof E==="string"){var G=D.exec(E);if(G&&(G[1]||!H)){if(G[1]){E=o.clean([G[1]],H)}else{var I=document.getElementById(G[3]);if(I&&I.id!=G[3]){return o().find(E)}var F=o(I||[]);F.context=document;F.selector=E;return F}}else{return o(H).find(E)}}else{if(o.isFunction(E)){return o(document).ready(E)}}if(E.selector&&E.context){this.selector=E.selector;this.context=E.context}return this.setArray(o.isArray(E)?E:o.makeArray(E))},selector:"",jquery:"1.3.2",size:function(){return this.length},get:function(E){return E===g?Array.prototype.slice.call(this):this[E]},pushStack:function(F,H,E){var G=o(F);G.prevObject=this;G.context=this.context;if(H==="find"){G.selector=this.selector+(this.selector?" ":"")+E}else{if(H){G.selector=this.selector+"."+H+"("+E+")"}}return G},setArray:function(E){this.length=0;Array.prototype.push.apply(this,E);return this},each:function(F,E){return o.each(this,F,E)},index:function(E){return o.inArray(E&&E.jquery?E[0]:E,this)},attr:function(F,H,G){var E=F;if(typeof F==="string"){if(H===g){return this[0]&&o[G||"attr"](this[0],F)}else{E={};E[F]=H}}return this.each(function(I){for(F in E){o.attr(G?this.style:this,F,o.prop(this,E[F],G,I,F))}})},css:function(E,F){if((E=="width"||E=="height")&&parseFloat(F)<0){F=g}return this.attr(E,F,"curCSS")},text:function(F){if(typeof F!=="object"&&F!=null){return this.empty().append((this[0]&&this[0].ownerDocument||document).createTextNode(F))}var E="";o.each(F||this,function(){o.each(this.childNodes,function(){if(this.nodeType!=8){E+=this.nodeType!=1?this.nodeValue:o.fn.text([this])}})});return E},wrapAll:function(E){if(this[0]){var F=o(E,this[0].ownerDocument).clone();if(this[0].parentNode){F.insertBefore(this[0])}F.map(function(){var G=this;while(G.firstChild){G=G.firstChild}return G}).append(this)}return this},wrapInner:function(E){return this.each(function(){o(this).contents().wrapAll(E)})},wrap:function(E){return this.each(function(){o(this).wrapAll(E)})},append:function(){return this.domManip(arguments,true,function(E){if(this.nodeType==1){this.appendChild(E)}})},prepend:function(){return this.domManip(arguments,true,function(E){if(this.nodeType==1){this.insertBefore(E,this.firstChild)}})},before:function(){return this.domManip(arguments,false,function(E){this.parentNode.insertBefore(E,this)})},after:function(){return this.domManip(arguments,false,function(E){this.parentNode.insertBefore(E,this.nextSibling)})},end:function(){return this.prevObject||o([])},push:[].push,sort:[].sort,splice:[].splice,find:function(E){if(this.length===1){var F=this.pushStack([],"find",E);F.length=0;o.find(E,this[0],F);return F}else{return this.pushStack(o.unique(o.map(this,function(G){return o.find(E,G)})),"find",E)}},clone:function(G){var E=this.map(function(){if(!o.support.noCloneEvent&&!o.isXMLDoc(this)){var I=this.outerHTML;if(!I){var J=this.ownerDocument.createElement("div");J.appendChild(this.cloneNode(true));I=J.innerHTML}return o.clean([I.replace(/ jQuery\d+="(?:\d+|null)"/g,"").replace(/^\s*/,"")])[0]}else{return this.cloneNode(true)}});if(G===true){var H=this.find("*").andSelf(),F=0;E.find("*").andSelf().each(function(){if(this.nodeName!==H[F].nodeName){return}var I=o.data(H[F],"events");for(var K in I){for(var J in I[K]){o.event.add(this,K,I[K][J],I[K][J].data)}}F++})}return E},filter:function(E){return this.pushStack(o.isFunction(E)&&o.grep(this,function(G,F){return E.call(G,F)})||o.multiFilter(E,o.grep(this,function(F){return F.nodeType===1})),"filter",E)},closest:function(E){var G=o.expr.match.POS.test(E)?o(E):null,F=0;return this.map(function(){var H=this;while(H&&H.ownerDocument){if(G?G.index(H)>-1:o(H).is(E)){o.data(H,"closest",F);return H}H=H.parentNode;F++}})},not:function(E){if(typeof E==="string"){if(f.test(E)){return this.pushStack(o.multiFilter(E,this,true),"not",E)}else{E=o.multiFilter(E,this)}}var F=E.length&&E[E.length-1]!==g&&!E.nodeType;return this.filter(function(){return F?o.inArray(this,E)<0:this!=E})},add:function(E){return this.pushStack(o.unique(o.merge(this.get(),typeof E==="string"?o(E):o.makeArray(E))))},is:function(E){return !!E&&o.multiFilter(E,this).length>0},hasClass:function(E){return !!E&&this.is("."+E)},val:function(K){if(K===g){var E=this[0];if(E){if(o.nodeName(E,"option")){return(E.attributes.value||{}).specified?E.value:E.text}if(o.nodeName(E,"select")){var I=E.selectedIndex,L=[],M=E.options,H=E.type=="select-one";if(I<0){return null}for(var F=H?I:0,J=H?I+1:M.length;F<J;F++){var G=M[F];if(G.selected){K=o(G).val();if(H){return K}L.push(K)}}return L}return(E.value||"").replace(/\r/g,"")}return g}if(typeof K==="number"){K+=""}return this.each(function(){if(this.nodeType!=1){return}if(o.isArray(K)&&/radio|checkbox/.test(this.type)){this.checked=(o.inArray(this.value,K)>=0||o.inArray(this.name,K)>=0)}else{if(o.nodeName(this,"select")){var N=o.makeArray(K);o("option",this).each(function(){this.selected=(o.inArray(this.value,N)>=0||o.inArray(this.text,N)>=0)});if(!N.length){this.selectedIndex=-1}}else{this.value=K}}})},html:function(E){return E===g?(this[0]?this[0].innerHTML.replace(/ jQuery\d+="(?:\d+|null)"/g,""):null):this.empty().append(E)},replaceWith:function(E){return this.after(E).remove()},eq:function(E){return this.slice(E,+E+1)},slice:function(){return this.pushStack(Array.prototype.slice.apply(this,arguments),"slice",Array.prototype.slice.call(arguments).join(","))},map:function(E){return this.pushStack(o.map(this,function(G,F){return E.call(G,F,G)}))},andSelf:function(){return this.add(this.prevObject)},domManip:function(J,M,L){if(this[0]){var I=(this[0].ownerDocument||this[0]).createDocumentFragment(),F=o.clean(J,(this[0].ownerDocument||this[0]),I),H=I.firstChild;if(H){for(var G=0,E=this.length;G<E;G++){L.call(K(this[G],H),this.length>1||G>0?I.cloneNode(true):I)}}if(F){o.each(F,z)}}return this;function K(N,O){return M&&o.nodeName(N,"table")&&o.nodeName(O,"tr")?(N.getElementsByTagName("tbody")[0]||N.appendChild(N.ownerDocument.createElement("tbody"))):N}}};o.fn.init.prototype=o.fn;function z(E,F){if(F.src){o.ajax({url:F.src,async:false,dataType:"script"})}else{o.globalEval(F.text||F.textContent||F.innerHTML||"")}if(F.parentNode){F.parentNode.removeChild(F)}}function e(){return +new Date}o.extend=o.fn.extend=function(){var J=arguments[0]||{},H=1,I=arguments.length,E=false,G;if(typeof J==="boolean"){E=J;J=arguments[1]||{};H=2}if(typeof J!=="object"&&!o.isFunction(J)){J={}}if(I==H){J=this;--H}for(;H<I;H++){if((G=arguments[H])!=null){for(var F in G){var K=J[F],L=G[F];if(J===L){continue}if(E&&L&&typeof L==="object"&&!L.nodeType){J[F]=o.extend(E,K||(L.length!=null?[]:{}),L)}else{if(L!==g){J[F]=L}}}}}return J};var b=/z-?index|font-?weight|opacity|zoom|line-?height/i,q=document.defaultView||{},s=Object.prototype.toString;o.extend({noConflict:function(E){l.$=p;if(E){l.jQuery=y}return o},isFunction:function(E){return s.call(E)==="[object Function]"},isArray:function(E){return s.call(E)==="[object Array]"},isXMLDoc:function(E){return E.nodeType===9&&E.documentElement.nodeName!=="HTML"||!!E.ownerDocument&&o.isXMLDoc(E.ownerDocument)},globalEval:function(G){if(G&&/\S/.test(G)){var F=document.getElementsByTagName("head")[0]||document.documentElement,E=document.createElement("script");E.type="text/javascript";if(o.support.scriptEval){E.appendChild(document.createTextNode(G))}else{E.text=G}F.insertBefore(E,F.firstChild);F.removeChild(E)}},nodeName:function(F,E){return F.nodeName&&F.nodeName.toUpperCase()==E.toUpperCase()},each:function(G,K,F){var E,H=0,I=G.length;if(F){if(I===g){for(E in G){if(K.apply(G[E],F)===false){break}}}else{for(;H<I;){if(K.apply(G[H++],F)===false){break}}}}else{if(I===g){for(E in G){if(K.call(G[E],E,G[E])===false){break}}}else{for(var J=G[0];H<I&&K.call(J,H,J)!==false;J=G[++H]){}}}return G},prop:function(H,I,G,F,E){if(o.isFunction(I)){I=I.call(H,F)}return typeof I==="number"&&G=="curCSS"&&!b.test(E)?I+"px":I},className:{add:function(E,F){o.each((F||"").split(/\s+/),function(G,H){if(E.nodeType==1&&!o.className.has(E.className,H)){E.className+=(E.className?" ":"")+H}})},remove:function(E,F){if(E.nodeType==1){E.className=F!==g?o.grep(E.className.split(/\s+/),function(G){return !o.className.has(F,G)}).join(" "):""}},has:function(F,E){return F&&o.inArray(E,(F.className||F).toString().split(/\s+/))>-1}},swap:function(H,G,I){var E={};for(var F in G){E[F]=H.style[F];H.style[F]=G[F]}I.call(H);for(var F in G){H.style[F]=E[F]}},css:function(H,F,J,E){if(F=="width"||F=="height"){var L,G={position:"absolute",visibility:"hidden",display:"block"},K=F=="width"?["Left","Right"]:["Top","Bottom"];function I(){L=F=="width"?H.offsetWidth:H.offsetHeight;if(E==="border"){return}o.each(K,function(){if(!E){L-=parseFloat(o.curCSS(H,"padding"+this,true))||0}if(E==="margin"){L+=parseFloat(o.curCSS(H,"margin"+this,true))||0}else{L-=parseFloat(o.curCSS(H,"border"+this+"Width",true))||0}})}if(H.offsetWidth!==0){I()}else{o.swap(H,G,I)}return Math.max(0,Math.round(L))}return o.curCSS(H,F,J)},curCSS:function(I,F,G){var L,E=I.style;if(F=="opacity"&&!o.support.opacity){L=o.attr(E,"opacity");return L==""?"1":L}if(F.match(/float/i)){F=w}if(!G&&E&&E[F]){L=E[F]}else{if(q.getComputedStyle){if(F.match(/float/i)){F="float"}F=F.replace(/([A-Z])/g,"-$1").toLowerCase();var M=q.getComputedStyle(I,null);if(M){L=M.getPropertyValue(F)}if(F=="opacity"&&L==""){L="1"}}else{if(I.currentStyle){var J=F.replace(/\-(\w)/g,function(N,O){return O.toUpperCase()});L=I.currentStyle[F]||I.currentStyle[J];if(!/^\d+(px)?$/i.test(L)&&/^\d/.test(L)){var H=E.left,K=I.runtimeStyle.left;I.runtimeStyle.left=I.currentStyle.left;E.left=L||0;L=E.pixelLeft+"px";E.left=H;I.runtimeStyle.left=K}}}}return L},clean:function(F,K,I){K=K||document;if(typeof K.createElement==="undefined"){K=K.ownerDocument||K[0]&&K[0].ownerDocument||document}if(!I&&F.length===1&&typeof F[0]==="string"){var H=/^<(\w+)\s*\/?>$/.exec(F[0]);if(H){return[K.createElement(H[1])]}}var G=[],E=[],L=K.createElement("div");o.each(F,function(P,S){if(typeof S==="number"){S+=""}if(!S){return}if(typeof S==="string"){S=S.replace(/(<(\w+)[^>]*?)\/>/g,function(U,V,T){return T.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i)?U:V+"></"+T+">"});var O=S.replace(/^\s+/,"").substring(0,10).toLowerCase();var Q=!O.indexOf("<opt")&&[1,"<select multiple='multiple'>","</select>"]||!O.indexOf("<leg")&&[1,"<fieldset>","</fieldset>"]||O.match(/^<(thead|tbody|tfoot|colg|cap)/)&&[1,"<table>","</table>"]||!O.indexOf("<tr")&&[2,"<table><tbody>","</tbody></table>"]||(!O.indexOf("<td")||!O.indexOf("<th"))&&[3,"<table><tbody><tr>","</tr></tbody></table>"]||!O.indexOf("<col")&&[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"]||!o.support.htmlSerialize&&[1,"div<div>","</div>"]||[0,"",""];L.innerHTML=Q[1]+S+Q[2];while(Q[0]--){L=L.lastChild}if(!o.support.tbody){var R=/<tbody/i.test(S),N=!O.indexOf("<table")&&!R?L.firstChild&&L.firstChild.childNodes:Q[1]=="<table>"&&!R?L.childNodes:[];for(var M=N.length-1;M>=0;--M){if(o.nodeName(N[M],"tbody")&&!N[M].childNodes.length){N[M].parentNode.removeChild(N[M])}}}if(!o.support.leadingWhitespace&&/^\s/.test(S)){L.insertBefore(K.createTextNode(S.match(/^\s*/)[0]),L.firstChild)}S=o.makeArray(L.childNodes)}if(S.nodeType){G.push(S)}else{G=o.merge(G,S)}});if(I){for(var J=0;G[J];J++){if(o.nodeName(G[J],"script")&&(!G[J].type||G[J].type.toLowerCase()==="text/javascript")){E.push(G[J].parentNode?G[J].parentNode.removeChild(G[J]):G[J])}else{if(G[J].nodeType===1){G.splice.apply(G,[J+1,0].concat(o.makeArray(G[J].getElementsByTagName("script"))))}I.appendChild(G[J])}}return E}return G},attr:function(J,G,K){if(!J||J.nodeType==3||J.nodeType==8){return g}var H=!o.isXMLDoc(J),L=K!==g;G=H&&o.props[G]||G;if(J.tagName){var F=/href|src|style/.test(G);if(G=="selected"&&J.parentNode){J.parentNode.selectedIndex}if(G in J&&H&&!F){if(L){if(G=="type"&&o.nodeName(J,"input")&&J.parentNode){throw"type property can't be changed"}J[G]=K}if(o.nodeName(J,"form")&&J.getAttributeNode(G)){return J.getAttributeNode(G).nodeValue}if(G=="tabIndex"){var I=J.getAttributeNode("tabIndex");return I&&I.specified?I.value:J.nodeName.match(/(button|input|object|select|textarea)/i)?0:J.nodeName.match(/^(a|area)$/i)&&J.href?0:g}return J[G]}if(!o.support.style&&H&&G=="style"){return o.attr(J.style,"cssText",K)}if(L){J.setAttribute(G,""+K)}var E=!o.support.hrefNormalized&&H&&F?J.getAttribute(G,2):J.getAttribute(G);return E===null?g:E}if(!o.support.opacity&&G=="opacity"){if(L){J.zoom=1;J.filter=(J.filter||"").replace(/alpha\([^)]*\)/,"")+(parseInt(K)+""=="NaN"?"":"alpha(opacity="+K*100+")")}return J.filter&&J.filter.indexOf("opacity=")>=0?(parseFloat(J.filter.match(/opacity=([^)]*)/)[1])/100)+"":""}G=G.replace(/-([a-z])/ig,function(M,N){return N.toUpperCase()});if(L){J[G]=K}return J[G]},trim:function(E){return(E||"").replace(/^\s+|\s+$/g,"")},makeArray:function(G){var E=[];if(G!=null){var F=G.length;if(F==null||typeof G==="string"||o.isFunction(G)||G.setInterval){E[0]=G}else{while(F){E[--F]=G[F]}}}return E},inArray:function(G,H){for(var E=0,F=H.length;E<F;E++){if(H[E]===G){return E}}return -1},merge:function(H,E){var F=0,G,I=H.length;if(!o.support.getAll){while((G=E[F++])!=null){if(G.nodeType!=8){H[I++]=G}}}else{while((G=E[F++])!=null){H[I++]=G}}return H},unique:function(K){var F=[],E={};try{for(var G=0,H=K.length;G<H;G++){var J=o.data(K[G]);if(!E[J]){E[J]=true;F.push(K[G])}}}catch(I){F=K}return F},grep:function(F,J,E){var G=[];for(var H=0,I=F.length;H<I;H++){if(!E!=!J(F[H],H)){G.push(F[H])}}return G},map:function(E,J){var F=[];for(var G=0,H=E.length;G<H;G++){var I=J(E[G],G);if(I!=null){F[F.length]=I}}return F.concat.apply([],F)}});var C=navigator.userAgent.toLowerCase();o.browser={version:(C.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)||[0,"0"])[1],safari:/webkit/.test(C),opera:/opera/.test(C),msie:/msie/.test(C)&&!/opera/.test(C),mozilla:/mozilla/.test(C)&&!/(compatible|webkit)/.test(C)};o.each({parent:function(E){return E.parentNode},parents:function(E){return o.dir(E,"parentNode")},next:function(E){return o.nth(E,2,"nextSibling")},prev:function(E){return o.nth(E,2,"previousSibling")},nextAll:function(E){return o.dir(E,"nextSibling")},prevAll:function(E){return o.dir(E,"previousSibling")},siblings:function(E){return o.sibling(E.parentNode.firstChild,E)},children:function(E){return o.sibling(E.firstChild)},contents:function(E){return o.nodeName(E,"iframe")?E.contentDocument||E.contentWindow.document:o.makeArray(E.childNodes)}},function(E,F){o.fn[E]=function(G){var H=o.map(this,F);if(G&&typeof G=="string"){H=o.multiFilter(G,H)}return this.pushStack(o.unique(H),E,G)}});o.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(E,F){o.fn[E]=function(G){var J=[],L=o(G);for(var K=0,H=L.length;K<H;K++){var I=(K>0?this.clone(true):this).get();o.fn[F].apply(o(L[K]),I);J=J.concat(I)}return this.pushStack(J,E,G)}});o.each({removeAttr:function(E){o.attr(this,E,"");if(this.nodeType==1){this.removeAttribute(E)}},addClass:function(E){o.className.add(this,E)},removeClass:function(E){o.className.remove(this,E)},toggleClass:function(F,E){if(typeof E!=="boolean"){E=!o.className.has(this,F)}o.className[E?"add":"remove"](this,F)},remove:function(E){if(!E||o.filter(E,[this]).length){o("*",this).add([this]).each(function(){o.event.remove(this);o.removeData(this)});if(this.parentNode){this.parentNode.removeChild(this)}}},empty:function(){o(this).children().remove();while(this.firstChild){this.removeChild(this.firstChild)}}},function(E,F){o.fn[E]=function(){return this.each(F,arguments)}});function j(E,F){return E[0]&&parseInt(o.curCSS(E[0],F,true),10)||0}var h="jQuery"+e(),v=0,A={};o.extend({cache:{},data:function(F,E,G){F=F==l?A:F;var H=F[h];if(!H){H=F[h]=++v}if(E&&!o.cache[H]){o.cache[H]={}}if(G!==g){o.cache[H][E]=G}return E?o.cache[H][E]:H},removeData:function(F,E){F=F==l?A:F;var H=F[h];if(E){if(o.cache[H]){delete o.cache[H][E];E="";for(E in o.cache[H]){break}if(!E){o.removeData(F)}}}else{try{delete F[h]}catch(G){if(F.removeAttribute){F.removeAttribute(h)}}delete o.cache[H]}},queue:function(F,E,H){if(F){E=(E||"fx")+"queue";var G=o.data(F,E);if(!G||o.isArray(H)){G=o.data(F,E,o.makeArray(H))}else{if(H){G.push(H)}}}return G},dequeue:function(H,G){var E=o.queue(H,G),F=E.shift();if(!G||G==="fx"){F=E[0]}if(F!==g){F.call(H)}}});o.fn.extend({data:function(E,G){var H=E.split(".");H[1]=H[1]?"."+H[1]:"";if(G===g){var F=this.triggerHandler("getData"+H[1]+"!",[H[0]]);if(F===g&&this.length){F=o.data(this[0],E)}return F===g&&H[1]?this.data(H[0]):F}else{return this.trigger("setData"+H[1]+"!",[H[0],G]).each(function(){o.data(this,E,G)})}},removeData:function(E){return this.each(function(){o.removeData(this,E)})},queue:function(E,F){if(typeof E!=="string"){F=E;E="fx"}if(F===g){return o.queue(this[0],E)}return this.each(function(){var G=o.queue(this,E,F);if(E=="fx"&&G.length==1){G[0].call(this)}})},dequeue:function(E){return this.each(function(){o.dequeue(this,E)})}});

/*
 * Sizzle CSS Selector Engine - v0.9.3
 */
(function(){var R=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,L=0,H=Object.prototype.toString;var F=function(Y,U,ab,ac){ab=ab||[];U=U||document;if(U.nodeType!==1&&U.nodeType!==9){return[]}if(!Y||typeof Y!=="string"){return ab}var Z=[],W,af,ai,T,ad,V,X=true;R.lastIndex=0;while((W=R.exec(Y))!==null){Z.push(W[1]);if(W[2]){V=RegExp.rightContext;break}}if(Z.length>1&&M.exec(Y)){if(Z.length===2&&I.relative[Z[0]]){af=J(Z[0]+Z[1],U)}else{af=I.relative[Z[0]]?[U]:F(Z.shift(),U);while(Z.length){Y=Z.shift();if(I.relative[Y]){Y+=Z.shift()}af=J(Y,af)}}}else{var ae=ac?{expr:Z.pop(),set:E(ac)}:F.find(Z.pop(),Z.length===1&&U.parentNode?U.parentNode:U,Q(U));af=F.filter(ae.expr,ae.set);if(Z.length>0){ai=E(af)}else{X=false}while(Z.length){var ah=Z.pop(),ag=ah;if(!I.relative[ah]){ah=""}else{ag=Z.pop()}if(ag==null){ag=U}I.relative[ah](ai,ag,Q(U))}}if(!ai){ai=af}if(!ai){throw"Syntax error, unrecognized expression: "+(ah||Y)}if(H.call(ai)==="[object Array]"){if(!X){ab.push.apply(ab,ai)}else{if(U.nodeType===1){for(var aa=0;ai[aa]!=null;aa++){if(ai[aa]&&(ai[aa]===true||ai[aa].nodeType===1&&K(U,ai[aa]))){ab.push(af[aa])}}}else{for(var aa=0;ai[aa]!=null;aa++){if(ai[aa]&&ai[aa].nodeType===1){ab.push(af[aa])}}}}}else{E(ai,ab)}if(V){F(V,U,ab,ac);if(G){hasDuplicate=false;ab.sort(G);if(hasDuplicate){for(var aa=1;aa<ab.length;aa++){if(ab[aa]===ab[aa-1]){ab.splice(aa--,1)}}}}}return ab};F.matches=function(T,U){return F(T,null,null,U)};F.find=function(aa,T,ab){var Z,X;if(!aa){return[]}for(var W=0,V=I.order.length;W<V;W++){var Y=I.order[W],X;if((X=I.match[Y].exec(aa))){var U=RegExp.leftContext;if(U.substr(U.length-1)!=="\\"){X[1]=(X[1]||"").replace(/\\/g,"");Z=I.find[Y](X,T,ab);if(Z!=null){aa=aa.replace(I.match[Y],"");break}}}}if(!Z){Z=T.getElementsByTagName("*")}return{set:Z,expr:aa}};F.filter=function(ad,ac,ag,W){var V=ad,ai=[],aa=ac,Y,T,Z=ac&&ac[0]&&Q(ac[0]);while(ad&&ac.length){for(var ab in I.filter){if((Y=I.match[ab].exec(ad))!=null){var U=I.filter[ab],ah,af;T=false;if(aa==ai){ai=[]}if(I.preFilter[ab]){Y=I.preFilter[ab](Y,aa,ag,ai,W,Z);if(!Y){T=ah=true}else{if(Y===true){continue}}}if(Y){for(var X=0;(af=aa[X])!=null;X++){if(af){ah=U(af,Y,X,aa);var ae=W^!!ah;if(ag&&ah!=null){if(ae){T=true}else{aa[X]=false}}else{if(ae){ai.push(af);T=true}}}}}if(ah!==g){if(!ag){aa=ai}ad=ad.replace(I.match[ab],"");if(!T){return[]}break}}}if(ad==V){if(T==null){throw"Syntax error, unrecognized expression: "+ad}else{break}}V=ad}return aa};var I=F.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(T){return T.getAttribute("href")}},relative:{"+":function(aa,T,Z){var X=typeof T==="string",ab=X&&!/\W/.test(T),Y=X&&!ab;if(ab&&!Z){T=T.toUpperCase()}for(var W=0,V=aa.length,U;W<V;W++){if((U=aa[W])){while((U=U.previousSibling)&&U.nodeType!==1){}aa[W]=Y||U&&U.nodeName===T?U||false:U===T}}if(Y){F.filter(T,aa,true)}},">":function(Z,U,aa){var X=typeof U==="string";if(X&&!/\W/.test(U)){U=aa?U:U.toUpperCase();for(var V=0,T=Z.length;V<T;V++){var Y=Z[V];if(Y){var W=Y.parentNode;Z[V]=W.nodeName===U?W:false}}}else{for(var V=0,T=Z.length;V<T;V++){var Y=Z[V];if(Y){Z[V]=X?Y.parentNode:Y.parentNode===U}}if(X){F.filter(U,Z,true)}}},"":function(W,U,Y){var V=L++,T=S;if(!U.match(/\W/)){var X=U=Y?U:U.toUpperCase();T=P}T("parentNode",U,V,W,X,Y)},"~":function(W,U,Y){var V=L++,T=S;if(typeof U==="string"&&!U.match(/\W/)){var X=U=Y?U:U.toUpperCase();T=P}T("previousSibling",U,V,W,X,Y)}},find:{ID:function(U,V,W){if(typeof V.getElementById!=="undefined"&&!W){var T=V.getElementById(U[1]);return T?[T]:[]}},NAME:function(V,Y,Z){if(typeof Y.getElementsByName!=="undefined"){var U=[],X=Y.getElementsByName(V[1]);for(var W=0,T=X.length;W<T;W++){if(X[W].getAttribute("name")===V[1]){U.push(X[W])}}return U.length===0?null:U}},TAG:function(T,U){return U.getElementsByTagName(T[1])}},preFilter:{CLASS:function(W,U,V,T,Z,aa){W=" "+W[1].replace(/\\/g,"")+" ";if(aa){return W}for(var X=0,Y;(Y=U[X])!=null;X++){if(Y){if(Z^(Y.className&&(" "+Y.className+" ").indexOf(W)>=0)){if(!V){T.push(Y)}}else{if(V){U[X]=false}}}}return false},ID:function(T){return T[1].replace(/\\/g,"")},TAG:function(U,T){for(var V=0;T[V]===false;V++){}return T[V]&&Q(T[V])?U[1]:U[1].toUpperCase()},CHILD:function(T){if(T[1]=="nth"){var U=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(T[2]=="even"&&"2n"||T[2]=="odd"&&"2n+1"||!/\D/.test(T[2])&&"0n+"+T[2]||T[2]);T[2]=(U[1]+(U[2]||1))-0;T[3]=U[3]-0}T[0]=L++;return T},ATTR:function(X,U,V,T,Y,Z){var W=X[1].replace(/\\/g,"");if(!Z&&I.attrMap[W]){X[1]=I.attrMap[W]}if(X[2]==="~="){X[4]=" "+X[4]+" "}return X},PSEUDO:function(X,U,V,T,Y){if(X[1]==="not"){if(X[3].match(R).length>1||/^\w/.test(X[3])){X[3]=F(X[3],null,null,U)}else{var W=F.filter(X[3],U,V,true^Y);if(!V){T.push.apply(T,W)}return false}}else{if(I.match.POS.test(X[0])||I.match.CHILD.test(X[0])){return true}}return X},POS:function(T){T.unshift(true);return T}},filters:{enabled:function(T){return T.disabled===false&&T.type!=="hidden"},disabled:function(T){return T.disabled===true},checked:function(T){return T.checked===true},selected:function(T){T.parentNode.selectedIndex;return T.selected===true},parent:function(T){return !!T.firstChild},empty:function(T){return !T.firstChild},has:function(V,U,T){return !!F(T[3],V).length},header:function(T){return/h\d/i.test(T.nodeName)},text:function(T){return"text"===T.type},radio:function(T){return"radio"===T.type},checkbox:function(T){return"checkbox"===T.type},file:function(T){return"file"===T.type},password:function(T){return"password"===T.type},submit:function(T){return"submit"===T.type},image:function(T){return"image"===T.type},reset:function(T){return"reset"===T.type},button:function(T){return"button"===T.type||T.nodeName.toUpperCase()==="BUTTON"},input:function(T){return/input|select|textarea|button/i.test(T.nodeName)}},setFilters:{first:function(U,T){return T===0},last:function(V,U,T,W){return U===W.length-1},even:function(U,T){return T%2===0},odd:function(U,T){return T%2===1},lt:function(V,U,T){return U<T[3]-0},gt:function(V,U,T){return U>T[3]-0},nth:function(V,U,T){return T[3]-0==U},eq:function(V,U,T){return T[3]-0==U}},filter:{PSEUDO:function(Z,V,W,aa){var U=V[1],X=I.filters[U];if(X){return X(Z,W,V,aa)}else{if(U==="contains"){return(Z.textContent||Z.innerText||"").indexOf(V[3])>=0}else{if(U==="not"){var Y=V[3];for(var W=0,T=Y.length;W<T;W++){if(Y[W]===Z){return false}}return true}}}},CHILD:function(T,W){var Z=W[1],U=T;switch(Z){case"only":case"first":while(U=U.previousSibling){if(U.nodeType===1){return false}}if(Z=="first"){return true}U=T;case"last":while(U=U.nextSibling){if(U.nodeType===1){return false}}return true;case"nth":var V=W[2],ac=W[3];if(V==1&&ac==0){return true}var Y=W[0],ab=T.parentNode;if(ab&&(ab.sizcache!==Y||!T.nodeIndex)){var X=0;for(U=ab.firstChild;U;U=U.nextSibling){if(U.nodeType===1){U.nodeIndex=++X}}ab.sizcache=Y}var aa=T.nodeIndex-ac;if(V==0){return aa==0}else{return(aa%V==0&&aa/V>=0)}}},ID:function(U,T){return U.nodeType===1&&U.getAttribute("id")===T},TAG:function(U,T){return(T==="*"&&U.nodeType===1)||U.nodeName===T},CLASS:function(U,T){return(" "+(U.className||U.getAttribute("class"))+" ").indexOf(T)>-1},ATTR:function(Y,W){var V=W[1],T=I.attrHandle[V]?I.attrHandle[V](Y):Y[V]!=null?Y[V]:Y.getAttribute(V),Z=T+"",X=W[2],U=W[4];return T==null?X==="!=":X==="="?Z===U:X==="*="?Z.indexOf(U)>=0:X==="~="?(" "+Z+" ").indexOf(U)>=0:!U?Z&&T!==false:X==="!="?Z!=U:X==="^="?Z.indexOf(U)===0:X==="$="?Z.substr(Z.length-U.length)===U:X==="|="?Z===U||Z.substr(0,U.length+1)===U+"-":false},POS:function(X,U,V,Y){var T=U[2],W=I.setFilters[T];if(W){return W(X,V,U,Y)}}}};var M=I.match.POS;for(var O in I.match){I.match[O]=RegExp(I.match[O].source+/(?![^\[]*\])(?![^\(]*\))/.source)}var E=function(U,T){U=Array.prototype.slice.call(U);if(T){T.push.apply(T,U);return T}return U};try{Array.prototype.slice.call(document.documentElement.childNodes)}catch(N){E=function(X,W){var U=W||[];if(H.call(X)==="[object Array]"){Array.prototype.push.apply(U,X)}else{if(typeof X.length==="number"){for(var V=0,T=X.length;V<T;V++){U.push(X[V])}}else{for(var V=0;X[V];V++){U.push(X[V])}}}return U}}var G;if(document.documentElement.compareDocumentPosition){G=function(U,T){var V=U.compareDocumentPosition(T)&4?-1:U===T?0:1;if(V===0){hasDuplicate=true}return V}}else{if("sourceIndex" in document.documentElement){G=function(U,T){var V=U.sourceIndex-T.sourceIndex;if(V===0){hasDuplicate=true}return V}}else{if(document.createRange){G=function(W,U){var V=W.ownerDocument.createRange(),T=U.ownerDocument.createRange();V.selectNode(W);V.collapse(true);T.selectNode(U);T.collapse(true);var X=V.compareBoundaryPoints(Range.START_TO_END,T);if(X===0){hasDuplicate=true}return X}}}}(function(){var U=document.createElement("form"),V="script"+(new Date).getTime();U.innerHTML="<input name='"+V+"'/>";var T=document.documentElement;T.insertBefore(U,T.firstChild);if(!!document.getElementById(V)){I.find.ID=function(X,Y,Z){if(typeof Y.getElementById!=="undefined"&&!Z){var W=Y.getElementById(X[1]);return W?W.id===X[1]||typeof W.getAttributeNode!=="undefined"&&W.getAttributeNode("id").nodeValue===X[1]?[W]:g:[]}};I.filter.ID=function(Y,W){var X=typeof Y.getAttributeNode!=="undefined"&&Y.getAttributeNode("id");return Y.nodeType===1&&X&&X.nodeValue===W}}T.removeChild(U)})();(function(){var T=document.createElement("div");T.appendChild(document.createComment(""));if(T.getElementsByTagName("*").length>0){I.find.TAG=function(U,Y){var X=Y.getElementsByTagName(U[1]);if(U[1]==="*"){var W=[];for(var V=0;X[V];V++){if(X[V].nodeType===1){W.push(X[V])}}X=W}return X}}T.innerHTML="<a href='#'></a>";if(T.firstChild&&typeof T.firstChild.getAttribute!=="undefined"&&T.firstChild.getAttribute("href")!=="#"){I.attrHandle.href=function(U){return U.getAttribute("href",2)}}})();if(document.querySelectorAll){(function(){var T=F,U=document.createElement("div");U.innerHTML="<p class='TEST'></p>";if(U.querySelectorAll&&U.querySelectorAll(".TEST").length===0){return}F=function(Y,X,V,W){X=X||document;if(!W&&X.nodeType===9&&!Q(X)){try{return E(X.querySelectorAll(Y),V)}catch(Z){}}return T(Y,X,V,W)};F.find=T.find;F.filter=T.filter;F.selectors=T.selectors;F.matches=T.matches})()}if(document.getElementsByClassName&&document.documentElement.getElementsByClassName){(function(){var T=document.createElement("div");T.innerHTML="<div class='test e'></div><div class='test'></div>";if(T.getElementsByClassName("e").length===0){return}T.lastChild.className="e";if(T.getElementsByClassName("e").length===1){return}I.order.splice(1,0,"CLASS");I.find.CLASS=function(U,V,W){if(typeof V.getElementsByClassName!=="undefined"&&!W){return V.getElementsByClassName(U[1])}}})()}function P(U,Z,Y,ad,aa,ac){var ab=U=="previousSibling"&&!ac;for(var W=0,V=ad.length;W<V;W++){var T=ad[W];if(T){if(ab&&T.nodeType===1){T.sizcache=Y;T.sizset=W}T=T[U];var X=false;while(T){if(T.sizcache===Y){X=ad[T.sizset];break}if(T.nodeType===1&&!ac){T.sizcache=Y;T.sizset=W}if(T.nodeName===Z){X=T;break}T=T[U]}ad[W]=X}}}function S(U,Z,Y,ad,aa,ac){var ab=U=="previousSibling"&&!ac;for(var W=0,V=ad.length;W<V;W++){var T=ad[W];if(T){if(ab&&T.nodeType===1){T.sizcache=Y;T.sizset=W}T=T[U];var X=false;while(T){if(T.sizcache===Y){X=ad[T.sizset];break}if(T.nodeType===1){if(!ac){T.sizcache=Y;T.sizset=W}if(typeof Z!=="string"){if(T===Z){X=true;break}}else{if(F.filter(Z,[T]).length>0){X=T;break}}}T=T[U]}ad[W]=X}}}var K=document.compareDocumentPosition?function(U,T){return U.compareDocumentPosition(T)&16}:function(U,T){return U!==T&&(U.contains?U.contains(T):true)};var Q=function(T){return T.nodeType===9&&T.documentElement.nodeName!=="HTML"||!!T.ownerDocument&&Q(T.ownerDocument)};var J=function(T,aa){var W=[],X="",Y,V=aa.nodeType?[aa]:aa;while((Y=I.match.PSEUDO.exec(T))){X+=Y[0];T=T.replace(I.match.PSEUDO,"")}T=I.relative[T]?T+"*":T;for(var Z=0,U=V.length;Z<U;Z++){F(T,V[Z],W)}return F.filter(X,W)};o.find=F;o.filter=F.filter;o.expr=F.selectors;o.expr[":"]=o.expr.filters;F.selectors.filters.hidden=function(T){return T.offsetWidth===0||T.offsetHeight===0};F.selectors.filters.visible=function(T){return T.offsetWidth>0||T.offsetHeight>0};F.selectors.filters.animated=function(T){return o.grep(o.timers,function(U){return T===U.elem}).length};o.multiFilter=function(V,T,U){if(U){V=":not("+V+")"}return F.matches(V,T)};o.dir=function(V,U){var T=[],W=V[U];while(W&&W!=document){if(W.nodeType==1){T.push(W)}W=W[U]}return T};o.nth=function(X,T,V,W){T=T||1;var U=0;for(;X;X=X[V]){if(X.nodeType==1&&++U==T){break}}return X};o.sibling=function(V,U){var T=[];for(;V;V=V.nextSibling){if(V.nodeType==1&&V!=U){T.push(V)}}return T};return;l.Sizzle=F})();o.event={add:function(I,F,H,K){if(I.nodeType==3||I.nodeType==8){return}if(I.setInterval&&I!=l){I=l}if(!H.guid){H.guid=this.guid++}if(K!==g){var G=H;H=this.proxy(G);H.data=K}var E=o.data(I,"events")||o.data(I,"events",{}),J=o.data(I,"handle")||o.data(I,"handle",function(){return typeof o!=="undefined"&&!o.event.triggered?o.event.handle.apply(arguments.callee.elem,arguments):g});J.elem=I;o.each(F.split(/\s+/),function(M,N){var O=N.split(".");N=O.shift();H.type=O.slice().sort().join(".");var L=E[N];if(o.event.specialAll[N]){o.event.specialAll[N].setup.call(I,K,O)}if(!L){L=E[N]={};if(!o.event.special[N]||o.event.special[N].setup.call(I,K,O)===false){if(I.addEventListener){I.addEventListener(N,J,false)}else{if(I.attachEvent){I.attachEvent("on"+N,J)}}}}L[H.guid]=H;o.event.global[N]=true});I=null},guid:1,global:{},remove:function(K,H,J){if(K.nodeType==3||K.nodeType==8){return}var G=o.data(K,"events"),F,E;if(G){if(H===g||(typeof H==="string"&&H.charAt(0)==".")){for(var I in G){this.remove(K,I+(H||""))}}else{if(H.type){J=H.handler;H=H.type}o.each(H.split(/\s+/),function(M,O){var Q=O.split(".");O=Q.shift();var N=RegExp("(^|\\.)"+Q.slice().sort().join(".*\\.")+"(\\.|$)");if(G[O]){if(J){delete G[O][J.guid]}else{for(var P in G[O]){if(N.test(G[O][P].type)){delete G[O][P]}}}if(o.event.specialAll[O]){o.event.specialAll[O].teardown.call(K,Q)}for(F in G[O]){break}if(!F){if(!o.event.special[O]||o.event.special[O].teardown.call(K,Q)===false){if(K.removeEventListener){K.removeEventListener(O,o.data(K,"handle"),false)}else{if(K.detachEvent){K.detachEvent("on"+O,o.data(K,"handle"))}}}F=null;delete G[O]}}})}for(F in G){break}if(!F){var L=o.data(K,"handle");if(L){L.elem=null}o.removeData(K,"events");o.removeData(K,"handle")}}},trigger:function(I,K,H,E){var G=I.type||I;if(!E){I=typeof I==="object"?I[h]?I:o.extend(o.Event(G),I):o.Event(G);if(G.indexOf("!")>=0){I.type=G=G.slice(0,-1);I.exclusive=true}if(!H){I.stopPropagation();if(this.global[G]){o.each(o.cache,function(){if(this.events&&this.events[G]){o.event.trigger(I,K,this.handle.elem)}})}}if(!H||H.nodeType==3||H.nodeType==8){return g}I.result=g;I.target=H;K=o.makeArray(K);K.unshift(I)}I.currentTarget=H;var J=o.data(H,"handle");if(J){J.apply(H,K)}if((!H[G]||(o.nodeName(H,"a")&&G=="click"))&&H["on"+G]&&H["on"+G].apply(H,K)===false){I.result=false}if(!E&&H[G]&&!I.isDefaultPrevented()&&!(o.nodeName(H,"a")&&G=="click")){this.triggered=true;try{H[G]()}catch(L){}}this.triggered=false;if(!I.isPropagationStopped()){var F=H.parentNode||H.ownerDocument;if(F){o.event.trigger(I,K,F,true)}}},handle:function(K){var J,E;K=arguments[0]=o.event.fix(K||l.event);K.currentTarget=this;var L=K.type.split(".");K.type=L.shift();J=!L.length&&!K.exclusive;var I=RegExp("(^|\\.)"+L.slice().sort().join(".*\\.")+"(\\.|$)");E=(o.data(this,"events")||{})[K.type];for(var G in E){var H=E[G];if(J||I.test(H.type)){K.handler=H;K.data=H.data;var F=H.apply(this,arguments);if(F!==g){K.result=F;if(F===false){K.preventDefault();K.stopPropagation()}}if(K.isImmediatePropagationStopped()){break}}}},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),fix:function(H){if(H[h]){return H}var F=H;H=o.Event(F);for(var G=this.props.length,J;G;){J=this.props[--G];H[J]=F[J]}if(!H.target){H.target=H.srcElement||document}if(H.target.nodeType==3){H.target=H.target.parentNode}if(!H.relatedTarget&&H.fromElement){H.relatedTarget=H.fromElement==H.target?H.toElement:H.fromElement}if(H.pageX==null&&H.clientX!=null){var I=document.documentElement,E=document.body;H.pageX=H.clientX+(I&&I.scrollLeft||E&&E.scrollLeft||0)-(I.clientLeft||0);H.pageY=H.clientY+(I&&I.scrollTop||E&&E.scrollTop||0)-(I.clientTop||0)}if(!H.which&&((H.charCode||H.charCode===0)?H.charCode:H.keyCode)){H.which=H.charCode||H.keyCode}if(!H.metaKey&&H.ctrlKey){H.metaKey=H.ctrlKey}if(!H.which&&H.button){H.which=(H.button&1?1:(H.button&2?3:(H.button&4?2:0)))}return H},proxy:function(F,E){E=E||function(){return F.apply(this,arguments)};E.guid=F.guid=F.guid||E.guid||this.guid++;return E},special:{ready:{setup:B,teardown:function(){}}},specialAll:{live:{setup:function(E,F){o.event.add(this,F[0],c)},teardown:function(G){if(G.length){var E=0,F=RegExp("(^|\\.)"+G[0]+"(\\.|$)");o.each((o.data(this,"events").live||{}),function(){if(F.test(this.type)){E++}});if(E<1){o.event.remove(this,G[0],c)}}}}}};o.Event=function(E){if(!this.preventDefault){return new o.Event(E)}if(E&&E.type){this.originalEvent=E;this.type=E.type}else{this.type=E}this.timeStamp=e();this[h]=true};function k(){return false}function u(){return true}o.Event.prototype={preventDefault:function(){this.isDefaultPrevented=u;var E=this.originalEvent;if(!E){return}if(E.preventDefault){E.preventDefault()}E.returnValue=false},stopPropagation:function(){this.isPropagationStopped=u;var E=this.originalEvent;if(!E){return}if(E.stopPropagation){E.stopPropagation()}E.cancelBubble=true},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=u;this.stopPropagation()},isDefaultPrevented:k,isPropagationStopped:k,isImmediatePropagationStopped:k};var a=function(F){var E=F.relatedTarget;while(E&&E!=this){try{E=E.parentNode}catch(G){E=this}}if(E!=this){F.type=F.data;o.event.handle.apply(this,arguments)}};o.each({mouseover:"mouseenter",mouseout:"mouseleave"},function(F,E){o.event.special[E]={setup:function(){o.event.add(this,F,a,E)},teardown:function(){o.event.remove(this,F,a)}}});o.fn.extend({bind:function(F,G,E){return F=="unload"?this.one(F,G,E):this.each(function(){o.event.add(this,F,E||G,E&&G)})},one:function(G,H,F){var E=o.event.proxy(F||H,function(I){o(this).unbind(I,E);return(F||H).apply(this,arguments)});return this.each(function(){o.event.add(this,G,E,F&&H)})},unbind:function(F,E){return this.each(function(){o.event.remove(this,F,E)})},trigger:function(E,F){return this.each(function(){o.event.trigger(E,F,this)})},triggerHandler:function(E,G){if(this[0]){var F=o.Event(E);F.preventDefault();F.stopPropagation();o.event.trigger(F,G,this[0]);return F.result}},toggle:function(G){var E=arguments,F=1;while(F<E.length){o.event.proxy(G,E[F++])}return this.click(o.event.proxy(G,function(H){this.lastToggle=(this.lastToggle||0)%F;H.preventDefault();return E[this.lastToggle++].apply(this,arguments)||false}))},hover:function(E,F){return this.mouseenter(E).mouseleave(F)},ready:function(E){B();if(o.isReady){E.call(document,o)}else{o.readyList.push(E)}return this},live:function(G,F){var E=o.event.proxy(F);E.guid+=this.selector+G;o(document).bind(i(G,this.selector),this.selector,E);return this},die:function(F,E){o(document).unbind(i(F,this.selector),E?{guid:E.guid+this.selector+F}:null);return this}});function c(H){var E=RegExp("(^|\\.)"+H.type+"(\\.|$)"),G=true,F=[];o.each(o.data(this,"events").live||[],function(I,J){if(E.test(J.type)){var K=o(H.target).closest(J.data)[0];if(K){F.push({elem:K,fn:J})}}});F.sort(function(J,I){return o.data(J.elem,"closest")-o.data(I.elem,"closest")});o.each(F,function(){if(this.fn.call(this.elem,H,this.fn.data)===false){return(G=false)}});return G}function i(F,E){return["live",F,E.replace(/\./g,"`").replace(/ /g,"|")].join(".")}o.extend({isReady:false,readyList:[],ready:function(){if(!o.isReady){o.isReady=true;if(o.readyList){o.each(o.readyList,function(){this.call(document,o)});o.readyList=null}o(document).triggerHandler("ready")}}});var x=false;function B(){if(x){return}x=true;if(document.addEventListener){document.addEventListener("DOMContentLoaded",function(){document.removeEventListener("DOMContentLoaded",arguments.callee,false);o.ready()},false)}else{if(document.attachEvent){document.attachEvent("onreadystatechange",function(){if(document.readyState==="complete"){document.detachEvent("onreadystatechange",arguments.callee);o.ready()}});if(document.documentElement.doScroll&&l==l.top){(function(){if(o.isReady){return}try{document.documentElement.doScroll("left")}catch(E){setTimeout(arguments.callee,0);return}o.ready()})()}}}o.event.add(l,"load",o.ready)}o.each(("blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave,change,select,submit,keydown,keypress,keyup,error").split(","),function(F,E){o.fn[E]=function(G){return G?this.bind(E,G):this.trigger(E)}});o(l).bind("unload",function(){for(var E in o.cache){if(E!=1&&o.cache[E].handle){o.event.remove(o.cache[E].handle.elem)}}});(function(){o.support={};var F=document.documentElement,G=document.createElement("script"),K=document.createElement("div"),J="script"+(new Date).getTime();K.style.display="none";K.innerHTML='   <link/><table></table><a href="/a" style="color:red;float:left;opacity:.5;">a</a><select><option>text</option></select><object><param/></object>';var H=K.getElementsByTagName("*"),E=K.getElementsByTagName("a")[0];if(!H||!H.length||!E){return}o.support={leadingWhitespace:K.firstChild.nodeType==3,tbody:!K.getElementsByTagName("tbody").length,objectAll:!!K.getElementsByTagName("object")[0].getElementsByTagName("*").length,htmlSerialize:!!K.getElementsByTagName("link").length,style:/red/.test(E.getAttribute("style")),hrefNormalized:E.getAttribute("href")==="/a",opacity:E.style.opacity==="0.5",cssFloat:!!E.style.cssFloat,scriptEval:false,noCloneEvent:true,boxModel:null};G.type="text/javascript";try{G.appendChild(document.createTextNode("window."+J+"=1;"))}catch(I){}F.insertBefore(G,F.firstChild);if(l[J]){o.support.scriptEval=true;delete l[J]}F.removeChild(G);if(K.attachEvent&&K.fireEvent){K.attachEvent("onclick",function(){o.support.noCloneEvent=false;K.detachEvent("onclick",arguments.callee)});K.cloneNode(true).fireEvent("onclick")}o(function(){var L=document.createElement("div");L.style.width=L.style.paddingLeft="1px";document.body.appendChild(L);o.boxModel=o.support.boxModel=L.offsetWidth===2;document.body.removeChild(L).style.display="none"})})();var w=o.support.cssFloat?"cssFloat":"styleFloat";o.props={"for":"htmlFor","class":"className","float":w,cssFloat:w,styleFloat:w,readonly:"readOnly",maxlength:"maxLength",cellspacing:"cellSpacing",rowspan:"rowSpan",tabindex:"tabIndex"};o.fn.extend({_load:o.fn.load,load:function(G,J,K){if(typeof G!=="string"){return this._load(G)}var I=G.indexOf(" ");if(I>=0){var E=G.slice(I,G.length);G=G.slice(0,I)}var H="GET";if(J){if(o.isFunction(J)){K=J;J=null}else{if(typeof J==="object"){J=o.param(J);H="POST"}}}var F=this;o.ajax({url:G,type:H,dataType:"html",data:J,complete:function(M,L){if(L=="success"||L=="notmodified"){F.html(E?o("<div/>").append(M.responseText.replace(/<script(.|\s)*?\/script>/g,"")).find(E):M.responseText)}if(K){F.each(K,[M.responseText,L,M])}}});return this},serialize:function(){return o.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?o.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||/select|textarea/i.test(this.nodeName)||/text|hidden|password|search/i.test(this.type))}).map(function(E,F){var G=o(this).val();return G==null?null:o.isArray(G)?o.map(G,function(I,H){return{name:F.name,value:I}}):{name:F.name,value:G}}).get()}});o.each("ajaxStart,ajaxStop,ajaxComplete,ajaxError,ajaxSuccess,ajaxSend".split(","),function(E,F){o.fn[F]=function(G){return this.bind(F,G)}});var r=e();o.extend({get:function(E,G,H,F){if(o.isFunction(G)){H=G;G=null}return o.ajax({type:"GET",url:E,data:G,success:H,dataType:F})},getScript:function(E,F){return o.get(E,null,F,"script")},getJSON:function(E,F,G){return o.get(E,F,G,"json")},post:function(E,G,H,F){if(o.isFunction(G)){H=G;G={}}return o.ajax({type:"POST",url:E,data:G,success:H,dataType:F})},ajaxSetup:function(E){o.extend(o.ajaxSettings,E)},ajaxSettings:{url:location.href,global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,xhr:function(){return l.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest()},accepts:{xml:"application/xml, text/xml",html:"text/html",script:"text/javascript, application/javascript",json:"application/json, text/javascript",text:"text/plain",_default:"*/*"}},lastModified:{},ajax:function(M){M=o.extend(true,M,o.extend(true,{},o.ajaxSettings,M));var W,F=/=\?(&|$)/g,R,V,G=M.type.toUpperCase();if(M.data&&M.processData&&typeof M.data!=="string"){M.data=o.param(M.data)}if(M.dataType=="jsonp"){if(G=="GET"){if(!M.url.match(F)){M.url+=(M.url.match(/\?/)?"&":"?")+(M.jsonp||"callback")+"=?"}}else{if(!M.data||!M.data.match(F)){M.data=(M.data?M.data+"&":"")+(M.jsonp||"callback")+"=?"}}M.dataType="json"}if(M.dataType=="json"&&(M.data&&M.data.match(F)||M.url.match(F))){W="jsonp"+r++;if(M.data){M.data=(M.data+"").replace(F,"="+W+"$1")}M.url=M.url.replace(F,"="+W+"$1");M.dataType="script";l[W]=function(X){V=X;I();L();l[W]=g;try{delete l[W]}catch(Y){}if(H){H.removeChild(T)}}}if(M.dataType=="script"&&M.cache==null){M.cache=false}if(M.cache===false&&G=="GET"){var E=e();var U=M.url.replace(/(\?|&)_=.*?(&|$)/,"$1_="+E+"$2");M.url=U+((U==M.url)?(M.url.match(/\?/)?"&":"?")+"_="+E:"")}if(M.data&&G=="GET"){M.url+=(M.url.match(/\?/)?"&":"?")+M.data;M.data=null}if(M.global&&!o.active++){o.event.trigger("ajaxStart")}var Q=/^(\w+:)?\/\/([^\/?#]+)/.exec(M.url);if(M.dataType=="script"&&G=="GET"&&Q&&(Q[1]&&Q[1]!=location.protocol||Q[2]!=location.host)){var H=document.getElementsByTagName("head")[0];var T=document.createElement("script");T.src=M.url;if(M.scriptCharset){T.charset=M.scriptCharset}if(!W){var O=false;T.onload=T.onreadystatechange=function(){if(!O&&(!this.readyState||this.readyState=="loaded"||this.readyState=="complete")){O=true;I();L();T.onload=T.onreadystatechange=null;H.removeChild(T)}}}H.appendChild(T);return g}var K=false;var J=M.xhr();if(M.username){J.open(G,M.url,M.async,M.username,M.password)}else{J.open(G,M.url,M.async)}try{if(M.data){J.setRequestHeader("Content-Type",M.contentType)}if(M.ifModified){J.setRequestHeader("If-Modified-Since",o.lastModified[M.url]||"Thu, 01 Jan 1970 00:00:00 GMT")}J.setRequestHeader("X-Requested-With","XMLHttpRequest");J.setRequestHeader("Accept",M.dataType&&M.accepts[M.dataType]?M.accepts[M.dataType]+", */*":M.accepts._default)}catch(S){}if(M.beforeSend&&M.beforeSend(J,M)===false){if(M.global&&!--o.active){o.event.trigger("ajaxStop")}J.abort();return false}if(M.global){o.event.trigger("ajaxSend",[J,M])}var N=function(X){if(J.readyState==0){if(P){clearInterval(P);P=null;if(M.global&&!--o.active){o.event.trigger("ajaxStop")}}}else{if(!K&&J&&(J.readyState==4||X=="timeout")){K=true;if(P){clearInterval(P);P=null}R=X=="timeout"?"timeout":!o.httpSuccess(J)?"error":M.ifModified&&o.httpNotModified(J,M.url)?"notmodified":"success";if(R=="success"){try{V=o.httpData(J,M.dataType,M)}catch(Z){R="parsererror"}}if(R=="success"){var Y;try{Y=J.getResponseHeader("Last-Modified")}catch(Z){}if(M.ifModified&&Y){o.lastModified[M.url]=Y}if(!W){I()}}else{o.handleError(M,J,R)}L();if(X){J.abort()}if(M.async){J=null}}}};if(M.async){var P=setInterval(N,13);if(M.timeout>0){setTimeout(function(){if(J&&!K){N("timeout")}},M.timeout)}}try{J.send(M.data)}catch(S){o.handleError(M,J,null,S)}if(!M.async){N()}function I(){if(M.success){M.success(V,R)}if(M.global){o.event.trigger("ajaxSuccess",[J,M])}}function L(){if(M.complete){M.complete(J,R)}if(M.global){o.event.trigger("ajaxComplete",[J,M])}if(M.global&&!--o.active){o.event.trigger("ajaxStop")}}return J},handleError:function(F,H,E,G){if(F.error){F.error(H,E,G)}if(F.global){o.event.trigger("ajaxError",[H,F,G])}},active:0,httpSuccess:function(F){try{return !F.status&&location.protocol=="file:"||(F.status>=200&&F.status<300)||F.status==304||F.status==1223}catch(E){}return false},httpNotModified:function(G,E){try{var H=G.getResponseHeader("Last-Modified");return G.status==304||H==o.lastModified[E]}catch(F){}return false},httpData:function(J,H,G){var F=J.getResponseHeader("content-type"),E=H=="xml"||!H&&F&&F.indexOf("xml")>=0,I=E?J.responseXML:J.responseText;if(E&&I.documentElement.tagName=="parsererror"){throw"parsererror"}if(G&&G.dataFilter){I=G.dataFilter(I,H)}if(typeof I==="string"){if(H=="script"){o.globalEval(I)}if(H=="json"){I=l["eval"]("("+I+")")}}return I},param:function(E){var G=[];function H(I,J){G[G.length]=encodeURIComponent(I)+"="+encodeURIComponent(J)}if(o.isArray(E)||E.jquery){o.each(E,function(){H(this.name,this.value)})}else{for(var F in E){if(o.isArray(E[F])){o.each(E[F],function(){H(F,this)})}else{H(F,o.isFunction(E[F])?E[F]():E[F])}}}return G.join("&").replace(/%20/g,"+")}});var m={},n,d=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]];function t(F,E){var G={};o.each(d.concat.apply([],d.slice(0,E)),function(){G[this]=F});return G}o.fn.extend({show:function(J,L){if(J){return this.animate(t("show",3),J,L)}else{for(var H=0,F=this.length;H<F;H++){var E=o.data(this[H],"olddisplay");this[H].style.display=E||"";if(o.css(this[H],"display")==="none"){var G=this[H].tagName,K;if(m[G]){K=m[G]}else{var I=o("<"+G+" />").appendTo("body");K=I.css("display");if(K==="none"){K="block"}I.remove();m[G]=K}o.data(this[H],"olddisplay",K)}}for(var H=0,F=this.length;H<F;H++){this[H].style.display=o.data(this[H],"olddisplay")||""}return this}},hide:function(H,I){if(H){return this.animate(t("hide",3),H,I)}else{for(var G=0,F=this.length;G<F;G++){var E=o.data(this[G],"olddisplay");if(!E&&E!=="none"){o.data(this[G],"olddisplay",o.css(this[G],"display"))}}for(var G=0,F=this.length;G<F;G++){this[G].style.display="none"}return this}},_toggle:o.fn.toggle,toggle:function(G,F){var E=typeof G==="boolean";return o.isFunction(G)&&o.isFunction(F)?this._toggle.apply(this,arguments):G==null||E?this.each(function(){var H=E?G:o(this).is(":hidden");o(this)[H?"show":"hide"]()}):this.animate(t("toggle",3),G,F)},fadeTo:function(E,G,F){return this.animate({opacity:G},E,F)},animate:function(I,F,H,G){var E=o.speed(F,H,G);return this[E.queue===false?"each":"queue"](function(){var K=o.extend({},E),M,L=this.nodeType==1&&o(this).is(":hidden"),J=this;for(M in I){if(I[M]=="hide"&&L||I[M]=="show"&&!L){return K.complete.call(this)}if((M=="height"||M=="width")&&this.style){K.display=o.css(this,"display");K.overflow=this.style.overflow}}if(K.overflow!=null){this.style.overflow="hidden"}K.curAnim=o.extend({},I);o.each(I,function(O,S){var R=new o.fx(J,K,O);if(/toggle|show|hide/.test(S)){R[S=="toggle"?L?"show":"hide":S](I)}else{var Q=S.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),T=R.cur(true)||0;if(Q){var N=parseFloat(Q[2]),P=Q[3]||"px";if(P!="px"){J.style[O]=(N||1)+P;T=((N||1)/R.cur(true))*T;J.style[O]=T+P}if(Q[1]){N=((Q[1]=="-="?-1:1)*N)+T}R.custom(T,N,P)}else{R.custom(T,S,"")}}});return true})},stop:function(F,E){var G=o.timers;if(F){this.queue([])}this.each(function(){for(var H=G.length-1;H>=0;H--){if(G[H].elem==this){if(E){G[H](true)}G.splice(H,1)}}});if(!E){this.dequeue()}return this}});o.each({slideDown:t("show",1),slideUp:t("hide",1),slideToggle:t("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"}},function(E,F){o.fn[E]=function(G,H){return this.animate(F,G,H)}});o.extend({speed:function(G,H,F){var E=typeof G==="object"?G:{complete:F||!F&&H||o.isFunction(G)&&G,duration:G,easing:F&&H||H&&!o.isFunction(H)&&H};E.duration=o.fx.off?0:typeof E.duration==="number"?E.duration:o.fx.speeds[E.duration]||o.fx.speeds._default;E.old=E.complete;E.complete=function(){if(E.queue!==false){o(this).dequeue()}if(o.isFunction(E.old)){E.old.call(this)}};return E},easing:{linear:function(G,H,E,F){return E+F*G},swing:function(G,H,E,F){return((-Math.cos(G*Math.PI)/2)+0.5)*F+E}},timers:[],fx:function(F,E,G){this.options=E;this.elem=F;this.prop=G;if(!E.orig){E.orig={}}}});o.fx.prototype={update:function(){if(this.options.step){this.options.step.call(this.elem,this.now,this)}(o.fx.step[this.prop]||o.fx.step._default)(this);if((this.prop=="height"||this.prop=="width")&&this.elem.style){this.elem.style.display="block"}},cur:function(F){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null)){return this.elem[this.prop]}var E=parseFloat(o.css(this.elem,this.prop,F));return E&&E>-10000?E:parseFloat(o.curCSS(this.elem,this.prop))||0},custom:function(I,H,G){this.startTime=e();this.start=I;this.end=H;this.unit=G||this.unit||"px";this.now=this.start;this.pos=this.state=0;var E=this;function F(J){return E.step(J)}F.elem=this.elem;if(F()&&o.timers.push(F)&&!n){n=setInterval(function(){var K=o.timers;for(var J=0;J<K.length;J++){if(!K[J]()){K.splice(J--,1)}}if(!K.length){clearInterval(n);n=g}},13)}},show:function(){this.options.orig[this.prop]=o.attr(this.elem.style,this.prop);this.options.show=true;this.custom(this.prop=="width"||this.prop=="height"?1:0,this.cur());o(this.elem).show()},hide:function(){this.options.orig[this.prop]=o.attr(this.elem.style,this.prop);this.options.hide=true;this.custom(this.cur(),0)},step:function(H){var G=e();if(H||G>=this.options.duration+this.startTime){this.now=this.end;this.pos=this.state=1;this.update();this.options.curAnim[this.prop]=true;var E=true;for(var F in this.options.curAnim){if(this.options.curAnim[F]!==true){E=false}}if(E){if(this.options.display!=null){this.elem.style.overflow=this.options.overflow;this.elem.style.display=this.options.display;if(o.css(this.elem,"display")=="none"){this.elem.style.display="block"}}if(this.options.hide){o(this.elem).hide()}if(this.options.hide||this.options.show){for(var I in this.options.curAnim){o.attr(this.elem.style,I,this.options.orig[I])}}this.options.complete.call(this.elem)}return false}else{var J=G-this.startTime;this.state=J/this.options.duration;this.pos=o.easing[this.options.easing||(o.easing.swing?"swing":"linear")](this.state,J,0,1,this.options.duration);this.now=this.start+((this.end-this.start)*this.pos);this.update()}return true}};o.extend(o.fx,{speeds:{slow:600,fast:200,_default:400},step:{opacity:function(E){o.attr(E.elem.style,"opacity",E.now)},_default:function(E){if(E.elem.style&&E.elem.style[E.prop]!=null){E.elem.style[E.prop]=E.now+E.unit}else{E.elem[E.prop]=E.now}}}});if(document.documentElement.getBoundingClientRect){o.fn.offset=function(){if(!this[0]){return{top:0,left:0}}if(this[0]===this[0].ownerDocument.body){return o.offset.bodyOffset(this[0])}var G=this[0].getBoundingClientRect(),J=this[0].ownerDocument,F=J.body,E=J.documentElement,L=E.clientTop||F.clientTop||0,K=E.clientLeft||F.clientLeft||0,I=G.top+(self.pageYOffset||o.boxModel&&E.scrollTop||F.scrollTop)-L,H=G.left+(self.pageXOffset||o.boxModel&&E.scrollLeft||F.scrollLeft)-K;return{top:I,left:H}}}else{o.fn.offset=function(){if(!this[0]){return{top:0,left:0}}if(this[0]===this[0].ownerDocument.body){return o.offset.bodyOffset(this[0])}o.offset.initialized||o.offset.initialize();var J=this[0],G=J.offsetParent,F=J,O=J.ownerDocument,M,H=O.documentElement,K=O.body,L=O.defaultView,E=L.getComputedStyle(J,null),N=J.offsetTop,I=J.offsetLeft;while((J=J.parentNode)&&J!==K&&J!==H){M=L.getComputedStyle(J,null);N-=J.scrollTop,I-=J.scrollLeft;if(J===G){N+=J.offsetTop,I+=J.offsetLeft;if(o.offset.doesNotAddBorder&&!(o.offset.doesAddBorderForTableAndCells&&/^t(able|d|h)$/i.test(J.tagName))){N+=parseInt(M.borderTopWidth,10)||0,I+=parseInt(M.borderLeftWidth,10)||0}F=G,G=J.offsetParent}if(o.offset.subtractsBorderForOverflowNotVisible&&M.overflow!=="visible"){N+=parseInt(M.borderTopWidth,10)||0,I+=parseInt(M.borderLeftWidth,10)||0}E=M}if(E.position==="relative"||E.position==="static"){N+=K.offsetTop,I+=K.offsetLeft}if(E.position==="fixed"){N+=Math.max(H.scrollTop,K.scrollTop),I+=Math.max(H.scrollLeft,K.scrollLeft)}return{top:N,left:I}}}o.offset={initialize:function(){if(this.initialized){return}var L=document.body,F=document.createElement("div"),H,G,N,I,M,E,J=L.style.marginTop,K='<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';M={position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"};for(E in M){F.style[E]=M[E]}F.innerHTML=K;L.insertBefore(F,L.firstChild);H=F.firstChild,G=H.firstChild,I=H.nextSibling.firstChild.firstChild;this.doesNotAddBorder=(G.offsetTop!==5);this.doesAddBorderForTableAndCells=(I.offsetTop===5);H.style.overflow="hidden",H.style.position="relative";this.subtractsBorderForOverflowNotVisible=(G.offsetTop===-5);L.style.marginTop="1px";this.doesNotIncludeMarginInBodyOffset=(L.offsetTop===0);L.style.marginTop=J;L.removeChild(F);this.initialized=true},bodyOffset:function(E){o.offset.initialized||o.offset.initialize();var G=E.offsetTop,F=E.offsetLeft;if(o.offset.doesNotIncludeMarginInBodyOffset){G+=parseInt(o.curCSS(E,"marginTop",true),10)||0,F+=parseInt(o.curCSS(E,"marginLeft",true),10)||0}return{top:G,left:F}}};o.fn.extend({position:function(){var I=0,H=0,F;if(this[0]){var G=this.offsetParent(),J=this.offset(),E=/^body|html$/i.test(G[0].tagName)?{top:0,left:0}:G.offset();J.top-=j(this,"marginTop");J.left-=j(this,"marginLeft");E.top+=j(G,"borderTopWidth");E.left+=j(G,"borderLeftWidth");F={top:J.top-E.top,left:J.left-E.left}}return F},offsetParent:function(){var E=this[0].offsetParent||document.body;while(E&&(!/^body|html$/i.test(E.tagName)&&o.css(E,"position")=="static")){E=E.offsetParent}return o(E)}});o.each(["Left","Top"],function(F,E){var G="scroll"+E;o.fn[G]=function(H){if(!this[0]){return null}return H!==g?this.each(function(){this==l||this==document?l.scrollTo(!F?H:o(l).scrollLeft(),F?H:o(l).scrollTop()):this[G]=H}):this[0]==l||this[0]==document?self[F?"pageYOffset":"pageXOffset"]||o.boxModel&&document.documentElement[G]||document.body[G]:this[0][G]}});o.each(["Height","Width"],function(I,G){var E=I?"Left":"Top",H=I?"Right":"Bottom",F=G.toLowerCase();o.fn["inner"+G]=function(){return this[0]?o.css(this[0],F,false,"padding"):null};o.fn["outer"+G]=function(K){return this[0]?o.css(this[0],F,false,K?"margin":"border"):null};var J=G.toLowerCase();o.fn[J]=function(K){return this[0]==l?document.compatMode=="CSS1Compat"&&document.documentElement["client"+G]||document.body["client"+G]:this[0]==document?Math.max(document.documentElement["client"+G],document.body["scroll"+G],document.documentElement["scroll"+G],document.body["offset"+G],document.documentElement["offset"+G]):K===g?(this.length?o.css(this[0],J):null):this.css(J,typeof K==="string"?K:K+"px")}})})();


/*
 *   TableSorter  http://tablesorter.com/
 */
(function($){$.extend({tablesorter:new
function(){var parsers=[],widgets=[];this.defaults={cssHeader:"header",cssAsc:"headerSortUp",cssDesc:"headerSortDown",cssChildRow:"expand-child",sortInitialOrder:"asc",sortMultiSortKey:"shiftKey",sortForce:null,sortAppend:null,sortLocaleCompare:true,textExtraction:"simple",parsers:{},widgets:[],widgetZebra:{css:["even","odd"]},headers:{},widthFixed:false,cancelSelection:true,sortList:[],headerList:[],dateFormat:"us",decimal:'/\.|\,/g',onRenderHeader:null,selectorHeaders:'thead th',debug:false};function benchmark(s,d){log(s+","+(new Date().getTime()-d.getTime())+"ms");}this.benchmark=benchmark;function log(s){if(typeof console!="undefined"&&typeof console.debug!="undefined"){console.log(s);}else{alert(s);}}function buildParserCache(table,$headers){if(table.config.debug){var parsersDebug="";}if(table.tBodies.length==0)return;var rows=table.tBodies[0].rows;if(rows[0]){var list=[],cells=rows[0].cells,l=cells.length;for(var i=0;i<l;i++){var p=false;if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){p=getParserById($($headers[i]).metadata().sorter);}else if((table.config.headers[i]&&table.config.headers[i].sorter)){p=getParserById(table.config.headers[i].sorter);}if(!p){p=detectParserForColumn(table,rows,-1,i);}if(table.config.debug){parsersDebug+="column:"+i+" parser:"+p.id+"\n";}list.push(p);}}if(table.config.debug){log(parsersDebug);}return list;};function detectParserForColumn(table,rows,rowIndex,cellIndex){var l=parsers.length,node=false,nodeValue=false,keepLooking=true;while(nodeValue==''&&keepLooking){rowIndex++;if(rows[rowIndex]){node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);nodeValue=trimAndGetNodeText(table.config,node);if(table.config.debug){log('Checking if value was empty on row:'+rowIndex);}}else{keepLooking=false;}}for(var i=1;i<l;i++){if(parsers[i].is(nodeValue,table,node)){return parsers[i];}}return parsers[0];}function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){return rows[rowIndex].cells[cellIndex];}function trimAndGetNodeText(config,node){return $.trim(getElementText(config,node));}function getParserById(name){var l=parsers.length;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==name.toLowerCase()){return parsers[i];}}return false;}function buildCache(table){if(table.config.debug){var cacheTime=new Date();}var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={row:[],normalized:[]};for(var i=0;i<totalRows;++i){var c=$(table.tBodies[0].rows[i]),cols=[];if(c.hasClass(table.config.cssChildRow)){cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);continue;}cache.row.push(c);for(var j=0;j<totalCells;++j){cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));}cols.push(cache.normalized.length);cache.normalized.push(cols);cols=null;};if(table.config.debug){benchmark("Building cache for "+totalRows+" rows:",cacheTime);}return cache;};function getElementText(config,node){var text="";if(!node)return"";if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;if(config.textExtraction=="simple"){if(config.supportsTextContent){text=node.textContent;}else{if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){text=node.childNodes[0].innerHTML;}else{text=node.innerHTML;}}}else{if(typeof(config.textExtraction)=="function"){text=config.textExtraction(node);}else{text=$(node).text();}}return text;}function appendToTable(table,cache){if(table.config.debug){var appendTime=new Date()}var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];for(var i=0;i<totalRows;i++){var pos=n[i][checkCell];rows.push(r[pos]);if(!table.config.appender){var l=r[pos].length;for(var j=0;j<l;j++){tableBody[0].appendChild(r[pos][j]);}}}if(table.config.appender){table.config.appender(table,rows);}rows=null;if(table.config.debug){benchmark("Rebuilt table:",appendTime);}applyWidget(table);setTimeout(function(){$(table).trigger("sortEnd");},0);};function buildHeaders(table){if(table.config.debug){var time=new Date();}var meta=($.metadata)?true:false;var header_index=computeTableHeaderCellIndexes(table);$tableHeaders=$(table.config.selectorHeaders,table).each(function(index){this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];this.order=formatSortingOrder(table.config.sortInitialOrder);this.count=this.order;if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);if(!this.sortDisabled){var $th=$(this).addClass(table.config.cssHeader);if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);}table.config.headerList[index]=this;});if(table.config.debug){benchmark("Built headers:",time);log($tableHeaders);}return $tableHeaders;};function computeTableHeaderCellIndexes(t){var matrix=[];var lookup={};var thead=t.getElementsByTagName('THEAD')[0];var trs=thead.getElementsByTagName('TR');for(var i=0;i<trs.length;i++){var cells=trs[i].cells;for(var j=0;j<cells.length;j++){var c=cells[j];var rowIndex=c.parentNode.rowIndex;var cellId=rowIndex+"-"+c.cellIndex;var rowSpan=c.rowSpan||1;var colSpan=c.colSpan||1
var firstAvailCol;if(typeof(matrix[rowIndex])=="undefined"){matrix[rowIndex]=[];}for(var k=0;k<matrix[rowIndex].length+1;k++){if(typeof(matrix[rowIndex][k])=="undefined"){firstAvailCol=k;break;}}lookup[cellId]=firstAvailCol;for(var k=rowIndex;k<rowIndex+rowSpan;k++){if(typeof(matrix[k])=="undefined"){matrix[k]=[];}var matrixrow=matrix[k];for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){matrixrow[l]="x";}}}}return lookup;}function checkCellColSpan(table,rows,row){var arr=[],r=table.tHead.rows,c=r[row].cells;for(var i=0;i<c.length;i++){var cell=c[i];if(cell.colSpan>1){arr=arr.concat(checkCellColSpan(table,headerArr,row++));}else{if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){arr.push(cell);}}}return arr;};function checkHeaderMetadata(cell){if(($.metadata)&&($(cell).metadata().sorter===false)){return true;};return false;}function checkHeaderOptions(table,i){if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){return true;};return false;}function checkHeaderOptionsSortingLocked(table,i){if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;return false;}function applyWidget(table){var c=table.config.widgets;var l=c.length;for(var i=0;i<l;i++){getWidgetById(c[i]).format(table);}}function getWidgetById(name){var l=widgets.length;for(var i=0;i<l;i++){if(widgets[i].id.toLowerCase()==name.toLowerCase()){return widgets[i];}}};function formatSortingOrder(v){if(typeof(v)!="Number"){return(v.toLowerCase()=="desc")?1:0;}else{return(v==1)?1:0;}}function isValueInArray(v,a){var l=a.length;for(var i=0;i<l;i++){if(a[i][0]==v){return true;}}return false;}function setHeadersCss(table,$headers,list,css){$headers.removeClass(css[0]).removeClass(css[1]);var h=[];$headers.each(function(offset){if(!this.sortDisabled){h[this.column]=$(this);}});var l=list.length;for(var i=0;i<l;i++){h[list[i][0]].addClass(css[list[i][1]]);}}function fixColumnWidth(table,$headers){var c=table.config;if(c.widthFixed){var colgroup=$('<colgroup>');$("tr:first td",table.tBodies[0]).each(function(){colgroup.append($('<col>').css('width',$(this).width()));});$(table).prepend(colgroup);};}function updateHeaderSortCount(table,sortList){var c=table.config,l=sortList.length;for(var i=0;i<l;i++){var s=sortList[i],o=c.headerList[s[0]];o.count=s[1];o.count++;}}function multisort(table,sortList,cache){if(table.config.debug){var sortTime=new Date();}var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;for(var i=0;i<l;i++){var c=sortList[i][0];var order=sortList[i][1];var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));var e="e"+i;dynamicExp+="var "+e+" = "+s;dynamicExp+="if("+e+") { return "+e+"; } ";dynamicExp+="else { ";}var orgOrderCol=cache.normalized[0].length-1;dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";for(var i=0;i<l;i++){dynamicExp+="}; ";}dynamicExp+="return 0; ";dynamicExp+="}; ";if(table.config.debug){benchmark("Evaling expression:"+dynamicExp,new Date());}eval(dynamicExp);cache.normalized.sort(sortWrapper);if(table.config.debug){benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);}return cache;};function makeSortFunction(type,direction,index){var a="a["+index+"]",b="b["+index+"]";if(type=='text'&&direction=='asc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";}else if(type=='text'&&direction=='desc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";}else if(type=='numeric'&&direction=='asc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";}else if(type=='numeric'&&direction=='desc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";}};function makeSortText(i){return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";};function makeSortTextDesc(i){return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";};function makeSortNumeric(i){return"a["+i+"]-b["+i+"];";};function makeSortNumericDesc(i){return"b["+i+"]-a["+i+"];";};function sortText(a,b){if(table.config.sortLocaleCompare)return a.localeCompare(b);return((a<b)?-1:((a>b)?1:0));};function sortTextDesc(a,b){if(table.config.sortLocaleCompare)return b.localeCompare(a);return((b<a)?-1:((b>a)?1:0));};function sortNumeric(a,b){return a-b;};function sortNumericDesc(a,b){return b-a;};function getCachedSortType(parsers,i){return parsers[i].type;};this.construct=function(settings){return this.each(function(){if(!this.tHead||!this.tBodies)return;var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;this.config={};config=$.extend(this.config,$.tablesorter.defaults,settings);$this=$(this);$.data(this,"tablesorter",config);$headers=buildHeaders(this);this.config.parsers=buildParserCache(this,$headers);cache=buildCache(this);var sortCSS=[config.cssDesc,config.cssAsc];fixColumnWidth(this);$headers.click(function(e){var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;if(!this.sortDisabled&&totalRows>0){$this.trigger("sortStart");var $cell=$(this);var i=this.column;this.order=this.count++%2;if(this.lockedOrder)this.order=this.lockedOrder;if(!e[config.sortMultiSortKey]){config.sortList=[];if(config.sortForce!=null){var a=config.sortForce;for(var j=0;j<a.length;j++){if(a[j][0]!=i){config.sortList.push(a[j]);}}}config.sortList.push([i,this.order]);}else{if(isValueInArray(i,config.sortList)){for(var j=0;j<config.sortList.length;j++){var s=config.sortList[j],o=config.headerList[s[0]];if(s[0]==i){o.count=s[1];o.count++;s[1]=o.count%2;}}}else{config.sortList.push([i,this.order]);}};setTimeout(function(){setHeadersCss($this[0],$headers,config.sortList,sortCSS);appendToTable($this[0],multisort($this[0],config.sortList,cache));},1);return false;}}).mousedown(function(){if(config.cancelSelection){this.onselectstart=function(){return false};return false;}});$this.bind("update",function(){var me=this;setTimeout(function(){me.config.parsers=buildParserCache(me,$headers);cache=buildCache(me);},1);}).bind("updateCell",function(e,cell){var config=this.config;var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);}).bind("sorton",function(e,list){$(this).trigger("sortStart");config.sortList=list;var sortList=config.sortList;updateHeaderSortCount(this,sortList);setHeadersCss(this,$headers,sortList,sortCSS);appendToTable(this,multisort(this,sortList,cache));}).bind("appendCache",function(){appendToTable(this,cache);}).bind("applyWidgetId",function(e,id){getWidgetById(id).format(this);}).bind("applyWidgets",function(){applyWidget(this);});if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){config.sortList=$(this).metadata().sortlist;}if(config.sortList.length>0){$this.trigger("sorton",[config.sortList]);}applyWidget(this);});};this.addParser=function(parser){var l=parsers.length,a=true;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){a=false;}}if(a){parsers.push(parser);};};this.addWidget=function(widget){widgets.push(widget);};this.formatFloat=function(s){var i=parseFloat(s);return(isNaN(i))?0:i;};this.formatInt=function(s){var i=parseInt(s);return(isNaN(i))?0:i;};this.isDigit=function(s,config){return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));};this.clearTableBody=function(table){if($.browser.msie){function empty(){while(this.firstChild)this.removeChild(this.firstChild);}empty.apply(table.tBodies[0]);}else{table.tBodies[0].innerHTML="";}};}});$.fn.extend({tablesorter:$.tablesorter.construct});var ts=$.tablesorter;ts.addParser({id:"text",is:function(s){return true;},format:function(s){return $.trim(s.toLocaleLowerCase());},type:"text"});ts.addParser({id:"digit",is:function(s,table){var c=table.config;return $.tablesorter.isDigit(s,c);},format:function(s){return $.tablesorter.formatFloat(s);},type:"numeric"});ts.addParser({id:"currency",is:function(s){return/^[Â£$â‚¬?.]/.test(s);},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/[Â£$â‚¬]/g),""));},type:"numeric"});ts.addParser({id:"ipAddress",is:function(s){return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);},format:function(s){var a=s.split("."),r="",l=a.length;for(var i=0;i<l;i++){var item=a[i];if(item.length==2){r+="0"+item;}else{r+=item;}}return $.tablesorter.formatFloat(r);},type:"numeric"});ts.addParser({id:"url",is:function(s){return/^(https?|ftp|file):\/\/$/.test(s);},format:function(s){return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));},type:"text"});ts.addParser({id:"isoDate",is:function(s){return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);},format:function(s){return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");},type:"numeric"});ts.addParser({id:"percent",is:function(s){return/\%$/.test($.trim(s));},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));},type:"numeric"});ts.addParser({id:"usLongDate",is:function(s){return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));},format:function(s){return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"shortDate",is:function(s){return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);},format:function(s,table){var c=table.config;s=s.replace(/\-/g,"/");if(c.dateFormat=="us"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");}else if(c.dateFormat=="uk"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");}else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");}return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"time",is:function(s){return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);},format:function(s){return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());},type:"numeric"});ts.addParser({id:"metadata",is:function(s){return false;},format:function(s,table,cell){var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;return $(cell).metadata()[p];},type:"numeric"});ts.addWidget({id:"zebra",format:function(table){if(table.config.debug){var time=new Date();}var $tr,row=-1,odd;$("tr:visible",table.tBodies[0]).each(function(i){$tr=$(this);if(!$tr.hasClass(table.config.cssChildRow))row++;odd=(row%2==0);$tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])});if(table.config.debug){$.tablesorter.benchmark("Applying Zebra widget",time);}}});})(jQuery);
/*
 *   Jobmine plus code
 */ 

/*======================================*\
l*        CONSTANTS                                               |
\*======================================*/
 var SETTINGS_GENERAL = '<table cellpadding="0" cellspacing="0"><tbody><tr><td valign="top">Login Default Page:</td><td valign="top"><select id="popupSelect"><option selected="selected" value="ap">Applications</option><option value="in">Interviews</option><option value="js">Job Search</option><option value="dc">Documents</option><option value="jl">Job Short List</option><option value="rk">Rankings</option><option value="pr">Profile</option><!-- <option value="wr">Work Report Evaluations</option> --></select></td></tr><tr><td valign="top">Load Message Off:</td><td valign="top"><input id="loadCheckbox" class="chkbox" type="checkbox"></td></tr><tr><td valign="top">Do not Show Updates:</td><td valign="top"><input id="updateCheckbox" class="chkbox" type="checkbox"></td></tr><tr><td valign="top">Remove Timer:</td><td valign="top"><input checked="checked" id="removeTimerChkbx" class="chkbox" type="checkbox"></td></tr><tr><td class="" style="color: black;" valign="top">Auto-Refresh Duration (min):<br><span id="removeTimerDetails" class="details">The time specified (minutes) would allow the page to refresh when the page is on idle. If 0 or any time above 19 minutes is specified, there will be a timer for 19 minutes to avoid the php timer.</span></td><td valign="top"><input value="0" style="background-color: white; color: black;" onkeypress="return decimalOnly(event)" class="textField" id="popupText" type="text"></td></tr></tbody></table>';
/*======================================*\
l*        FUNCTIONS                                                |
\*======================================*/

function showLoadingPopup(){
     if($("body").scrollTop() != 0){$("#whiteOverlay").css("top",0);};
	$("#popupWhiteContainer").css("display","block");	
     $("body").css("overflow","hidden");
     $("#hintmsg").css("display","none");
     $("#popupContainer").css("visibility","hidden");
}
function hideLoadingPopup(){
     $("#whiteOverlay").css("top","125px");
     $("#popupWhiteContainer").css("display","none");
     $("body").css("overflow","auto");
}
function loadPopupMsg(msg){
	$("#whitePopupMsg").html(msg);
}
function resetGlobalTimer(){
	if(GLOBAL_TIMER)
        	clearTimeout(GLOBAL_TIMER);        	
     GLOBAL_TIMER  = setTimeout(function(){window.location.href = window.location.href;},getCookieValue('AUTO_REFRESH')*60*1000);
}


/*
 *        APPLIES CORRECTED DATE SORTING FOR JOBMINE
 */ 
$.tablesorter.addParser({ 
     id: 'jobmineDates', 
     is: function(s) { 
          return false; 
     }, 
     format: function(s) { 
          //Parse Jobmines dates
          s = s.trim();
          if(s == "")         //Empty
               return 0;
          var date = s[2] == " " ? s.split(" ") : s.split("-");
          var month = parseMonth(date[1]);
          var day =    date[0];
          var year =   date[2];     
          return Date.UTC(year, month, day) ;
     }, 
     type: 'numeric' 
}); 

function applyTableSorting(path, pagetype){
     var tables = $(path);
     if (tables.size()) {
          $("table:not('.PSGROUPBOX')").css("width","100%");
          tables.each(function() {$(this).prepend($("<thead></thead>").append($(this).find("tr:first").remove()));	});
          tables.addClass("tablesorter");
          
          //Applies the sorting dependent on the page
          //CHANGE THIS IF YOU ARE ADDING MORE COLUMNS
          switch(pagetype)
          {
               case "student_app_summary":
                    tables.tablesorter( {headers: {8: { sorter: 'jobmineDates' } } } );   break;
               case "student_interviews":
                    tables.tablesorter( {headers: {4: { sorter: 'jobmineDates' } } } );   break;
               case "job_short_list":
                    tables.tablesorter( {headers: {7: { sorter: 'jobmineDates' } } } );   break;
               case 'job_search_component':
                    tables.tablesorter( {headers: {11: { sorter: 'jobmineDates' } } } );   break;
               case 'student_ranking_open':
                    tables.tablesorter( {headers: {7: { sorter: 'jobmineDates' }, 9: { sorter: 'jobmineDates' } } } );   break;
               default:
                    tables.tablesorter();   break;
          }
          tables.find("td, th").css("border-bottom","1px solid #999").css("width","auto");
     }
     return tables;
}

//Runs the function when CSS is ready, very customized
function cssReady(the_function, checkRate){checkRate = checkRate == null ? 250 : checkRate;var style = window.getComputedStyle(document.getElementById('cssLoadTest'), null).getPropertyValue("display");if(window.getComputedStyle(document.getElementById('cssLoadTest'), null).getPropertyValue("display") == "none"){the_function();}else{setTimeout(function(){cssReady(the_function)},checkRate);}}

function insertCustomHeader(){
     var header = '<div id="updateInfo" style="display:none;background-color: #f1f8fe; width: 100%; text-align: center;"><a popup="false" href="http://userscripts.org/scripts/source/80771.user.js">There is a newer version of Jobmine Plus, click to install.</a></div>';
     
     header +=     '<div id="jobminepanel" style="width:100%; height:125px; background-repeat: repeat-x;';
     header +=     'background-image: url(data:image/gif;base64,R0lGODlhAQB9AOYAAFdXmlhYm+3v+mBgoF1dnmRkorW10nJyq1panGhopWpqpnZ2rW1tqPHx9/T0+IWFtoeHt4mJuPr6/JmZwpubw7Cw0KSkyLm51WdnpKKix8PD21xcncHB2s/P4qyszdfX566uz9nZ6OXl8Nzc6tXV5qioy/X1+f39/qamybe31Ozs83t7sL2915OTvltbnZWVv2xsp8nJ34GBs4+PvOjo8Xl5r9PT5W9vqJGRvXR0rIuLuaqqzH19sbKy0bu71p2dxHh4rnFxqs3N4dvb6WNjof7+/uDg7J+fxo2NumFhoOfn8FZWmllZm39/smVlo/n5+/j4++rq8r+/2fPz+HeAt/z8/YODtO3t9OLi7ff3+t7e619fn/v7/cvL4JeXwe/v9fDw9uPj7tHR5FVVmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAABAH0AAAdsgGOCg4SFhoVLAAFMCC4bBFsDSUQFThgJCjAMN0EHOQtANSs8TTJWDxAROkgzOC0vXhMUP0cZFiglOx4gFT0GKRc+LFIcGlQCMV1CHWI2JB8hQyNaRlhhIko0USpXX2ANUw4mWVBPElxVJ0WBADs=);';
     header +=     '"><table cellspacing="0" cellpadding="0" style="background-repeat: repeat-x;';
     header +=     'background-image: url(data:image/gif;base64,R0lGODlhAQB9AOYAAFdXmlhYm+3v+mBgoF1dnmRkorW10nJyq1panGhopWpqpnZ2rW1tqPHx9/T0+IWFtoeHt4mJuPr6/JmZwpubw7Cw0KSkyLm51WdnpKKix8PD21xcncHB2s/P4qyszdfX566uz9nZ6OXl8Nzc6tXV5qioy/X1+f39/qamybe31Ozs83t7sL2915OTvltbnZWVv2xsp8nJ34GBs4+PvOjo8Xl5r9PT5W9vqJGRvXR0rIuLuaqqzH19sbKy0bu71p2dxHh4rnFxqs3N4dvb6WNjof7+/uDg7J+fxo2NumFhoOfn8FZWmllZm39/smVlo/n5+/j4++rq8r+/2fPz+HeAt/z8/YODtO3t9OLi7ff3+t7e619fn/v7/cvL4JeXwe/v9fDw9uPj7tHR5FVVmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAABAH0AAAdsgGOCg4SFhoVLAAFMCC4bBFsDSUQFThgJCjAMN0EHOQtANSs8TTJWDxAROkgzOC0vXhMUP0cZFiglOx4gFT0GKRc+LFIcGlQCMV1CHWI2JB8hQyNaRlhhIko0USpXX2ANUw4mWVBPElxVJ0WBADs=);';
     header +=     '"><tr><td valign="top"><div style="width:228px;color:white;height:88px;padding:15px;padding-left:30px;text-shadow: black -2px -2px 5px, black 2px 2px 5px;font-family:Verdana,Arial;background-image:url('+SCRIPTSURL+'/images/left.png);background-repeat:no-repeat;"><span style="font-size:30px;">Jobmine Plus</span><br/><div style="margin-left:20px;">Browse jobs your way.</div></div></td>';
     header +=     '<td valign="top"><div class="links" style="margin-top:30px;width:820px;color:#CCCCCC;font-family: Arial, Verdana;outline: none; text-decoration:none;">'; 
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+PROFILE_PAGE+'>Profile</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+DOCUMENT_PAGE+'>Documents</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+JOB_SEARCH_PAGE +'>Job Search</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+JOB_SHORT_PAGE+'>Job Short List</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+APPLICATION_PAGE+'>Applications</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+INTERVIEW_PAGE+'>Interviews</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+RANKING_PAGE+'>Rankings</a> | ';
     //header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href='+WORK_REPORT_PAGE+'>Work Report Evalutions</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href="javascript:void(0)" width="500" height="400" class="popupOpen" id="settings_nav" popup="false">Settings</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href="javascript:void(0)" width="360" height="400" class="popupOpen" id="about_nav" popup="false">About</a> | ';
     header +=     '<a style="text-shadow: black -2px -2px  5px,black 2px 2px  5px;text-decoration:none;" href="javascript:saveWarning(\'main\',null,\'_top\',\'/servlets/iclientservlet/SS/?cmd=logout\')">Logout</a>';
     header +=     '</div></td><td width="100%" valign="top"><img style="float:right;" alt="" src="'+SCRIPTSURL+'/images/waterloo_logo.png"/></td></tr></table></div>';
     
     //Popup
     header +=     "<div id='popupContainer' style='display:none;'><div id='overlay'></div><div id='popupWrapper'><div id='popupContent' style='padding: 0px !important'><span id='panelWrapper'>";
     header +=     '<div class="panels" id="Settings" style="display: block; height: 100%;"><table style="width: 100%;" cellpadding="0" cellspacing="0" height="100%"><tr><td id="settingsLeft" valign="top"><div id="settingsNav" style="padding: 30px 0px; height: 100%;"></div></td><td id="settingsRight" valign="top"><div id="popupTitle" class="title"></div><div style="color: red; margin: 10px 0pt;">This uses cookies to save the following.</div><div id="settingsContent">';
     header +=      '</div><button class="button PSPUSHBUTTON" id="saveSettings">Save and Refresh</button><button style="float: right;" class="button PSPUSHBUTTON closePopup">Cancel</button></td></tr></table></div>';
     
     //About Popup
     header +=     "<div style='display:none;padding:20px;' class='panels' id='About'><b>Jobmine Plus v"+CURRENT_VERSION/100+"</b><br/><br/><span class='details'>Written by Matthew Ng<br/><br/>Website: <a href='http://userscripts.org/scripts/show/80771' target='_blank'>http://userscripts.org/scripts/show/80771</a><br/><br/>Any problems/issues/wanted features email me at:<br/><span class='details'>Email: <a href='mailto:jobmineplus@gmail.com'>jobmineplus@gmail.com</a></span></span><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><button style='float:right;' class='button closePopup PSPUSHBUTTON'>Cancel</button></div>";
     
     header +=     "</span></div></div></div>";
     
     //White overlay
     header +=     white_overlay();
     
     //Hint Popup
     header +=     "<div id='hintmsg' style='display:none;visibility:hidden;position:absolute;' class=''><a style='cursor:pointer;' popup='false'></a><div id='description'></div><input type='checkbox' id='preventShowingChkbx'  /><div id='preventShowingText'>Never show me this again.</div></div>";
     header +=     "<div id='cssLoadTest' style='visibility:hidden;display:block;'></div>";
     $("body").prepend(header);    
}

//Adds a new settings item under settings
function addSettingsItem(name, html)
{
     if(!document.getElementById("general_"+name.toLowerCase()))
     {
          $("#settingsNav").append('<a popup="false" href="javascript:void(0)">'+name+'</a>');
          $("#settingsContent").append('<div class="settingsItem" id="settings_'+name.toLowerCase()+'">'+html+'</div>');
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
{
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
          style.appendChild( document.createTextNode("@import '"+SCRIPTSURL+"/css/style2.css';") );
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
          
          //For iframes! :D
          $("body").append("<script language='javascript'>function runIframeFunction(name,_function){window.frames[name].eval(_function);}</script>");
/*======================================*\
l*        JOB SEARCH PAGE                                       |
\*======================================*/
          if(pagetype == "job_search_component")            
          {
               //Write the current term in cookies if it is specified  
               if($("#UW_CO_JOBSRCH_UW_CO_WT_SESSION")[0].value.trim() != ""){ writeCookie("CURTERM", $("#UW_CO_JOBSRCH_UW_CO_WT_SESSION")[0].value.trim());}
               
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
                         tableBody.each(function(row){ var obj = $(this).children();          
                         //HEADER
                              if(row == 0)   
                              {
                                   //Tells the table that the results are up
                                   $(this).parent().parent().addClass("results");
                                   
                                   //Adds new columns (status and hiring)
                                   obj.eq(0).before("<th class='PSLEVEL1GRIDCOLUMNHDR' align='left' scope='col'>Status</th>");
                                   obj.eq(8).after("<th title='You must be skilled to get the job, this is equation does not included your skill level.' class='PSLEVEL1GRIDCOLUMNHDR' align='left' scope='col'>Hiring Chances*</th>");
                              }
                         //CELLS
                              else      
                              {
                                    /*
                                    *   ADD THE STATUS COLUMN
                                    */
                                   var jobStatus = obj.eq(0);
                                   jobStatus.before("<td class='PSLEVEL1GRIDODDROW' align='left'>"+(obj.eq(6).find("div:contains('Already Applied')").length == 0 ? "New" : "Applied")+"</td>");
                               
                                   /*
                                    *   ADD THE HIRING CHANCES     
                                    */                                      
                                   var numApps = obj.eq(8);
                                   /*   Reading Purposes
                                        var openings = parseInt(obj.eq(5).html());
                                        var applications = parseInt(isNaN(parseInt(numApps.html()+1)) ? 1 : parseInt(numApps.html()+1));
                                   */
                                   numApps.after("<td title='You must be skilled to get the job, this is equation does not included your skill level.' class='PSLEVEL1GRIDODDROW' align='left'>"+Math.round((parseInt(obj.eq(5).html())/parseInt(isNaN(parseInt(numApps.html()+1)) ? 1 : parseInt(numApps.html()+1)))*10000)/100+"%</td>");
                                   
                                   if(obj.eq(7).children().html().trim() == "&nbsp;"){
                                        obj.eq(7).children().html("Not Able to Shortlist").attr("title","Jobmine has a thing where if you delete a job from shortlist, you cannot shortlist the job again. Sorry.");
                                   }
                                   
                                   /*
                                    *   ADD THE GOOGLE MAPS AND SEARCHES
                                    */ 
                                   var company = obj.eq(2).html().trim();
                                   var location = obj.eq(4).html().trim();
                                   
                                   //This is the Google search for the company
                                   obj.eq(2).wrapInner("<a class='googleSearch' title='Google Search that Company!!!'  target='_blank' href='http://www.google.ca/#hl=en&q="+company.replace(/\s/g,"+")+"'/>");            
                                   //This is for google map the location
                                   obj.eq(4).wrapInner("<a class='mapsSearch' title='Google Maps that Company!!!'  target='_blank' href='http://maps.google.ca/maps?hl=en&q="+company.replace(/\s/g,"+")+"+"+location.replace(/\s/g,"+")+"+"+$("#UW_CO_JOBSRCH_UW_CO_LOCATION").attr("value").replace(/\s/g,"+")+"'/>"); 
                                   
                                   /*
                                    *   CHANGE JOB DESCRIPTIONS
                                    */                  //Jobs appear as a tab now and it doesnt need to be refreshed                                  
                                   obj.eq(1).find("a").attr("href","https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID="+obj.eq(0).html().trim()).attr("target","_blank");
                              }         
                         });
                    }
                    
                    //Set the search visited when it ready
                    function setReadyVisited()
                    {
                         var totalRows = tables.find("tr");
                         if(totalRows.length > 2)           //Make sure the table isnt empty
                         {
                              //Each row
                              totalRows.each(function(row){
                                   if(row != 0)
                                   {
                                        /*
                                         *        VISITED LINK
                                         */
                                        var jobDescLink = $(this).children().eq(2).find("a");
                                        
                                        if(window.getComputedStyle(jobDescLink[0], null).getPropertyValue("color") == "rgb(0, 0, 254)")
                                        {
                                             //Change the color of the text and the 
                                             jobDescLink.css("color","#0000FF").parent().parent().parent().addClass("visited");
                                             
                                             //If you have not applied for the job, change the status
                                             if(jobDescLink.parent().parent().parent().find("td:first-child").html() != "Applied")
                                             {
                                                  jobDescLink.parent().parent().parent().find("td:first-child").html("Viewed");                                             
                                             }
                                        }
                                        /*
                                         *        NEW/UNVISITED LINK
                                         */
                                        else{
                                             jobDescLink.click(function(){
                                                  $(this).css("color","#0000FF").parent().parent().parent().addClass("visited").find("td:first-child").html("Viewed");
                                                  tables.trigger("update");                                             
                                             });
                                        }
                                        tables.trigger("update");
                                   }
                              });
                         }
                    }
                    
                    var tables = applyTableSorting("table table table.PSLEVEL1GRID",pagetype);
                    $("body > form > table").css("width","auto");
               }else{
                    $("form").css("margin-bottom","20px");
               }
          }
/*======================================*\
l*        PROFILE PAGE                                            |
\*======================================*/
          else if(pagetype == "student_data" && $("form > table:last-child").html()) 
          {
               var tables = applyTableSorting("table table table.PSLEVEL1GRID" , pagetype);
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
                    if(ISFIREFOX){
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

               var tables = applyTableSorting("table table.PSLEVEL1GRID" , pagetype);
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
                         var company = child.eq(2).html().trim();
                         var location = child.eq(4).html().trim();                         
                         child.eq(2).wrapInner("<a class='googleSearch' title='Google Search that Company!!!' target='_blank' href='http://www.google.ca/#hl=en&q="+company.replace(/\s/g,"+")+"'/>");            
                         child.eq(4).wrapInner("<a class='mapsSearch' title='Google Maps that Company!!!' target='_blank' href='http://maps.google.ca/maps?hl=en&q="+location.replace(/\s/g,"+")+"+"+company.replace(/\s/g,"+")+"'/>"); 
                         
                         //Change the hyperlink for the job descriptions
                         child.eq(1).find("a").attr("href","https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID="+child.eq(0).html().trim()).attr("target","_blank");
                    }    
               });
               //Add invisible iframe
               $("body").append("<iframe style='display:none;' name='hiddenIframe' id='hiddenIframe' width='100%' height='400' src=''></iframe>");  
               
               //Add the buttons that auto select/deselect the checkboxes
               $("#UW_CO_JSLIST_VW_").parent().parent().html("<td valign='top' height='30' colspan='13'><button class='deleteSelectedButton PSPUSHBUTTON' total='"+numOfChkbx+"' onclick='return false'>Delete Selected</button><button onclick='return selectAllChkbx(false,"+numOfChkbx+")' class='PSPUSHBUTTON'>Unselected All</button><button onclick='return selectAllChkbx(true,"+numOfChkbx+")' class='PSPUSHBUTTON'>Select All</button></td>");
               $("form > table > tbody > tr").eq(7).after("<tr><td valign='top' height='30' colspan='13'><button class='deleteSelectedButton PSPUSHBUTTON' total='"+numOfChkbx+"' onclick='return false'>Delete Selected</button><button onclick='return selectAllChkbx(false,"+numOfChkbx+")' class='PSPUSHBUTTON'>Unselected All</button><button onclick='return selectAllChkbx(true,"+numOfChkbx+")' class='PSPUSHBUTTON'>Select All</button></td></tr>");
               var tables = applyTableSorting("table table table.PSLEVEL1GRID" , pagetype);
               
               /*======================================*\
               l*        MULTISELECT CHECKBOXES                           |
               \*======================================*/
               
               //Binds so that the ids of the table are reset everytime
               tables.bind("sortEnd", function()
               {
                    tables.find("input").each(function(order){
                         $(this).attr("id","chkbx"+order);
                    });
                    anchorChkbox = null;
               });
               
               var anchorChkbox = null;
               var shiftDown = false;
               $(document).keydown(function(evt){if(evt.shiftKey){evt.preventDefault();shiftDown = true;}});
               $(document).keyup(function(evt){if(evt.keyCode == '16'){evt.preventDefault();shiftDown = false;}});
               $(".editChkbx").click(function(evt)
               {
                    var obj = $(this);
                    var row = parseInt(obj.attr("id").substr(obj.attr("id").indexOf("chkbx")+5));     
                    //If shift held, the anchor is set, and the checkbox is not the same as the last clicked
                    if(shiftDown && anchorChkbox != null && row != anchorChkbox)
                    {
                         if(anchorChkbox < row)        //Sees if you are going from down up or up down
                         {
                              for(var i=anchorChkbox; i<=row;i++){$("#chkbx"+i).attr("checked",obj.is(':checked'));}
                         }
                         else
                         {
                              for(var i=anchorChkbox; i>row;i--){$("#chkbx"+i).attr("checked",obj.is(':checked'));}
                         }
                    }   
                    anchorChkbox = row;                   
               });
               
               /*======================================*\
               l*        MULTIJOB REMOVAL                                     |
               \*======================================*/
               $('.deleteSelectedButton').click(function(){                 
                    var numChkbx = $(this).attr('total');
                    var iframeArray = new Array();
                    //Get the checkboxes in an array
                    tables.find("input").each(function(){
                         if($(this).attr("checked")){iframeArray.push($(this).attr("row"));}
                    });
                    iframeArray.sort(function(a,b){return a-b;});
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
                              if(ISFIREFOX){
                                   unsafeWindow.runIframeFunction("hiddenIframe","submitAction_main0(document,'main0','UW_CO_STUJOBLST$delete$"+(iframeArray.pop())+"$$0')");				
                              }else{
                                   runJS('runIframeFunction("hiddenIframe","submitAction_main0(document.main0,\'UW_CO_STUJOBLST$delete$'+(iframeArray.pop())+'$$0\')")');	
                              }
                         }
                         else if(iframeCounter > 0){     //Save 
                              loadPopupMsg("Each job removed needs to be refreshed, this will take a while because of Jobmine slowness. <br/><span style='color:red'>Saving now... Do not refresh.</span>");
                              $("title").html("Job Short List | Saving...");
                              iframeCounter = -1;      // go to next step
                              if(ISFIREFOX){
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
               //Functions for the buttons to do stuff     		
               if(ISFIREFOX){
                    unsafeWindow.selectAllChkbx = function(flag,numChkbx){for(var i=0;i<numChkbx;i++){$("#chkbx"+i).attr("checked",flag);}return false;};
               }else{
                    injectFunction("selectAllChkbx(flag,numChkbx){for(var i=0;i<numChkbx;i++){document.getElementById('chkbx'+i).checked = flag;}return false;}");
               }
          }
/*======================================*\
l*        APPLICATIONS PAGE                                    |
\*======================================*/
          else if(pagetype == "student_app_summary")
          {
               /*======================================*\
               l*        INITIAL CONTENT CHANGES                          |
               \*======================================*/
               var tables = applyTableSorting("table table table.PSLEVEL1GRID" , pagetype);
               tables.find("div.PSHYPERLINKDISABLED:contains('Edit Application')").html("Cannot Edit Application");
               tables.eq(0).find("td:contains('Ranking Completed')").html("Ranked or Offer").parent().attr("title","This means that the company you had an interview with has either ranked or offered you a job.");
               
               /*======================================*\
               l*        JOB ID STORAGE SYSTEM                             |
               \*======================================*/
               //SemiGlobal Variables, holds the important values to push in storage
               var company = "";
               var jobDescription = "";
               var clickedElement = {};
               
               //Check to see if we can use storage
               if(localStorage == null) {
                    alert("Sorry, storage (html5) not supported by the browser, please use a new version of the browser.");
                    return;
               }
               
               //Object that manages the storage of keys and jobs ids
               var appJobIdStorage = {
               //Variables
                    idKeys              : [],                                                  //holds the arrays of all the stuff
                    KEYNAME_APP   : "KEYBASE_NAME_APPLICATION",           //constant that holds the name of the key to access all the job keys
               //Inits the storage by getting all the id's
                    init:            function(){       try{
                         var keys = [];             
                         if( (keys = this.readID(this.KEYNAME_APP) ) !== false)
                         {    //Read the key if it exists
                              this.idKeys = keys.split(" ");
                         }    
                    }catch(e){alert("Init:\n"+e)}  },
               //Returns if the key exists
                    IDExists:      function(key){    
                         return this.readID(key) != false;
                    },
               //Sets the Job ID in storage, returns true if it works and false if it failed
                    addID:         function(key, value){    try{
                         //If it doesnt exist, put it into the array as well right our new list of keys
                         if( !this.IDExists(key) ){
                              this.idKeys.push(key);             alert("Adding "+key);
                              try{      //Try to update our list of keys
                                   localStorage.setItem(this.KEYNAME_APP, this.idKeys.join(" ") );          //Put a string of name delimited by a space
                              }catch(e){
                                   alert("Failed to write to storage:\n"+e);  return false;
                              }
                         }
                    //Try to store the item
                         try{
                              localStorage.setItem(key, value);
                         }catch(e){
                              alert("Failed to write to storage:\n"+e); return false;
                         }
                         return true;
                    }catch(e){alert("add:\n"+e)}       },
                    
                    //Read an ID or return false if not found
                    readID:         function(key){          try{
                         var value = localStorage.getItem(key);
                         return value != null ? value : false;
                    }catch(e){alert("read:\n"+e)}         },
                    
                    //Removes a value, returns the value if it worked, if not then it returns false
                    removeID:     function(key){       try{
                         var value;
                         if(value = this.readID(key))
                         {
                              localStorage.removeItem(key);
                              return value;
                         }
                         return false;
                    }catch(e){alert("remove:\n"+e)}     }
               };
               appJobIdStorage.init();
               
               //Once a user clicks a job without an ID, this runs the hyperlink in the iframe
               function lookupJobID(evt)
               {
                    //Write these into the variables of the parent scope
                    clickedElement = $(this);
                    company = clickedElement.attr("company");
                    jobDescription = clickedElement.html().trim().replace(/\xA0/g, " ");
                    
                    var _company      = encodeURIComponent(company);
                    var _description   = encodeURIComponent(jobDescription);
                    
                    //Set the source for the iframe
                    $("#hiddenIframe").attr("src",
                         "https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&Page=UW_CO_STU_JOBDTLS&UW_CO_JOB_TITLE="+_description+"&UW_CO_PARENT_NAME="+_company
                    );
               }
               
               //Create a temporary Array to hold all our keys
               var keyIndex = [];
               for(var i=0; i<appJobIdStorage.idKeys.length; i++)
               {
                    var item = appJobIdStorage.idKeys[i];
                    var keyCompanyName =  item.substring(0, item.lastIndexOf("|")).replace(/_/g, " ");
                    var keyDescription      =  item.substr(item.lastIndexOf("|")+1).replace(/_/g, " ");
                    var keyValue              = appJobIdStorage.readID(item);
                    //If value is false, that means it does not exist in the storage
                    if(keyValue === false){alert("Something broke"); return;}
                    
                    keyIndex[keyCompanyName] = new Array(keyDescription, keyValue);
               }
               
               //Add company for google search
               $("body > form > table td.tablepanel table.PSLEVEL1GRID tr:last-child td tr").each(function(rowNum){
                    //Do something on each row
                    var row = $(this).children();
                    if(row[0].nodeName.toUpperCase() != "TH")   
                    {
                         var companyName = row.eq(2).html().trim().replace(/\xA0/g, " ");           //Break the nbps; back to a space
                         var linkCol1Obj = row.eq(1).find("a");
                         
                        
                         if(  keyIndex[companyName] != null                                                                  //Do we have this job id in storage
                         && linkCol1Obj.html().trim().replace(/\xA0/g, " ") == keyIndex[companyName][0]       //Are the job descriptions the same?
                         //If the above conditions are true, then we have the link to this object
                         ){
                              linkCol1Obj.css("color", "red").attr("href","https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID="+keyIndex[companyName][1]).attr("target","_blank");
                         }
                         //Give the links an eventlistener to find the links
                         else
                         {
                              linkCol1Obj.attr("href","javascript:void").attr("popup","false").attr("company", companyName).bind("click", lookupJobID);
                         }
                         
                         //Add the Google Search for company names
                         row.eq(2).wrapInner("<a class='googleSearch' title='Google Search that Company!!!' target='_blank' href='http://www.google.ca/#hl=en&q="+companyName.replace(/\s/g,"+")+"'/>");  
                    }
               });
               
               //Make an invisible iframe to handle links
               $("body").append('<iframe width="100%" height="35%" src="" id="hiddenIframe" name="hiddenIframe" style="display: none;position:fixed;bottom:0px;"></iframe>');     
               
               //Runs when the application form loads, this is where we can manipulate the id          
               $("#hiddenIframe").load(function(){try{
                    var jobID = getCookieValue("APP_LAST_ID");
                    
                    //If there is a location in the iframe and if the jobid is value
                    if( $(this).attr("src") != "" && jobID != -1)
                    {
                         hideLoadingPopup();
                         //Add the id:  name|description = value
                         appJobIdStorage.addID( company.replace(/\s/g, "_")+"|"+jobDescription.replace(/\s/g, "_") , jobID);
                         
                         //Give that link we clicked the new link
                         clickedElement.unbind().css("color", "red").attr("href","https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID="+jobID).attr("target","_blank");
                         writeCookie("APP_LAST_ID", "-1");            //we have read the id, we dont need it anymore
                    }
                    
                    }catch(e){alert(e)}
               });
          }
/*======================================*\
l*        Interview Page                                           |
\*======================================*/
          else if(pagetype == "student_interviews")
          {  
               //Add an extra column for google calendars
               tableBody = $("table table table.PSLEVEL1GRID:eq(0) tr");
               if(tableBody.length > 2)      //Must have something in the table
               {
                    tableBody.each(function(rowNum){                                                
                         var row = $(this).children();                         
                         if(rowNum == 0)   //Header
                         {
                              //Adds a changes row
                              row.eq(12).after("<th class='PSLEVEL1GRIDCOLUMNHDR' align='left' scope='col'>Google Calendar</th>");
                         }
                         else      //Pull information and make the Google Calendars button
                         {    
                              //Change the hyperlink for the job descriptions
                              row.eq(3).find("a").attr("href","https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID="+row.eq(1).html().trim()).attr("target","_blank");
                         
                              //Parse the date
                              var date = row.eq(4).html().trim().split(" ");
                              var day = date[0];
                              var month = parseMonth(date[1]);
                              var year = date[2];
                              
                              //Parse the time
                              var time = row.eq(7).html().trim().split(" ");
                              var dateStr;
                              if(time != "")
                              {          
                              //How long is the interview
                                   var length = parseInt(row.eq(8).html().trim());        
                              //Find start time
                                   var sMin = time[0].split(":")[1];                                 
                                   var sHour = time[0].split(":")[0];
                                   sHour = parseInt(sHour[0] == "0" ? sHour.substring(1) : sHour);      //remove leading zeros                                   
                                   sHour +=  parseInt(new Date().getTimezoneOffset()/60 + (time[1] == "pm" && sHour != "12" ? 12 : 0));
                              //Find the ending time                                   
                                   var eMin = parseInt(sMin) + length;
                                   var eHour = sHour;
                                   if(eMin >= 60)           //Overflow in time
                                   {
                                        eMin = ((eMin-60)+"").length < 2 ?  "0"+(eMin-60) : eMin-60;
                                        eHour += 1;
                                   }   
                                   //Write the time string to be parsed by Google Calendar
                                   dateStr = year + month + day + "T" + sHour + sMin + "00Z/" + year + month + day + "T" + eHour + eMin + "00Z";
                              }
                              
                              //Other pieces of info
                              var location = row.eq(9).html().replace(/&nbsp;/g," ").trim(); location = location != "" ? "Tatham Centre: Room "+location : "Offsite Location (check description)";
                              var company = row.eq(2).html().trim();
                              var type = row.eq(5).html().trim();
                              var instructions = row.eq(10).html().replace(/&nbsp;/g," ").trim(); instructions = instructions != "" ? "\nExtra Information:\n"+instructions : "";
                              var interviewer = row.eq(11).html().trim();
                              var jobTitle = row.eq(3).find("a").html().trim();
                              
                              //Write the details
                              var details = (type + " interview with " + company + " (" + interviewer + ")\nTitle: "+ jobTitle + "\n"+instructions).replace(/ /g,"%20").replace(/\n/g,"%0A").replace(/:/g,"%3A").replace(/,/g,"%2C").replace(/,/g,"%2C");
                              
                              //Check to see all fields are valid before we add the calendar, else leave it blank
                              if(month && time != "" && type && jobTitle){
                                   row.eq(12).after('<td title="Click to add to Google Calendar!" class="PSLEVEL1GRIDODDROW" align="left"><a href="http://www.google.com/calendar/event?action=TEMPLATE&text=Coop Interview with '+company+'&dates='+dateStr+'&details='+details+'&location='+location+'&trp=false&sprop=&sprop=name:" target="_blank"><img src="http://www.google.com/calendar/images/ext/gc_button6.gif" border=0></a></td>');
                              }else{
                                   row.eq(12).after('<td class="PSLEVEL1GRIDODDROW" align="left">&nbsp;</td>');
                              }
                         }         
                    });
               }
               var tables = applyTableSorting("table table table.PSLEVEL1GRID" , pagetype);
          }
          else
/*======================================*\
l*        OTHER PAGES                                             |
\*======================================*/
          {
               var tables = applyTableSorting("table table table.PSLEVEL1GRID" , pagetype);
          }
/*======================================*\
l*        HINT SYSTEM                                             |
\*======================================*/
          //Constants 
          var hintArray = new Array();
          hintArray["com"] = new Array();
          hintArray["apps"] = new Array();
          hintArray["short"] = new Array();
          hintArray["search"] = new Array();
         
          //Common hints for all pages
          hintArray["com"].push({page: "com",percentage: 0.4,obj:$("#settings_nav")[0], text : "Check out the settings tab to customize your experience. You can remove the timer and/or set the default page Jobmine Plus loads."});
          hintArray["com"].push({page: "com",percentage: 0.3,obj:tables.find("th.PSLEVEL1GRIDCOLUMNHDR.header")[2], text : "Click the header a column to sort jobs and other information."});
          hintArray["com"].push({page: "com",percentage: 0.4,obj:$("#about_nav")[0], text : "Send me an email if you have any questions, concerns or wanted features."});
          
          //Applications hints
          hintArray["apps"].push({page: "apps",percentage: 0.4,obj:tables.find("a.googleSearch")[0], text : "You can now select the company name and Jobmine Plus will Google search it for you in a new tab."});
          
          //Shortlist hints
          hintArray["short"].push({page: "short",percentage: 0.5,obj:tables.find("input.editChkbx")[0], text : "You can delete multiple short list jobs with checkboxes. It also supports shift-click functionality."});
          
          //Job Search hints
          hintArray["search"].push({page: "search",percentage: 0.4,obj:tables.find("a.mapsSearch")[0], text : "You can now select the location and Jobmine Plus will Google Maps it for you."});
          hintArray["search"].push({page: "search",percentage: 0.3,obj:tables.find("th.PSLEVEL1GRIDCOLUMNHDR:contains('Hiring Chances*')")[0], text : "This is hiring changes. Note: you need to be skilled to get the job, I am not responsible for incorrect statistics."});
          
          function saveTooltip()
          {               
              var cookieQuery = $("#enableTooltip")[0].checked ? 1 : 0;  
               if(cookieQuery != 0)               //is tooltips enabled?           
               {
                    var searchTable = $("#settings_tooltip table");
                    for(var page in hintArray)
                    {
                         if(page != "enable")
                         {
                              cookieQuery += "|"+page +"=";
                              for(var i=0;i<hintArray[page].length;i++){cookieQuery += (searchTable.find("input[num='"+i+"'][page='"+page+"']")[0].checked ? 1 : 0) + ",";}
                              cookieQuery = cookieQuery.slice(0, -1);        //removes last comma                    
                         }
                    }
               }
               writeCookie("TOOLTIP", cookieQuery);         //alert(cookieQuery);
          }
                  
          //Closes and fades out the hint box
          $("#hintmsg a").bind("click",function(){
               $(this).unbind("click");
               $(window).unbind("resize");
               $(this.parentNode).fadeOut(500);
               
               if($("#preventShowingChkbx").attr("checked"))
               {              
                    var index = 0;
                    var query = getCookieValue("TOOLTIP").split("|");
                    var page = $("#preventShowingChkbx").attr("page");
                    while(query[index].indexOf(page+"=") == -1 && index++ < query.length);
                    var selectedValues = query.splice(index,1).toString().split("=")[1].split(",");
                    index = $("#preventShowingChkbx").attr("num");
                    if(index > selectedValues.length)       //if the jobmine plus has a new hint that is not in cookies
                    {
                         var diff = index-selectedValues.length;
                         var count = hintArray[page].length - selectedValues.length;
                         for(var i=0; i<count;i++){
                              if(i == diff){selectedValues.push(0);}       //when they are the same           
                              else{selectedValues.push(1);}
                         }
                    }
                    else                                              //if the hint is in the cookies
                    {
                         selectedValues.splice(index, 1, 0);          //we go to the index in the array and replace it with 0 (which is false)
                    }
                    query.push(page+"="+selectedValues.join(","));
                    writeCookie("TOOLTIP", query.join("|"));
             }
          });
          
          var tempPageHint;
          
          //Map the hints
          switch(pagetype)
          {
               case "student_app_summary":
                    tempPageHint = hintArray["apps"];
                    break;
               case "job_short_list":
                    tempPageHint = hintArray["short"];
                    break;
               case "job_search_component":
                    tempPageHint = hintArray["search"];
                    break;
               default:
                    tempPageHint = new Array();
                    break;
          }
          
          function positionHint(objPoint)
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
                    if((objLeft+VERTICALHINT[0]/2)*parseInt(1+marginPercentage) > window.innerWidth){orientation = "right";}
                    else if(objLeft-VERTICALHINT[0]/2 < window.innerWidth*marginPercentage){orientation = "left";}
                    else{orientation = "up";}
               }
               else
               {
                    if((objLeft+VERTICALHINT[0]/2)*parseInt(1+marginPercentage) > window.innerWidth){orientation = "right";}
                    else if(objLeft-VERTICALHINT[0]/2 < window.innerWidth*marginPercentage){orientation = "left";}
                    else{orientation = "down";}
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
               $("#hintmsg").css("left",objLeft+"px").css("top",objTop+"px");
          }
          
          function randomizeHints(array)
          {
               //Load cookie
               var cookieVal = getCookieValue("TOOLTIP");
               if(cookieVal != 0)       //Do not show any hints 
               {
                    //Choose a random hint
                    var randomIndex = Math.floor(Math.random()*array.length+1)-1;
                    var hint = array[randomIndex];
                    var chosenIndex = Math.floor(Math.random()*101);
                    //See if we display it based on the percentage probability
                    var probability = hint.percentage*100;
                    
                    //See if user has disabled selected cookie
                    var index = 0;
                    if(cookieVal != -1 && cookieVal.indexOf("1|") == 0) //no cookie exists
                    {
                         var query = cookieVal.split("|");          
                         while(query[index].indexOf(hint.page+"=") == -1 && index++ < query.length);
                         var selectedValues = query.splice(index,1).toString().split("=")[1].split(",");
                         var number = hint.page != "com" ? randomIndex : randomIndex - tempPageHint.length;
                    }
                    else{
                         var selectedValues = new Array();
                         
                         //Build a default cookie
                         var cookieQuery = "1";
                         for(var page in hintArray)
                         {
                              if(page != "enable")
                              {
                                   cookieQuery += "|"+page +"=";
                                   for(var i=0;i<hintArray[page].length;i++){cookieQuery += "1,";}
                                   cookieQuery = cookieQuery.slice(0, -1);        //removes last comma                    
                              }
                         }
                         writeCookie("TOOLTIP", cookieQuery);         //alert(cookieQuery);
                    }
                    
                    //Show it
                    if(selectedValues[number] != 0 && chosenIndex <= probability && hint.obj)   //also check if user blocked this hint
                    {
                         positionHint(hint.obj);                    
                         $("#hintmsg #description").html(hint.text);
                         $("#preventShowingChkbx").attr("page",hint.page);
                         $("#preventShowingChkbx").attr("num", number);
                         $("#hintmsg").fadeIn(1200);
                         
                         //Window Resizing and reposition
                         $(window).bind("resize",function(){positionHint(hint.obj);});
                    }
               }
          }
          
          //Generate the Tooltip Settings page
          var tooltipGenerated = "<div style='margin-bottom:15px;'><input id='enableTooltip' class='tooltipChkbx' type='checkbox'/>Enable Tooltips</div><table cellpadding='0' cellspacing='0'>";
          var index=0;
          for(var page in hintArray)
          {
               var arr = hintArray[page];
               for(var i=0;i<arr.length;i++)
               {
                    tooltipGenerated += "<tr><td valign='top'><input id='toolChkbx"+(index++)+"' class='tooltipChkbx' page='"+page+"' num='"+i+"' type='checkbox'/></td><td class='details' valign='top'>"+arr[i].text+"<br/><br/></td></tr>";
               }
          }
          tooltipGenerated += "</table>";
          index = null;
/*======================================*\
l*        SETTINGS                                                  |
\*======================================*/        
          //Build the settings
          addSettingsItem("General",SETTINGS_GENERAL);
          addSettingsItem("Tooltip",tooltipGenerated);
          
          //Clicking the menu nav under settings
          $("#settingsNav a").click(function(){
               var name = $(this).html();
               $("#popupTitle").html(name+" Settings");
               for(var i=0;i<$("#settingsContent")[0].childNodes.length;i++){$("#settingsContent")[0].childNodes[i].style.display='none';}     
               $("#settings_"+name.toLowerCase()).css("display","block");
          });
          
          function saveGeneralSettings()
          {
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
          }
          
          //Mainly only for settings
          $("#saveSettings").click(function(){
               saveGeneralSettings();
               saveTooltip();
               hidePopup();
               showLoadingPopup();
               window.location.href = window.location.href;
          });
          
          //Bind the change event listener to the checkbox
          $("#removeTimerChkbx").change(function(){toggleRemoveTimer(this);});
          $("#enableTooltip").change(function(){toggleEnableTooltip(this);});
          
          /*
           *   POPUP TOGGLES
           */
          //Toggle the tooltip enable
          function toggleEnableTooltip(obj){
               if(obj.checked){  $(obj.parentNode.nextSibling).removeClass("disabled").find("input").removeAttr("disabled").attr("checked","checked");}
               else{$(obj.parentNode.nextSibling).addClass("disabled").find("input").attr("disabled","disabled");}
          };
          
          //Shows the text description if checked
          function toggleRemoveTimer(obj){
               if(obj.checked){    $("#popupText").removeAttr("disabled").css("background-color","white").css("color","black").parent().prev().css("color","black").removeClass("disabled");}
               else{$("#popupText").attr("disabled","disabled").css("background-color","#EEE").css("color","#CCC").parent().prev().addClass('disabled').css("color","#CCC");}
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
                    for(var i=0;i<$("#panelWrapper")[0].childNodes.length;i++){$("#panelWrapper")[0].childNodes[i].style.display='none';}                      
                    $("#"+panelName).css("display","block");
                    $('#popupTitle').html(panelName);
                    $("#popupContainer").css("display","block");
                    $("body").css("overflow","hidden");
                    
                    //Resize
                    $("#popupContent").css("width",width+"px").css("height",height+"px").css("left",-width/2+"px").css("top",-height/2+"px");
                    
                    //Load preferences from cookies
                    if(panelName == "Settings")  
                    {    //Load all the general settings from cookies
                         $('#popupTitle').html("General Settings");
                         $("#popupSelect").attr("value",getCookieValue('DEFAULT_PAGE'));
                         $("#popupText").attr("value",(getCookieValue('AUTO_REFRESH') != -1 ? getCookieValue('AUTO_REFRESH') : 0));
                         $('#removeTimerChkbx').attr("checked",(getCookieValue('DISABLE_TIMER') == 1 ? true : false));  
                         $('#updateCheckbox').attr("checked",(getCookieValue('HIDE_UPDATES') == 1 ? true : false));  
                         $('#loadCheckbox').attr("checked",(getCookieValue('LOAD_SCREEN') == 1 ? true : false));  
                         
                         //Load all the tooltip settings from cookies
                         var cookieVal = getCookieValue("TOOLTIP");
                         var query = cookieVal == -1 ? new Array(0) : cookieVal.split("|");
                         if(query.shift() != 0)        //is tooltips enabled?
                         {
                              $("#enableTooltip").attr("checked","checked").parent().next().removeClass("disabled").find("input").removeAttr("disabled");
                              for(var page in hintArray)          //Each Page
                              {
                                   //Find the index we need and populate an array, if the hint has nothing in it, ignore it
                                   if(hintArray[page].length > 0)     
                                   {
                                        if(query.length > 0){         //Does the page in the cookie exist?
                                             var index = 0;
                                             while(query[index].indexOf(page+"=") == -1 && index++ < query.length);     //Find the right array inside query
                                             var savedValues = query.splice(index,1).toString().split("=")[1].split(",");
                                        } 
                                        else{savedValues = new Array();}
                                        for(var i=0;i<hintArray[page].length;i++){         //Each value of that page
                                             if(savedValues[i])       //is there any values in that page of the cookie?
                                                  {$("#settings_tooltip table input[num='"+i+"'][page='"+page+"']")[0].checked = savedValues[i] != 0;}
                                             else
                                                  {$("#settings_tooltip table input[num='"+i+"'][page='"+page+"']")[0].checked = true;}
                                        }
                                   }
                              }
                         }
                         else
                         {
                              $("#enableTooltip").removeAttr("checked");
                              toggleEnableTooltip(document.getElementById("enableTooltip"));
                         }
                         
                         //Set Toggles
                         toggleRemoveTimer(document.getElementById("removeTimerChkbx"));
                         
                         for(var i=0;i<$("#settingsContent")[0].childNodes.length;i++){$("#settingsContent")[0].childNodes[i].style.display='none';}     
                         $("#settingsContent")[0].firstChild.style.display = "block";
                    }
               }
          }
          
          function hidePopup(){$("#popupContainer").css("display","none");$("body").css("overflow","auto");$("#panelWrapper").children().each(function(){$(this).css("display","none");});};
          
          //When to run the white overlay
          if(getCookieValue('LOAD_SCREEN') != 1)
          {
               $("a").click(function(){
                    if($(this).attr("target")!= "_blank" && $(this).attr("target") != "new" && $(this).attr("popup")!= "false" && $(this).parent().html().indexOf('onclick="return ') == -1  && $(this).attr('href').indexOf('mailto') == -1){
                         showLoadingPopup();
                    }
               });

               $("input").click(function(){
                    if($(this).attr("type") == "button"){
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
               if(ISFIREFOX){
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
               //2nd setTimeout Fixes Chrome refresh after add shortlist from search
                    setTimeout(function(){
                         setTimeout(function(){
                         window.location = window.location;
                         }, 19 * 1000 * 60);
                    },1);
               }else{
                    document.addEventListener('click',resetGlobalTimer,true);
                    resetGlobalTimer();
               }
          }
/*======================================*\
l*        CSS READY LOAD                                        |
\*======================================*/  
          cssReady(function(){
               try{
               
               randomizeHints(tempPageHint.concat(hintArray["com"]));
               
               //If we are at jobs, we can run the visited highlighting and sorting
               if(pagetype == "job_search_component"){ setReadyVisited(); }
               
               
               }catch(e){alert(e)}
          },200);
/*======================================*\
l*        HIGHLIGHTING                                            |
\*======================================*/         
          // Set syntax highlighting colours for various statuses
          var VERYGOOD   = "#9f9";
          var GOOD          = "#61efef";
          var MEDIOCRE    = "#faf39a";
          var BAD             = "#fdaaaa";
          var WORST        = "#b5bbc1";
          
          if(tables)
          {
               switch(pagetype)
               {
                    case "student_app_summary":
                         tables.find("tr").find("td:first, th:first").remove();
                         tables.find("tr:contains('Ranking')").find("td").css("background-color",MEDIOCRE);
                         tables.find("tr:contains('Ranking Complete')").find("td").css("background-color",BAD);
                         tables.find("tr:contains('Ranked or Offer')").find("td").css("background-color",GOOD);
                         tables.find("tr:contains('Selected')").find("td").css("background-color",VERYGOOD);	
                         tables.find("tr:contains('Alternate')").find("td").css("background-color",MEDIOCRE);
                         tables.find("tr:contains('Scheduled')").find("td").css("background-color",VERYGOOD);
                         tables.find("tr:contains('Employed')").find("td").css("background-color",VERYGOOD);
                         tables.find("tr:contains('Not Selected')").find("td").css("background-color",WORST);
                         tables.find("tr:contains('Filled')").find("td").css("background-color",BAD);
                         tables.find("tr:contains('Not Ranked')").find("td").css("background-color",WORST);
                         tables.find("tr:contains('Applied')").find("td").css("background-color",'');
                         tables.find("tr:contains('Approved')").find("td").css("background-color",BAD);
                         tables.find("tr:contains('Cancelled')").find("td").css("background-color",BAD);
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
                         tables.find("tr:contains('Screened')").find("td").css("background-color",VERYGOOD);
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
                         tables.find("tr:contains('Already Applied')").find("td").css("background-color",WORST);
                         break;
               }
          }
     } 
}


/*
 *   Start running code
 */
startOperation();