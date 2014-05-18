/*===============================*\
|*    __PROTOTYPE_FUNCTIONS__    *|
\*===============================*/
{/*Expand to see the prototype functions*/
String.prototype.contains = function(string, from){
   return this.indexOf(string, from) >= 0;
}
String.prototype.empty = function(){
   return this == null || this.length == 0 || this == "";
}
String.prototype.replaceLast = function(find, replaceWith){
   var start = this.lastIndexOf(find);
   var length = find.length;
   //Cannot find it
   if (start == -1) {return this;}
   return this.substring(0, start) + this.substr(start + length);
}
String.prototype.setCharAt = function(index, character) {
   if (index < 0) {index = this.length + index;}
   return this.substr(0, index) + character + this.substr(index+character.length);
}
String.prototype.startsWith = function(str) {
   if (str == null || str.length == 0) {return false;}
   return this.substring(0, str.length) == str;
}
String.prototype.underscorize = function() {
   return this.replace(/\s|-/g, "_");
}
String.prototype.removeWords = function(listOfWords){
   if (!UTIL.isArray(listOfWords) || listOfWords.empty()) {
      return this;
   }
   var regexStr = "(^|\\W)("+listOfWords[0];
   for(var i=1;i<listOfWords.length;i++) {
      regexStr += "|" + listOfWords[i];
   }
   regexStr += ")(\\W|$)";
   return this.replace(new RegExp(regexStr,"gi"), "");
}
String.prototype.trim=function(){
   return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};
String.prototype.getTextBetween=function(front, end){
   if (this==null){return null;}
   var startIndex=0;
   var endIndex=this.length-1;
   if (front!=null){startIndex=this.indexOf(front)+front.length;}
   if (end!=null){endIndex=this.lastIndexOf(end);}
   return this.substring(startIndex,endIndex);
};
String.prototype.replaceCharCodes=function(){
   if (this==null){return null;}
   return this.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"");
};
String.prototype.replaceHTMLCodes=function(){
   if (this==null){return null;}
   return this.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
};
String.prototype.capitalizeAllFirstLetters = function() {
   return this.replace(/\b[a-z]/g, function(letter){
      return letter.toUpperCase();
   });
};
Number.prototype.toDigits=function(numOfDigits){
   var numberOfMovements = numOfDigits-this.toString().length;
   if (numberOfMovements < 0) {
      return this.toString().substr(Math.abs(numberOfMovements)-1);
   } else {
      var prefix = "";
      for(var i=0;i<numberOfMovements;i++) {prefix += "0";}
      return prefix + this;
   }
};
Array.prototype.empty = function(){
   return this.length == 0;
}
Array.prototype.clone = function(){
   return this.concat([]);
}
Array.prototype.contains = function(index){
   return this.indexOf(index) != -1;
}
Array.prototype.last = function(index){
   if (this.empty()) {return null;}
   return this[this.length-1];
}
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};



/**
 *    Utilities
 */
var UTIL = {
   getID: function(idName) {
      return document.getElementById(idName);
   },
   idExists: function(idName) {
      return this.getID(idName) != null;
   },
   isNumeric : function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
   },
   isArray : function(o) {
      return Object.prototype.toString.call(o) === '[object Array]';
   },
   isFunction : function(o) {
      return Object.prototype.toString.call(o) === '[object Function]';
   },
   inRange : function(low_OR_mid, mid_OR_high, high_OR_null) {
      if (arguments.length == 2) {
         return low_OR_mid <= mid_OR_high;
      }
      return low_OR_mid <= mid_OR_high && mid_OR_high <= high_OR_null;
   },
   isjQuery : function(obj) {
      return obj instanceof jQuery;
   },
}
}