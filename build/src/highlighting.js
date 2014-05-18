/*================================*\
|*        __HIGHLIGHTING__        *|
\*================================*/
{/*Expand to see the highlighting code*/
var HIGHLIGHT = {
   getCriteria : function(){     //The lower it is, the more priority it has
      switch(PAGEINFO.TYPE) { 
         case PAGES.LIST: 
            return {
               'Already Applied'          :     COLOURS.GREAT,
               'Not Authorized to Apply'  :     COLOURS.BAD,
            };
            break;
         case PAGES.RANKINGS:
            return {
               'Offer'                    :     COLOURS.GREAT,
               'Ranked'                   :     COLOURS.GOOD,
               'Not Ranked'               :     COLOURS.WORST,
            };
            break;
         case PAGES.INTERVIEWS:
            return {
               'Unfilled'                 :     COLOURS.BAD,
               'Scheduled'                :     COLOURS.GREAT,
            };
            break;
         case PAGES.SEARCH:
            return {
               'New'                      :     COLOURS.AVERAGE,
               'Read'                     :     COLOURS.BLANK,
               'On Short List'            :     COLOURS.GREAT,
               'Already Applied'          :     COLOURS.GREAT,
            };
            break;
         case PAGES.PROFILE:
            return {
               'Outstanding'              :     COLOURS.GREAT,
               'Excellent'                :     COLOURS.GREAT,
               'Good'                     :     COLOURS.GOOD,
               'Very Good'                :     COLOURS.GOOD,
               'Satisfactory'             :     COLOURS.AVERAGE,
               'Marginal'                 :     COLOURS.AVERAGE,
               'Unsatisfactory'           :     COLOURS.BAD,
            };
            break;
         case PAGES.APPLICATIONS:
            return {
               'Selected'                 :     COLOURS.GREAT,
               'Scheduled'                :     COLOURS.GREAT,
               'Not Selected'             :     COLOURS.WORST,
               "Unfilled"                 :     COLOURS.BAD,
               "Ranked or Offered"        :     COLOURS.GREAT,
               "Alternate"                :     COLOURS.GOOD,
               "Ranking Complete"         :     COLOURS.BAD,
               "Cancelled"                :     COLOURS.WORST,
               "Employed"                 :     COLOURS.GREAT,
            };
            break;
         default:
            return null;
            break;
      }
   },
   apply : function(jObj){
      if (jObj == null) {jObj=$("form:eq(0) table.tablesorter tr");}
      if (!UTIL.isjQuery(jObj)) {
         jObj = $(jObj);
      }
      var criteria = this.getCriteria();
      if (criteria!=null){
         for(var text in criteria) {
            jObj.find("td:contains('"+text+"')").parent().css("background-color", criteria[text]);
         }
      }
   },
};
//   LOGIN          : "LOGIN",
//   HOME           : "HOME",
//   DOCUMENTS      : "DOCUMENTS",
//   PROFILE        : "PROFILE",
//   PERSONAL       : "PERSONAL_INFO",
//   ACADEMIC       : "ACADEMIC_INFO",
//   SKILLS         : "SKILLS_INVENTORY",
//   SEARCH         : "SEARCH",
//   LIST           : "SHORT_LIST",
//   APPLICATIONS   : "APPLICATIONS",
//   INTERVIEWS     : "INTERVIEWS",
//   RANKINGS       : "RANKINGS",
//   DETAILS        : "JOB_DETAILS",
//   EMPLOYEE_PROF  : "EMPLOYEE_PROFILE",
}