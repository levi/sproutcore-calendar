// ==========================================================================
// Project:   SampleCalendar - mainPage
// Copyright: ©2009 Martin Ottenwaelter
// ==========================================================================
/*globals Calendar */
/*globals SampleCalendar*/

// This page describes the main user interface for your application.  
SampleCalendar.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    childViews: 'calendarView selectedDateLabelView'.w(),
    
    calendarView: Calendar.CalendarView.design({
      layout: {top: 0, left: 0, width: 203, height: 198},
      backgroundColor: 'white'
    }),
    
    selectedDateLabelView: SC.LabelView.design({
      layout: {top: 208, left: 0, width: 203, height: 22},
      valueBinding:  SC.Binding.transform(SC.Time.transform('%x')).from('SampleCalendar.mainPage.mainPane.calendarView.selection'),
      textAlign: SC.ALIGN_CENTER
    })

  })

});
