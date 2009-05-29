// ==========================================================================
// Project:   Calendar
// Copyright: ©2009 Martin Ottenwaelter
// ==========================================================================
/*globals Calendar */

require('datetime');

Calendar.DayView = SC.LabelView.extend({
  textAlign: SC.ALIGN_CENTER,
  
  render: function(context, firstTime) {
    sc_super();
    
    var day = this.get('content');
    var days_month = day.get('month');
    var calendars_month = this.getPath('parentView.parentView.month.month');
    
    context.addClass('calendar-day-view');
    
    if (days_month === calendars_month) {
      context.addClass('current-month');
    } else {
      context.addClass('other-month');
    }
    
    if (day.isToday()) {
      context.addClass('today');
    }
    
  }
  
});

/** @class

  TODO: Describe
  
  @extend SC.View
*/
Calendar.CalendarView = SC.View.extend(SC.Control,
/** Calendar.CalendarView.prototype */ {
  
  classNames: ['calendar-calendar-view'],

  childViews: 'headerView subHeaderView contentView'.w(),
  
  allowsMultipleSelection: NO,
  
  month: null,
  days: SC.ArrayController.create(),
    
  headerView: SC.View.extend({
    layout: { top: 0, left: 0, right: 0, height: 24 },
    childViews: 'previousMonthButton monthLabel nextMonthButton'.w(),
    previousMonthButton: SC.ButtonView.extend({
      layout: { top: 0, left: 0, width: 24 },
      title: '◀',
      titleMinWidth: 0,
      textAlign: SC.ALIGN_CENTER,
      action: function() { this.getPath('parentView.parentView').decrementMonth(); } //FIXME: find a way to make target/action work
      }),
    monthLabel: SC.LabelView.extend({
      layout: { top: 0, left: 24, right: 24, height: 24 },
      valueBinding: SC.Binding.transform(SC.DateTime.transform('%B %Y')).oneWay('.parentView.parentView.month'),
      textAlign: SC.ALIGN_CENTER }),
    nextMonthButton: SC.ButtonView.extend({
      layout: { top: 0, right: 0, width: 24 },
      title: '▶',
      titleMinWidth: 0,
      textAlign: SC.ALIGN_CENTER,
      action: function() { this.getPath('parentView.parentView').incrementMonth(); } //FIXME: find a way to make target/action work
      })
  }),
  
  subHeaderView: SC.View.extend({
    layout: { top: 24, left: 0, right: 0, height: 24 },
    exampleView: SC.LabelView.design({
      textAlign: SC.ALIGN_CENTER
    }),
    createChildViews: function() {
      var childViews = this.get('childViews');
      var t = SC.DateTime.create().beginning_of_week();
      
      this.beginPropertyChanges();
      for (var i = 0; i < 7; i++) {
        childViews[i] = this.createChildView(this.exampleView, {
          layout: {left: i*29, top: 0, width: 29, height: 24},
          value: t.toFormattedString('%a')
        });
        t._advance({day: 1});
      }
      this.endPropertyChanges();
      
      return this;
    }
  }),
    
  contentView: SC.GridView.extend({
    layout: { top: 48, left: 0, right: 0, height: 150 },
    itemsPerRow: 7,
    rowHeight: 25,
    columnWidth: 25,
    exampleView: Calendar.DayView,
    contentBinding: '.parentView.days.arrangedObjects',
    contentValueKey: 'day',
    selectionBinding: '.parentView.days.selection'
  }),
  
  monthDidChange: function() {    
    var days = [];
    days[0] = this.get('month').beginning_of_week();
    for (var i = 1; i < 42; i++) days[i] = days[i-1].advance({day: 1});
    this.setPath('days.content', days);
  }.observes('*month.value'),
  
  selection: function() {
    var selection = this.days.get('selection');
    if (selection && !this.get('allowsMultipleSelection')) {
      selection = selection[0]; 
    }
    return selection;
  }.property('.days.selection'),

  // FIXME: I think this is a bug in SC: if '.days.selection' changes,
  // then the observers of the 'selection' property are not notified.
  // The method below is a workaround.
  selectionDidChange: function() {
    this.notifyPropertyChange('selection');
  }.observes('.days.selection'),
  
  incrementMonth: function() {
    this.set('month', this.get('month').advance({month: +1}));
  },
  
  decrementMonth: function() {
    this.set('month', this.get('month').advance({month: -1}));
  },
  
  init: function() {
    sc_super();
    this.set('month', SC.DateTime.create({day: 1}));
    this.setPath('days.allowsMultipleSelection', this.get('allowsMultipleSelection'));
    this.setPath('days.selection', [SC.DateTime.create()]);
  }
  
});