// show a modal dialog base on jQuery-UI dialog
// http://jqueryui.com/demos/dialog/#options
(function($) {
  $.fn.modaldialog = function(options) {

    options = $.extend({}, $.fn.modaldialog.defaults, options);

    return this.each(function() {
      var opts = $.fn.modaldialog.elementOptions(this, options);
      return $.fn.modaldialog.slidedown('abc', $(this), opts);
    });

  };


  $.fn.modaldialog.defaults = {
    zIndex: 1007,
    modal: true,
    draggable: false,
    resizable: false,
    position: 'bottom',
    width: 'auto',
    disableScrolling: true,
    overlayOpacity: 0 // jquery-ui default is 0.3, 0 means transparent
  };
  
  // Overwrite this method to provide options on a per-element basis.
  // For example, you could store the overlayOpacity in a 'overlayOpacity' attribute:
  // return $.extend({}, options, {overlayOpacity: $(ele).attr('overlayOpacity') || 0.3 });
  // (remember - do not modify 'options' in place!)
  $.fn.modaldialog.elementOptions = function(ele, options) {
      return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
  };
  
  // Show a dialog base on jquery-ui dialog
   $.fn.modaldialog.dialog = function(id, html, options){
     var selector = "#"+id;
     options = $.extend({width: 350, height: 'auto', modal: true, bgiframe: true,
       close: function(){
         $(selector).remove();
       }
     }, options);
     if(!$(selector).get(0)){
       $(document.body).append('<div id="'+id+'"></div>');
         $(selector)
           .html(html)
           // .find(":input").addClass("text ui-widget-content ui-corner-all").end()
           // .find(":submit").addClass("ui-button ui-state-default ui-corner-all").end()
           .dialog($.extend({
             title: function(){var title = $(selector).find("h1").html();$(selector).find("h1").remove();return title;}()
           }, options));
     }
     else{
       $(selector).dialog('open');
     }
   };

   // example:
   // $.fn.modaldialog.dialog.confirm('hello', function(){
   //  ok: function(){ // click on ok button },
   //  cancel: function(){ // click on cancel button }
   // })
   $.fn.modaldialog.confirm = function(message, options){
     var opts = $.extend($.fn.modaldialog.defaults,{
       width: 431,
       minHeight: 120,
       okText: 'OK',
       cancelText: 'Cancel',
       title: 'Are you sure?',
       dialogClass: 'confirm',
       ok: function(){},
       cancel: function(){}
     });
     options = $.extend(opts, options);
     // add buttons hooks
     var open,close, beforeclose; // used callbacks
     (open = options.open) && (delete options.open); // This event is triggered when dialog is opened.
     options = $.extend({
       open: function(){
         var dialog = $(this);
         dialog.find(".action-area .ok").click(function(){
           options.ok.apply(this, arguments);
           dialog.dialog('close');
         });
         dialog.find(".action-area .cancel").click(function(){
           options.cancel.apply(this, arguments);
           dialog.dialog('close');
         });
         if(open)open.apply(this, arguments);
       }
     }, options);

     html = '<div class="message">'+message+'</div>';
     html += '<div class="action-area">';
     html += ('<button type="button" class="text ui-widget-content ui-corner-all ok"><span class="left"/><span class="right">'+options['okText']+'</span></button>');
     html += ('<button type="button" class="text ui-widget-content ui-corner-all cancel"><span class="left"/><span class="right">'+options['cancelText']+'</span></button>');
     html += '</div>';
     return $.fn.modaldialog.open("modaldialog_dialog_confirm", html, options);
   };


  // Slide a dialog box down to the center of the viewport
   // the dialog will be destroyed after closed
   // example:
    // $.fn.modaldialog.open('test', 'hi', {
    //   modal: false,
    //   draggable: false,
    //   resizable: true,
    //   beforeopen: function(){
    //     // return false to prevent open
    //     console.info('before open');
    //   },
    //   open: function(){
    //     console.info('after close');
    //   },
    //   beforeclose: function(){
    //     // return false to prevent close
    //     console.info('before close');
    //   },
    //   close: function(){
    //     console.info('after close');
    //   }
    // });

   $.fn.modaldialog.open = function(id, html, options){
     options = $.extend({
       scrollTo: false,
       show: function(){} // when complete open
     }, options);
     var open,close, beforeclose; // used callbacks
     (open = options.open) && (delete options.open); // This event is triggered when dialog is opened.
     (close = options.close) && (delete options.close); // This event is triggered when dialog is closed.
     (beforeclose = options.beforeclose) && (delete options.beforeclose); // This event is triggered when dialog is closed.
     $.fn.modaldialog.dialog(id, html, $.extend({
       open:function(){
        // check beforeopen callback
         if(options.beforeopen){
           if(options.beforeopen.apply(this, arguments) === false){
             return false;
           }
         }
         // $(this) is .ui-dialog-content
         if(!$(this).parent('.ui-dialog').parents('.ui-dialog-localizer').get(0)){ // init once
           $(this).parent('.ui-dialog').each(function(){
             // $(this) is .ui-dialog
             var target = $(document.body);
             var width = $(this).outerWidth();
             var height = $(this).outerHeight();
             var top = target.offset().top;
             var left = target.offset().left + (target.width() - width) / 2; // show in center
             // prepare container and helper
             $(this)
               .hide()
               .css({top: 'auto', bottom:0, left: 0, position: 'absolute'}) // slidable, each css is necessary
               .wrap('<div class="ui-dialog-localizer modaldialog" style="position: fixed;"></div>')
               .wrap('<div class="ui-dialog-helper" style="position: relative;"></div>')
               .wrap('<div class="ui-dialog-container" style="position: absolute; overflow:hidden;"></div>')
               .parents('.ui-dialog-localizer').css({top: top, left: left}).end()
               .parents('.ui-dialog-container').css({height: 0, width: width}).end()
              ;
              // recompute width and height
              width = $(this).outerWidth();
              height = $(this).outerHeight();
              $(this).parents('.ui-dialog-container').stop().animate({height: height, width: width}, {duration:600, complete: function(){
                 // after show
                 // $(this) is .ui-dialog-container
                 // enable auto resize after adding new elements
                 $(this).css({overflow:'visible'});
                 // reset container height
                 $(this).css({height: $(this).find('.ui-dialog').outerHeight()});

                 // auto resize
                 if(options.height == 'auto'){
                   var dialog = $(this).find(".ui-dialog");
                   var autoResizeIntervalId = setInterval(function(){
                     if(dialog.find('.ui-widget-content').outerHeight() != dialog.parents('.ui-dialog-container').outerHeight()){
                       dialog.parents('.ui-dialog-container').css({height: dialog.find('.ui-widget-content').outerHeight()});
                     }
                   }, 5);
                   dialog.find(".ui-widget-content").data('autoResizeIntervalId', autoResizeIntervalId);
                 }

                 // focus on
                 if(options.scrollTo){
                   $.fn.modaldialog.scrollTo(this);
                 }

                 // fire hook
                 options.show.apply(this, arguments);
               }}).end() // slide down
               .show()
               ;
           });
         }
         // set overlayOpacity
         $.fn.modaldialog.setOverlayOpacity($(this).dialog('option', 'overlayOpacity'));
         // disable scrolling
         if(options.disableScrolling){
           $.fn.modaldialog.disableScrolling();
         }
         // apply after open callback
         if(open){
           open.apply(this, arguments);
         }
       },
       beforeclose: function(){
         if($(this).data('autoResizeIntervalId')){clearInterval($(this).data('autoResizeIntervalId'));} // clear interval
         $(this).parents('.ui-dialog-container').stop().animate({height: 0}, {complete: function(){$(this).find('.ui-dialog-content').dialog('close'); }}).end() // slide up
         if($(this).parents('.ui-dialog-container').height() > 0){
           return false;
         }
         if(beforeclose){
           return beforeclose.apply(this, arguments);
         }
       },
       close: function(){
         if(close){
           close.apply(this, arguments);
         }
         if($(this).parents('.ui-dialog-localizer').get(0)){
           var localizer =  $(this).parents('.ui-dialog-localizer');
           $(this).remove(); // must remove this first
           localizer.remove();
         }
         $.fn.modaldialog.disableScrolling(false);
       },
       resizeStart: function(){ $(this).parents('.ui-dialog-container').css({overflow: ''}); },
       resizeStop: function(){
         $(this).parents('.ui-dialog-container')
           .width($(this).parent('.ui-dialog').outerWidth())
           .height($(this).parent('.ui-dialog').outerHeight())
           .css('overflow', 'hidden')
         ;
       }
     }, options));
   };
   
   // example:
   // $("#block-login").modaldialog({titleSelector: 'h2'})
   $.fn.modaldialog.slidedown = function(id, target, options){
     var width = target.outerWidth();
     var height = target.outerHeight();
     options = $.extend({}, {
        // width: width,
        // height: height,
        titleSelector: 'h1', // if setted ,will use this html of the selector to set the dialog title,then remove the selector element
        dialogClass: 'slidedown',
        beforeopen: (function(){
          var beforopen = options.beforeopen;
          options.beforeopen = function(){
            // set title by titleSelector
            var titleSelector = $(this).dialog('option', 'titleSelector');
            var titleEle = $(this).find(titleSelector);
            if(titleEle.get(0)){
              $(this).dialog('option', 'title', titleEle.html());
              titleEle.remove();
            }
            // call beforopen from the first options
            return beforopen && beforopen.call(this);
          };
        })()
      }, options);
     return $.fn.modaldialog.open(id, target.html(), options);
   };

   $.fn.modaldialog.setOverlayOpacity = function(opacity){
     $(".ui-widget-overlay").css('opacity', opacity);
   };

   // $.fn.modaldialog.disableScrolling(false);
   $.fn.modaldialog.disableScrolling = function(disable){
     if(typeof(disable) == 'undefined'){
       disable = true;
     }
     if(disable){
       $.fn.modaldialog.overflow = $('body').css('overflow');
       $('body').css('overflow', 'hidden');
     }else{
       if($.fn.modaldialog.overflow){
         $('body').css('overflow', $.fn.modaldialog.overflow);
       }
     }
   }


})(jQuery);
