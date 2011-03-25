
/*======================================*\
l*        _PAGE_CLEAN_UP                 |
\*======================================*/
   //Does not run on the old job details page
   if(PAGE_TYPE != "job_details" || getCookieValue('SHOW_OLD_DETAILS') != 1)     
   {
      init();
   }
   
/*======================================*\
l*        _JOB_DESCRIPTION               |
\*======================================*/
   if( ( doesUrlContain("https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID=")    //Does it include this url
      || doesUrlContain("SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&Market=GBL&Page=UW_CO_STU_JOBDTLS&Action=U&target=Transfer"))                //or this one?   
      && !IS_IN_IFRAME                                                                                                                                //Also must not be in an iframe   
   ){
      //Should we show the old details page? SHOW_OLD_DETAILS => 1: show old, 0|-1: show new
      if(getCookieValue('SHOW_OLD_DETAILS') != 1)
      {
         //Data that needs to be extracted from the page, this object holds it all
         var jobDescriptionData = {
            employerName   : "",
            position       : "",
            location       : "",
            openings       : "",
            jobLevels      : "",
            grades         : "",
            comments       : "",
            description    : "",
            openDate       : "",
            cecsCoord      : "",
            disciplines    : "",
            closeDate      : ""
         };
         
          //The normal way of getting to the page has an offset of 1, which means it has an extra div.
         var offset = 0;
         if(doesUrlContain("SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&Market=GBL&Page=UW_CO_STU_JOBDTLS&Action=U&target=Transfer"))
         {offset = 1;}
         
         //Extract data from page
         $("div").each(function(index){
            var text = $(this).html().replace(/&nbsp;/, " ").trim();
            if(text != "")
            {
               switch(index-offset)
               {
                  case 1:
                     jobDescriptionData.openDate      = text;        break;
                  case 2:
                     jobDescriptionData.closeDate     = text;        break;
                  case 5:
                     jobDescriptionData.employerName  = text;        break;
                  case 6:
                     jobDescriptionData.position      = text;        break;
                  case 7:
                     jobDescriptionData.grades        = text;        break;
                  case 8:
                     jobDescriptionData.location      = text;        break;
                  case 9:
                     jobDescriptionData.openings      = text;        break;
                  case 10:
                     jobDescriptionData.disciplines   = text+", ";   break;
                  case 11:
                     jobDescriptionData.disciplines  += text;        break;
                  case 12:
                     jobDescriptionData.jobLevels     = text;        break;
                  case 13:
                     jobDescriptionData.cecsCoord     = text;        break;
                  case 14:
                     jobDescriptionData.comments      = text;        break;
                  case 16:
                     jobDescriptionData.description   = text;        break;
               }
            }
         });
         
         //Add url a-href to most of the links on page
         jobDescriptionData.description = jobDescriptionData.description.replace(/((http:|https:|www.)[^\s]+)/gi, function(item){
            item = item.replace(/&nbsp;/, "");        //usually this appears at the end of the link
            
            //Removes random all punctuation at the end of the link
            var endPunctuation = "";
            item = item.replace(/([^\/\w])+$/, function(characters){
               endPunctuation = characters;
               return "";
            });
            
            item = item.toUpperCase().indexOf('HTTP') == 0 ? item : "http://"+item;         
            return "<a href='"+item+"' target='_blank'>"+item+"</a>" + (endPunctuation ? endPunctuation : "");
         });
         
         //Append CSS and some HTML to display the new job description page
         var jobDescCSS = "<style>.printshow{display:none;}iframe{overflow-x:hidden;overflow-y:scroll;}.jobmineButton{font-family: 'Arial','sans-serif';font-size: 9pt;font-weight: normal;font-Style: normal;font-variant: normal;color: rgb(0,0,0);background-color: rgb(255,255,153);}#jobDetails.page{width:760px;height:950px;min-height:950px;margin: 50px auto;-moz-box-shadow: 0 0 1em black;-webkit-box-shadow: 0 0 1em black;background-color: #f6f6f6;padding: 35px 20px;font-family: Arial, Verdana, san-serif;font-size:12px;}html, body{margin:0;padding:0;}input.button{float:right;}.important{color:red;}.jobDescriptionArea td, #comments td{font-size:14px;}.jobDescriptionArea .left{width:100%;}.jobDescriptionArea .right td{white-space:nowrap;}.jobDescriptionArea a.location{color: #3333cc;text-decoration: none;}.jobDescriptionArea .category{font-weight:bold;padding-right:10px;white-space:nowrap;width:10px;}#comments{margin-top:10px;display:"+(jobDescriptionData.comments == " " ? "none" : "block")+";}#comments .category{font-weight:bold;padding-right:30px;}hr{color:#6c6cbd;margin:10px 0;}#content .body{margin: 15px 0px;}.title{font-size:19px;color: #4b4bb4 !important;font-weight: bold;}#jobDetails .title a:visited{font-size:19px;color: #4b4bb4 !important;}#jobDetails .title a{font-weight: normal;margin-left:10px;}#content{height:100%;}#footer{max-height:110px;}/*Popup Close*/#popupContainer input.button{position:absolute;top:15px;right:10px;}/*Toolbar*/#toolbar{background-color: rgba(0,0,0,0.6);color: white;width:100%;position:fixed;text-align:center;top:0;left:0;padding: 5px 20px;font-family:Arial;font-size:12px;}#toolbar a{color: white;}#toolbar a:hover{color: #CCC;}/*Printing*/@media print{a{color: black !important;text-decoration: none;}hr{color:black;}.printHide{display:none !important;}#jobDetails .title{color: black !important;}body, #jobDetails.page{width: 100%;padding:0px;margin:0px;-moz-box-shadow: none;-webkit-box-shadow: none;background-color:white;}.printshow{display:inline !important;}}</style>";
         var popupCSS   = "<style>#popupContainer{position:fixed;z-index:200;top:0px;left: 0px;height:100%;width:100%;}#overlay{opacity:0.6;height:100%;width:100%;filter: alpha(opacity = 70);filter:progid:DXImageTransform.Microsoft.Alpha(opacity=70);background-color:black;}#popupWrapper{left:0px;top:0px;position:absolute;width:100%;}#popupContent{position:relative;margin:0 auto;min-height:400px;height:400px;top:150px;width:510px;padding:10px;background-color:white;-moz-box-shadow: 0 0 1em black;-webkit-box-shadow: 0 0 1em black;background:no-repeat url('https://jobmine-plus.googlecode.com/svn/trunk/scripts/images/loading_small.gif') white 50%;}#popupContent .title{font-weight:bold;font-size:18px;display:block; margin-top:5px;}</style>";
         
         var toolbar = "<div id='toolbar' class='printHide'>Don't like this look for your job descriptions? <a id='showOldDetailsBtn' href='#'>Click here to change it back</a></div>";
         
         var popup = "<div id='popupContainer' class='printHide' style='display:none;'><link type='text/css' rel='stylesheet' href='popup.css'/><div id='overlay'><!-- --></div><div id='popupWrapper'><div id='popupContent'><input type='button' class='button jobmineButton' value='Close' onclick='document.body.style.marginRight = \"0\";document.getElementById(\"popupContainer\").style.display = \"none\";document.body.style.overflow = \"auto\"'/><span class='title'>Employer Profile</span><iframe id='hiddenIframe' style='margin-top:10px;' name='hiddenIframe' src='test.html' frameborder='0' width='100%' height='360px'></iframe></div></div></div>";
         
         var newBody =  "<table class='page' id='jobDetails' cellspacing='0' cellpadding='0'><tr><td valign='top' id='header'><span class='title'>Employer: <a class='printHide' target='_blank' title='Google search "+jobDescriptionData.employerName+"' href='http://www.google.ca/#hl=en&q="+encodeURIComponent(jobDescriptionData.employerName)+"'>"+(jobDescriptionData.employerName.length > 48 ? jobDescriptionData.employerName.substring(0,48)+"..." : jobDescriptionData.employerName)+"</a><a class='printshow' href='#'>"+jobDescriptionData.employerName+"</a></span>"+
                        "<input class='button printHide' onclick='window.print();' type='button' value='Print Job Description'/><br/><br/><table class='jobDescriptionArea' cellspacing='0' cellpadding='0'>"+
                        "<tr><td valign='top' class='left'><table cellspacing='0' cellpadding='0'><tr><td valign='top' class='category'>Job Title:</td><td valign='top'>"+jobDescriptionData.position+"</td></tr><tr>"+
                        "<td valign='top' class='category'>Work Location:</td><td valign='top'><a target='_blank' href='http://maps.google.ca/maps?hl=en&q="+encodeURIComponent(jobDescriptionData.employerName)+"+"+encodeURIComponent(jobDescriptionData.location)+"' title='Search location' class='location'>"+jobDescriptionData.location+"</a></td></tr><tr>"+
                        "<td valign='top' class='category'>Available Openings:</td><td valign='top'>"+jobDescriptionData.openings+"</td></tr></table></td><td valign='top' class='right'>"+
                        "<table cellspacing='0' cellpadding='0'><tr><td valign='top' class='category'>Levels:</td><td valign='top'>"+jobDescriptionData.jobLevels+"</td></tr><tr>"+
                        "<td valign='top' class='category'>Grades:</td><td valign='top'>"+jobDescriptionData.grades+"</td></tr></table>"+
                        "<input style='margin-top:10px;' class='button printHide' onclick='document.getElementById(\"popupContainer\").style.display = \"block\";document.body.style.marginRight = \"17px\";document.body.style.overflow = \"hidden\"' type='button' value='View Employer Profile'/>"+
                        "</td></tr></table><br/><table id='comments' cellspacing='0' cellpadding='0'><tr><td class='category' valign='top'>Comments:</td><td class='important' valign='top'>"+jobDescriptionData.comments+"</td>"+
                        "</tr></table><hr/></td></tr><tr><td valign='top' id='content'><div class='title'>Description</div><div class='body'>"+jobDescriptionData.description+"</div>"+
                        "</td></tr><tr><td valign='top' id='footer'><hr/><table class='jobDescriptionArea' cellspacing='0' cellpadding='0'><tr><td valign='top' class='left'><table cellspacing='0' cellpadding='0'><tr><td valign='top' class='category'>"+
                        "Posting Open Date:</td><td valign='top'>"+jobDescriptionData.openDate+"</td></tr><tr><td valign='top' class='category'>CECS Field Co-ordinator:</td><td valign='top'>"+jobDescriptionData.cecsCoord+"</td></tr>"+
                        "<tr><td colspan='2'><br/><table class='jobDescriptionArea' cellspacing='0' cellpadding='0'><tr><td valign='top' class='category'>Disciplines:</td><td valign='top'>"+jobDescriptionData.disciplines+"</td></tr></table></td></tr>"+
                        "</table></td><td valign='top' class='right'><table cellspacing='0' cellpadding='0'><tr><td valign='top' class='category'>Last Day to Apply:</td><td valign='top'>"+jobDescriptionData.closeDate+"</td></tr></table></td>"+
                        "</tr></table><hr class='printHide'/></td></tr></table>";
         
         //Append everything on the page
         $("head").append(popupCSS).append(jobDescCSS);
         $("body").html(newBody).append(toolbar).append(popup);
         //Chrome doesnt find this element that fast
         setTimeout(function(){
            $("#showOldDetailsBtn").click(function(){
               writeCookie('SHOW_OLD_DETAILS', 1);     
               refresh();}
         )}, 0);

         
         /*
          *    Iframe employer profile page 
          */      
         function goToEmployerProfile()
         {
            //First Load
            if(this.getAttribute("src") == "test.html")
            {
               $(this).css("display","none");
               this.src = window.location.href.substr(window.location.href.indexOf("servlets/"));
               $(this).attr("status", "loading");
            }
            //Second load, we are the orginal job description page
            else if( $(this).attr("status") == "loading" )
            {
               //Write status so it doesnt run this a billion times XD
               $(this).attr("status", "almostdone");
               if(ISFIREFOX){
                  unsafeWindow.runIframeFunction("hiddenIframe","submitAction_main(document,'main', '#ICPanel1')");		               	
               }else{
                  runJS('runIframeFunction("hiddenIframe","submitAction_main(document.main , \'#ICPanel1\')")');	
               }
            }
            //Third and final load; we now have the employer profile
            else if( $(this).attr("status") == "almostdone" )
            {
               //$(this).fadeIn();
               $(this).css("display","block");
               $(this).attr("status", "done");

               if(ISFIREFOX){
                  unsafeWindow.runIframeFunction("hiddenIframe","var grabbedHTML = document.getElementsByTagName('table')[2].innerHTML;document.body.innerHTML = '<table id=\"newTable\" cellpadding=\"0\" cellspacing=\"0\">'+grabbedHTML+'</table>';document.body.style.marginLeft='-15px';document.body.style.marginTop='-10px';var header = document.getElementById('newTable').getElementsByTagName('tr')[1]; header.parentNode.removeChild(header);");
               }else{
                  var runInIframe = "var grabbedHTML = document.getElementsByTagName('table')[2].innerHTML;document.body.innerHTML = '<table id=newTable cellpadding=0 cellspacing=0>'+grabbedHTML+'</table>';document.body.style.marginLeft='-15px';document.body.style.marginTop='-10px';var header = document.getElementById('newTable').getElementsByTagName('tr')[1]; header.parentNode.removeChild(header);";
                  runJS('runIframeFunction("hiddenIframe","'+runInIframe+'")');	
               }            
               this.removeEventListener("load", goToEmployerProfile, false);
            }
         }
         document.getElementById("hiddenIframe").addEventListener("load", goToEmployerProfile, false);
         //Avoid the stupid resend
         $(window).unload( refresh   );
         
         jobDescriptionData = null;
      }
      //Old version of the job descriptions
      else
      {
         var toolbar    = "<div id='toolbar' class='printHide'>Want to see the Jobmine Plus version of job descriptions? <a id='showNewDetailsBtn' href='#'>Click here to change it</a></div>";
         var cssStyles  = "<style>.PSPAGE{margin-top:30px;}@media print{.PSPAGE{margin-top:1px;}.printHide{display:none;}}/*Toolbar*/#toolbar{background-color: rgba(0,0,0,0.6);color: white;width:100%;position:fixed;text-align:center;top:0;left:0;padding: 5px 20px;font-family:Arial;font-size:12px;}#toolbar a{color: white;}#toolbar a:hover{color: #CCC;}</style>";
         $("body").append(toolbar).append(cssStyles);
         
         //Clicking the link would tell it to look at the old one
         $("#showNewDetailsBtn").click(function(){
            writeCookie('SHOW_OLD_DETAILS', 0);     
            refresh();
         });
      }
      
      //Remove timer and end the script
      removeTimer();
      return;
   }
/*======================================*\
l*        _JOB_SEARCH_PAGE               |
\*======================================*/
   else if(PAGE_TYPE == "job_search_component")            
   {
      //Write the current term in cookies if it is specified  
      if($("#UW_CO_JOBSRCH_UW_CO_WT_SESSION")[0].value.trim() != ""){ writeCookie("CURTERM", $("#UW_CO_JOBSRCH_UW_CO_WT_SESSION")[0].value.trim());}
      
      var tableBody = null;
      
      //If This page is not the look up page
      if(!$("form > span").html() || $("form > span").html().search(/Lookup/i) == -1)
         {
         $('form > table > tbody > tr:first-child > td:first-child').html("<div style='margin-bottom:30px;' class='PAPAGETITLE'><span style='position:absolute;margin-left:10px;'>Job Search Criteria</span></div>");

         /*
         *     Major clean up for the Job Search Page
         */

         //Set widths
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
         
         /*
          *    Object that manages the visited list
          *       This object manages the visited job descriptions using localStorage. 
          */        
         var JOB_VISITED_MANAGER = {
         //Variables
            KEYPREFIX : "visited_",
            termInput : $("#UW_CO_JOBSRCH_UW_CO_WT_SESSION").attr("value").trim(),
            
         //Checks to see if we need to remove all of the jobs first from viewed history
            validateDate :    function(){
               var currentTerm = getCurrentTerm();
               
               //Write the last time we accessed it and today's date for comparison
               var now = new Date();
               var today = now.getFullYear()+"|"+now.getMonth()+"|"+now.getUTCDate();
               var lastAccessDate = (localStorage.getItem("searchPageLastAccess") ? localStorage.getItem("searchPageLastAccess") : today).split("|");
               localStorage.setItem("searchPageLastAccess", today);
               
               today = today.split("|");
               var differenceInMonths = (Date.UTC(today[0], today[1], today[2]) - Date.UTC(lastAccessDate[0], lastAccessDate[1], lastAccessDate[2]) )/1000/60/60/24/30;
               
               //It has been about 2 months since you accessed job search, clear everything
               if(differenceInMonths >= 2)
               {  
                  alert("Clear all");
                  this.clear();
               }
               else if(parseInt(this.termInput) > parseInt(currentTerm)    //If the guessed term is smaller than the term we are search through
                     && parseInt(today[1]) >= parseInt(currentTerm[3] )     //AND if we have passed a certain date with the old term, eg. if winter term, the last date is may
               ){
                  alert("Clear old");
                  this.clearOldTerms();
               }
            },
         //Sets the Job ID in storage, returns true if it works and false if it failed
            addID:            function(id){   
               //If it doesnt exist, put it into the array as well right our new list of keys
               if( !this.IDExists(id) ){
                  //Try to store the item
                  try{
                     localStorage.setItem(this.KEYPREFIX + id, this.termInput);
                  }catch(e){
                     alert("Failed to write to storage:\n"+e); return false;
                  }
               }
               return true;
            },
         //Returns if the key exists
            IDExists:         function(id){    
               return this.readID(id) != false;
            },
         //Read an ID or return false if not found
            readID:           function(id){          
               var value = localStorage.getItem(this.KEYPREFIX + id);
               return value != null && value != "" ? value : false;
            }, 
         //Deletes all of the old terms that have been expired
            clearOldTerms:    function()
            {
               if(this.termInput != "" && this.termInput.length == 4)         //Redundency
               {
                  //Cycle through all keys in storage
                  for(var key in localStorage)
                  {
                     //if the key is associated with viewed and is not the specified term, remove it!
                     if(key.substring(0,8) == this.KEYPREFIX && localStorage.getItem(key) != this.termInput)
                     {
                        localStorage.removeItem(key);
                     }
                  }
               }else{
                  alert("Something broke.");
               }
            },
         //Clear all keys that have anything to do with job visits
            clear:            function()
            {
               //Cycle through all keys in storage
               for(var key in localStorage)
               {
                  //if the key is associated with reading, then remove all
                  if(key.substring(0,8) == this.KEYPREFIX)
                  {
                     localStorage.removeItem(key);
                  }
               }
            }
         };
         JOB_VISITED_MANAGER.validateDate();

         //Playing with the table; details below
         tableBody = $("#searchTable tr tr:eq(1) td.tablepanel table.PSLEVEL1GRID tr");
         if(tableBody.length > 2)
         {
            tableBody.each(function(row){ var obj = $(this).children();          
               //HEADER
               if(row == 0){
                  //Tells the table that the results are up
                  $(this).parent().parent().addClass("results");

                  //Adds new columns (status and hiring)
                  obj.eq(0).before("<th class='PSLEVEL1GRIDCOLUMNHDR' align='left' scope='col'>Status</th>");
                  obj.eq(8).after("<th title='You must be skilled to get the job, this is equation does not included your skill level.' class='PSLEVEL1GRIDCOLUMNHDR' align='left' scope='col'>Hiring Chances*</th>");
               
               //Cells
               }else{
               /*
                *     ADD THE STATUS COLUMN
                */
                  var jobStatusCol = obj.eq(0);
                  var jobID = obj.eq(0).plainText();
                  
                  //Find what the status of the job is
                  var status;
                  if(obj.eq(7).find("div").plainText().indexOf('Already Applied') != -1){
                     status = "Applied";
                  }else if(obj.eq(7).find("div").plainText().indexOf('On Short List') != -1){
                     status = "On Shortlist";
                  }else if(JOB_VISITED_MANAGER.IDExists(jobID)){
                     status = "Viewed/Read";
                  }else{
                     status = "New";
                  }
                  jobStatusCol.before("<td class='PSLEVEL1GRIDODDROW' align='left'>"+status+"</td>");

               /*
                *     ADD THE HIRING CHANCES     
                */                                      
                  var numApps = obj.eq(8);
                  /*    Reading Purposes
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
                  obj.eq(2).wrapInner("<a class='googleSearch' title='Google Search that Company!!!'  target='_blank' href='http://www.google.ca/#hl=en&q="+encodeURIComponent(company)+"'/>");            
                  //This is for google map the location
                  obj.eq(4).wrapInner("<a class='mapsSearch' title='Google Maps that Company!!!'  target='_blank' href='http://maps.google.ca/maps?hl=en&q="+encodeURIComponent(company)+"+"+encodeURIComponent(location)+"+"+$("#UW_CO_JOBSRCH_UW_CO_LOCATION").attr("value").replace(/\s/g,"+")+"'/>"); 

               /*
                *   CHANGE JOB DESCRIPTIONS
                *     Jobs appear as a tab now and it doesnt need to be refreshed                                  
                */
                  function hasViewedDescription()
                  {
                     var thisObj = $(this);
                     
                     //Remove click
                     thisObj.unbind();
                     //Add the job id
                     JOB_VISITED_MANAGER.addID(thisObj.attr("jobID"));
                     
                     //Mark down that we have seen this job
                     thisObj[0].parentNode.parentNode.parentNode.firstChild.nextSibling.firstChild.nodeValue = "Viewed/Read";
                     
                     //Update the state of the row
                     updateTableHighlighting( $("#toggleHighlight").attr("state") == "on" );
                     TABLES_OBJ.trigger("update");
                  }
                  
                  var aLink = obj.eq(1).find("a");
                  aLink.attr("href","https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID="+jobID).attr("target","_blank").attr("jobID",jobID);
                  
                  //New job means we have not seen the job yet
                  if(status == "New"){
                     aLink.bind("click", hasViewedDescription);
                  }
               }         
            });
         }
         
         //Clears the viewing history
         function clearingHistory(){
            if(confirm("Are you sure you would like to clear you viewed history? This page will refresh after it clears the history."))
            {
               loadPopupMsg("Clearing the viewed history.<br/><span style='color:red;font-size:20px;'>This cannot be cancelled, please do not try.<br/>Really I mean it.</span>");
               showLoadingPopup();
               JOB_VISITED_MANAGER.clear();
               refresh();
            }
         }

         var TABLES_OBJ = applyTableSorting("table table table.PSLEVEL1GRID",PAGE_TYPE);
         $("body > form > table").css("width","auto");
         $("form").eq(1).append("<input id='clearViewedHistoryBtn' popup='false' class='PSPUSHBUTTON' type='button' title='What this does is clears the history of your searches that you have viewed/read already.' oncick='return false;' value='Clear Viewed History'/><br/>");
         $("#clearViewedHistoryBtn").click(clearingHistory);
      }else{
         $("form").css("margin-bottom","20px");
      }
   }

/*======================================*\
l*        _PROFILE_PAGE                  |
\*======================================*/
   else if(PAGE_TYPE == "student_data" && $("form > table:last-child").html()) 
   {
      var TABLES_OBJ = applyTableSorting("table table table.PSLEVEL1GRID" , PAGE_TYPE);
      var bottomNav = $("form > table:last-child").html();
      /*======================================*\
      l*        TERM CARDS                     |
      \*======================================*/
      if(bottomNav.indexOf("Term Cards |") != -1){
         $("form > table > tbody >tr:first-child > td:last-child").attr("width",1);
         $("form > table > tbody >tr:first-child > td:last-child > img").attr("width",1);
         $("form > table > tbody >tr:first-child > td:first-child").attr("width",1);
         $("form > table > tbody >tr:first-child > td:first-child > img").attr("width",1);
         $("body form table").eq(1).children().children().eq(2).children(":first-child").attr("height",1);        
      }
      /*======================================*\
      l* STUDENT PERSONAL INFO & ACADEMIC INFO |
      \*======================================*/
      else if(bottomNav.indexOf("Student Personal Info |") != -1 || bottomNav.indexOf("Acad Info. |") != -1){
         $("body form table").css("margin","0 auto");
         $("body form table").eq(-2).css("width","auto");          
      }
      /*======================================*\
      l*        SKILLS INVENTORY               |
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
      l*        LOOK UP PAGES                  |
      \*======================================*/
      if($("form span").html() && $("form span").html().search(/Lookup.*ID/ig) == -1){
         $("body form table:first").css("width","auto").css("margin","0 auto");
      }else{
         $("form:last").css("margin-bottom","20px");
      }
   }
   
/*======================================*\
l*        _DOCUMENTS_PAGE                |
\*======================================*/
   else if(PAGE_TYPE == "resumes"){                
      $("form table tr:eq(3)").children().eq(1).attr("colspan",20);
      $("form > table > tbody > tr:last-child > td:first-child").attr("height",10);    
      var resumeTable = $("form table tr:eq(5)").remove().children().eq(1).html();
      $("form:last").append(resumeTable);

      var TABLES_OBJ = applyTableSorting("table table.PSLEVEL1GRID" , PAGE_TYPE);
      $("body > form > table").eq(0).css("width","auto");
   }
/*======================================*\
l*        _JOB_SHORT_LIST_PAGE           |
\*======================================*/
   else if(PAGE_TYPE == "job_short_list")
   { 
      window.scrollTo(0,0);      //Fixes glitch that always loaded to the bottom of the page
      $(".PAERRORTEXT").html("(You can remove multiple jobs by checking the rows off and clicking 'Delete Selected' or use the minus button ( - ) to remove jobs from your list.)");

      /*
       *   Adding columns to tables:
       *       - Added checkboxes 
       *       - Added the google search and map feature
       */
      var numOfChkbx = 0;
      $("body > form > table td.tablepanel table.PSLEVEL1GRID tr:last-child td tr").each(function(row){        
         var obj = $(this);
         var child = obj.children();
      //Header
         if(row == 0){   
            obj.prepend('<th align="LEFT" class="PSLEVEL1GRIDCOLUMNHDR" scope="col">&nbsp;</th>');
      //Body
         }else{
            //Add checkboxes
            obj.prepend('<td align="center" height="19" class="PSLEVEL1GRIDODDROW"><input class="editChkbx" row="'+numOfChkbx+'" id=chkbx'+(numOfChkbx++)+' type="checkbox"></td>');

            //Add company and location href
            var company = child.eq(2).html().trim();
            var location = child.eq(4).html().trim();                         
            child.eq(2).wrapInner("<a class='googleSearch' title='Google Search that Company!!!' target='_blank' href='http://www.google.ca/#hl=en&q="+encodeURIComponent(company)+"'/>");            
            child.eq(4).wrapInner("<a class='mapsSearch' title='Google Maps that Company!!!' target='_blank' href='http://maps.google.ca/maps?hl=en&q="+encodeURIComponent(location)+"+"+encodeURIComponent(company)+"'/>"); 

            //Change the hyperlink for the job descriptions
            child.eq(1).find("a").attr("href","https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID="+child.eq(0).html().trim()).attr("target","_blank");
         }    
      });
      
      //Add invisible iframe
      $("body").append("<iframe style='display:none;' name='hiddenIframe' id='hiddenIframe' width='100%' height='400' src=''></iframe>");  

      //Add the buttons that auto select/deselect the checkboxes
      $("#UW_CO_JSLIST_VW_").parent().parent().html("<td valign='top' height='30' colspan='13'><button class='deleteSelectedButton PSPUSHBUTTON' total='"+numOfChkbx+"' onclick='return false'>Delete Selected</button><button onclick='return selectAllChkbx(false,"+numOfChkbx+")' class='PSPUSHBUTTON'>Unselected All</button><button onclick='return selectAllChkbx(true,"+numOfChkbx+")' class='PSPUSHBUTTON'>Select All</button></td>");
      $("form > table > tbody > tr").eq(7).after("<tr><td valign='top' height='30' colspan='13'><button class='deleteSelectedButton PSPUSHBUTTON' total='"+numOfChkbx+"' onclick='return false'>Delete Selected</button><button onclick='return selectAllChkbx(false,"+numOfChkbx+")' class='PSPUSHBUTTON'>Unselected All</button><button onclick='return selectAllChkbx(true,"+numOfChkbx+")' class='PSPUSHBUTTON'>Select All</button></td></tr>");
      var TABLES_OBJ = applyTableSorting("table table table.PSLEVEL1GRID" , PAGE_TYPE);

      /*
       *    MULTISELECT CHECKBOXES
       *       -Shift-click nature
       */

      //Binds so that the ids of the checkboxes are reset everytime sorting occurs
      TABLES_OBJ.bind("sortEnd", function()
      {
         TABLES_OBJ.find("input").each(function(order){
            $(this).attr("id","chkbx"+order);
         });
         anchorChkbox = null;
      });
      
      var anchorChkbox  = null;     //AnchoChkbox is the row of the last checkbox user has clicked
      var shiftDown     = false;    //Boolean to see if the shiftkey is held
      
      //Apply Shift-key Eventlisteners
      $(document).keydown  (function(evt){ if(evt.shiftKey       ){evt.preventDefault(); shiftDown = true;   }});
      $(document).keyup    (function(evt){ if(evt.keyCode == '16'){evt.preventDefault(); shiftDown = false;  }});
      
      //After you click a checkbox
      $(".editChkbx").click(function(evt)
      {
         var obj = $(this);
         var row = parseInt(obj.attr("id").substr(obj.attr("id").indexOf("chkbx")+5));  
            
         //If shift held, the anchor is set, and the checkbox is not the same as the last clicked
         if(shiftDown && anchorChkbox != null && row != anchorChkbox){
            //Down the page; we are checking/unchecking boxes from top to bottom 
            if(anchorChkbox < row){        
               for(var i=anchorChkbox; i<=row;i++){$("#chkbx"+i).attr("checked",obj.is(':checked'));}
            //Up the page; we are checking/unchecking boxes from bottom to top
            }else{
               for(var i=anchorChkbox; i>row;i--){$("#chkbx"+i).attr("checked",obj.is(':checked'));}
            }
         }   
         anchorChkbox = row;     //Now the new anchor is the new checkbox's row                   
      });

      /*
       *    MULTIJOB REMOVAL
       *       -one of the major features, able to remove multiple jobs at once
       *       -it refreshes the iframe by removing each job automatically one by one
       */
      $('.deleteSelectedButton').click(function(){                 
         var numChkbx = $(this).attr('total');
         var iframeArray = new Array();
         
         //Get the checked checkboxes in an array
         TABLES_OBJ.find("input").each(function(){
            if($(this).attr("checked")){  iframeArray.push($(this).attr("row")); }
         });
         
         //Sort the checkboxes in order numerically 
         iframeArray.sort(function(a,b){return a-b;});
         
         //Get the number of checkboxes and see if how to handle the short list
         var iframeCounter = iframeArray.length;
         if(iframeCounter == 0){return false;}     //If nothing is selected we can return
         
         //We can ask the user if they really want to remove the jobs
         var answer = confirm (iframeCounter < 10 ? "Do you wish to delete the checked rows from this page? The page itself will refresh after the transaction is saved." : "Do you wish to delete the checked rows from this page? You have "+iframeCounter+" rows to delete and this may take a while. The page itself will refresh after the transaction is saved.");
         if(!answer){return false;}    //if nothing is selected
         
         //Start the iFrame fun!
         $("#hiddenIframe").attr("src","servlets/iclientservlet/SS/?ICType=Panel&Menu=UW_CO_STUDENTS&Market=GBL&PanelGroupName=UW_CO_JOB_SLIST&RL=&target=main0&navc=5170"); 

         //White loading screen shows up with a different message
         loadPopupMsg("Each job removed needs to be refreshed, this will take a while because of Jobmine slowness.<br/><span style='color:blue;font-size:20px;'>*Refresh to Cancel*</span><br/>Starting...");
         $("title").html("Job Short List | Starting...");
         showLoadingPopup();
         
         //Everytime the iframe loads
         $("#hiddenIframe").load(function(){        
            //Start counting and removing
            if(iframeArray.length != 0){   
               var progress = (iframeCounter - iframeArray.length+1)+"/"+iframeCounter;
               $("title").html("Job Short List | Removing: "+progress);
               loadPopupMsg("Each job removed needs to be refreshed, this will take a while because of Jobmine slowness.<br/><span style='color:blue;font-size:20px;'>*Refresh to Cancel*</span><br/>Progress: "+progress);
               
               //Deletes the job in the iframe
               if(ISFIREFOX){
                  unsafeWindow.runIframeFunction("hiddenIframe","submitAction_main0(document,'main0','UW_CO_STUJOBLST$delete$"+(iframeArray.pop())+"$$0')");				
               }else{
                  runJS('runIframeFunction("hiddenIframe","submitAction_main0(document.main0,\'UW_CO_STUJOBLST$delete$'+(iframeArray.pop())+'$$0\')")');	
               }
            }
            //We are all done, so we can now save and refresh
            else if(iframeCounter > 0){     
               loadPopupMsg("Each job removed needs to be refreshed, this will take a while because of Jobmine slowness. <br/><span style='color:red'>Saving now... Do not refresh.</span>");
               $("title").html("Job Short List | Saving...");
               iframeCounter = -1;      // go to next step
               if(ISFIREFOX){
                  unsafeWindow.runIframeFunction("hiddenIframe","submitAction_main0(document,'main0', '#ICSave')");
               }else{
                  runJS('runIframeFunction("hiddenIframe","submitAction_main0(document.main0, \'#ICSave\')")');
               }
            }
            //Just refresh the page itself
            else if(iframeCounter == -1){       
               window.location = JOB_SHORT_PAGE;                              
            }
         });
         return false;
      });
      //Function to select all the checkboxes     		
      if(ISFIREFOX){
         unsafeWindow.selectAllChkbx = function(flag,numChkbx){for(var i=0;i<numChkbx;i++){$("#chkbx"+i).attr("checked",flag);}return false;};
      }else{
         injectFunction("selectAllChkbx(flag,numChkbx){for(var i=0;i<numChkbx;i++){document.getElementById('chkbx'+i).checked = flag;}return false;}");
      }
   }
   
/*======================================*\
l*        _APPLICATIONS_PAGE             |
\*======================================*/
   else if(PAGE_TYPE == "student_app_summary")
   {
      var TABLES_OBJ = applyTableSorting("table table table.PSLEVEL1GRID");
      TABLES_OBJ.find("div.PSHYPERLINKDISABLED:contains('Edit Application')").html("Cannot Edit Application");
      TABLES_OBJ.eq(0).find("td:contains('Ranking Completed')").html("Ranked or Offer").parent().attr("title","This means that the company you had an interview with has either ranked or offered you a job.");
      
      $("body > form > table td.tablepanel table.PSLEVEL1GRID tr:last-child td tr").each(function(rowNum){
         //Do something on each row
         var row = $(this).children();
         if(row[0].nodeName.toUpperCase() != "TH")   
         {          
            //Add the Google Search for company names
            row.eq(2).wrapInner("<a class='googleSearch' title='Google Search that Company!!!' target='_blank' href='http://www.google.ca/#hl=en&q="+encodeURIComponent(row.eq(2).plainText())+"'/>");  
            
            //Add link to get tabbed job description
            row.eq(1).find("a").attr("href","https://jobmine.ccol.uwaterloo.ca/servlets/iclientservlet/SS/?Menu=UW_CO_STUDENTS&Component=UW_CO_JOBDTLS&UW_CO_JOB_ID="+row.eq(0).plainText()).attr("target","_blank");
         }
      });
   }
   /*======================================*\
   l*        _INTERVIEW_PAGE                |
   \*======================================*/
   else if(PAGE_TYPE == "student_interviews")
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
            var date    = row.eq(4).html().trim().split(" ");
            var day     = date[0];
            var month   = parseMonth(date[1]);
            var year    = date[2];

            //Parse the time
            var time = row.eq(7).html().trim().split(" ");
            var dateStr;
            if(time != "")
            {          
               //How long is the interview
               var length  = parseInt(row.eq(8).html().trim());        
               //Find start time
               var sMin    = time[0].split(":")[1];                                 
               var sHour   = time[0].split(":")[0];
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
            var location      = row.eq(9).html().replace(/&nbsp;/g," ").trim(); location = location != "" ? "Tatham Centre: Room "+location : "Offsite Location (check description)";
            var company       = row.eq(2).html().trim();
            var type          = row.eq(5).html().trim();
            var instructions  = row.eq(10).html().replace(/&nbsp;/g," ").trim(); instructions = instructions != "" ? "\nExtra Information:\n"+instructions : "";
            var interviewer   = row.eq(11).html().trim();
            var jobTitle      = row.eq(3).find("a").html().trim();

            //Write the details
            var details = (type + " interview with " + company + " (" + interviewer + ")\nTitle: "+ jobTitle + "\n"+instructions).replace(/ /g,"%20").replace(/\n/g,"%0A").replace(/:/g,"%3A").replace(/,/g,"%2C").replace(/,/g,"%2C");

            //Check to see all fields are valid before we add the calendar, else leave it blank
            if(month && time != "" && type && jobTitle){
               row.eq(12).after('<td title="Click to add to Google Calendar!" class="PSLEVEL1GRIDODDROW" align="left"><a href="http://www.google.com/calendar/event?action=TEMPLATE&text=Coop Interview with '+encodeURIComponent(company)+'&dates='+dateStr+'&details='+details+'&location='+encodeURIComponent(location)+'&trp=false&sprop=&sprop=name:" target="_blank"><img src="http://www.google.com/calendar/images/ext/gc_button6.gif" border=0></a></td>');
            }else{
               row.eq(12).after('<td class="PSLEVEL1GRIDODDROW" align="left">&nbsp;</td>');
            }
         }         
         });
      }
      var TABLES_OBJ = applyTableSorting("table table table.PSLEVEL1GRID" , PAGE_TYPE);
   }
/*======================================*\
l*        _OTHER_PAGES                   |
\*======================================*/
   else
   {
      var TABLES_OBJ = applyTableSorting("table table table.PSLEVEL1GRID" , PAGE_TYPE);
   }
   
/*======================================*\
l*        _HINT_SYSTEM                    |
\*======================================*/
   /*
    *    Write all the hints dependent on page
    *          -each page will have different hints but common applies to all
    */
    
   //Common hints for all pages
   HINT_ARRAY["com"]     = [];
   HINT_ARRAY["com"].    push({page:  "com",  percentage: 0.4, text : "Check out the settings tab to customize your experience. You can remove the timer and/or set the default page Jobmine Plus loads.", obj:$("#settings_nav")[0] });
   HINT_ARRAY["com"].    push({page:  "com",  percentage: 0.3, text : "Click the header a column to sort jobs and other information.", obj:TABLES_OBJ.find("th.PSLEVEL1GRIDCOLUMNHDR.header")[2]  });
   HINT_ARRAY["com"].    push({page:  "com",  percentage: 0.4, text : "Send me an email if you have any questions, concerns or wanted features. You can also check out the FAQ.", obj:$("#about_nav")[0] });

   //Applications hints
   HINT_ARRAY["apps"]    = [];
   HINT_ARRAY["apps"].   push({page: "apps",  percentage: 0.4, text : "You can now select the company name and Jobmine Plus will Google search it for you in a new tab.", obj:TABLES_OBJ.find("a.googleSearch")[0]  });

   //Shortlist hints
   HINT_ARRAY["short"]   = [];
   HINT_ARRAY["short"].  push({page: "short", percentage: 0.5, text : "You can delete multiple short list jobs with checkboxes. It also supports shift-click functionality.", obj:TABLES_OBJ.find("input.editChkbx")[0]   });

   //Job Search hints
   HINT_ARRAY["search"]  = [];
   HINT_ARRAY["search"]. push({page: "search",percentage: 0.4, text : "You can now select the location and Jobmine Plus will Google Maps it for you.", obj:TABLES_OBJ.find("a.mapsSearch")[0]  });
   HINT_ARRAY["search"]. push({page: "search",percentage: 0.3, text : "This is hiring chances. Note: you need to be skilled to get the job, I am not responsible for incorrect statistics.", obj:TABLES_OBJ.find("th.PSLEVEL1GRIDCOLUMNHDR:contains('Hiring Chances*')")[0]  });
   HINT_ARRAY["search"]. push({page: "search",percentage: 1.0, text : "It seems the term is incorrect.<br/><br/>Jobmine Plus suggests that the term is <a popup='false' onclick='document.getElementById(\"UW_CO_JOBSRCH_UW_CO_WT_SESSION\").value = \"1115\"'>"+getCurrentTerm()+" (Click to change)</a>.", obj: document.getElementById("UW_CO_JOBSRCH_UW_CO_WT_SESSION"), funct: function(){if($("#UW_CO_JOBSRCH_UW_CO_WT_SESSION").attr("value") != getCurrentTerm()){return true}else{return false}}  });
   HINT_ARRAY["search"]. push({page: "search",percentage: 0.7, text : "This is the status column. This keeps track of viewed/read, new, applied and shortlisted jobs. Clear history using the button at the below the table.", obj:TABLES_OBJ.find("th:contains('Status')")[0]   });

   //Map the hints depending on the page
   var tempPageHint;
   switch(PAGE_TYPE)
   {
      case "student_app_summary":
         tempPageHint = HINT_ARRAY["apps"];
         break;
      case "job_short_list":
         tempPageHint = HINT_ARRAY["short"];
         break;
      case "job_search_component":
         tempPageHint = HINT_ARRAY["search"];
         break;
      default:
         tempPageHint = new Array();
         break;
   }
     
   /*
    *    Generate the Tooltip Settings page
    */
   var tooltipGenerated = "<div style='margin-bottom:15px;'><input id='enableTooltip' class='tooltipChkbx' type='checkbox'/>Enable Tooltips</div><table cellpadding='0' cellspacing='0'>";
   var index=0;
   for(var page in HINT_ARRAY)
   {
      var arr = HINT_ARRAY[page];
      for(var i=0;i<arr.length;i++)
      {
         tooltipGenerated += "<tr><td valign='top'><input id='toolChkbx"+(index++)+"' class='tooltipChkbx' page='"+page+"' num='"+i+"' type='checkbox'/></td><td class='details' valign='top'>"+arr[i].text.replace("/<brz/>/ig"," ").replace(/<[^>]+>/g,"")+"<br/><br/></td></tr>";
      }
   }
   tooltipGenerated += "</table>";
   index = null;
   
/*======================================*\
l*        _SETTINGS                      |
\*======================================*/        
   /*
    *    Build the settings panel
    */
   addSettingsItem("General",SETTINGS_GENERAL);
   addSettingsItem("Tooltip",tooltipGenerated);
   addSettingsItem("Pages",SETTINGS_PAGES);

   //Clicking the menu nav under settings
   $("#settingsNav a").click(function(){
      var name = $(this).html();
      $("#popupTitle").html(name+" Settings");
      for(var i=0;i<$("#settingsContent")[0].childNodes.length;i++){$("#settingsContent")[0].childNodes[i].style.display='none';}     
      $("#settings_"+name.toLowerCase()).css("display","block");
   });

   //Mainly only for settings
   $("#saveSettings").click(function(){
      //Place all nav item's save functions here
      saveGeneralSettings();
      saveTooltipSettings();
      savePageSettings();
      
      //Set the state of reloading the page
      hidePopup();
      showLoadingPopup();
      refresh();
   });
   
   /*
    *   SETTINGS TOGGLES
    *       -sets the toggle states in the settings panel
    */   
   //Bind the change event listener to the checkbox
   $("#removeTimerChkbx")  .change(function(){toggleRemoveTimer(this);  });
   $("#enableTooltip")     .change(function(){toggleEnableTooltip(this);});
  
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
   
   //For decimals and numbers in general settings
   injectFunction("decimalOnly(evt){var charCode = (evt.which) ? evt.which : event.keyCode;if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46){return false;}else{return true;}}");
   
/*======================================*\
l*        _POPUP_PANEL                   |
\*======================================*/          
   //Opening the popup panel
   $("#jobminepanel a.popupOpen").click(function(){
      showPanel($(this).html().trim(),$(this).attr("width"),$(this).attr("height"));
   });
          
   //Closing the popup
   $("#panelWrapper button.closePopup").click(function(){
      hidePopup();
   });
   
/*======================================*\
l*        _REMOVING_THE_TIMER            |
\*======================================*/
 
   //Remove the timer
   removeTimer();
             
/*======================================*\
l*        _CSS_READY_LOAD                |
\*======================================*/  
   cssReady(function(){
      try{
         randomizeHints(tempPageHint.concat(HINT_ARRAY["com"]));

         //Apply the eventlisteners for white overlay
         setWhiteOverlayListeners();
         
      }catch(e){alert(e)}
   },200);
   
/*======================================*\
l*        _HIGHLIGHTING                  |
\*======================================*/    
   //Apply the highlighting for the tables
   updateTableHighlighting();
   
