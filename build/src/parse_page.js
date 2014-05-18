/*===============================*\
|*        __PARSE_PAGE__         *|
\*===============================*/
{/*Expand this to see the page parsing code*/
//Check to see if local storage is supported
if (!('localStorage' in window) || window['localStorage'] === null){
   alert("Local Storage is not supported, update your browser.");
   return;
}
//Avoids stupid errors
if (document.body == null || document.body.className == "PSSRCHPAGE") {
   return;
}

var BROWSER = {
   FIREFOX  : 0,
   CHROME   : 1,
   OTHER    : 2,
}

var PAGEINFO = {
   URL               : document.location.href,
   DOMAIN            : document.domain,
   TYPE              : null,
   TITLE             : document.title,
   IN_IFRAME         : top != self,
   BROWSER           : (function(){var ua = navigator.userAgent.toLowerCase();var b;if (ua.contains("firefox")) {b = BROWSER.FIREFOX;this.BROWSER_VERSION = ua.substr(ua.lastIndexOf("firefox/")+8);} else if (ua.contains("chrome")) {b = BROWSER.CHROME;var ua = navigator.userAgent.toLowerCase();var start = ua.lastIndexOf("chrome/")+7;this.BROWSER_VERSION = ua.substring(start, ua.indexOf(" ", start));} else {b = BROWSER.OTHER;}return b;})(),
   BROWSER_VERSION   : (function(){var ua = navigator.userAgent.toLowerCase();var b;if (ua.contains("firefox")) {b = ua.substr(ua.lastIndexOf("firefox/")+8);} else if (ua.contains("chrome")) {var ua = navigator.userAgent.toLowerCase();var start = ua.lastIndexOf("chrome/")+7;b = ua.substring(start, ua.indexOf(" ", start));} else {b = null;}return b;})(),
};

var REVERSE_PAGES = {
   LOGIN             : "LOGIN",
   HOME              : "HOME",
   DOCUMENTS         : "DOCUMENTS",
   PROFILE           : "PROFILE",
   PERSONAL_INFO     : "PERSONAL",
   ACADEMIC_INFO     : "ACADEMIC",
   SKILLS_INVENTORY  : "SKILLS",
   APPLY             : "APPLY",
   SEARCH            : "SEARCH",
   SHORT_LIST        : "LIST",
   APPLICATIONS      : "APPLICATIONS",
   INTERVIEWS        : "INTERVIEWS",
   RANKINGS          : "RANKINGS",
   JOB_DETAILS       : "DETAILS",
   EMPLOYEE_PROFILE  : "EMPLOYEE_PROF",
};

var PAGES = {
   LOGIN          : "LOGIN",
   HOME           : "HOME",
   DOCUMENTS      : "DOCUMENTS",
   PROFILE        : "PROFILE",
   PERSONAL       : "PERSONAL_INFO",
   ACADEMIC       : "ACADEMIC_INFO",
   SKILLS         : "SKILLS_INVENTORY",
   APPLY          : "APPLY",
   SEARCH         : "SEARCH",
   LIST           : "SHORT_LIST",
   APPLICATIONS   : "APPLICATIONS",
   INTERVIEWS     : "INTERVIEWS",
   RANKINGS       : "RANKINGS",
   DETAILS        : "JOB_DETAILS",
   EMPLOYEE_PROF  : "EMPLOYEE_PROFILE",
   
   //Functions
   isValid     : function(page){
      return this.hasOwnProperty(page);
   },
};

/**
 *    Find the page we are currently at
 */
if(PAGEINFO.URL.contains(LINKS.EMPLYR_TOP) || PAGEINFO.URL.contains(LINKS.EMPLYR_FRAME)) {
   window.location.href = LINKS.LOGIN;    //Forces you to be redirected to the student login page
   return;
} else if (PAGEINFO.TITLE.contains("JobMine") && UTIL.idExists("userid") ) {
   PAGEINFO.TYPE = PAGES.LOGIN;
} else if (PAGEINFO.URL.contains("?tab=DEFAULT") && PAGEINFO.URL.contains(CONSTANTS.PAGESIMILARTOP)) {
   PAGEINFO.TYPE = PAGES.HOME;
} else if (PAGEINFO.TITLE == "Job Details") {
   if(UTIL.getID("selected").getElementsByTagName("span")[0].firstChild.nodeValue == "Job Details") {
      PAGEINFO.TYPE = PAGES.DETAILS;
   } else {
      PAGEINFO.TYPE = PAGES.EMPLOYEE_PROF;
   }
} else if (PAGEINFO.TITLE.contains("Student Ranking")) {
   PAGEINFO.TYPE = PAGES.RANKINGS; 
} else {
    switch(PAGEINFO.TITLE) {
        case "Student PDF Library":                PAGEINFO.TYPE = PAGES.DOCUMENTS;    break;
        case "Job Search Component":               PAGEINFO.TYPE = PAGES.SEARCH;       break;
        case "Job Short List":                     PAGEINFO.TYPE = PAGES.LIST;         break;
        case "Student App Summary":                PAGEINFO.TYPE = PAGES.APPLICATIONS; break;
        case "Student Interviews":                 PAGEINFO.TYPE = PAGES.INTERVIEWS;   break;
        case "Create / Maintain student Apps":     PAGEINFO.TYPE = PAGES.APPLY;        break;
        case "Student Data":          //Handle each profile page differently
            try{
                var selectedText = UTIL.getID("selected").getElementsByTagName("span")[0].firstChild.nodeValue;
                switch(selectedText.trim().toLowerCase()) {
                    case "skills inventory":      PAGEINFO.TYPE = PAGES.SKILLS;    break;
                    case "acad info.":            PAGEINFO.TYPE = PAGES.ACADEMIC;  break;
                    case "student personal info": PAGEINFO.TYPE = PAGES.PERSONAL;  break;
                    case "term cards":            PAGEINFO.TYPE = PAGES.PROFILE;   break;
                    default:
                        throw new Error("Unhandled new nav item: "+selectedText.toLowerCase().trim());
                        break;
                }
            }catch(e){alert("There is a problem with the Profile page, cannot parse selected tab\n"+e);}
        break;
   }
}
if (PAGEINFO.TYPE != null) {
   var noClasses = document.body.className == "";
   document.body.className += (noClasses ? "" : " ") + PAGEINFO.TYPE;
   if (PAGEINFO.IN_IFRAME) {
      document.body.className += " iframe";
   }
}
//Set inital stuff
OBJECTS.STORAGE = (PAGEINFO.BROWSER == BROWSER.FIREFOX ? unsafeWindow.localStorage : localStorage);      //Fixes FF3.5/6
}