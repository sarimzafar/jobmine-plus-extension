/*================================*\
|*          __SETTINGS__          *|
\*================================*/
{/*Expand to see settings*/
var SETTINGS_RESTRICT_TYPES = {
   DECIMALS          : "DECIMALS",
   POSITIVE_DECIMALS : "POSITIVE_DECIMALS",
   INTEGERS          : "INTEGERS",
   POSITIVE_INTEGERS : "POSITIVE_INTEGERS",
};
var SETTINGS_FIELD_TYPES = {
   DROPDOWN    : 0,
   TEXTFIELD   : 1,
   CHECKBOX    : 2,
   TITLE       : 3,
};
var SETTINGS = {
   template  : {
      'General'   : {
         'default_page' : {
            'label' : 'Default Page when Logged In',
            'type' : SETTINGS_FIELD_TYPES.DROPDOWN,
            'data' : NAVIGATION,
            'defaultValue' : "applications",
            //'detail' : 'Some text',
            //'onchange' : function(){},
         },
         'kill_timer' : {
            'label' : 'Kill Login Timer',
            'type' : SETTINGS_FIELD_TYPES.CHECKBOX,
            'detail' : 'If checked, you will not be forced offline being idle.',
         },
         'auto_refresh' : {
            'label' : 'Auto-refresh Rate',
            'type' : SETTINGS_FIELD_TYPES.TEXTFIELD,
            'restrict'     : SETTINGS_RESTRICT_TYPES.POSITIVE_DECIMALS,
            'defaultValue' : 0,
            'detail' : 'Page refreshes at the inputted min. (0 = Off)',
         },
         'show_status_bar' : {   
            'label'  : 'Show Statusbar',
            'type'   : SETTINGS_FIELD_TYPES.CHECKBOX,
            'defaultValue' : true,
         },
      }, 
      'Pages'     : {
         'search' : {
            'label' : 'Job Search',
            'type' : SETTINGS_FIELD_TYPES.TITLE,
         },
            'search_close' : {
               'label'  : "Don't Hide Criteria",
               'detail' : 'Do not collapse search criteria when searching.',
               'type' : SETTINGS_FIELD_TYPES.CHECKBOX,
            },
            'auto_search' : {
               'label' : 'Auto Search',
               'detail': 'Will search immediately once entering this page.',
               'type' : SETTINGS_FIELD_TYPES.CHECKBOX,
            },
         'job_details' : {
            'label' : 'Job Details',
            'type' : SETTINGS_FIELD_TYPES.TITLE,
         },
            'show_old' : {
               'label' : 'Show Old Page',
               'detail': 'This would show the original job details page',
               'type' : SETTINGS_FIELD_TYPES.CHECKBOX,
            },
      },
   },
   PREF_PREFIX_KEY : "SETTINGS_",
   selected : null,
   build  : function() {
      //Build only if nothing is inside the settings div
      var settingObj = $("#jbmnplsPopupSettings");
      if(!settingObj.children().exists()) {
         $("#jbmnplsPopupSettings input[restriction]").die("keydown").live("keydown", function(e){
            var type = $(this).attr("restriction");
            return INPUT_RESTRICTIONS[type].call(this, e.keyCode);
         });
      
         var template = this.template;
         var navHtml = "<nav id='settings-nav' class='noselect'><ul>";
         var bodyHtml = "";
         for(var navItem in template) {
            var navItemLC = navItem.toLowerCase();
            navHtml += "<li class='settings-nav-item "+navItemLC+"'>" + navItem + "</li>";
            bodyHtml += "<div id='settings-" + navItemLC + "' class='settings-panel'>";
            for(var fieldName in template[navItem]) {
               fieldName = fieldName.toLowerCase();
               //Build each field entry
               var fieldEntry = template[navItem][fieldName];
               Assert(fieldEntry.label && fieldEntry.type !== null, "Settings cannot be built because '" + fieldName + "' is maliformed and does not have label and/or type.");
               Assert(UTIL.isNumeric(fieldEntry.type), "Settings type is not a numeric value and hence you must use an enum value (look at SETTINGS_FIELD_TYPES)");
               if(fieldEntry.type == SETTINGS_FIELD_TYPES.TITLE) {
                  bodyHtml += "<div class='settings-entry " + navItemLC + "-" + (fieldName.replace(/\s|_/g, "-")) + "'><span class='settings-entry-title'>" + fieldEntry.label + "</span></div>";
               } else {
                  bodyHtml += "<div class='settings-entry " + navItemLC + "-" + (fieldName.replace(/\s|_/g, "-")) + "'><span class='settings-entry-label'>" + fieldEntry.label + "</span>";
                  if(fieldEntry.detail) {
                     bodyHtml += "<span class='settings-entry-detail'>" + fieldEntry.detail + "</span>";
                  }
                  var changetext = '';
                  var include_onchange = fieldEntry.onchange != null && UTIL.isFunction(fieldEntry.onchange);
                  if(include_onchange && fieldEntry.type == SETTINGS_FIELD_TYPES.DROPDOWN && fieldEntry.type == SETTINGS_FIELD_TYPES.TEXTFIELD) {
                     changetext = "onchange='settings_"+navItemLC+"_"+fieldName+"(this.value)'";
                     BRIDGE.registerFunction("settings_"+navItemLC+"_"+fieldName, fieldEntry.onchange);
                  }
                  var id = "settings-" + navItemLC + "-" + fieldName.replace(/\s|_/g, "-");
                  bodyHtml += "<span class='settings-entry-input'>";
                  switch(fieldEntry.type) {
                     case SETTINGS_FIELD_TYPES.DROPDOWN: 
                        Assert(fieldEntry.data, "Settings cannot be built because '" + fieldName + "' is a dropdown but has no data.");
                        var defaultSelection = fieldEntry.defaultValue && UTIL.isNumeric(fieldEntry.defaultValue) ? fieldEntry.defaultValue : 0;
                        var ddData = "";
                        for(var value in fieldEntry.data) {
                           ddData += "<option value='"+value.toString().toLowerCase()+"'>" + fieldEntry.data[value] + "</option>";
                        }
                        bodyHtml += "<select "+changetext+" id='"+id+"' class='settings-dropdown'>"+ddData+"</select>";
                        break;
                     case SETTINGS_FIELD_TYPES.TEXTFIELD:
                        var restriction = false;
                        bodyHtml += "<input "+(fieldEntry.hasOwnProperty('restrict')?"restriction='"+fieldEntry.restrict+"'":"")+" "+changetext+" "+(fieldEntry.defaultValue!=null&&fieldEntry.defaultValue.toString()!=''?"value='"+fieldEntry.defaultValue+"'":"")+" type='text' id='"+id+"' class='settings-textfield'/>";
                        break;
                     case SETTINGS_FIELD_TYPES.CHECKBOX:
                        if(include_onchange) {
                           changetext = "onchange='settings_"+navItemLC+"_"+fieldName+"(this.checked)'";
                           BRIDGE.registerFunction("settings_"+navItemLC+"_"+fieldName, fieldEntry.onchange);
                        }
                        bodyHtml += "<input "+changetext+" "+(fieldEntry.defaultValue===true?"checked='checked'":"")+" type='checkbox' id='"+id+"' class='settings-checkbox'/>";
                        break;
                     default:
                        Throw("There is no such thing as a setting's type as '" + fieldEntry.type + "'");
                        break;
                  }
                  bodyHtml += "</span></div>";
               }
            }
            bodyHtml += "</div>";
         }
         navHtml += "</ul></nav>";
         settingObj.html(navHtml + bodyHtml);

         $('#settings-nav li').unbind('click').bind('click', function(){
            var navItem = $(this).plainText();
            SETTINGS.switchPanel(navItem);
         });
      }
   },
   reset : function() {
   },
   handleClose  : function(action) {
      var settingObj = $("#jbmnplsPopupSettings");
      $("#jbmnplsPopupContent").addClass('noselect');
      var template = SETTINGS.template;
      switch(action) {
         //case "cancel":    break;    //Do nothing
         case "save":
            for(var panelName in template) {
               for(var fieldName in template[panelName]) {
                  var fieldEntry = template[panelName][fieldName];
                  var key = SETTINGS.PREF_PREFIX_KEY + panelName.toUpperCase().underscorize() + "_" + fieldName.toUpperCase().underscorize();
                  var value = '';
                  if(fieldEntry.type == SETTINGS_FIELD_TYPES.DROPDOWN 
                  || fieldEntry.type == SETTINGS_FIELD_TYPES.TEXTFIELD ){
                     value = $("#"+key.toLowerCase().replace(/_/g,"-")).val();
                  } else if(fieldEntry.type == SETTINGS_FIELD_TYPES.CHECKBOX) {
                     value = UTIL.getID(key.toLowerCase().replace(/_/g,"-")).checked;
                  } else {
                     continue;      //Cannot handle this type
                  }
                  PREF.save(key, value);
               }
            }
            //Update search page with the checkbox
            if(PREF.load('LAST_PAGE') == PAGES.SEARCH) {
               var iframe = $("#jbmnplsWebpage").contents();
               iframe.find("#jbmnplsDontCloseSearch").get(0).checked = UTIL.getID("settings-pages-search-close").checked;
            }
            //Update to show or not show the statusbar
            if(PREF.load("SETTINGS_GENERAL_SHOW_STATUS_BAR", null, true)) {
               updateStatusBar();
               $("#jbmnplsStatus").removeClass("hide");
            } else {
               $("#jbmnplsStatus").addClass("hide");
            }
            invokeRefreshTimer();
            return true;
            break;
      }
   },
   show  : function() { //Must call SETTINGS as this
      showPopup(true, '', "Settings", 600, null, SETTINGS.handleClose);
      SETTINGS.build();
      $("#jbmnplsPopupContent").removeClass('noselect');
      var settingObj = $("#jbmnplsPopupSettings");
      //Here we need to put all the values that are from preferences just for the first page
      SETTINGS.switchPanel('General');
      
      //Populate fields with preferences
      var template = SETTINGS.template;
      for(var panelName in template) {
         for(var fieldName in template[panelName]) {
            var fieldEntry = template[panelName][fieldName];
            var key = SETTINGS.PREF_PREFIX_KEY + panelName.toUpperCase().underscorize() + "_" + fieldName.toUpperCase().underscorize();
            var value = '';
            var id = key.toLowerCase().replace(/_/g,"-");
            switch(fieldEntry.type) {
               case SETTINGS_FIELD_TYPES.DROPDOWN:
               case SETTINGS_FIELD_TYPES.TEXTFIELD:
                  var defaultValue = fieldEntry.defaultValue == null ? '' : fieldEntry.defaultValue;
                  var value = PREF.load(key, null, defaultValue);
                  if(value !== '') { 
                     $('#'+id).val(value);
                  }
                  break;
               case SETTINGS_FIELD_TYPES.CHECKBOX:
                  var defaultValue = fieldEntry.defaultValue == null ? false : fieldEntry.defaultValue;
                  var value = PREF.load(key, null, defaultValue);
                  UTIL.getID(id).checked = value;
                  break;
               default:
                  continue;
                  break;
            }
         }
      }
      resetPopupPosition();
   },
   switchPanel : function(navItem) {
      if(this.template.hasOwnProperty(navItem) && this.selected != navItem) {
         var navItemLC = navItem.toLowerCase();
         $("#jbmnplsPopupSettings .settings-panel.open").removeClass("open");
         $("#settings-"+navItemLC).addClass("open");
         this.selected = navItem;
         $("#settings-nav li.selected").removeClass("selected");
         $("#settings-nav li."+navItemLC).addClass("selected");
         
         //Load the preferences now!!!
      }
   },
};
BRIDGE.registerFunction("showSettings", SETTINGS.show);
}