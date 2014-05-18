/*================================*\
|*          __DEBUGGING__         *|
\*================================*/
{/*Expand to see debugging information*/
//Error messages
var MESSAGE = {
   ARRAY_OUT_OF_BOUNDS  : "The index(es) are out of bounds of the array.",
   INVALID_ARGUMENTS    : "There is an invalid number of arguments.",
   INDEX_RANGE_INCORRECT: "The start index cannot be larger than the end index (startIndex <= endIndex is acceptable).",
   TABLES_NO_SET_ROW    : "Cannot set table rows, use deleteRow() / insertRow() instead.",
   TABLES_NO_SET_COL    : "Cannot set table columns, use deleteColumn() / insertColumn() instead.",
   JOBID_INVALID        : "jobID inputted is not valid.",
   UNHIDE_COLUMNS       : "Please unhide all columns in Jobmine for this to work.",
   UNHIDE_COLUMNS_PAGE  : "Please unhide columns in Jobmine for features on this page to work.",
};
//Log into firebug
function Log() {
   if(arguments.length == 0) {return;}
   console.log("JbmnPls Log: ",arguments);
   $("#jbmnplsDebugAssertOutput").text(arguments);
}
//Throw an error
function Throw(message) {
   throw new Error("Error: "+message);
   $("#jbmnplsDebugAssertOutput").text("Error: "+message);
}
//Assert a condition
function Assert(condition, message) {
   if (!condition) {
      throw new Error("Assert Error: "+ message);
   }
}
var DEBUGGER = {
   isAttached     : false,
   storageTable   : null,
   refresh  :function(){
      if (!this.isAttached) {
         return;
      }
      var data = [];
      var o = OBJECTS.STORAGE.length;     //Glitch in FF, need to explicitly get length for it to update
      for(var key in OBJECTS.STORAGE) {
         data.push([key, OBJECTS.STORAGE[key]]);
      }
      this.storageTable.insertData(["Key", "Data"], data).updateCells();
   },
   init : function(){
      //RUN ONCE: Don't need to attach if already attached
      if(UTIL.getID("jbmnplsDebuggerBtn") != null) {return;}
      DEBUGGER.isAttached = true;
      //Add a new nav item
      $("#jbmnplsNav ul:eq(0)").append("<li><span id='jbmnplsDebuggerBtn' class='fakeLink'>Debugger OFF</span></li>");
      
      //Append some css
      var debugCSS = {
         "body.debugon #jbmnplsLocal_Storage" : {
            "display"   :  "block",
         },
         "#jbmnplsLocal_Storage" : {
            "position"  :  "fixed",
            "opacity"   :  "0.1",
            "-moz-transition-property"   :  "opacity",
            "-moz-transition-duration"   :  "0.5s",
            "-webkit-transition-property"   :  "opacity",
            "-webkit-transition-duration"   :  "0.5s",
            "top"       :  "30%",
            "left"      :  "20%",
            "display"   :  "none",
            "min-width" :  "500px",
            "width"     :  "500px",
         },
         "#jbmnplsLocal_Storage:hover" : {
            "opacity"   :  "1",
         },
         '#jbmnplsLocal_Storage table td' : {
            'width'    :  '100%',
         },
         "#jbmnplsLocal_Storage.draggable-move" : {
            "opacity"   :  "1 !important",
         },
         "#jbmnplsLocal_Storage thead, #jbmnplsLocal_Storage tbody" : {
            'display'     :  'block',
         },
         '#jbmnplsLocal_Storage thead' : {
            'height'    :  '30px',
         },
         '#jbmnplsLocal_Storage thead th[col="0"]' : {
            'width'     :  '113px',
         },
         '#jbmnplsLocal_Storage thead th[col="1"]' : {
            'width'     :  '218px',
         },
         '#jbmnplsLocal_Storage thead th[col="2"]' : {
            'width'     :  '79px',
         },
         '#jbmnplsLocal_Storage tbody' : {
            'overflow'  :  'auto',
            'max-height':  '480px',
            'width'     :  '500px',
         },
      };
      appendCSS(debugCSS);
      var table = this.storageTable = makeTable("Local Storage");
      table.insertData(["Blank"], [[""]])
               .addCheckboxes()
               .addControlButton("Refresh", function(){DEBUGGER.refresh();})
               .addControlButton("Clear", function(){PREF.clear();DEBUGGER.refresh();})
               .addControlButton("Delete Selected", function(){
                  //Get all the rows to delete
                  var listToDelete = [];
                  $("#"+table.tableID+" input.checkbox:checked").each(function(r){
                     listToDelete.push(this.parentNode.parentNode.getAttribute("row"));
                  });
                  if(listToDelete.empty()) {return;}
                  if(!confirm("Would you like to delete these rows?\nThere are "+listToDelete.length+" rows to delete.")) {
                     return;
                  }
                  listToDelete.sort(function(a,b){return b-a;});     
                  //Remove the data from storage
                  for (var i=0;i<listToDelete.length;i++) {
                     var tr = $("#row_"+table.cname+"_"+listToDelete[i]);
                     if (tr.exists()) {
                        var key = tr.children(":eq(1)").text();
                        OBJECTS.STORAGE.removeItem(key);
                     }
                  }
                  table.deleteRowRange(listToDelete);
               })
               .appendTo($(document.body))
               .makeDraggrable();
      this.refresh();
      
      //Events for the debugger button
      $("#jbmnplsDebuggerBtn").bind("click", function(){
         DEBUGGER.refresh();
         var body = $(document.body);
         var obj = $(this);
         if (obj.hasClass("on")) {
            body.removeClass("debugon");
            obj.removeClass("on").text("Debugger OFF");
         } else {
            body.addClass("debugon");
            obj.addClass("on").text("Debugger ON");
         }
      });
   },
};
}