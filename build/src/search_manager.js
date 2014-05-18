/*================================*\
|*       __SEARCH_MANAGER__       *|
\*================================*/
/**
 *    Implementation
 *       SearchManager.updateLastVisit();       //Checks to see if 30 days have passed, if it has, then it deletes all ids; runs everytime you go to search
 *       SearchManager.hasRead(jobId);          //Returns boolean true if user has read the job id; if the id exists in storage
 *       SearchManager.setRead(jobId);          //Sets the id as read in storage
 *       SearchManager.setNew(jobId);           //Removes the id in storage so the job has not been read
 *       SearchManager.clearAll();              //Removes all the ids from storage so nothing is read
 */
{/*Expand to see storage: job search*/
var SearchManager = {
   prefix : "SEARCH_ID_VISITED_",
   updateLastVisit : function(){
      var now = new Date().getTime();
      var before = PREF.load("LAST_ACCESSED_SEARCH");
      PREF.save("LAST_ACCESSED_SEARCH", now);
      var daysPast = (now - before) / 24 / 60 / 60 / 1000;     //Convert to days
      Assert(daysPast>=0, "Somehow time went backwards? Search manager is broken");
      if (daysPast > CONSTANTS.SEARCH_DAYS_CLEAR) {
         this.clearAll();
      }
   },
   validateKey : function(jobID) {
      console.log(jobID, parseInt(jobID + "", 10))
      jobID = parseInt(jobID + "", 10);
      Assert(jobID!=null&&jobID!="", MESSAGE.JOBID_INVALID);
      return this.prefix + jobID;
   },
   hasRead : function(jobID){
      var key = this.validateKey(jobID);
      try{
      return OBJECTS.STORAGE.getItem(key) != undefined;
      }catch(e){Throw("Something wrong with reading item in localStorage: "+e)}
   },
   setRead : function(jobID){
        console.log(jobID)
      var key = this.validateKey(jobID);
      try{
      OBJECTS.STORAGE.setItem(key, 1);
      }catch(e){Throw("Something wrong with setting item in localStorage: "+e)}
   },
   setNew : function(jobID){
        console.log(jobID)
      var key = this.validateKey(jobID);
      try{
      OBJECTS.STORAGE.removeItem(key);
      }catch(e){Throw("Something wrong with removing item in localStorage: "+e)}
   },
   clearAll : function(){
      var d = OBJECTS.STORAGE.length;     //Firefox glitch to update localstorage
      for(var item in OBJECTS.STORAGE) {  
         if (item.startsWith(this.prefix)) { 
            try{
            OBJECTS.STORAGE.removeItem(item);
            }catch(e){Throw("Something wrong with removing item in localStorage: "+e)}
         }
      }
   },
};
}