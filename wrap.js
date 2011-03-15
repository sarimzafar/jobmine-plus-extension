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
var ISFIREFOX = unsafeWindow.toString().indexOf("[object Window]")!=-1;
var IS_IN_IFRAME = (self != top);
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
 *        Debug 
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
   
}catch(e){alert("Debug: "+e)}
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
          if(foundJobID == 0){
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
          if(!isNumeric( foundJobID )){
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
 *   TableSorter  http://tablesorter.com/
 */
(function($){$.extend({tablesorter:new
function(){var parsers=[],widgets=[];this.defaults={cssHeader:"header",cssAsc:"headerSortUp",cssDesc:"headerSortDown",cssChildRow:"expand-child",sortInitialOrder:"asc",sortMultiSortKey:"shiftKey",sortForce:null,sortAppend:null,sortLocaleCompare:true,textExtraction:"simple",parsers:{},widgets:[],widgetZebra:{css:["even","odd"]},headers:{},widthFixed:false,cancelSelection:true,sortList:[],headerList:[],dateFormat:"us",decimal:'/\.|\,/g',onRenderHeader:null,selectorHeaders:'thead th',debug:false};function benchmark(s,d){log(s+","+(new Date().getTime()-d.getTime())+"ms");}this.benchmark=benchmark;function log(s){if(typeof console!="undefined"&&typeof console.debug!="undefined"){console.log(s);}else{alert(s);}}function buildParserCache(table,$headers){if(table.config.debug){var parsersDebug="";}if(table.tBodies.length==0)return;var rows=table.tBodies[0].rows;if(rows[0]){var list=[],cells=rows[0].cells,l=cells.length;for(var i=0;i<l;i++){var p=false;if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){p=getParserById($($headers[i]).metadata().sorter);}else if((table.config.headers[i]&&table.config.headers[i].sorter)){p=getParserById(table.config.headers[i].sorter);}if(!p){p=detectParserForColumn(table,rows,-1,i);}if(table.config.debug){parsersDebug+="column:"+i+" parser:"+p.id+"\n";}list.push(p);}}if(table.config.debug){log(parsersDebug);}return list;};function detectParserForColumn(table,rows,rowIndex,cellIndex){var l=parsers.length,node=false,nodeValue=false,keepLooking=true;while(nodeValue==''&&keepLooking){rowIndex++;if(rows[rowIndex]){node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);nodeValue=trimAndGetNodeText(table.config,node);if(table.config.debug){log('Checking if value was empty on row:'+rowIndex);}}else{keepLooking=false;}}for(var i=1;i<l;i++){if(parsers[i].is(nodeValue,table,node)){return parsers[i];}}return parsers[0];}function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){return rows[rowIndex].cells[cellIndex];}function trimAndGetNodeText(config,node){return $.trim(getElementText(config,node));}function getParserById(name){var l=parsers.length;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==name.toLowerCase()){return parsers[i];}}return false;}function buildCache(table){if(table.config.debug){var cacheTime=new Date();}var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={row:[],normalized:[]};for(var i=0;i<totalRows;++i){var c=$(table.tBodies[0].rows[i]),cols=[];if(c.hasClass(table.config.cssChildRow)){cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);continue;}cache.row.push(c);for(var j=0;j<totalCells;++j){cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));}cols.push(cache.normalized.length);cache.normalized.push(cols);cols=null;};if(table.config.debug){benchmark("Building cache for "+totalRows+" rows:",cacheTime);}return cache;};function getElementText(config,node){var text="";if(!node)return"";if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;if(config.textExtraction=="simple"){if(config.supportsTextContent){text=node.textContent;}else{if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){text=node.childNodes[0].innerHTML;}else{text=node.innerHTML;}}}else{if(typeof(config.textExtraction)=="function"){text=config.textExtraction(node);}else{text=$(node).text();}}return text;}function appendToTable(table,cache){if(table.config.debug){var appendTime=new Date()}var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];for(var i=0;i<totalRows;i++){var pos=n[i][checkCell];rows.push(r[pos]);if(!table.config.appender){var l=r[pos].length;for(var j=0;j<l;j++){tableBody[0].appendChild(r[pos][j]);}}}if(table.config.appender){table.config.appender(table,rows);}rows=null;if(table.config.debug){benchmark("Rebuilt table:",appendTime);}applyWidget(table);setTimeout(function(){$(table).trigger("sortEnd");},0);};function buildHeaders(table){if(table.config.debug){var time=new Date();}var meta=($.metadata)?true:false;var header_index=computeTableHeaderCellIndexes(table);$tableHeaders=$(table.config.selectorHeaders,table).each(function(index){this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];this.order=formatSortingOrder(table.config.sortInitialOrder);this.count=this.order;if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);if(!this.sortDisabled){var $th=$(this).addClass(table.config.cssHeader);if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);}table.config.headerList[index]=this;});if(table.config.debug){benchmark("Built headers:",time);log($tableHeaders);}return $tableHeaders;};function computeTableHeaderCellIndexes(t){var matrix=[];var lookup={};var thead=t.getElementsByTagName('THEAD')[0];var trs=thead.getElementsByTagName('TR');for(var i=0;i<trs.length;i++){var cells=trs[i].cells;for(var j=0;j<cells.length;j++){var c=cells[j];var rowIndex=c.parentNode.rowIndex;var cellId=rowIndex+"-"+c.cellIndex;var rowSpan=c.rowSpan||1;var colSpan=c.colSpan||1
var firstAvailCol;if(typeof(matrix[rowIndex])=="undefined"){matrix[rowIndex]=[];}for(var k=0;k<matrix[rowIndex].length+1;k++){if(typeof(matrix[rowIndex][k])=="undefined"){firstAvailCol=k;break;}}lookup[cellId]=firstAvailCol;for(var k=rowIndex;k<rowIndex+rowSpan;k++){if(typeof(matrix[k])=="undefined"){matrix[k]=[];}var matrixrow=matrix[k];for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){matrixrow[l]="x";}}}}return lookup;}function checkCellColSpan(table,rows,row){var arr=[],r=table.tHead.rows,c=r[row].cells;for(var i=0;i<c.length;i++){var cell=c[i];if(cell.colSpan>1){arr=arr.concat(checkCellColSpan(table,headerArr,row++));}else{if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){arr.push(cell);}}}return arr;};function checkHeaderMetadata(cell){if(($.metadata)&&($(cell).metadata().sorter===false)){return true;};return false;}function checkHeaderOptions(table,i){if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){return true;};return false;}function checkHeaderOptionsSortingLocked(table,i){if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;return false;}function applyWidget(table){var c=table.config.widgets;var l=c.length;for(var i=0;i<l;i++){getWidgetById(c[i]).format(table);}}function getWidgetById(name){var l=widgets.length;for(var i=0;i<l;i++){if(widgets[i].id.toLowerCase()==name.toLowerCase()){return widgets[i];}}};function formatSortingOrder(v){if(typeof(v)!="Number"){return(v.toLowerCase()=="desc")?1:0;}else{return(v==1)?1:0;}}function isValueInArray(v,a){var l=a.length;for(var i=0;i<l;i++){if(a[i][0]==v){return true;}}return false;}function setHeadersCss(table,$headers,list,css){$headers.removeClass(css[0]).removeClass(css[1]);var h=[];$headers.each(function(offset){if(!this.sortDisabled){h[this.column]=$(this);}});var l=list.length;for(var i=0;i<l;i++){h[list[i][0]].addClass(css[list[i][1]]);}}function fixColumnWidth(table,$headers){var c=table.config;if(c.widthFixed){var colgroup=$('<colgroup>');$("tr:first td",table.tBodies[0]).each(function(){colgroup.append($('<col>').css('width',$(this).width()));});$(table).prepend(colgroup);};}function updateHeaderSortCount(table,sortList){var c=table.config,l=sortList.length;for(var i=0;i<l;i++){var s=sortList[i],o=c.headerList[s[0]];o.count=s[1];o.count++;}}function multisort(table,sortList,cache){if(table.config.debug){var sortTime=new Date();}var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;for(var i=0;i<l;i++){var c=sortList[i][0];var order=sortList[i][1];var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));var e="e"+i;dynamicExp+="var "+e+" = "+s;dynamicExp+="if("+e+") { return "+e+"; } ";dynamicExp+="else { ";}var orgOrderCol=cache.normalized[0].length-1;dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";for(var i=0;i<l;i++){dynamicExp+="}; ";}dynamicExp+="return 0; ";dynamicExp+="}; ";if(table.config.debug){benchmark("Evaling expression:"+dynamicExp,new Date());}eval(dynamicExp);cache.normalized.sort(sortWrapper);if(table.config.debug){benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);}return cache;};function makeSortFunction(type,direction,index){var a="a["+index+"]",b="b["+index+"]";if(type=='text'&&direction=='asc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";}else if(type=='text'&&direction=='desc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";}else if(type=='numeric'&&direction=='asc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";}else if(type=='numeric'&&direction=='desc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";}};function makeSortText(i){return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";};function makeSortTextDesc(i){return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";};function makeSortNumeric(i){return"a["+i+"]-b["+i+"];";};function makeSortNumericDesc(i){return"b["+i+"]-a["+i+"];";};function sortText(a,b){if(table.config.sortLocaleCompare)return a.localeCompare(b);return((a<b)?-1:((a>b)?1:0));};function sortTextDesc(a,b){if(table.config.sortLocaleCompare)return b.localeCompare(a);return((b<a)?-1:((b>a)?1:0));};function sortNumeric(a,b){return a-b;};function sortNumericDesc(a,b){return b-a;};function getCachedSortType(parsers,i){return parsers[i].type;};this.construct=function(settings){return this.each(function(){if(!this.tHead||!this.tBodies)return;var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;this.config={};config=$.extend(this.config,$.tablesorter.defaults,settings);$this=$(this);$.data(this,"tablesorter",config);$headers=buildHeaders(this);this.config.parsers=buildParserCache(this,$headers);cache=buildCache(this);var sortCSS=[config.cssDesc,config.cssAsc];fixColumnWidth(this);$headers.click(function(e){var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;if(!this.sortDisabled&&totalRows>0){$this.trigger("sortStart");var $cell=$(this);var i=this.column;this.order=this.count++%2;if(this.lockedOrder)this.order=this.lockedOrder;if(!e[config.sortMultiSortKey]){config.sortList=[];if(config.sortForce!=null){var a=config.sortForce;for(var j=0;j<a.length;j++){if(a[j][0]!=i){config.sortList.push(a[j]);}}}config.sortList.push([i,this.order]);}else{if(isValueInArray(i,config.sortList)){for(var j=0;j<config.sortList.length;j++){var s=config.sortList[j],o=config.headerList[s[0]];if(s[0]==i){o.count=s[1];o.count++;s[1]=o.count%2;}}}else{config.sortList.push([i,this.order]);}};setTimeout(function(){setHeadersCss($this[0],$headers,config.sortList,sortCSS);appendToTable($this[0],multisort($this[0],config.sortList,cache));},1);return false;}}).mousedown(function(){if(config.cancelSelection){this.onselectstart=function(){return false};return false;}});$this.bind("update",function(){var me=this;setTimeout(function(){me.config.parsers=buildParserCache(me,$headers);cache=buildCache(me);},1);}).bind("updateCell",function(e,cell){var config=this.config;var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);}).bind("sorton",function(e,list){$(this).trigger("sortStart");config.sortList=list;var sortList=config.sortList;updateHeaderSortCount(this,sortList);setHeadersCss(this,$headers,sortList,sortCSS);appendToTable(this,multisort(this,sortList,cache));}).bind("appendCache",function(){appendToTable(this,cache);}).bind("applyWidgetId",function(e,id){getWidgetById(id).format(this);}).bind("applyWidgets",function(){applyWidget(this);});if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){config.sortList=$(this).metadata().sortlist;}if(config.sortList.length>0){$this.trigger("sorton",[config.sortList]);}applyWidget(this);});};this.addParser=function(parser){var l=parsers.length,a=true;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){a=false;}}if(a){parsers.push(parser);};};this.addWidget=function(widget){widgets.push(widget);};this.formatFloat=function(s){var i=parseFloat(s);return(isNaN(i))?0:i;};this.formatInt=function(s){var i=parseInt(s);return(isNaN(i))?0:i;};this.isDigit=function(s,config){return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));};this.clearTableBody=function(table){if($.browser.msie){function empty(){while(this.firstChild)this.removeChild(this.firstChild);}empty.apply(table.tBodies[0]);}else{table.tBodies[0].innerHTML="";}};}});$.fn.extend({tablesorter:$.tablesorter.construct});var ts=$.tablesorter;ts.addParser({id:"text",is:function(s){return true;},format:function(s){return $.trim(s.toLocaleLowerCase());},type:"text"});ts.addParser({id:"digit",is:function(s,table){var c=table.config;return $.tablesorter.isDigit(s,c);},format:function(s){return $.tablesorter.formatFloat(s);},type:"numeric"});ts.addParser({id:"currency",is:function(s){return/^[A’$a?Ê?.]/.test(s);},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/[A’$a?Ê]/g),""));},type:"numeric"});ts.addParser({id:"ipAddress",is:function(s){return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);},format:function(s){var a=s.split("."),r="",l=a.length;for(var i=0;i<l;i++){var item=a[i];if(item.length==2){r+="0"+item;}else{r+=item;}}return $.tablesorter.formatFloat(r);},type:"numeric"});ts.addParser({id:"url",is:function(s){return/^(https?|ftp|file):\/\/$/.test(s);},format:function(s){return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));},type:"text"});ts.addParser({id:"isoDate",is:function(s){return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);},format:function(s){return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");},type:"numeric"});ts.addParser({id:"percent",is:function(s){return/\%$/.test($.trim(s));},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));},type:"numeric"});ts.addParser({id:"usLongDate",is:function(s){return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));},format:function(s){return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"shortDate",is:function(s){return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);},format:function(s,table){var c=table.config;s=s.replace(/\-/g,"/");if(c.dateFormat=="us"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");}else if(c.dateFormat=="uk"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");}else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");}return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"time",is:function(s){return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);},format:function(s){return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());},type:"numeric"});ts.addParser({id:"metadata",is:function(s){return false;},format:function(s,table,cell){var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;return $(cell).metadata()[p];},type:"numeric"});ts.addWidget({id:"zebra",format:function(table){if(table.config.debug){var time=new Date();}var $tr,row=-1,odd;$("tr:visible",table.tBodies[0]).each(function(i){$tr=$(this);if(!$tr.hasClass(table.config.cssChildRow))row++;odd=(row%2==0);$tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])});if(table.config.debug){$.tablesorter.benchmark("Applying Zebra widget",time);}}});})(jQuery);




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