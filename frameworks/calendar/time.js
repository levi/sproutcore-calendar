// ==========================================================================
// Project:   Time
// Copyright: ©2009 Martin Ottenwaelter
// ==========================================================================
/*globals SC */

/** @class

  TODO: Describe
  
  @extend SC.Object
*/
SC.Time = SC.Object.extend({
  
  date: null,
  
  init: function() {
    sc_super();
    
    if (SC.none(this.date)) this.set('date', new Date());
    this._change(this);
    
    delete this.year;
    delete this.month;
    delete this.day;
    delete this.hours;
    delete this.minutes;
    delete this.seconds;
    delete this.milliseconds;
    
    return this;
  },
  
  clone: function() {
    var d = new Date();
    d.setTime(this.get('date').getTime());
    return SC.Time.create({date: d});
  },
  
  _change: function(options) {
    var d = this.get('date');

    if (!SC.none(options.year))         d.setFullYear(options.year);
    if (!SC.none(options.month))        d.setMonth(options.month-1); // January is 0 in JavaScript
    if (!SC.none(options.day))          d.setDate(options.day);
    if (!SC.none(options.hours))        d.setHours(options.hours);
    if (!SC.none(options.minutes))      d.setMinutes(options.minutes);
    if (!SC.none(options.seconds))      d.setSeconds(options.seconds);
    if (!SC.none(options.milliseconds)) d.setMilliseconds(options.milliseconds);
    
    return this;
  },
  
  change: function(options) {
    return this.clone()._change(options);
  },

  isLeapYear: function() {
    var y = this.get('year');
    return (y%4 === 0 && y%100 !== 0) || y%400 === 0;
  }.property(),
  
  daysInMonth: function() {
    switch (this.get('month')) {
      case 4:
      case 6:
      case 9:
      case 11:
        return 30;
      case 2:
        return this.get('isLeapYear') ? 29 : 28;
      default:
        return 31;
    }
  }.property(),

  unknownProperty: function(key, value) {
    // set
    if (!(value === undefined)) {
      var options = {};
      options[key] = value;
      this._change(options);
      return this;
     
    // get
    } else {
      var d = this.get('date');
      switch (key) {
        case 'year':         return d.getFullYear(); //TODO: investigate why some libraries do getFullYear().toString() or getFullYear()+""
        case 'month':        return d.getMonth()+1; // January is 0 in JavaScript
        case 'day':          return d.getDate();
        case 'dayOfWeek':    return d.getDay();
        case 'hours':        return d.getHours();
        case 'minutes':      return d.getMinutes();
        case 'seconds':      return d.getSeconds();
        case 'milliseconds': return d.getMilliseconds();   
      }
    }
    
    return undefined;
  },
  
  _beginning_of_week: function() {
    var day_of_week = this.get('date').getDay();
    var days_to_monday = day_of_week !== 0 ? day_of_week-1 : 6;
    
    this._advance({day: -1 * days_to_monday});
    this._change({hours: 0, minutes: 0, seconds: 0, milliseconds: 0});
    
    return this;
  },
  
  beginning_of_week: function() {
    return this.clone()._beginning_of_week();
  },
  
  /*
    only works with integers, floating point computing gives unpredictable results in JavaScript
  */
  _advance: function(options) {
    for (var key in options) options[key] += this.get(key);
    return this._change(options);
  },
  
  advance: function(options) {
    return this.clone()._advance(options);
  },
  
  toString: function() {
    return this.get('date').toString();
  },
  
  /*
    %a - The abbreviated weekday name (``Sun'')
    %A - The full weekday name (``Sunday'')
    %b - The abbreviated month name (``Jan'')
    %B - The full month name (``January'')
    %c - The preferred local date and time representation
    %d - Day of the month (01..31)
    %H - Hour of the day, 24-hour clock (00..23)
    %I - Hour of the day, 12-hour clock (01..12)
    %j - Day of the year (001..366)
    %m - Month of the year (01..12)
    %M - Minute of the hour (00..59)
    %p - Meridian indicator (``AM'' or ``PM'')
    %S - Second of the minute (00..60)
    %U - Week number of the current year,
        starting with the first Sunday as the first
        day of the first week (00..53)
    %W - Week number of the current year,
        starting with the first Monday as the first
        day of the first week (00..53)
    %w - Day of the week (Sunday is 0, 0..6)
    %x - Preferred representation for the date alone, no time
    %X - Preferred representation for the time alone, no date
    %y - Year without a century (00..99)
    %Y - Year with century
    %Z - Time zone name
    %% - Literal ``%'' character
  */
  
  dayNames:'_SC.Time.dayNames'.loc().w(),
  abbreviatedDayNames: '_SC.Time.abbreviatedDayNames'.loc().w(),
  monthNames: '_SC.Time.monthNames'.loc().w(),
  abbreviatedMonthNames: '_SC.Time.abbreviatedMonthNames'.loc().w(),
  pad: function(x) { return (x<0||x>9 ? '' : '0') + x; },
  
  toFormattedString: function(format) {
    var that = this;
    return format.replace(/\%([aAbBcdHIjmMpSUWwxXyYZ\%])/g, function() { return that._toFormattedString.call(that, arguments); } );
  },
  
  _toFormattedString: function(part) {
    var hours = this.get('hours');
    switch(part[1]) {
      case 'a': return this.abbreviatedDayNames[this.get('dayOfWeek')];
      case 'A': return this.dayNames[this.get('dayOfWeek')];
      case 'b': return this.abbreviatedMonthNames[this.get('month')-1];
      case 'B': return this.monthNames[this.get('month')-1];
      case 'c': return this.toString();
      case 'd': return this.pad(this.get('day'));
      case 'H': return this.pad(hours);
      case 'I': return this.pad((hours === 12 || hours === 0) ? 12 : (hours + 12) % 12);
      case 'j': return; //TODO
      case 'm': return this.pad(this.get('month'));
      case 'M': return this.pad(this.get('minutes'));
      case 'p': return hours > 11 ? 'PM' : 'AM';
      case 'S': return this.pad(this.get('seconds'));
      case 'U': return; //TODO
      case 'W': return; //TODO
      case 'w': return this.get('dayOfWeek');
      case 'x': return this.get('date').toDateString();
      case 'X': return this.get('date').toTimeString();
      case 'y': return this.pad(this.get('year') % 100);
      case 'Y': return this.get('year');
      case 'Z': return; //TODO
      case '%': return '%';
    }
  }

  
});

// Class Methods
SC.Time.mixin(/** @scope SC.Time */{
  
  /*
    for use with bindings
    eg: SC.Binding.transform(SC.Time.transform('%B')).oneWay('myDate')
  */
  transform: function(format) {
    return function(value, binding) { return value ? value.toFormattedString(format) : null; };
  }
  
});
