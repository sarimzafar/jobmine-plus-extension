/*======================================*\
l*        _FUNCTIONS                     |
\*======================================*/

/*
 *    _COOKIES_
 */
    
   // Reads cookies, specify a name and returns value; returns -1 if not found
   function getCookieValue(name){
      var cookies = document.cookie;
      var lookup = cookies.indexOf(name+'=');
      //Doesn't exist
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

   // Write a cookie with from a name and value, it will be held for 3 months
   function writeCookie(name, value){
      var date = new Date();
      date.setTime(date.getTime()+(3*31*24*60*60*1000));     //3 months
      document.cookie = name+'='+value+';expires='+date.toGMTString()+'; path/';
   }

/*
 *    _UTILITIES_
 */
 
   //Only runs this once; cleans up the html of common pages
   function init()
   {
      //Get page type and add a class to body
      $("body").addClass(PAGE_TYPE);

      // Insert navigation header at the top and overlays when not at these pages
      if( PAGE_TYPE != "jobmine_|_university_of_waterloo" && PAGE_TYPE != "job_details"){ insertCustomHeader();}

      // Add a CSS stylesheets
      var style = document.createElement( "style" ); 
      style.appendChild( document.createTextNode("@import '"+SCRIPTSURL+"/css/style.css';") );
      
      //Update CSS Stylesheet
      if(getCookieValue('HIDE_UPDATES') != 1){style.appendChild( document.createTextNode("@import '"+SCRIPTSURL+"/css/update.css';") );};
      document.getElementsByTagName( "body" ).item(0).appendChild( style );	

      //Adds current version to the body class
      $('body').addClass("v"+CURRENT_VERSION.replace(/\./g, "_"));

      //Removing useless parts
      $("#WAIT_main0").remove();
      $("#WAIT_main").remove();

      //Makes all View buttons to the next tab
      $("a.PSHYPERLINK:contains('View')").attr("target","_blank");

      //SPECIFIC PAGE LAYOUTS
      $(".PSLEVEL1GRID.tablesorter").attr("cellpadding",0);
      $('.PSLEVEL1GRID').parent().addClass("tablepanel");
      $("table a.PTBREADCRUMB").parents("table").remove();

      //Student data Clean up
      if(PAGE_TYPE != "student_data" ){$(".PSACTIVETAB").parents().eq(2).remove();}

      //For iframes! :D
      $("body").append("<script language='javascript'>function runIframeFunction(name,_function){window.frames[name].eval(_function);}</script>");
   }
   
   // Set syntax highlighting colours for various text in tables
   function updateTableHighlighting(allowHighlighting)
   {     
      var NORMAL     = "";
      var VERYGOOD   = "#9f9";
      var GOOD       = "#61efef";
      var MEDIOCRE   = "#faf39a";
      var BAD        = "#fdaaaa";
      var WORST      = "#b5bbc1";
      
      if(allowHighlighting !== false)
      {
         
         //If tables exist on the page
         if(TABLES_OBJ)
         {
            switch(PAGE_TYPE)
            {
               case "student_app_summary":
                  TABLES_OBJ.find("tr:contains('Ranking')"           ).find("td").css("background-color",MEDIOCRE );
                  TABLES_OBJ.find("tr:contains('Ranking Complete')"  ).find("td").css("background-color",BAD      );
                  TABLES_OBJ.find("tr:contains('Ranked or Offer')"   ).find("td").css("background-color",GOOD     );
                  TABLES_OBJ.find("tr:contains('Selected')"          ).find("td").css("background-color",VERYGOOD );	
                  TABLES_OBJ.find("tr:contains('Alternate')"         ).find("td").css("background-color",MEDIOCRE );
                  TABLES_OBJ.find("tr:contains('Scheduled')"         ).find("td").css("background-color",VERYGOOD );
                  TABLES_OBJ.find("tr:contains('Employed')"          ).find("td").css("background-color",VERYGOOD );
                  TABLES_OBJ.find("tr:contains('Not Selected')"      ).find("td").css("background-color",WORST    );
                  TABLES_OBJ.find("tr:contains('Not Ranked')"        ).find("td").css("background-color",WORST    );
                  TABLES_OBJ.find("tr:contains('Applied')"           ).find("td").css("background-color",NORMAL   );
                  TABLES_OBJ.find("tr:contains('Filled')"            ).find("td").css("background-color",BAD      );
                  TABLES_OBJ.find("tr:contains('Approved')"          ).find("td").css("background-color",BAD      );
                  TABLES_OBJ.find("tr:contains('Cancelled')"         ).find("td").css("background-color",BAD      );
                  break;
               case "student_sel.interview_schedule":
                  TABLES_OBJ.find("tr:contains('Break')"             ).find("td").css("background-color",MEDIOCRE );
                  break;
               case "job_short_list":
                  TABLES_OBJ.find("tr:contains('Already Applied')"   ).find("td").css("background-color",VERYGOOD );
                  TABLES_OBJ.find("tr:contains('Not Posted')"        ).find("td").css("background-color",BAD      );
                  TABLES_OBJ.find("tr:contains('Not Authorized to ')").find("td").css("background-color",WORST    );
                  break;
               case "student_interviews":
                  TABLES_OBJ.find("tr:contains('Ranking')"           ).find("td").css("background-color",MEDIOCRE );
                  TABLES_OBJ.find("tr:contains('Scheduled')"         ).find("td").css("background-color",VERYGOOD );
                  TABLES_OBJ.find("tr:contains('Screened')"          ).find("td").css("background-color",VERYGOOD );
                  TABLES_OBJ.find("tr:contains('Selected')"          ).find("td").css("background-color",VERYGOOD );
                  TABLES_OBJ.find("tr:contains('Filled')"            ).find("td").css("background-color",WORST    );
                  TABLES_OBJ.find("tr:contains('Unfilled')"          ).find("td").css("background-color",WORST    );
                  break;
               case "student_ranking_open":
                  TABLES_OBJ.find("tr:contains('Offer')"             ).find("td").css("background-color",VERYGOOD );
                  TABLES_OBJ.find("tr:contains('Ranked')"            ).find("td").css("background-color",GOOD     );
                  TABLES_OBJ.find("tr:contains('Not Ranked')"        ).find("td").css("background-color",WORST    );
                  break;
               case 'job_search_component':
                  TABLES_OBJ.find("tr:contains('New')"               ).find("td").css("background-color",MEDIOCRE );
                  TABLES_OBJ.find("tr:contains('Viewed/Read')"       ).find("td").css("background-color",NORMAL   );
                  TABLES_OBJ.find("tr:contains('On Short List')"     ).find("td").css("background-color",WORST    );
                  TABLES_OBJ.find("tr:contains('Not Able to Shortl')").find("td").css("background-color",WORST    );
                  TABLES_OBJ.find("tr:contains('Already Applied')"   ).find("td").css("background-color",WORST    );
                  break;
            }
         }
      }
      else
      {
      //Remove the highlighting
         TABLES_OBJ.find("td").css("background-color", NORMAL);
      }
   }
   
   //Returns true if the input is a number or not
   function isNumeric( number )
   {
        return  (number - 0) == number && number.length > 0
   }
    
   //Parses an abrevation of a month and returns a number (1-12)
   function parseMonth(givenMonth){
      var months = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
      var i = 0;
      while(months[i] && months[i].indexOf(givenMonth) == -1 && months[i++]);
      //If month cannot be found
      if(i == 12) return false;
      return (parseInt(i+1)+"").length < 2 ? "0"+parseInt(i+1) : parseInt(i+1);
   }
   
   //Guess your current term and compares it to the term specified in Job Search
   function getCurrentTerm( strict )            //Strict means that it takes the term without consideration of whats in search
   {     
      var date       = new Date();
      var year       = date.getFullYear() + "";
      var firstDigit = parseInt( year[0] ) - 1;
      var middleDigit= parseInt(year.substr( 2, 2 ));
      var month      = parseInt(date.getMonth() + 1);

      //Tries to guess the digit
      // eg. 1115 --> 4 digits
      var lastDigit;
      if(month >= 1 && month <= 4){  //Jan - April
         lastDigit = "5";
      }else if(month <= 8){         //May - August
         lastDigit = "9";
      }else{                        //September - December
         lastDigit = "1";
         middleDigit++;             //Add one more for the next year
      }
      var guessTerm = firstDigit+""+middleDigit+""+lastDigit;
      
      if(strict) return guessTerm;
         
      //Algorithm to return the correct term
      var curTermInCookie = getCookieValue("CURTERM");
      if(curTermInCookie != -1)          //Cookie exists
      {
         //See if the student is looking for a job during the first month  
         // of coop term only if the cookie and the guess are not the same
         var cookieLastDigit  = parseInt(curTermInCookie[3]);          
         if(curTermInCookie   != guessTerm               //They are not equal
         &&(cookieLastDigit   == 5 && month == 5         //If a Jan-April but applying in May
         ||  cookieLastDigit  == 9 && month == 9         //If a May-August but applying in Sept
         ||  cookieLastDigit  == 1 && month == 1))       //If a Sept-Dec but applying in Jan
         {return curTermInCookie;}                      //It is acceptable to return the search value if they are still looking for a coop job but are not finding one
      }
      /*This is the best choice
      *    - Cookie doesnt exist
      *    - The month doesnt collide with the first month of their coop term; they have yet to find a job
      *    - Cookie and the guess are the same
      */
      return guessTerm;
   }
   
   //Runs the function when CSS is ready, very customized
   function cssReady(the_function, checkRate){
      checkRate = checkRate == null ? 250 : checkRate;
      var style = window.getComputedStyle(document.getElementById('cssLoadTest'), null).getPropertyValue("display");
      if(window.getComputedStyle(document.getElementById('cssLoadTest'), null).getPropertyValue("display") == "none"){
         the_function();
      }else{
         //Runs again after a few minutes
         setTimeout(function(){
            cssReady(the_function);
         },checkRate);
      }
   }
   
   //Runs JS for Chrome; ugly way of doing this;            MUST RUN BEFORE injectionFunction();
   function runJS(code){	
      window.location.href = "javascript:"+code;
   }
   
   //Able to rewrite and inject a function into the page;   MUST RUN AFTER runJS();
   function injectFunction(_function,bruteforce){
      $('body').append('<script language="javascript">function '+_function+'</script>');
   }
   
   //Returns true or false if the current page's url contains specific text
   function doesUrlContain(string)
   {
      return window.location.href.indexOf(string) != -1;
   }

   function refresh()
   {
      window.location.href = window.location.href;
   }
   
/*
 *    _LOADING_POPUP_
 */
   
   //Shows the loading Popup
   function showLoadingPopup( msg ){
      if(msg != null && (typeof msg == "string") && msg != ""){loadPopupMsg(msg);}    //Change message if inputted
      if($("body").scrollTop() != 0){$("#whiteOverlay").css("top",0);};
      $("#popupWhiteContainer").css("display","block");	
      $("body").css("overflow","hidden");
      $("#hintmsg").css("display","none");
      $("#popupContainer").css("visibility","hidden");
   }
   
   //Hides the Loading Popup if it was shown before
   function hideLoadingPopup(){
      $("#popupContainer").css("visibility", "visible");
      $("#whiteOverlay").css("top","125px");
      $("#popupWhiteContainer").css("display","none");
      $("body").css("overflow","auto");
   }
   
   //Loads a message into the Loading Popup
   function loadPopupMsg(msg){
      $("#whitePopupMsg").html(msg);
   }
   
   //White loading overlay
   function white_overlay(text, fontSize, includeImg){var image = includeImg == false  ? "" : "<img alt='' style='position:relative;top:-125px;' src='"+SCRIPTSURL+"/images/loading.gif'/>";fontSize = fontSize != null ? fontSize+"px" : "30px";text = text != null ? text : "Jobmine has been programmed to load pages really slowly.";return "<div id='popupWhiteContainer' style='display:none;'><div id='whiteOverlay' style='display:block;position:fixed;width:100%;height:100%;background-color:white;opacity:0.5;z-index:1;left:0px;top:125px;'></div><div id='popupWrapper' style='position:fixed;width:50%;height:50%;bottom:0px;right:0px;'><div id='popupWhiteContent' style='position:relative;width:450px; font-weight:bold; height:180px;top:-90px;font-size:"+fontSize+";left:-225px;z-index:49;font-family:Arial,Verdana;text-align:center;text-shadow:-2px -2px 5px #777, 2px 2px 5px #777;'><span style='font-size:50px;'>Please be Patient.</span><br/><div id='whitePopupMsg'>"+text+"</div><br/>"+image+"</div></div></div>";}
   
   //When to run the white overlay: a-tags or inputs (buttons)
   function setWhiteOverlayListeners()
   {
      if(getCookieValue('LOAD_SCREEN') != 1)
      {
         //Do not show overlay if and only if it produces new tab, if specified no popup, parent is returning false, if email link
         $("a").click(function(){
            if($(this).attr("target")!= "_blank" && $(this).attr("target") != "new" && $(this).attr("popup")!= "false" && $(this).parent().html().indexOf('onclick="return ') == -1  && $(this).attr('href').indexOf('mailto') == -1){
               showLoadingPopup();
            }
         });

         $("input[type='button'][popup!='false']").click(showLoadingPopup);
      }
   }
   
/*
 *    _REMOVING_THE_TIMER_
 */

   function resetGlobalTimer(){
      //If a timer exists already, remove it and start a new one
      if(GLOBAL_TIMER){
         clearTimeout(GLOBAL_TIMER);        	
      }
      GLOBAL_TIMER  = setTimeout(function(){
         refresh();
      },getCookieValue('AUTO_REFRESH')*60*1000); 
   }
   
   function removeTimer()
   {
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
                  refresh();
               }, 19 * 1000 * 60);
            },1);
         }else{
            document.addEventListener('click',resetGlobalTimer,true);
            resetGlobalTimer();
         }
      } 
   }
   
/* 
 *    _INSERTING_HTML_
 */
 
   //Jobmine Plus header
   function insertCustomHeader(){
   var   header = '<div id="updateInfo" style="display:none;background-color: #f1f8fe; width: 100%; text-align: center;"><a popup="false" href="http://userscripts.org/scripts/source/80771.user.js">There is a newer version of Jobmine Plus, click to install.</a></div>';
         header +=     '<div id="jobminepanel" style="width:100%; height:125px; background-repeat: repeat-x;';
         header +=     'background-image: url(data:image/gif;base64,R0lGODlhAQB9AOYAAFdXmlhYm+3v+mBgoF1dnmRkorW10nJyq1panGhopWpqpnZ2rW1tqPHx9/T0+IWFtoeHt4mJuPr6/JmZwpubw7Cw0KSkyLm51WdnpKKix8PD21xcncHB2s/P4qyszdfX566uz9nZ6OXl8Nzc6tXV5qioy/X1+f39/qamybe31Ozs83t7sL2915OTvltbnZWVv2xsp8nJ34GBs4+PvOjo8Xl5r9PT5W9vqJGRvXR0rIuLuaqqzH19sbKy0bu71p2dxHh4rnFxqs3N4dvb6WNjof7+/uDg7J+fxo2NumFhoOfn8FZWmllZm39/smVlo/n5+/j4++rq8r+/2fPz+HeAt/z8/YODtO3t9OLi7ff3+t7e619fn/v7/cvL4JeXwe/v9fDw9uPj7tHR5FVVmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAABAH0AAAdsgGOCg4SFhoVLAAFMCC4bBFsDSUQFThgJCjAMN0EHOQtANSs8TTJWDxAROkgzOC0vXhMUP0cZFiglOx4gFT0GKRc+LFIcGlQCMV1CHWI2JB8hQyNaRlhhIko0USpXX2ANUw4mWVBPElxVJ0WBADs=);';
         header +=     '"><table cellspacing="0" cellpadding="0" style="background-repeat: repeat-x;';
         header +=     'background-image: url(data:image/gif;base64,R0lGODlhAQB9AOYAAFdXmlhYm+3v+mBgoF1dnmRkorW10nJyq1panGhopWpqpnZ2rW1tqPHx9/T0+IWFtoeHt4mJuPr6/JmZwpubw7Cw0KSkyLm51WdnpKKix8PD21xcncHB2s/P4qyszdfX566uz9nZ6OXl8Nzc6tXV5qioy/X1+f39/qamybe31Ozs83t7sL2915OTvltbnZWVv2xsp8nJ34GBs4+PvOjo8Xl5r9PT5W9vqJGRvXR0rIuLuaqqzH19sbKy0bu71p2dxHh4rnFxqs3N4dvb6WNjof7+/uDg7J+fxo2NumFhoOfn8FZWmllZm39/smVlo/n5+/j4++rq8r+/2fPz+HeAt/z8/YODtO3t9OLi7ff3+t7e619fn/v7/cvL4JeXwe/v9fDw9uPj7tHR5FVVmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAABAH0AAAdsgGOCg4SFhoVLAAFMCC4bBFsDSUQFThgJCjAMN0EHOQtANSs8TTJWDxAROkgzOC0vXhMUP0cZFiglOx4gFT0GKRc+LFIcGlQCMV1CHWI2JB8hQyNaRlhhIko0USpXX2ANUw4mWVBPElxVJ0WBADs=);';
         header +=     '"><tr><td valign="top"><div style="width:228px;color:white;height:88px;padding:15px;padding-left:30px;text-shadow: black -2px -2px 5px, black 2px 2px 5px;font-family:Verdana,Arial;background-image:url('+SCRIPTSURL+'/images/left.png);background-repeat:no-repeat;"><span style="font-size:30px;">Jobmine Plus</span><br/><div style="margin-left:20px;">Browse jobs your way.</div></div></td>';
         header +=     '<td valign="top"><div id="jobmineplus_links" class="links" style="margin-top:30px;width:820px;color:#CCCCCC;font-family: Arial, Verdana;outline: none; text-decoration:none;">'; 
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
         header +=     "<div style='display:none;padding:20px;' class='panels' id='About'><b>Jobmine Plus v"+CURRENT_VERSION+"</b><br/><br/><span class='details'>Written by Matthew Ng<br/><br/>Website: <a href='http://userscripts.org/scripts/show/80771' target='_blank'>http://userscripts.org/scripts/show/80771</a><br/><br/>FAQ:<a href='http://userscripts.org/topics/70845' target='_blank'>http://userscripts.org/topics/70845</a><br/><br/>Any problems/issues/wanted features email me at:<br/><span class='details'>Email: <a href='mailto:jobmineplus@gmail.com'>jobmineplus@gmail.com</a></span><br/></span><br/><br/><br/><br/><br/><br/><br/><br/><br/><button style='float:right;' class='button closePopup PSPUSHBUTTON'>Cancel</button></div>";

         header +=     "</span></div></div></div>";

         //White overlay
         header +=     white_overlay();

         //Hint Popup
         header +=     "<div id='hintmsg' style='display:none;visibility:hidden;position:absolute;' class=''><a class='close' style='cursor:pointer;' popup='false'></a><div id='description'></div><input type='checkbox' id='preventShowingChkbx'  /><div id='preventShowingText'>Never show me this again.</div></div>";
         header +=     "<div id='cssLoadTest' style='visibility:hidden;display:block;'></div>";
         
      //Put it on
      $("body").prepend(header);    
   }
   
/* 
 *    _SETTING_
 */
   
   //Adds a new settings item under settings with the content loaded and its own nav item
   function addSettingsItem(name, html)
   {
      if(!document.getElementById("general_"+name.toLowerCase()))
      {
         $("#settingsNav")    .append('<a popup="false" href="javascript:void(0)">'+name+'</a>');
         $("#settingsContent").append('<div class="settingsItem" id="settings_'+name.toLowerCase()+'">'+html+'</div>');
      }
   }
   
   //The general settings nav item: running this saves the states of the fields
   function saveGeneralSettings()
   {
      var autorefresh   = $("#popupText")       .attr("value");
      if(autorefresh && autorefresh.search(/^[0-9]+(\.[0-9]+$)?/g) == -1){alert("Please make sure that the Auto Refresh Duration is a positive decimal or integer number (numbers and a period).");return;};
      var remove_load   = $('#loadCheckbox')    .attr("checked");
      var remove_timer  = $('#removeTimerChkbx').attr("checked");
      var hideupdates   = $('#updateCheckbox')  .attr("checked");
      var default_page  = $("#popupSelect")     .attr("value");
      //Write Cookies
      writeCookie('LOAD_SCREEN',    remove_load    ? 1 : 0);
      writeCookie('DISABLE_TIMER',  remove_timer   ? 1 : 0);
      writeCookie('HIDE_UPDATES',   hideupdates    ? 1 : 0);
      writeCookie('DEFAULT_PAGE',   default_page   );
      writeCookie('AUTO_REFRESH',   autorefresh    );
   }
   
   //Saves settings for the pages nav
   function savePageSettings()
   {
      var show_oldDtlPage  = $("#pgSettings_showOldPage")   .attr("checked");
      var run_lastSearch   = $("#pgSettings_runLastSrch")   .attr("checked");
      
      //Write Cookies
      writeCookie('SHOW_OLD_DETAILS', show_oldDtlPage ? 1 : 0);
      writeCookie('RUN_LAST_SEARCH' , run_lastSearch  ? 1 : 0);
   }
   
/*
 *    _HINTS_TOOLTIP_
 */
   function saveTooltipSettings()
   {               
     var cookieQuery = $("#enableTooltip")[0].checked ? 1 : 0;  
      if(cookieQuery != 0)               //is tooltips enabled?           
      {
         var searchTable = $("#settings_tooltip table");
         for(var page in HINT_ARRAY)
         {
            if(page != "enable")
            {
               cookieQuery += "|"+page +"=";
               for(var i=0;i<HINT_ARRAY[page].length;i++){cookieQuery += (searchTable.find("input[num='"+i+"'][page='"+page+"']")[0].checked ? 1 : 0) + ",";}
               cookieQuery = cookieQuery.slice(0, -1);        //removes last comma                    
            }
         }
      }
      writeCookie("TOOLTIP", cookieQuery);       
   }
   
   //Position the tooltip that points to an object; it will auto determine the orientation depending on where the object is
   function positionHint(objPoint)
   {
      var orientation = null;

      //Dimensions of Orientations, HARDCODED
      var VERTICALHINT     = new Array(218, 157);
      var HORIZONTALHINT   = new Array(235, 138);
      var marginPercentage = 0.2;
      var offsets          = $(objPoint).offset();
      var objLeft          = parseInt(offsets.left);
      var objTop           = parseInt(offsets.top);

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
      //Orient the hint box depending on the location of the object
      switch(orientation)   
      {
         case "up":     
            objLeft  += parseInt(-VERTICALHINT[0]/2+$(objPoint).outerWidth(true)/2);
            objTop   += parseInt($(objPoint).outerHeight(true));
            break;
         case "down":
            objLeft  += parseInt(-VERTICALHINT[0]/2+$(objPoint).outerWidth(true)/2);
            objTop   -= VERTICALHINT[1];
            break;
         case "left":
            objLeft  += $(objPoint).outerWidth(true);
            objTop   -= parseInt(HORIZONTALHINT[1]/2-$(objPoint).outerHeight(true)/2);
            break;
         case "right":
            objLeft  -= HORIZONTALHINT[0];
            objTop   -= parseInt(HORIZONTALHINT[1]/2-$(objPoint).outerHeight(true)/2);
            break;
         default:
            return;
            break;
      }
      $("#hintmsg")[0].className = orientation;
      $("#hintmsg").css("left",objLeft+"px").css("top",objTop+"px");
   }
   
   //Chooses a random hint/tooltip defined in that section of the code
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
         
         //The cookie exists, time to get some values
         if(cookieVal != -1 && cookieVal.indexOf("1|") == 0) 
         {
            var query = cookieVal.split("|");          
            while(query[index].indexOf(hint.page+"=") == -1 && index++ < query.length);
            var selectedValues = query.splice(index,1).toString().split("=")[1].split(",");
            var number = hint.page != "com" ? randomIndex : (randomIndex - tempPageHint.length);
         }else{
            //Cookie doesnt exist
            var selectedValues = new Array();

            //Build a default cookie
            var cookieQuery = "1";
            for(var page in HINT_ARRAY)
            {
               if(page != "enable")
               {
                  cookieQuery += "|"+page +"=";
                  for(var i=0;i<HINT_ARRAY[page].length;i++){cookieQuery += "1,";}
                  cookieQuery = cookieQuery.slice(0, -1);        //removes last comma                    
               }
            }
            writeCookie("TOOLTIP", cookieQuery);        
         }
         
         //Show it if:
         if(   selectedValues[number] != 0                     //Has not been blocked under settings
            && chosenIndex <= probability                      //If probability allows the percentage to show it
            && hint.obj                                        //The object it is pointing to must exist on page
            && (hint.funct == null || hint.funct() === true)  //The function specified must be true or not specified at all
         ){
            //Properties and position the tooltip/hint
            positionHint(hint.obj);                    
            $("#hintmsg #description").html(hint.text);
            $("#preventShowingChkbx").attr("page",hint.page);
            $("#preventShowingChkbx").attr("num", number);
            $("#hintmsg").fadeIn(1200);
            
            //Window Resizing and reposition
            $(window).bind("resize",function(){positionHint(hint.obj);});
            
            //Closes and fades out the hint box for every a tag clicked
            var aLinks = $("#hintmsg a");
            aLinks.bind("click",function(){
               aLinks.unbind();
               $(window).unbind("resize");
               $("#hintmsg").fadeOut(500);
               
               //If checkbox is checked
               if($("#preventShowingChkbx").attr("checked"))
               {              
                  var index = 0;
                  var query = getCookieValue("TOOLTIP").split("|");
                  var page = $("#preventShowingChkbx").attr("page");
                  while(query[index].indexOf(page+"=") == -1 && index++ < query.length);
                  var selectedValues = query.splice(index,1).toString().split("=")[1].split(",");
                  index = $("#preventShowingChkbx").attr("num");

                  //if the jobmine plus has a new hint that is not in cookies
                  if(index > selectedValues.length)       
                  {
                     var diff = index-selectedValues.length;
                     var count = HINT_ARRAY[page].length - selectedValues.length;
                     for(var i=0; i<count;i++){
                        if(i == diff){selectedValues.push(0);}       //when they are the same           
                        else{selectedValues.push(1);}
                     }
                  }
                  //if the hint is in the cookies, just update it with 0 (off)
                  else                                              
                  {
                     selectedValues.splice(index, 1, 0);          //we go to the index in the array and replace it with 0 (which is false)
                  }
                  query.push(page+"="+selectedValues.join(","));
                  writeCookie("TOOLTIP", query.join("|"));
               }
            });
         }
      }
   }
   
   /*
    *    _PANEL_POPUP_
    */
   function hidePopup(){$("#popupContainer").css("display","none");$("body").css("overflow","auto");$("#panelWrapper").children().each(function(){$(this).css("display","none");});};
   
   //When the popup is shown, the panel is shown based off the name
   function showPanel(panelName, width, height)
   {
      if($("#"+panelName))
      {
         for(var i=0;i<$("#panelWrapper")[0].childNodes.length;i++){$("#panelWrapper")[0].childNodes[i].style.display='none';}                      
         $("#"+panelName)     .css("display","block");
         $('#popupTitle')     .html(panelName);
         $("#popupContainer") .css("display","block");
         $("body")            .css("overflow","hidden");

         //Resize
         $("#popupContent").css("width",width+"px").css("height",height+"px").css("left",-width/2+"px").css("top",-height/2+"px");

         /*
          *    Settings Panel
          */
         if(panelName == "Settings")  
         {  /*
             *    Get general settings cookies
             */
            $('#popupTitle')        .html("General Settings");
            $("#popupSelect")       .attr("value",    getCookieValue('DEFAULT_PAGE'));
            $("#popupText")         .attr("value",    (getCookieValue('AUTO_REFRESH')  != -1? getCookieValue('AUTO_REFRESH') : 0));
            $('#removeTimerChkbx')  .attr("checked",  (getCookieValue('DISABLE_TIMER') ==  1 ? true : false));  
            $('#updateCheckbox')    .attr("checked",  (getCookieValue('HIDE_UPDATES')  ==  1 ? true : false));  
            $('#loadCheckbox')      .attr("checked",  (getCookieValue('LOAD_SCREEN')   ==  1 ? true : false));  

            
            /*
             *    Get tooltip settings cookies
             */
            //Load all the tooltip settings from cookies
            var cookieVal  = getCookieValue("TOOLTIP");
            var query      = cookieVal == -1 ? new Array(0) : cookieVal.split("|");
            if(query.shift() != 0)        
            {
               $("#enableTooltip").attr("checked","checked").parent().next().removeClass("disabled").find("input").removeAttr("disabled");
               for(var page in HINT_ARRAY)            //Each Page
               {
                  //Find the index we need and populate an array, if the hint has nothing in it, ignore it
                  if(HINT_ARRAY[page].length > 0)     
                  {
                     if(query.length > 0){            //Does the page in the cookie exist?
                        var index = 0;
                        while(query[index].indexOf(page+"=") == -1 && index++ < query.length);     //Find the right array inside query
                        var savedValues = query.splice(index,1).toString().split("=")[1].split(",");
                     } 
                     else{savedValues = new Array();}
                     for(var i=0;i<HINT_ARRAY[page].length;i++){         //Each value of that page
                        if(savedValues[i]){       //is there any values in that page of the cookie?
                           $("#settings_tooltip table input[num='"+i+"'][page='"+page+"']")[0].checked = savedValues[i] != 0;
                        }else{
                           $("#settings_tooltip table input[num='"+i+"'][page='"+page+"']")[0].checked = true;
                        }
                     }
                  }
               }
            }
            //Tooltips are not enabled
            else
            {
            $("#enableTooltip").removeAttr("checked");
               toggleEnableTooltip(document.getElementById("enableTooltip"));
            }
            
            /*
             *    Get pages settings cookies
             */
            $("#pgSettings_showOldPage")  .attr("checked",  (getCookieValue('SHOW_OLD_DETAILS') ==  1 ? true : false)); 
            $("#pgSettings_runLastSrch")  .attr("checked",  (getCookieValue('RUN_LAST_SEARCH')  ==  1 ? true : false)); 
          
            /*
             *    Set toggles for settings panel
             */
            toggleRemoveTimer(document.getElementById("removeTimerChkbx"));
            
            //Make sure you make all other setting panels are invisible and only set the general settings on
            for(var i=0;i<$("#settingsContent")[0].childNodes.length;i++){$("#settingsContent")[0].childNodes[i].style.display='none';}     
            $("#settingsContent")[0].firstChild.style.display = "block";
         }
      }
   }