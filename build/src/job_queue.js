/*================================*\
|*         __JOBS_QUEUE__         *|
\*================================*/
{/*Expand to see the job queue*/
function Job(commandOutline, listOfIndexes, onComplete) {
   if(commandOutline == null || commandOutline == ""){
      Throw("Job queue init is not valid");
   }
   this.commandTemplate = commandOutline;
   this.callback = UTIL.isFunction(onComplete) ? onComplete : null;
   //Private
   this.list = listOfIndexes
   this.copyList = listOfIndexes!=null ? listOfIndexes.clone() : null;
}
Job.prototype = {
   isValid : function(){
      return this.commandTemplate != null && this.commandTemplate != "";
   },
   isEmpty : function(){
      if (this.list == null) {
         this.list = [];
      }
      return this.list.empty();
   },
   length : function(){
      return this.list.length;
   },
};

var JOBQUEUE = {
   queue    : [],
   isRunning: false,
   command  : null,
   callback : null,
   number   : -1,
   isEmpty  : function(){
      return this.queue.empty();
   },
   addJob  : function(item){
      if(item == null || !(item instanceof Job) || !item.isValid()) {
         return;
      }
      this.queue.push(item);
      this.runNextJob();
   },
   runNextJob : function(){
      if (!this.isEmpty() && !this.isRunning) {
         var item = this.queue[0];
         var list = item.list;
         if (list == null) {
            this.number = -1;
            this.command = item.commandTemplate;
         } else {
            this.number = list.shift();
            this.command = item.commandTemplate.replace(/\%/g, this.number);
         }
         if(item.callback) {
            this.callback = item.callback;
         }
         this.isRunning = true;
         BRIDGE.run("function(){"+this.command+"}");
      }
   },
   getCurrentItem : function(){
      return this.isEmpty() ? null : this.queue[0];
   },
};
}