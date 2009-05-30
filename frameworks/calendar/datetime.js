// ==========================================================================
// Project:   Time
// Copyright: ©2009 Martin Ottenwaelter
// ==========================================================================
/*globals SC */

/** @class

  TODO: Describe
  
  @extend SC.Object
*/

SC.SCANNER_OUT_OF_BOUNDS_ERROR = new Error("Out of bounds.");
SC.SCANNER_INT_ERROR = new Error("Not an int.");
SC.SCANNER_SKIP_ERROR = new Error("Did not find the string/array to skip.");

SC.Scanner = SC.Object.extend({
  
  string: null,
  scanLocation: 0,
  
  scan: function(len) {
    if (this.scanLocation + len > this.length) throw SC.SCANNER_OUT_OF_BOUNDS_ERROR;
    var str = this.string.substr(this.scanLocation, len);
    this.scanLocation += len;
    return str;
  },
  
  scanInt: function(len) {
    var str = this.scan(len);
    var re = new RegExp("\\d{"+len+"}");
    if (!str.match(re)) throw SC.SCANNER_INT_ERROR;
    return parseInt(str, 10);
  },
  
  skipString: function(str) {
    if (this.scan(str.length) !== str) throw SC.SCANNER_SKIP_ERROR;
    return YES;
  },
  
  scanArray: function(ary) {
    for (var i = 0, len = ary.length; i < len; i++) {
      if (this.scan(ary[i].length) === ary[i]) {
        return i;
      }
      this.scanLocation -= ary[i].length;
    }
    throw SC.SCANNER_SKIP_ERROR;
  }
  
});

/** @class

  TODO: Describe
  
  @extend SC.Object
*/
SC.DateTime = SC.Object.extend(SC.Freezable, SC.Copyable, {
  
  date: null,
  
  init: function() {
    sc_super();
    
    if (SC.none(this.date)) this.set('date', new Date());
    this._change({
      year:         this.year,
      month:        this.month,
      day:          this.day,
      hours:        this.hours,
      minutes:      this.minutes,
      seconds:      this.seconds,
      milliseconds: this.milliseconds });
    
    delete this.year;
    delete this.month;
    delete this.day;
    delete this.hours;
    delete this.minutes;
    delete this.seconds;
    delete this.milliseconds;
    
    return this;
  },
  
  copy: function() {
    var d = new Date();
    d.setTime(this.get('date').getTime());
    return SC.DateTime.create({date: d});
  },
  
  _change: function(options) {
    var opts = SC.clone(options);
    
    if (!SC.none(options.hours) && SC.none(options.minutes)) opts.minutes = 0;
    if ((!SC.none(options.hours) || !SC.none(options.minutes)) && SC.none(options.seconds)) opts.seconds = 0;
    if ((!SC.none(options.hours) || !SC.none(options.minutes) || !SC.none(options.seconds)) && SC.none(options.milliseconds)) opts.milliseconds = 0;
    
    return this._rawChange(opts);
  },
  
  _rawChange: function(options) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    
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
    return this.copy()._change(options);
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
      return this._rawChange(options);
     
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
    return this.copy()._beginning_of_week();
  },
  
  /*
    only works with integers, floating point computing gives unpredictable results in JavaScript
  */
  _advance: function(options) {
    var o = SC.clone(options);
    for (var key in o) o[key] += this.get(key);
    return this._change(o);
  },
  
  advance: function(options) {
    return this.copy()._advance(options);
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
  
  pad: function(x) { return (x<0||x>9 ? '' : '0') + x; },
  
  toFormattedString: function(format) {
    var that = this;
    return format.replace(/\%([aAbBcdHIjmMpSUWwxXyYZ\%])/g, function() { return that._toFormattedString.call(that, arguments); } );
  },
  
  _toFormattedString: function(part) {
    var hours = this.get('hours');
    switch(part[1]) {
      case 'a': return SC.DateTime.abbreviatedDayNames[this.get('dayOfWeek')];
      case 'A': return SC.DateTime.dayNames[this.get('dayOfWeek')];
      case 'b': return SC.DateTime.abbreviatedMonthNames[this.get('month')-1];
      case 'B': return SC.DateTime.monthNames[this.get('month')-1];
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
  },
  
  compare: function(dt) {
    var t1 = this.get('date').getTime();
    var t2 = dt.get('date').getTime();
    return t1 < t2 ? -1 : t1 === t2 ? 0 : 1;
  },
  
  compareDate: function(dt) {
    var t1 = [this.get('year'), this.get('month'), this.get('day')];
    var t2 = [dt.get('year'), dt.get('month'), dt.get('day')];
    return SC.compare(t1, t2);
  },
  
  compareTime: function(dt) {
    var t1 = [this.get('hours'), this.get('minutes'), this.get('seconds'), this.get('milliseconds')];
    var t2 = [dt.get('hours'), dt.get('minutes'), dt.get('seconds'), dt.get('milliseconds')];
    return SC.compare(t1, t2);
  },
  
  isToday: function() {
    return this.compareDate(SC.DateTime.create()) === 0;
  }
  
});

// Class Methods
SC.DateTime.mixin(/** @scope SC.DateTime */{
  
  dayNames:'_SC.DateTime.dayNames'.loc().w(),
  abbreviatedDayNames: '_SC.DateTime.abbreviatedDayNames'.loc().w(),
  monthNames: '_SC.DateTime.monthNames'.loc().w(),
  abbreviatedMonthNames: '_SC.DateTime.abbreviatedMonthNames'.loc().w(),
  
  createFromString: function(str, fmt) {
    var re = /(?:\%([aAbBcdHIjmMpSUWwxXyYZ\%])|(.))/g;
    var parts, opts = {}, check = {}, scanner = SC.Scanner.create({string: str});
    try {
      while ((parts = re.exec(fmt)) !== null) {
        switch(parts[1]) {
          case 'a': check.dayOfWeek = scanner.scanArray(this.abbreviatedDayNames); break;
          case 'A': check.dayOfWeek = scanner.scanArray(this.dayNames); break;
          case 'b': opts.month = scanner.scanArray(this.abbreviatedMonthNames) + 1; break;
          case 'B': opts.month = scanner.scanArray(this.monthNames) + 1; break;
          case 'c': break; //TODO
          case 'd': opts.day = scanner.scanInt(2); break;
          case 'H': opts.hours = scanner.scanInt(2); break;
          case 'I': break; //TODO
          case 'j': break; //TODO
          case 'm': opts.month = scanner.scanInt(2); break;
          case 'M': opts.minutes = scanner.scanInt(2); break;
          case 'p': opts.meridian = scanner.scanArray(['AM', 'PM']); break;
          case 'S': opts.seconds = scanner.scanInt(2); break;
          case 'U': break; //TODO
          case 'W': break; //TODO
          case 'w': break; //TODO
          case 'x': break; //TODO
          case 'X': break; //TODO
          case 'y': opts.year = scanner.scanInt(2); opts.year += (opts.year > 70 ? 1900 : 2000); break;
          case 'Y': opts.year = scanner.scanInt(4); break;
          case 'Z': break; //TODO
          case '%': scanner.skipString('%'); break;
          default: scanner.skipString(parts[0]); break;
        }
      }
    } catch (e) {
      console.log('SC.DateTime.createFromString ' + e.toString());
      return null;
    }
    
    if (!SC.none(opts.meridian) && !SC.none(opts.hours)) {
      if (opts.meridian === 1) opts.hours = (opts.hours + 12) % 24;
      delete opts.meridian;
    }
    
    var d = SC.DateTime.create(opts);
    
    if (!SC.none(check.dayOfWeek) && d.get('dayOfWeek') !== check.dayOfWeek) {
      return null;
    }
    
    return d;
  },
  
  /*
    for use with bindings
    eg: SC.Binding.transform(SC.DateTime.transform('%B')).oneWay('myDate')
  */
  transform: function(format) {
    return function(value, binding) { 
      if (value.kindOf(SC.DateTime)) {
        return value ? value.toFormattedString(format) : null;
      } else if (SC.typeOf(value) === SC.T_STRING) {
        return SC.DateTime.createFromString(value, format);
      }
      return null;
    };
  }
  
});
