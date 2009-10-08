// ==========================================================================
// Project:   Calendar
// Copyright: ©2009 Martin Ottenwaelter
// ==========================================================================
/*globals Calendar */

/** @class

  TODO: Describe
  
  @extend SC.View
*/
Calendar.CalendarView = SC.View.extend(
/** Calendar.CalendarView.prototype */ {
  
  classNames: 'calendar-view',

  childViews: 'headerView weekdaysView daysView'.w(),
  
  month: SC.DateTime.create(),
  
  selection: null,
  minSelection: null,
  maxSelection: null,
    
  headerView: SC.View.extend({
    layout: { top: 0, left: 0, right: 0, height: 24 },
    childViews: 'previousMonthButton monthLabel nextMonthButton'.w(),
    classNames: 'calendar-header-view',
    previousMonthButton: SC.ButtonView.extend({
      layout: { top: 0, left: 0, width: 24 },
      classNames: 'calendar-previous-month',
      titleMinWidth: 0,
      action: function() { this.getPath('parentView.parentView').decrementMonth(); }
    }),
    monthLabel: SC.LabelView.extend({
      layout: { top: 0, left: 24, right: 24, height: 24 },
      init: function() {
        sc_super();
        // Don't use valueBinding: here because it will create one unique instance of SC.Binding
        // that will be shared by all the Calendar.CalendarView instances, which of course is not
        // what we want. The workaround is to instanciate SC.Binding at runtime.
        SC.Binding.dateTime('%B %Y').from('.parentView.parentView.month').to('value', this).connect();
      },
      textAlign: SC.ALIGN_CENTER,
      fontWeight: SC.BOLD_WEIGHT
    }),
    nextMonthButton: SC.ButtonView.extend({
      layout: { top: 0, right: 0, width: 24 },
      classNames: 'calendar-next-month',
      titleMinWidth: 0,
      action: function() { this.getPath('parentView.parentView').incrementMonth(); }
    })
  }),
  
  weekdaysView: SC.View.extend({
    layout: { top: 24, left: 0, right: 0, height: 24 },
    classNames: 'calendar-weekdays-view',
    render: function(context, firstTime) {
      var day = SC.DateTime.create().get('lastMonday');
      for (var i = 0; i < 7; ++i) {
        context = context.begin('div').addClass('calendar-weekday').addStyle({
          position: 'absolute',
          width: '29px',
          left: 29*i + 'px',
          top: '0px',
          bottom: '0px',
          textAlign: 'center'
        });
        context.push(day.toFormattedString('%a'));
        context = context.end();
        day = day.advance({day: 1});
      }
    }
  }),
  
  daysView: SC.View.extend({
    layout: { top: 48, left: 0, right: 0, height: 150 },
    classNames: 'calendar-days-view',
    
    displayProperties: 'parentView.selection parentView.month parentView.minSelection parentView.maxSelection'.w(),
    
    render: function(context, firstTime) {
      var i;
      
      if (firstTime) {
        for (i = 0; i < 42; ++i) {
          context = context.begin('div').addClass('calendar-day').addStyle({
            position: 'absolute',
            width: '29px',
            height: '24px',
            left: (29*i % 203) + 'px',
            top: (parseInt(i/7,10) * 25) + 'px',
            textAlign: 'center'
          });
          context = context.end();
        }
        
      } else {
        var parent = this.get('parentView');
        var today = SC.DateTime.create();
        var month = parent.get('month');
        var firstVisibleDay = parent.get('firstVisibleDay');
        var day = firstVisibleDay.copy();
        var selection = parent.get('selection');
        var div, divs = this.$().children();
        
        for (i = 0; i < 42; ++i) {
          div = SC.$(divs[i]);
          div.html(day.get('day'));
          if (parent.canSelect(day)) {
            div.removeClass('disabled');
          } else {
            div.addClass('disabled');
          }
          if (day.get('month') === month.get('month')) {
            div.removeClass('not-current-month');
          } else {
            div.addClass('not-current-month');
          }
          if (SC.DateTime.compareDate(today, day) === 0) {
            div.addClass('today');
          } else {
            div.removeClass('today');
          }
          if (!SC.none(selection) && SC.DateTime.compareDate(selection, day) === 0) {
            div.addClass('sel');
          } else {
            div.removeClass('sel');
          }
          day = day.advance({day: 1});
        }
      }
    },
    
    mouseDown: function(evt) {
      var parent = this.get('parentView');
      var target = SC.$(evt.target);
      var i = target.parent().children().index(target);
      var day = parent.get('firstVisibleDay').advance({day: i});
      
      if (parent.canSelect(day)) {
        parent.set('selection', day);
      }
      
      return YES;
    }
  }),
  
  canSelect: function(day) {
    var minSelection = this.get('minSelection');
    var maxSelection = this.get('maxSelection');
    if ((!minSelection || SC.DateTime.compareDate(minSelection, day) <= 0) &&
        (!maxSelection || SC.DateTime.compareDate(maxSelection, day) >= 0)) {
      return YES;
    }
    return NO;
  },
  
  incrementMonth: function() {
    var nextMonth = this.get('month').advance({ month: 1 });
    if (this.canSelect(nextMonth.adjust({ day: 1 }))) {
      this.set('month', nextMonth);
    }
  },
  
  decrementMonth: function() {
    var previousMonth = this.get('month').advance({ month: -1 });
    if (this.canSelect(previousMonth.adjust({ day: previousMonth.get('daysInMonth') }))) {
      this.set('month', previousMonth);
    }
  },
  
  firstVisibleDay: function() {
    var day = this.get('month').adjust({day: 1});
    if (day.get('dayOfWeek') !== 1) day = day.get('lastMonday');
    return day;
  }.property('month').cacheable(),
  
  _calendar_minSelectionDidChange: function() {
    var selection = this.get('selection');
    var minSelection = this.get('minSelection');
    if (minSelection) {
      if (selection && SC.DateTime.compareDate(minSelection, selection) > 0) {
        this.set('selection', minSelection);
        this.set('month', minSelection);
      } else if (SC.DateTime.compareDate(this.get('month').adjust({day: 1}), minSelection.adjust({day: 1})) < 0) {
        this.set('month', minSelection);
      }
    }
  }.observes('minSelection'),
  
  _calendar_maxSelectionDidChange: function() {
    var selection = this.get('selection');
    var maxSelection = this.get('maxSelection');
    if (maxSelection) {
      if (selection && SC.DateTime.compareDate(maxSelection, selection) < 0) {
        this.set('selection', maxSelection);
        this.set('month', maxSelection);
      } else if (SC.DateTime.compareDate(this.get('month').adjust({day: 1}), maxSelection.adjust({day: 1})) > 0) {
        this.set('month', maxSelection);
      }
    }
  }.observes('maxSelection')
  
});
