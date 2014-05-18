/*================================*\
|*            __TABLE__           *|
\*================================*/
/**
 *    Basic Arguments
 *       "defaultName"            arguments are optional, it can look for the table's name on the page; if no name is provided at all, then no table is made
 *       "_srcID"                is the Jobmine table you are grabbing informaation from
 *       "objectToAppendTo"      is the object that jQuery will attach the tablet to [eg. $("body").append(tableHTML);]; can be dom object or jQuery object
 *       "headerList"            an array of strings where each string is a header name (all name with "{____}" surrounded by curly braces will be empty but you reference a header through this)
 *       "dataList"              2D array [row][col] with Strings as the value; this the body of the table
 *       "index"                 is a positive integer that describes the location where an operation occurs; must be between 0 and the number of columns (subtract one)
 *       "filterFunction"        some functions require column manipulation, this allows the data in the column to be manipulated when building/updating
 *       "dontUpdate"            don't update the table, might use this if you are doing a batch operation
 *       "columnInput"           references a column by either index or column header name
 *       "onclick_OR_location"   provide a function that occurs when onclick happens or a url for it to go somewhere
 *
 *    makeTable & TABLES implementation
 *       Call < TABLES[index] > to get the JbmnplsTable object on the page
 *       Calling "makeTable(defaultName, tableID, objectToAppendTo)" would create the table and index the object in the "TABLES" array
 *    
 *    JbmnplsTable Filters [table.applyFilter("Job Title", TABLEFILTERS.jobDescription);  //Looks for header "Job Title" and applies the filter]
 *       TABLEFILTERS.normal;                   //Filter does nothing, this is default
 *       TABLEFILTERS.deleteRow;                //Filter shows the new delete object and provides the functionality; replaces only on Job short list and applications
 *       TABLEFILTERS.jobDescription;           //Replaces the job link with a faster and direct link to the description 
 *       TABLEFILTERS.googleSearch;             //Takes the employer name and makes it a link so that you can Google search them
 *       TABLEFILTERS.googleMap;                //Takes the location and makes it a link so that you can look up where they are located
 *       TABLEFILTERS.interviewerSearch;        //Takes the interviewer's name and makes it a link so that you can look them up on Linkedin
 *
 *    Implementation [Intended of use] 
 *       var table = JbmnplsTable(defaultName, _srcID, objectToAppendTo);     //Constructor
 *       table.parseTable(_srcID)               //Parses the table and gets the headers and columns+rows (can run multiple times)
 *       table.insertData(headerList,dataList)  //Applies the headerList to the table's headers and dataList to the body of the table (use table.updateCells() to visually update the table)
 *       table.updateCells()                    //Updates the headers and body of the table based on the data manipulation done to the class object
 *       table.update()                         //A combination of table.parseTable().updateCells(); only run after table has been build and appended
 *       table.updateTable()                    //When cell data changes externally, please run this
 *       table.empty()                          //Returns true if there are no rows
 *       table.setHeaderAt(index, newName)      //At the index, it will set the header with this name (becareful of other function that rely on the header to do things)
 *       table.insertColumn(headerName, index_OR_filterFunction, dataArray_OR_filterFunction)      //Insert a new column; if no index is specified, appends to end of table; look at implementation below for more info
 *       table.merge(intoIndex, fromIndex, headerName, filterFunction)      //merges two columns; fromIndex column is deleted; headername is optional (use null), look at implementation below for more info
 *       table.deleteColumn(index)              //Deletes the column at that index
 *       table.deleteColumnRange(startIndex_deleteArr, endIndex)   //Deletes all columns in a given range; more (arguments) info in implementation below
 *       table.deleteRow(index, dontUpdate)     //Deletes a row with given index
 *       table.deleteRowRange(list)             //Deletes several rows given an array list of indexes
 *       table.hideColumns(list)                //Hides the column[s] on provided array indexes
 *       table.showAllColumns()                 //Show all columns
 *       table.showColumns()                    //Shows the column[s] on provided array indexes
 *       table.isColumnShown(index)             //Checks to see if the column is shown
 *       table.getColumnsHidden()               //Returns an array of indexes that corresponds to columns that are hidden
 *       table.trim()                           //Removes all columns where they have no information (expensive)
 *       table.applyFilter(columnInput, filterFunction) //Provided a column, apply a filter when it builds/updates
 *       table.removeFilter(columnInput)        //Provided a column, removes a filter
 *       table.addCheckboxes(columnNumber)      //Adds checkboxes to the table that is all managed by the class; columnNumber is optional, will set to 1st column if null
 *       table.addControlButton(name, onclick_OR_location)   //Adds a control button on the table, attaches an array of colours
 *       table.removeControlButton(name)        //Removes a control button by name
 *       table.build()                          //Builds the html of the table (better to run table.appendTo(obj) after create table or parse table)
 *       table.appendTo(objectToAppendTo)       //Appends the object html to an object (can only run once)
 *       table.makeDraggrable(shouldAllow)      //Allows/do not allow the table to be draggable (drags on the header of the table)
 *       table.setLoading(shouldShow)           //Shows the loading screen for the table
 */   
{/*===== Expand to see the table functions/class =====*/

/**
 *    Object that holds all the table objects
 */
var TABLES = [];

/**
 *    Make a Jobmine Plus table and puts it in an array
 */
function makeTable(defaultName, tableID, objectToAppendTo) {
   var table = new JbmnplsTable(defaultName, tableID, objectToAppendTo);
   TABLES.push(table);
   return table;
}

/**
 *    Table columns: used to when you are applying a new filter for a new column
 */
var TABLECOLUMNS = {
   googleCalendar : function(row, rowData, reverseLookup){
      if (  !reverseLookup.hasOwnProperty("Employer Name") 
         || !reverseLookup.hasOwnProperty("Type") 
         || !reverseLookup.hasOwnProperty("Job Title") 
         || !reverseLookup.hasOwnProperty("Interviewer") 
         || !reverseLookup.hasOwnProperty("Instructions") 
         || !reverseLookup.hasOwnProperty("Date") 
         || !reverseLookup.hasOwnProperty("Start Time") 
         || !reverseLookup.hasOwnProperty("Length") 
      ) {
         return MESSAGE.UNHIDE_COLUMNS;
      }
      var company = rowData[reverseLookup["Employer Name"]];if(company==""){return "";}
      var title = encodeURIComponent("Interview with "+company);if(title==""){return "";}
      var type = rowData[reverseLookup["Type"]];if(type==""){return "";}
      var location = rowData[reverseLookup["Room"]];location=location==""?"Somewhere in Tatham Center":encodeURIComponent("Tatham Center Room "+location.substr(2));
      var jobTitle = rowData[reverseLookup["Job Title"]].getTextBetween(">","</a>");if(jobTitle==""){return "";}
      var interviewer = rowData[reverseLookup["Interviewer"]];if(interviewer==""){return "";}
      var instructions = rowData[reverseLookup["Instructions"]];instructions==""?"":"\nExtra Information:\n"+instructions;
      var details = encodeURIComponent(type + " interview with " + company + "\nInterviewer: " + interviewer + "\nTitle: "+ jobTitle + instructions);
      
      //Dates
      var date = rowData[reverseLookup["Date"]].split(" ");if(date[0]==''){return "";}
      var year = date[2];
      var month = (parseMonth(date[1])+1).toDigits(2);
      var day = parseInt(date[0],10).toDigits(2);
      var start = rowData[reverseLookup["Start Time"]].split(" ");if(start[0]==''){return "";}
      var startTime = start[0].split(":");
      var isPM = start[1].toUpperCase() == "PM" && parseInt(startTime[0],10) != 12 || start[1].toUpperCase() == "AM" && parseInt(startTime[0],10) == 12 ? "PM" : "AM";       //Google has some issues.
      var sHour = (parseInt(startTime[0],10) + new Date().getTimezoneOffset()/60 + (isPM == "PM" ? 12 : 0))%24;
      var sMin = parseInt(startTime[1],10);
      var length = rowData[reverseLookup["Length"]];if(length==""){return "";}
      var finishedDate = new Date(year, month, day, sHour, sMin + parseInt(length,10), 0, 0);
      var eHour = finishedDate.getHours();
      var eMin  = finishedDate.getMinutes();
      var dateStr = year + month + day + "T" + sHour.toDigits(2) + sMin.toDigits(2) + "00Z/" + year + month + day + "T" + eHour.toDigits(2) + eMin.toDigits(2) + "00Z";
      return '<a title="Google calendar may have the wrong date, please be aware of day light savings time!" href="http://www.google.com/calendar/event?action=TEMPLATE&text='+title+'&dates='+dateStr+'&details='+details+'&location='+location+'&trp=false&sprop=&sprop=name:" target="_blank"><img src="http://www.google.com/calendar/images/ext/gc_button6.gif" alt="0" border="0"></a>';
   },
   googleCalendarGroup : function(row, rowData, reverseLookup){
      if (  !reverseLookup.hasOwnProperty("Employer Name") 
         || !reverseLookup.hasOwnProperty("Job Title") 
         || !reverseLookup.hasOwnProperty("Instructions") 
         || !reverseLookup.hasOwnProperty("Date") 
         || !reverseLookup.hasOwnProperty("Start Time") 
         || !reverseLookup.hasOwnProperty("End Time") 
      ) {
         return MESSAGE.UNHIDE_COLUMNS;
      }
      var company = rowData[reverseLookup["Employer Name"]];if(company==""){return "";}
      var title = encodeURIComponent("Interview with "+company);if(title==""){return "";}
      var location = rowData[reverseLookup["Room"]];location=location==""?"Somewhere in Tatham Center":encodeURIComponent("Tatham Center Room "+location.substr(2));
      var jobTitle = rowData[reverseLookup["Job Title"]].getTextBetween(">","</a>");if(jobTitle==""){return "";}
      var instructions = rowData[reverseLookup["Instructions"]];instructions==""?"":"\nExtra Information:\n"+instructions;
      var details = encodeURIComponent("Group interview with " + company + "\nTitle: "+ jobTitle + instructions);
      
      //Dates
      var date = rowData[reverseLookup["Date"]].split(" ");if(date[0]==''){return "";}
      var year = date[2];
      var month = (parseMonth(date[1])+1).toDigits(2);
      var day = parseInt(date[0],10).toDigits(2);
      var start = rowData[reverseLookup["Start Time"]].split(" ");if(start[0]==''){return "";}
      var startTime = start[0].split(":");
      var isPM = start[1].toUpperCase() == "PM" && parseInt(startTime[0],10) != 12 || start[1].toUpperCase() == "AM" && parseInt(startTime[0],10) == 12 ? "PM" : "AM";       //Google has some issues.
      var sHour = (parseInt(startTime[0],10) + new Date().getTimezoneOffset()/60 + (isPM == "PM" ? 12 : 0))%24
      var sMin = parseInt(startTime[1],10);
      var end = rowData[reverseLookup["End Time"]].split(" ");if(end[0]==''){return "";}
      var endTime = end[0].split(":");
      isPM = end[1].toUpperCase() == "PM" && parseInt(endTime[0],10) != 12 || end[1].toUpperCase() == "AM" && parseInt(endTime[0],10) == 12 ? "PM" : "AM";       //Google has some issues.
      var eHour = (parseInt(endTime[0],10) + new Date().getTimezoneOffset()/60 + (isPM == "PM" ? 12 : 0))%24
      var eMin = parseInt(endTime[1],10);
      var dateStr = year + month + day + "T" + sHour.toDigits(2) + sMin.toDigits(2) + "00Z/" + year + month + day + "T" + eHour.toDigits(2) + eMin.toDigits(2) + "00Z";
      return '<a title="Google calendar may have the wrong date, please be aware of day light savings time!" href="http://www.google.com/calendar/event?action=TEMPLATE&text='+title+'&dates='+dateStr+'&details='+details+'&location='+location+'&trp=false&sprop=&sprop=name:" target="_blank"><img src="http://www.google.com/calendar/images/ext/gc_button6.gif" alt="0" border="0"></a>';
   },
}

/**
 *    Table filters: used to apply the filters before building
 */
var TABLEFILTERS = {
   normal : function(cell){
      return cell;
   },
   deleteRow : function(cell, row, rowData, reverseLookup){
      var element = cell.substring(1, cell.indexOf(" ")).toUpperCase();
      if (element == "A") {
         var start = cell.indexOf(" onclick=\"");
         var onclick = cell.substring(start + 10, cell.indexOf(";\"", start));            //Extract the onclick
         onclick = onclick.substring(onclick.indexOf("('")+2, onclick.lastIndexOf("')")); //Extract the argument
         return "<div class='delete noselect' action=\""+onclick.replace(/\$delete\$\d+/, "$delete$%")+"\"></div>";  //Replace number with '%' for the job queue
      } else if (element == "IMG") {
         return "<span class='delete noselect disabled'></span>";
      } else {
         return cell;
      }
   },
   jobDescription : function(cell, row, rowData, reverseLookup){
      var isFound = reverseLookup.hasOwnProperty("Job Identifier");
      var columnNumber;
      if (!isFound) {
         isFound = reverseLookup.hasOwnProperty("Job ID");
         if (!isFound) {
            return cell;
         } else {
            columnNumber = reverseLookup["Job ID"];
         }
      } else {
         columnNumber = reverseLookup["Job Identifier"];
      }
      var id = rowData[columnNumber];
      if (id.empty()){return cell;}
      var link = LINKS.JOB_DESCR + id;
      var end = cell.lastIndexOf("<");
      var jobDescription = cell.substring(cell.lastIndexOf("\">", end) + 2, end);
      return "<a target='_blank' class='PSHYPERLINK' href='"+link+"'>"+jobDescription+"</a>";
   },
   googleSearch : function(cell, row, rowData, reverseLookup){ 
      return "<a href='http://www.google.ca/#sclient=psy-ab&q="+cell.replace(/\s/g,"+")+"' title='Google search that company!' target='_blank' class='PSHYPERLINK'>"+cell+"</a>";
   },
   googleMap : function(cell, row, rowData, reverseLookup){ 
      var search;
      if (reverseLookup.hasOwnProperty("Employer Name")) {
         search = rowData[reverseLookup["Employer Name"]] + ",+" + cell;
      } else if (reverseLookup.hasOwnProperty("Employer")) {
         search = rowData[reverseLookup["Employer"]] + ",+" + cell;
      } else {
         search = cell;
      }
      return "<a href='http://maps.google.ca/maps?q="+(search.replace(/\s/g,"+"))+"' title='Google maps that company!' target='_blank' class='PSHYPERLINK'>"+cell+"</a>";
   },
   //Interviews
   interviewerSearch : function(cell, row, rowData, reverseLookup){ 
      var search = cell;
      if(reverseLookup.hasOwnProperty("Employer Name")){
         //Remove the company's corporate status when searching so more accurate results
         search += "+"+rowData[reverseLookup["Employer Name"]].removeWords(["Inc", "Ltd", "llc", "corp"]);     
      }
      return "<a href='http://www.linkedin.com/search/fpsearch?type=people&keywords="+search.replace(/\s/g,"+")+"' title='Linkedin this person' target='_blank' class='PSHYPERLINK'>"+cell+"</a>";
   },
   jobInterviews : function(cell, row, rowData, reverseLookup){ 
      if (!cell.empty()) {
         OBJECTS.STORAGE.setItem("INTERVIEWS_ID_" + cell, "1");
      }
      return cell;
   },
   //Applications
   //Next two are bad solutions, temporary
   fixApply : function(cell, row, rowData, reverseLookup){ 
      //If link
      if(cell.contains("<a")) {
         //invokeApplyPopup
         var lookup, jobId, text, title;
         if (reverseLookup.hasOwnProperty('Job Identifier')) {
            lookup = reverseLookup['Job Identifier'];
         } else if (reverseLookup.hasOwnProperty('Job ID')) {
            lookup = reverseLookup['Job ID'];
         } else {
            return "Job ID does not exist";
         }
         jobId = rowData[lookup],
         text = cell.getTextBetween(">", "<");
         title = (cell.contains("Edit Application")?"Edit":"Submit") + " Application";
         return '<span class="fakeLink" onclick="invokeApplyPopup(\'' + jobId + '\', \'' + title + '\');">' + text + '</span>';
      }
      return cell;
   },
}; 

/**
 *    Class declaration: call makeTable instead
 */
function JbmnplsTable (defaultName, tableID, objectToAppendTo) {
   //Objects
   this.instance = null;
   this.jInstance = null;
   
   //ID strings
   this.srcID;
   this.tableNum;
   this.cname = defaultName != null ? defaultName.underscorize() : null;
   this.id = defaultName != null ? "jbmnpls" + this.cname : null;
   this.tableID = defaultName != null ? this.id + "Table" : null;
   this.name = defaultName;
   this.rowCounterID = defaultName != null ? "jbmnpls_"+this.cname+"_TableCount" : null;

   //Booleans
   this.parsed = false;
   this.hasCheckboxes = false;
   this.hasBuilt = false;
   this.appliedSorting = false;
   this.draggable = false;
   
   //Data
   this.headers = [];
   this.data = [];
   this.html = null;
   this.hiddenHeaders = [];
   
   //Controls
   this.controls = {};
   this.pageControls = null;
   this.maxPages = -1;
   this.excel = "";
   this.viewAll = "";
   this.jobLength = 0;
   
   //Object Queues
   this.filters = {};
   this.columnQueue = {};
   
   //Getter for rows and columns
   this.__defineGetter__("rows", function(){
      return this.data.length;
   });
   this.__defineSetter__("rows", function(){
      Throw(MESSAGE.TABLES_NO_SET_ROW);
   });
   this.__defineGetter__("columns", function(){
      if (this.rows == 0) {      //If no rows then get the header's length
         return this.headers.length;
      }
      return this.data[0].length;
   });
   this.__defineSetter__("columns", function(){
      Throw(MESSAGE.TABLES_NO_SET_COL);
   });
   
   //Try to build the table if the rest of the arguments are present
   if (tableID != null && tableID != "") {
      if( this.parseTable(tableID) && objectToAppendTo != null ) {
         this.appendTo(objectToAppendTo);
      }
   }
   
   /**
    *    Event Handling
    */
   var obj = this;
   
   /**
    *   Click handler - wrap it to reduce memory
    */
   this.onClick = function(evt) {
      obj.clickHandler(evt);
      return obj;
   } 
   
   /**
    *    Update our table by sorting and checkboxes
    *       Usually if rows are added or removed
    */
   this.updateTable = function() {
      obj.updateCheckboxes();
      obj.updateSorting();
      HIGHLIGHT.apply(this.jInstance);
      return obj;
   }
   
   /**
    *    Updating Sorting
    */
   this.updateSorting = function() {
      if(!obj.empty() && obj.hasBuilt) { 
         obj.jInstance.trigger("update");
      }
      return obj;
   }

   /**
    *    Updates the checkboxes' ids in order of the row
    */
   this.updateCheckboxes = function() {
      if(!obj.empty() && obj.hasBuilt && obj.hasCheckboxes) {
         var checkboxes = $("#"+obj.tableID+" input.checkbox");
         var name = obj.cname;
         checkboxes.each(function(rowNum){
            this.id = "checkbox_"+name+"_"+rowNum;
         });
      }
      return obj;
   }
}

/**
 *    Handle clicks
 */
JbmnplsTable.prototype.clickHandler = function(evt) {
   if(this.empty() || !this.hasBuilt || evt == null) {
      return;
   }
   var tr = $(evt.target).parents("tr");     //Go up from wherever the node that was clicked till you reach a tr element
   var objID = tr.attr("id");
   var checked = false;
   //Toggle checkboxes
   var tagNameClicked = evt.target.tagName.toUpperCase();
   var validClick = tagNameClicked == "TD" || tagNameClicked == "INPUT";   
   if (this.hasCheckboxes && validClick) {
      var checkbox = tr.find("input.checkbox");
      if(checkbox.exists()) {
         checked = checkbox.is(":checked");
         if (tagNameClicked == "INPUT") {checked = !checked;}   //Glitch on inputfields becuase it would be clicked twice
         checkbox.attr("checked", !checked);
         checkbox.prev().text(checked ? 0 : 1);
         tr.toggleClass("selected");
         this.updateSorting();
      }
   }
   //Checked/clicked same row
   if (OBJECTS.HIGHLIGHT != null && tr == OBJECTS.HIGHLIGHT){
      alert("clicked same row")
      return;
   }
   //Remove the last highlight row and select the current one
   var lastTr = OBJECTS.HIGHLIGHT;
   if (lastTr != null) {  
      //Mulitple checkboxes
      if (this.hasCheckboxes && evt.shiftKey) {
         //Remove the highlighting when holding shift
         window.getSelection().removeAllRanges();
         //Get the bounds of checkboxes needed to be checked or unchecked
         var lastRow = lastTr.index();
         var thisRow = tr.index();
         for(var i = Math.min(lastRow, thisRow); i <= Math.max(lastRow, thisRow);i++) {
            checkbox = $("#checkbox_"+this.cname+"_"+i).attr("checked", !checked);
            var row = checkbox.parent().parent();
            if(!checked) {
               row.addClass("selected");
               checkbox.prev().text(1);
            } else {
               row.removeClass("selected");
               checkbox.prev().text(0);
            }
         }
         this.updateSorting();
      }
      lastTr.removeClass("lastClickedRow");
   }
   tr.addClass("lastClickedRow");
   OBJECTS.HIGHLIGHT = tr;
   return this;
} 

/**
 *    Parse and get all the information from a table
 */
JbmnplsTable.prototype.parseTable = function(_srcID) {
   //Check to see if table is there
   if(this.srcID == null && _srcID.empty()) {
      return this;
   }
   var isUpdatingInfo = this.parsed;
   var tableID = isUpdatingInfo ? this.srcID : _srcID;
   if (!UTIL.idExists(tableID) || UTIL.getID(tableID).tagName.toUpperCase() != "TABLE") {
      return this;
   }
   
   var splitID = tableID.substring(0, tableID.indexOf("$"));
   var table = $(UTIL.getID(tableID));
   
   //Updating the table's information or first time parsing the table?
   if(!isUpdatingInfo) {
      this.srcID = tableID;
      
      //Parse Name if doesnt already exist
      if (this.name == null) {
         var name = table.find("table.PSLEVEL1GRIDLABEL.PSLEFTCORNER td:eq(0)").html();
         if (name == null) { return false; }
         this.name = name;
      }
      
       //Meta Data for the table
      this.cname = this.name.underscorize();
      this.id = "jbmnpls" + this.cname;
      this.tableID = this.id + "Table";
      this.rowCounterID = "jbmnpls_"+this.cname+"_TableCount";
   }
   
   // Common parsing
   try{  //If we can find it
      this.excel = UTIL.getID(splitID + "$hexcel$0").getAttribute("href");
   }catch(e){
      Log(e);
      this.excel = "#";
   }

   // Get headers
   var tableRows = table.find("table.PSLEVEL1GRID tr");
   var listOfHeaderObjs = tableRows.eq(0).find("th.PSLEVEL1GRIDCOLUMNHDR");
   var headers = [];
   var filters = {};
   listOfHeaderObjs.each(function(a){
      var originalHeader = header = $(this).plainText();
      var counter = -1;
      do {
         counter++;
         header = originalHeader + "_" + counter;
      } while(headers.indexOf(header) > 0);
      header = originalHeader + "_" + counter;
      filters[header] = TABLEFILTERS.normal;
      headers.push(header);
   });
   this.headers = headers;
   if (!isUpdatingInfo) {
      this.filters = filters;
   }
   
   //Get the body cells information
   this.data = [];
   for(var r = 1; r < tableRows.length; r++) {     //Each Row
      var columns = tableRows.eq(r).find("td");
      var bodyData = [];
      var includeRow = false;
      columns.each(function(c){                    //Each Column in row
         //Check to see if a link is visible
         var obj = $(this);
         var link = obj.find("a");
         
         //Get the value of the cell
         var value = "";
         if (link.exists()) {
            value = link.outerHTML();
         } else {
            var img = obj.find("img");
            if (img.exists()) {
               value = img.outerHTML();
            } else { 
               var select = obj.find("select");
               if (select.exists()) {
                  value = select.outerHTML();
               } else {
                  value = obj.plainText();
               }
            }
         }
         if (value != "") {      //If one column at least has info, we record the row
            includeRow = true;
         }
         bodyData.push(value);
      });
      if (includeRow) {
         this.data.push(bodyData);
      }
   }
   
   //Parse the page controls
   var rightPanel = table.find("table:eq(0) table.PSRIGHTCORNER td").children();
   var pageStrBuffer = "";
   if (rightPanel.length >= 5 && rightPanel.last().plainText() == "Last") {  //Has the first,last, and page number controls; 5 button page controls
      var last = rightPanel.last();
      var first = rightPanel.eq(-5);
      //Make sure we can go to different pages; one of them cannot be a span
      if (first.tag() != "SPAN" || last.tag() != "SPAN") {
         var href;
         var progress = rightPanel.eq(-3).plainText().split(" of ");
         var controls = {
                           "First"  : first, 
                           "&lt;--"   : rightPanel.eq(-4), 
                           "page"   : progress, 
                           "--&gt;"   : rightPanel.eq(-2), 
                           "Last"   : last,
                        };
         for(var name in controls) {
            var item = controls[name];
            if (name == "page") {  //Progress pages
               Assert(item[0].contains("-"), "Parsing page controls is broken");
               var endRangeNum = parseInt(item[0].split("-")[1]);
               var totalPages;
               var currentPage;
               this.jobLength = parseInt(item[1]);
               if (endRangeNum == item[1]) {    //Last page
                  currentPage = totalPages = this.maxPages;
               } else {
                  var difference = this.rows;
                  var totalPages = this.maxPages = Math.ceil(parseInt(item[1]) / difference);
                  var currentPage = Math.ceil(endRangeNum / difference);
               }
               pageStrBuffer += " <span title='Current page/total pages'>" + currentPage + "/" + totalPages + "</span>";
            } else if (item.tag() == "A") {
               href = item.attr("href");
               href = href.substr(href.indexOf("submitA"));
               pageStrBuffer += ' <span class="fakeLink'+(name.contains("--")?' bold':'')+'" onclick="document.getElementById(\''+this.id+'\').className=\'jbmnplsTable loading\';'+href+'"">'+name+'</span>';
            } else {
               pageStrBuffer += " <span class='disabled fakeLink'>" + name + "</span>";
            }
         }
         this.pageControls = pageStrBuffer;
      } else {
         this.pageControls = null;
      }
      //View All/25
      var viewAll = rightPanel.eq(-8);
      var text = viewAll.plainText();
      if (viewAll.tag() == "A" && (text == "View All" || text == "View 100" || text == "View 25")) {
         var link = viewAll.attr("href");
         this.viewAll = '<span class="fakeLink" onclick="document.getElementById(\''+this.id+'\').className=\'jbmnplsTable loading\';'+link.substr(link.indexOf(":")+1)+'">'+text+' jobs/page</span>';
      }
   }/* else {}    Only displays page numbers, so useless*/
   
   //Cleanup
   columns = null
   table = null;
   listOfHeaderObjs = null;
   headers = null;
   bodyData = null;
   this.parsed = true;
   return this;
};

/**
 *    Insert custom data into a table
 */
JbmnplsTable.prototype.insertData = function(headerList, dataList) {
   Assert(headerList != null && UTIL.isArray(headerList) && dataList != null && UTIL.isArray(dataList), "Inserting data failed, use arrays for headers and data!");
   var newColumnLength = headerList.length;
   if( newColumnLength > 0 ){
      var filters = [];
      for(var c=0; c<newColumnLength; c++) {
         filters[headerList[c]] = TABLEFILTERS.normal;
      }
      var data = [];
      for(var r=0; r<dataList.length;r++) {
         var item = dataList[r];
         Assert(UTIL.isArray(item) && item.length == newColumnLength, "Inserting data failed, failed to input the correct columns per data entry.");
         data.push(item);
      }
      this.parsed = true;
      this.data = data;
      this.filters = filters;
      this.headers = headerList;
   }
   return this;
}

/**
 *    Tells functions if we can manipulate the table
 *       1. Make sure table is parsed  2. Make sure there is columns
 */
JbmnplsTable.prototype.empty = function() {
   return !this.parsed || this.columns == 0;
};

/**
 *    Change a header's name
 */
JbmnplsTable.prototype.setHeaderAt = function(index, newName) {
   if (this.empty() || newName == null || newName == "" || !UTIL.isNumeric(index)) {
      return false;
   }
   Assert(UTIL.inRange(index, this.columns-1), MESSAGE.ARRAY_OUT_OF_BOUNDS);
   //Hold old info and apply the new ones to the header and the filter
   var oldHeader = this.headers[index];
   var originalHeader = newName;
   var counter = -1;
   do {
      counter++;
      newName = originalHeader + "_" + counter;
   } while(this.headers.indexOf(newName) > 0);
   newName = originalHeader + "_" + counter;
   
   //No need to update header
   if (oldHeader == newName) {
      return this;
   }
   var oldFilter = this.filters[oldHeader];
   this.headers[index] = newName;
   delete this.filters[oldHeader];
   this.filters[newName] = oldFilter;
   return this;
}

/**
 *    Inserts a column
 *       Option 1: headerName = [String:header text]; index_OR_filterFunction = DATA or index to insert column; dataArray_OR_filterFunction = DATA
 *       Option 2: headerName = [String:header text]; index_OR_filterFunction = DATA     
 *       - DATA = [Array:list of values in that column|Function:a function that returns a value, passes the rowArray then the rowNumber as the arguments]
 *       - Option 2 appends the column to the end
 */
JbmnplsTable.prototype.insertColumn = function(headerName, index_OR_filterFunction, dataArray_OR_filterFunction) {
   //Last one is if we have the header name already
   if (this.empty() || index_OR_filterFunction == null || headerName == null || headerName == "" || this.filters.hasOwnProperty(headerName)) {   
      return false;
   }
  
   //Parse the inputs
   var index, data;
   //If inputted an array or function, then append the data
   if (UTIL.isNumeric(index_OR_filterFunction)) {
      Assert(UTIL.inRange(index_OR_filterFunction, this.columns-1), MESSAGE.ARRAY_OUT_OF_BOUNDS);
      index = index_OR_filterFunction;
      data = dataArray_OR_filterFunction;
   } else {
      index = this.columns;
      data = index_OR_filterFunction;
   }
   if (data == null) {
      return false;
   }
   //Add the column now
   var originalHeader = headerName;
   var counter = -1;
   do {
      counter++;
      headerName = originalHeader + "_" + counter;
   } while(this.headers.indexOf(headerName) > 0);
   headerName = originalHeader + "_" + counter;
   this.columnQueue[headerName] = {type: "insert", index: index, filter: data};
   this.internalInsertColumn(headerName, index, data);
   data = null;
   return this;
};

/** 
 *    Insert Column, really should run within the class and not an external call
 *    INTERNAL
 */
JbmnplsTable.prototype.internalInsertColumn = function(headerName, index, data) {
   var dataIsArray;
   if (UTIL.isArray(data) && data.length > 0) {
      dataIsArray = true;
   } else if(UTIL.isFunction(data)) {
      dataIsArray = false;
   } else {
      return false;
   }
   var reverseLookup = {};
   for(var i=0; i<this.columns; i++) {
      var visibleHeader = this.headers[i].substring(0, this.headers[i].lastIndexOf("_"));
      reverseLookup[visibleHeader] = i;
   }
   this.headers.splice(index, 0, headerName);
   this.filters[headerName] = TABLEFILTERS.normal;
   for(var r = 0; r < this.rows; r++) {
      var cellData = "";
      if (dataIsArray) {
         if (r < data.length) {
            cellData = data[r];
         }
      } else {
         cellData = data.call(this, r, this.data[r], reverseLookup);
      }
      this.data[r].splice(index, 0, cellData);
   }
   return this;
}

/**
 *    Merge two columns together
 *       intoIndex = [header stays!] any index that the new info goes to (does not have to be smaller than fromIndex)
 *       fromIndex = [header is deleted!] any index that the information is retrieved
 *       headerName (optional) = name of the new merged column; if null, then takes original name
 *       filterFunction (optional) = a function that reads in (intoCell, fromCell, rowNumber) and you return the value placed in the merged cell
 */
JbmnplsTable.prototype.merge = function(intoIndex, fromIndex, headerName, filterFunction) {
   if (this.empty() || intoIndex == null || fromIndex == null) {
      return false;
   }
   var columns = this.columns;
   Assert(UTIL.inRange(intoIndex, columns-1) && UTIL.inRange(intoIndex, columns-1), MESSAGE.ARRAY_OUT_OF_BOUNDS);
   this.columnQueue[this.headers[intoIndex]] = { type: "merge", into: intoIndex, from: fromIndex, name: headerName, filter: filterFunction};
   this.internalMerge(intoIndex, fromIndex, headerName, filterFunction);
   return this;
}
/**
 *    Merge two columns together, only call within the class
 *    INTERNAL
 */
JbmnplsTable.prototype.internalMerge = function(intoIndex, fromIndex, headerName, filterFunction) {
   if (filterFunction == null || !UTIL.isFunction(filterFunction)) {
      filterFunction = function(a, b){
         return a + " | " + b;
      }
   }
   //Delete the filters
   delete this.filters[this.headers[fromIndex]];
   //Set new header
   if (headerName != null && headerName.length > 0){
      this.headers[intoIndex] = headerName;
      delete this.filters[this.headers[intoIndex]];
      this.filters[headerName] = TABLEFILTERS.normal;
   };
   this.headers.splice(fromIndex, 1);
   for(var r = 0; r < this.rows; r++) {
      //Merge 2 cells per row
      var rowData = this.data[r];
      var a = rowData[intoIndex];
      var b = rowData[fromIndex];
      var value = filterFunction.call(this, a, b, r);
      value = value == " | " ? "" : value;
      this.data[r][intoIndex] = value;
      
      //Remove the old column
      this.data[r].splice(fromIndex, 1);
   }
   rowData = null;
   filterFunction = null;
   return this;
}

/**
 *    Deletes a column
 */
JbmnplsTable.prototype.deleteColumn = function(index) {
   if (this.empty() || index == null) {
      return false;
   }
   Assert(index >= 0 && index < this.columns, MESSAGE.ARRAY_OUT_OF_BOUNDS);
   var headerName = this.headers[index];
   delete this.columnQueue[headerName];
   delete this.filters[headerName];
   this.headers.splice(index, 1);
   for(var r = 0; r < this.rows; r++) {
      this.data[r].splice(index, 1);
   }
   return this;
};

/**
 *    Hides an array of columns
 */
JbmnplsTable.prototype.hideColumns = function(list) {
   if (this.empty() || !this.hasBuilt || list == null || !UTIL.isArray(list)) {
      return this;
   }   
   for(var i=0; i<list.length; i++) {
      this.jInstance.addClass("hideColumn"+list[i]);
      this.hiddenHeaders[list[i]] = true;
   }
   return this;
}

/**
 *    Shows all columns
 */
JbmnplsTable.prototype.showAllColumns = function() {
   if (this.empty() || !this.hasBuilt) {
      return this;
   }
   this.instance.className = "tablesorter";
   this.hiddenHeaders = [];
   return this;
}

/**
 *    Shows an array of columns
 */
JbmnplsTable.prototype.showColumns = function(list) {
   if (this.empty() || !this.hasBuilt || list == null || !UTIL.isArray(list)) {
      return this;
   }
   for(var i=0; i<list.length; i++) {
      this.jInstance.removeClass("hideColumn"+list[i]);
      this.hiddenHeaders[list[i]] = false;
   }
   return this;
}

/**
 *    Sees if a header is shown and not hiding
 */
JbmnplsTable.prototype.isColumnShown = function(index) {
   if (this.empty() || !this.hasBuilt) {
      return this;
   }
   Assert(index >= 0 && index < this.columns, MESSAGE.ARRAY_OUT_OF_BOUNDS);
   return this.hiddenHeaders[index] == null || this.hiddenHeaders[index] === false;
}

/**
 *    Sees if a header is shown and not hiding
 */
JbmnplsTable.prototype.getColumnsHidden = function() {
   if (this.empty() || !this.hasBuilt) {
      return this;
   } 
   var val = [];
   for(var i=0; i<this.columns; i++) {
      if(!this.isColumnShown(i)) {
         val.push(i);
      }
   }
   return val;
}

/**
 *    Deletes a range of columns
 *       Option 1: table.deleteColumnRange([0,1,3,5]);   <--- deletes these columns
 *       Option 2: table.deleteColumnRange(0, 4);        <--- deletes columns from 0->4
 */
JbmnplsTable.prototype.deleteColumnRange = function(startIndex_deleteArr, endIndex) {
   if (this.empty() || startIndex_deleteArr == null || endIndex == null) {
      return false;
   }
   if (UTIL.isArray(startIndex_deleteArr)) { //If one input: array of indexes
      var toDelete = startIndex_deleteArr.sort();
      for (var i = toDelete.length -1; i >= 0; i++) { 
         var index = toDelete[i];
         this.deleteColumn(index);
      }
   } else {    //If two inputs: start and end
      var startIndex = startIndex_deleteArr;
      Assert(startIndex <= endIndex, MESSAGE.INDEX_RANGE_INCORRECT);
      Assert(startIndex >= 0 && endIndex < this.columns, MESSAGE.ARRAY_OUT_OF_BOUNDS);
      var amountToDelete = endIndex - startIndex + 1;
      
      //Delete filters
      for(var i = startIndex; i < amountToDelete; i++) {
         delete this.filters[this.headers[i]];
      }
      
      //Delete rows
      this.headers.splice(startIndex, amountToDelete);
      for(var r = 0; r < this.rows; r++) {
         this.data[r].splice(startIndex, amountToDelete);
      }
   }
   return this;
};

/**
 *    Deletes a column, it will update on default
 */
JbmnplsTable.prototype.deleteRow = function(index, dontUpdate) {
   if (this.empty() || index == null) {
      return false;
   }
   Assert(index >= 0 && index < this.rows, MESSAGE.ARRAY_OUT_OF_BOUNDS);
   if(dontUpdate == null) {dontUpdate = false;}
   //Remove from html
   if (this.hasBuilt) {  
      var TRs = this.jInstance.find("tbody tr");
      var name = this.cname;
      $("#"+this.rowCounterID).text(TRs.length-1);    //Update the amount of rows in table
      //Renumber rows
      TRs.each(function(){
         var obj = $(this);
         var row = parseInt(obj.attr("row"));
         if(row > index) {             //Update the row number
            obj.attr("row", row-1);
            obj.attr("id", "row_"+name+"_"+(row-1))
         } else if(row == index) {     //Remove the row
            if (obj.hasClass("lastClickedRow")) {
               OBJECTS.HIGHLIGHT = null;
            }
            obj.remove();
         }
      });
      if (!dontUpdate) {
         this.updateTable();
      }
   }
   this.data.splice(index, 1);
   return this;
};

/**
 *    Deletes a range of row, feed in an array
 *       table.deleteRowRange([0,1,3,5]);   <--- deletes these rows
 */
JbmnplsTable.prototype.deleteRowRange = function(deleteList) {
   if (this.empty() || deleteList == null || !UTIL.isArray(deleteList) || deleteList.empty()) {
      return this;
   }
   //Sort with the largest first
   deleteList.sort(function(a,b){return b-a;});     
  
   //Make a lookup table and remove data from array
   var orderedList = [];
   var totalRows = this.rows;
   for(var i=0; i < deleteList.length ; i++) {
      var index = parseInt(deleteList[i]);
      orderedList[deleteList.length-i-1] = index;
      this.data.splice(index, 1);
   }
   //Delete rows from the table
   if(this.hasBuilt) {
      //Get the lowest and highest value
      var low = deleteList[deleteList.length-1];
      //Cycle through the row id's
      var offset = 0;
      for(var r=0; r < totalRows; r++) {
         var rowObj = $("#row_"+this.cname+"_"+r);
         var row = parseInt(rowObj.attr("row"));
         
         //Delete this row
         if (row == orderedList[offset]) {
            if (rowObj.hasClass("lastClickedRow")) {
               OBJECTS.HIGHLIGHT = null;
            }
            rowObj.remove();
            offset++;
         } else if(row > low) {
            //Reduce the row id and number
            var newNumber = row - offset;
            rowObj.attr("row", newNumber);
            rowObj.attr("id", "row_"+this.cname+"_"+newNumber);
         }
      }
      $("#"+this.rowCounterID).text(this.rows);
      this.updateTable();
   }
   return this;
};

/**
 *   Deletes all columns that have empty body cells even if there is a header
 */
JbmnplsTable.prototype.trim = function() {
   if (this.empty()) {
      return false;
   }
   for (var c = this.columns-1; c >= 0; c--) {
      var cellIsEmpty = true;
      for(var r = 0; r < this.rows && cellIsEmpty; r++) {
         cellIsEmpty = this.data[r][c].empty();
      }
      //The entire column is empty
      if (cellIsEmpty) {
         this.deleteColumn(c);
      }
   }
   return this;
};

/**
 *    Apply a filter so it filters columns when it builds
 */
JbmnplsTable.prototype.applyFilter = function(columnInput, filterFunction, index) {
   if (this.empty() || columnInput == null || !UTIL.isFunction(filterFunction)) {
      return false;
   }
   if(UTIL.isNumeric(columnInput)) {
      //We inputted a Number
      Assert(UTIL.inRange(columnInput, this.columns-1), MESSAGE.ARRAY_OUT_OF_BOUNDS);
      var header = this.headers[columnInput];
      this.filters[header] = filterFunction;
      return this;
   }
   columnInput += "_" + (index?index:"0");
   if (this.filters.hasOwnProperty(columnInput)) {
      //We inputted a header
      this.filters[columnInput] = filterFunction;
   }
   return this;
}

/**
 *    Removes a filter for a column
 */
JbmnplsTable.prototype.removeFilter = function(columnInput, index) {
   if (this.empty() || columnInput == null) {
      return false;
   }
   if(UTIL.isNumeric(columnInput)) {
      //We inputted a Number
      Assert(UTIL.inRange(columnInput, this.columns-1), MESSAGE.ARRAY_OUT_OF_BOUNDS);
      var header = this.headers[columnInput];
      this.filters[header] = TABLEFILTERS.normal;
      return this;
   }
   columnInput += "_" + (index?index:"0");
   if (this.filters.hasOwnProperty(columnInput)) {
      //We inputted a header
      this.filters[columnInput] = TABLEFILTERS.normal;
   } 
   return this;
}

/**
 *    Add checkboxes to a column and enables them to be handled by this class
 */
JbmnplsTable.prototype.addCheckboxes = function(columnNumber) {
   if(!this.empty() && !this.filters.hasOwnProperty("{CHECKBOXES}")) {      //Prevent mulitple checkboxes columns
      if(columnNumber == null) {columnNumber = 0;}
      this.hasCheckboxes = true;
      this.insertColumn("{CHECKBOXES}", columnNumber, function(row, rowData){
         return "<span class='hide'>0</span><input id='checkbox_"+this.cname+"_"+row+"' type='checkbox' class='checkbox'/>";
     });
  }
  return this;
}

/**
 *    Add a custom button (link or an onclick event) in the controls section to do stuff
 */
JbmnplsTable.prototype.addControlButton = function(name, onclick_OR_location) {
   if(this.empty() || name == null || name == "") {
      return this;
   }
   if(UTIL.isFunction(onclick_OR_location)) {      //If function, if not it is a link
      BRIDGE.registerFunction("controlButton_"+name.replace(/\W/gm,"_"), onclick_OR_location);
   }
   this.controls[name] = onclick_OR_location;
   return this;
}

/**
 *    Remove the custom button in the controls section
 */
JbmnplsTable.prototype.removeControlButton = function(name) {
   if(this.empty() || name == null || name == "" || !this.controls.hasOwnProperty(name)) {
      return this;
   }
   var value = this.controls[name];
   if(UTIL.isFunction(value)) {     //If function, if not it is a link
      BRIDGE.unregisterFunction("controlButton_"+name);
   }
   delete this.controls[name];
   return this;
}

/**
 *    Builds the table into html and returns it
 */
JbmnplsTable.prototype.buildControls = function() {
   var returnStr = '';
   if (PAGEINFO.TYPE != PAGES.HOME) {
      returnStr +=  '<span onclick="handleCustomize('+(this.tableNum)+')" class="options fakeLink">Customize</span>';
   }
   if (!this.excel.empty()) {
      returnStr +=  ' | <a class="options" onclick="showMessage(\'Please wait, retrieving download...\');" href="'+this.excel+'">Export</a>';
   }
   for(var name in this.controls) {
      //Function
      var value = this.controls[name];
      if(UTIL.isFunction(value)) {     
         returnStr += " | <span class='options fakeLink' onclick='controlButton_"+name.replace(/\W/gm,"_")+"();'>"+name+"</span>";
      } else {
      //A link
         returnStr += " | <a class='options' target='_blank' href='"+value+"'>"+name+"</a>";
      }
   }
   if(!this.viewAll.empty()) {
      returnStr += " | " + this.viewAll;
   }
   if (this.pageControls != null) {
     returnStr += " |" + this.pageControls;
   }
   //Removes the "| " because "customize" doesnt apply to any homepage tables
   if (PAGEINFO.TYPE == PAGES.HOME) {returnStr = returnStr.substr(2);}
   return returnStr;
}

/**
 *    Builds the table into html and returns it
 */
JbmnplsTable.prototype.build = function() {
   if (this.empty()) {
      return null;
   }
   this.tableNum = $("div.jbmnplsTable").length;
   
   var html =  "<div id='"+this.id+"' class='jbmnplsTable'><div class='jbmnplsTableHeader noselect'><div class='jbmnplsTableName'>" + this.name + (this.rows==0?"":" (<span id='"+this.rowCounterID+"'>"+this.rows+"</span> Rows)");
   html +=     '</div><div class="jbmnplsTableControls">';
   
   //Build the controls
   var controlsHTML = this.buildControls();
   html += controlsHTML;
   html +=     "</div></div><div class='jbmnplsTableBody'><div class='jbmnplsTableLoadOverlay'></div><table name='"+this.name+"' class='tablesorter' id='"+this.tableID+"' cellspacing=0 cellpadding=0 width='100%' height='auto'>";
   //Parse Header
   html +=     "<thead><tr row='header' class='noselect'>";
   var inverseHeaderLookup = {};
   for (var h = 0; h < this.columns; h++) {
      if (h < this.headers.length) {
         var header = this.headers[h];
         var end = header.lastIndexOf("_");
         header = header.substring(0, end);
         inverseHeaderLookup[header] = h;
         if (header.charAt(0) == "{" && header.charAt(header.length-1) == "}") {
            header = "";
         }
         html +=  "<th col='" + h + "'>" + header + "</th>";
      } else {
         html +=  "<th></th>";
      }
   }
   html +=     "</tr></thead><tbody>";
   
   //Each row
   for(var r = 0; r < this.data.length; r++) {
      html += "<tr id='row_"+this.cname+"_"+r+"' row='" + r + "'>";
      var rowData = this.data[r];
      for (var c = 0; c < this.columns; c++) {
         var header = this.headers[c];
         var cellData = this.filters[header].call(this, rowData[c], r, rowData, inverseHeaderLookup);
         html += "<td col='" + c + "'>" + cellData + "</td>";
      }
      html += "</tr>";
   }
   html +=     "</tbody></table></div><div class='jbmnplsTableFooter noselect'><div class='jbmnplsTableControls'>" + controlsHTML;
   //Parse the controls for the bottom
   html +=     "</div></div>";
   this.html = html;
   this.hasBuilt = true;
   html = null;
   return this.html;
};

/**
 *    Builds the table into html and returns it
 */
JbmnplsTable.prototype.updateCells = function() {
   if(this.empty() || !this.hasBuilt || this.jInstance == null) {
      return false;
   }
   //Add all the extra columns from columnQueue
   for (var headerName in this.columnQueue) {
      var action = this.columnQueue[headerName];
      var filter = action.filter;
      switch(action.type) {
         case "insert":
            this.internalInsertColumn(headerName, action.index, filter);
            break;
         case "merge":
            this.internalMerge(action.into, action.from, action.name, filter);
            break;
         default:
            Throw("No such action to insert columns: " + action.type);
            break;
      }
   }
   //Some variables
   var table = this.jInstance;
   var originalHeaders = table.find("th");
   var originalRows = table.find("tbody tr");
   var columns = this.columns;
   var rows = this.rows;
   var inverseHeaderLookup = {};
   //Columns: Insert/Remove new columns and write their new headers
   for(var i=0; i<Math.max(columns, originalHeaders.length); i++) {
      if(i >= originalHeaders.length) {   //Start Adding
         var headerName = this.headers[i];
         headerName = headerName.charAt(0) == "{" && headerName.charAt(headerName.length-1) == "}" ? "" : headerName;
         var displayHeader = headerName.substring(0, headerName.lastIndexOf('_'));
         originalHeaders.parent().append("<th col='"+i+"'>"+displayHeader+"</th>");
      } else if(i >= columns) {           //Start removing
            originalHeaders.eq(i).remove();   
      } else {                            //Write the new header
         var headerName = this.headers[i];
         headerName = headerName.charAt(0) == "{" && headerName.charAt(headerName.length-1) == "}" ? "" : headerName;
         var displayHeader = headerName.substring(0, headerName.lastIndexOf('_'));
         inverseHeaderLookup[displayHeader] = i;
         originalHeaders.eq(i).attr("col", i).text(displayHeader);
      }
   }
   //Rows: Insert/Remove new rows and write their cell data
   for(var i=0; i<Math.max(rows, originalRows.length); i++) {
      if(i >= rows) {           //Start removing
         originalRows.eq(i).remove();
      } else {
         if(i >= originalRows.length) {   //Start Adding a new row
            var tbody = originalRows.exists() ? originalRows.parent() : table.find("tbody");
            tbody.append("<tr id='row_"+this.cname+"_"+i+"' row='"+i+"'></tr>");
         } else {
            originalRows.eq(i).attr("id", "row_"+this.cname+"_"+i).attr("row", i).children().remove();
         }
         var row = $("#row_"+this.cname+"_"+i);
         for(var j=0; j<columns; j++) {
            var headerName = this.headers[j];
            var rowData = this.data[i];
            var cellData = this.filters[headerName].call(this, rowData[j], i, rowData, inverseHeaderLookup);
            row.append("<td col='"+j+"'>"+cellData+"</td>");
         }
      }
   }
   
   //Update controls
   $("#"+this.id).find("div.jbmnplsTableControls").html(this.buildControls());
   
   //Finally Update the table
   $("#"+this.rowCounterID).text(this.rows);
   this.applyTableSorter();
   this.updateTable();
   this.jInstance.find("th").attr("class", "header");
   return this;
}

/**
 *    Appends the table to an element and makes it table-sortable, returns the jquery object of the table
 */
JbmnplsTable.prototype.appendTo = function(obj) {
   if (this.empty() || obj == null || this.jInstance != null) {
      return null;
   }
   if(!UTIL.isjQuery(obj)) {
      obj = $(obj);
   }
   //Build if not yet have
   if (!this.hasBuilt) {
      this.build();
   }
   obj.append(this.html);
   this.instance = UTIL.getID(this.tableID);
   this.jInstance = $("#" + this.tableID);
   if (this.rows > 1) {
      this.applyTableSorter();
      HIGHLIGHT.apply(this.jInstance);
   }
   
   //Load and turn off some headers
   var index = this.tableNum;
   var hiddenHeadersList = PREF.load("HIDDEN_HEADERS", index);
   if(UTIL.isNumeric(hiddenHeadersList)) {     //1 hidden column
      this.hideColumns([hiddenHeadersList]);
   } else if(!UTIL.isArray(hiddenHeadersList)) {
      this.hideColumns(hiddenHeadersList.split(","));
   }
   return this;
}

/**
 *    Appends the table to an element and makes it table-sortable, returns the jquery object of the table
 */
JbmnplsTable.prototype.applyTableSorter = function() {
   if (this.appliedSorting || this.empty() || this.jInstance == null || !this.hasBuilt) {
      return;
   }
   switch(PAGEINFO.TYPE) {
	  case PAGES.SEARCH:
         this.jInstance.tablesorter({
		 headers : {
               8:{sorter : "plainText"},
               11:{sorter : "date"}
            }
         });
		 break;
      case PAGES.LIST: 
         this.jInstance.tablesorter({
            headers : {
               6:{sorter : "plainText"},
               7:{sorter : "date"}
            }
         });
         break;
      case PAGES.APPLICATIONS:
         this.jInstance.tablesorter({
            headers : {
               5:{sorter : "plainText"},
               6:{sorter : "plainText"},
               8:{sorter : "date"}
            }
         });
         break;
      default:
         this.jInstance.tablesorter();
         break;
   }
   //Append events
   this.jInstance.unbind("sortEnd").bind("sortEnd", this.updateCheckboxes);
   this.jInstance.find("tbody tr").die("click").live("click", this.onClick);
   this.appliedSorting = true;
   return this;
}

/**
 *    Updates the entire table, must be built first!
 */
JbmnplsTable.prototype.update = function() {
   this.parseTable();
   this.updateCells();
   return this;
}

/**
 *    Make the table draggable!
 */
JbmnplsTable.prototype.makeDraggrable = function(shouldAllow) {
   if(this.empty() || this.jInstance == null || !this.hasBuilt) { 
      return this;
   }
   if (shouldAllow == null) {shouldAllow = true;}
   var wrapper = $("#"+this.id);
   var header = wrapper.find("div.jbmnplsTableHeader:eq(0)");
   if (shouldAllow) {
      wrapper.addClass("draggable");
      header.addClass("draggable-region")
   } else {
      wrapper.removeClass("draggable");
      header.removeClass("draggable-region")
   }
   this.draggable = shouldAllow;
   return this;
}

/**
 *    Shows/removes the loading screen
 */
JbmnplsTable.prototype.setLoading = function(shouldShow) {
   if(shouldShow==null){shouldShow=true;}
   if (shouldShow) {
      $("#"+this.id).addClass("loading");
   } else {
      $("#"+this.id).removeClass("loading");
   }
   return this;
}

}