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
    
  headerView: SC.View.extend({
    layout: { top: 0, left: 0, right: 0, height: 24 },
    childViews: 'previousMonthButton monthLabel nextMonthButton'.w(),
    classNames: 'calendar-header-view',
    previousMonthButton: SC.ButtonView.extend({
      layout: { top: 0, left: 0, width: 24 },
      title: '←',
      titleMinWidth: 0,
      action: function() { this.getPath('parentView.parentView').decrementMonth(); }
    }),
    monthLabel: SC.LabelView.extend({
      layout: { top: 0, left: 24, right: 24, height: 24 },
      valueBinding: SC.Binding.dateTime('%B %Y').oneWay('.parentView.parentView.month'),
      textAlign: SC.ALIGN_CENTER,
      fontWeight: SC.BOLD_WEIGHT
    }),
    nextMonthButton: SC.ButtonView.extend({
      layout: { top: 0, right: 0, width: 24 },
      title: '→',
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
    month: null,
    day: null,
    selection: {index: null, month: null},
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
        var month = this.getPath('parentView.month');
        var day = month.adjust({day: 1});
        if (day.get('dayOfWeek') !== 1) day = day.get('lastMonday');
        this.set('day', day);
        var displayedMonth = this.get('month');
        var divs = this.$().children();
        
        if (SC.none(displayedMonth) || SC.DateTime.compare(month, displayedMonth) !== 0) {
          for (i = 0; i < 42; ++i) {
            SC.$(divs[i]).html(day.get('day'));
            day = day.advance({day: 1});
          }
          this.set('month', month);
        }
        
        var sel = this.get('selection');
        i = sel.index;
        this.$('.sel').removeClass('sel');
        if (!SC.none(i) && SC.DateTime.compare(month, sel.month) === 0) SC.$(divs[i]).addClass('sel');
      }
    },
    mouseDown: function(evt) {
      return YES;
    },
    mouseUp: function(evt) {
      var target = SC.$(evt.target);
      var i = target.parent().children().index(target);
      this.set('selection', { index: i, month: this.get('month') });
      this.setPath('parentView.selection', this.get('day').advance({day: i}));
      this.set('layerNeedsUpdate', YES);
    }
  }),
    
  incrementMonth: function() {
    this.set('month', this.get('month').advance({month: +1}));
  },
  
  decrementMonth: function() {
    this.set('month', this.get('month').advance({month: -1}));
  },
  
  _calendar_monthDidChange: function() {
    this.setPath('daysView.layerNeedsUpdate', YES);
  }.observes('month')
  
});
