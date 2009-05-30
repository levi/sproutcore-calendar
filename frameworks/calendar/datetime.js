// ==========================================================================
// Project:   DateTime
// Copyright: ©2009 Martin Ottenwaelter
// ==========================================================================
/*globals SC */

/** @class

  A Scanner reads a string and interprets the characters into numbers. You
  assign the scanner's string on initialization and the scanner progresses
  through the characters of that string from beginning to end as you request
  items.
  
  Scanners are used by DateTime to convert strings into DateTime objects.
  
  @extends SC.Object
  @author Martin Ottenwaelter
*/

SC.SCANNER_OUT_OF_BOUNDS_ERROR = new Error("Out of bounds.");
SC.SCANNER_INT_ERROR = new Error("Not an int.");
SC.SCANNER_SKIP_ERROR = new Error("Did not find the string to skip.");
SC.SCANNER_SCAN_ARRAY_ERROR = new Error("Did not find any string of the given array to scan.");

SC.Scanner = SC.Object.extend(
/** @scope SC.Scanner.prototype */ {
  
  /**
    The string to scan. You usually pass it to the create method:
    
    {{{
      SC.Scanner.create({string: 'May, 8th'});
    }}}
    
    @property
    @type {String}
  */
  string: null,
  
  /**
    The current scan location. It is incremented by the scanner as the
    characters are processed.
    The default is 0: the beginning of the string.
    
    @property
    @type {integer}
  */
  scanLocation: 0,
  
  /**
    Reads some characters from the string, and increments the scan location
    accordingly. 
    
    @param {integer} len the amount of characters to read
    @throws {SC.SCANNER_OUT_OF_BOUNDS_ERROR} if asked to read too many characters
    @returns {String} the characters
  */
  scan: function(len) {
    if (this.scanLocation + len > this.length) throw SC.SCANNER_OUT_OF_BOUNDS_ERROR;
    var str = this.string.substr(this.scanLocation, len);
    this.scanLocation += len;
    return str;
  },
  
  /**
    Reads some characters from the string and interprets it as an integer.
    
    @param {integer} len the amount of characters to read
    @throws {SC.SCANNER_INT_ERROR} if asked to read non numeric characters
    @returns {integer} the scanned integer
  */
  scanInt: function(len) {
    var str = this.scan(len);
    var re = new RegExp("\\d{"+len+"}");
    if (!str.match(re)) throw SC.SCANNER_INT_ERROR;
    return parseInt(str, 10);
  },
  
  /**
    Attempts to skip a given string
    
    @param {String} str the string to skip
    @throws {SC.SCANNER_SKIP_ERROR} if the given string could not be scanned
    @returns {Boolean} YES if the given string was successfully scanned
  */
  skipString: function(str) {
    if (this.scan(str.length) !== str) throw SC.SCANNER_SKIP_ERROR;
    return YES;
  },
  
  /**
    Attempts to scan any string in a given array.
    
    @param {Array} ary the array of strings to scan
    @throws {SC.SCANNER_SCAN_ARRAY_ERROR} if no string of the given array is found
    @returns {integer} the index of the scanned string of the given array
  */
  scanArray: function(ary) {
    for (var i = 0, len = ary.length; i < len; i++) {
      if (this.scan(ary[i].length) === ary[i]) {
        return i;
      }
      this.scanLocation -= ary[i].length;
    }
    throw SC.SCANNER_SCAN_ARRAY_ERROR;
  }
  
});

/** @class

  A class representation of a date and time. It's basically a wrapper around
  the Date javascript object, KVO friendly and with common date/time
  manipulation methods.
  
  @extends SC.Object
  @extends SC.Freezable
  @extends SC.Copyable
  @author Martin Ottenwaelter
*/
SC.DateTime = SC.Object.extend(SC.Freezable, SC.Copyable, {
  
  /**
    The underlying JavaScript Date object.
    
    @property
    @type {Date}
  */
  date: null,
  
  /**
    The init method, called on creation. Without any parameters, the create
    method returns a DateTime object set to the current date and time:
    {{{
      var now = SC.DateTime.create();
    }}}
    
    You can pass a hash parameter to create a specific date:
    {{{
      var birthday = SC.DateTime.create({year: 1985, month: 5, day: 8});
    }}}
    
    You can also pass a JavaScript Date object:
    {{{
      var dateFromJSDate = SC.DateTime.create({date: aJSDate});
    }}}
    
    @returns {DateTime} the DateTime object initialized with the create options
  */
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
  
  /**
    Returns a copy of the receiver, as defined in the SC.Copyable mixin.
    
    @returns {DateTime} copy of receiver
  */
  copy: function() {
    var d = new Date();
    d.setTime(this.get('date').getTime());
    return SC.DateTime.create({date: d});
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
  
  _change: function(options) {
    var opts = SC.clone(options);
    
    if (!SC.none(options.hours) && SC.none(options.minutes)) opts.minutes = 0;
    if ((!SC.none(options.hours) || !SC.none(options.minutes)) && SC.none(options.seconds)) opts.seconds = 0;
    if ((!SC.none(options.hours) || !SC.none(options.minutes) || !SC.none(options.seconds)) && SC.none(options.milliseconds)) opts.milliseconds = 0;
    
    return this._rawChange(opts);
  },
  
  /**
    Returns a new DateTime object where one or more of the elements have been
    changed according to the options parameter. The time options (hour,
    minute, sec, usec) reset cascadingly, so if only the hour is passed, then
    minute, sec, and usec is set to 0. If the hour and minute is passed, then
    sec and usec is set to 0. (Copied from the Ruby On Rails documentation)
    
    @returns {DateTime} copy of receiver
  */
  change: function(options) {
    return this.copy()._change(options);
  },

  /**
    Is the receiver's current year a leap year?
    
    @returns {Boolean}
  */
  isLeapYear: function() {
    var y = this.get('year');
    return (y%4 === 0 && y%100 !== 0) || y%400 === 0;
  }.property(),
  
  /**
    The amount of days of the month of the receiver. Takes into account
    leap years for February.
    
    @returns {integer} the amount of days in the current month
  */
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

  /**
    Generic setter and getter.
    
    The properties you can get are:
      - year
      - month (January is 1, contrary to JavaScript Dates for which January is 0)
      - day
      - dayOfWeek (Sunday is 0)
      - hours
      - minutes
      - seconds
      - milliseconds
      
    The properties you can set are:
      - year
      - month (January is 1, contrary to JavaScript Dates for which January is 0)
      - day
      - hours
      - minutes
      - seconds
      - milliseconds
  */
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
    this._rawChange({hours: 0, minutes: 0, seconds: 0, milliseconds: 0});
    
    return this;
  },
  
  /**
    Returns a new DateTime object representing the beginning of the week,
    which is Monday, 0:00.
    
    @returns {integer} the amount of days in the current month
  */
  beginning_of_week: function() {
    return this.copy()._beginning_of_week();
  },
  
  _advance: function(options) {
    var o = SC.clone(options);
    for (var key in o) o[key] += this.get(key);
    return this._change(o);
  },
  
  /**
    Returns a new DateTime object advanced according the the given parameters.
    Don't use floating point values, it might give unpredicatble results.
    
    @param {Hash} options the amount of date/time to advance the receiver
    @returns {DateTime} the amount of days in the current month
  */
  advance: function(options) {
    return this.copy()._advance(options);
  },
  
  toString: function() {
    return this.get('date').toString();
  },
  
  pad: function(x) { return (x<0||x>9 ? '' : '0') + x; },
  
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
  
  /**
    Formats the receiver according to the given format string. Should behave
    like the C strftime function.
  
    The format parameter can contain the following characters:
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
    
    @param {String} format the format string
    @return {String} the formatted string
  */
  toFormattedString: function(format) {
    var that = this;
    return format.replace(/\%([aAbBcdHIjmMpSUWwxXyYZ\%])/g, function() { return that._toFormattedString.call(that, arguments); } );
  },
  
  /**
    Compares the receiver with the given parameter. It will tell you which one
    is greater than the other by returning:
      -1 if the first is smaller than the second,
       0 if both are equal,
       1 if the first is greater than the second.
    
    @param {DateTime} dt the DateTime to compare to
    @returns {integer} the result of the comparison
  */
  compare: function(dt) {
    var t1 = this.get('date').getTime();
    var t2 = dt.get('date').getTime();
    return t1 < t2 ? -1 : t1 === t2 ? 0 : 1;
  },
  
  /**
    Compares the receiver with the given parameter, but only compares the
    date part of the DateTime.
    
    @see #compare
    @param {DateTime} dt the DateTime to compare to
    @returns {integer} the result of the comparison
  */
  compareDate: function(dt) {
    var t1 = [this.get('year'), this.get('month'), this.get('day')];
    var t2 = [dt.get('year'), dt.get('month'), dt.get('day')];
    return SC.compare(t1, t2);
  },
  
  /**
    Compares the receiver with the given parameter, but only compares the
    time part of the DateTime.
    
    @see #compare
    @param {DateTime} dt the DateTime to compare to
    @returns {integer} the result of the comparison
  */
  compareTime: function(dt) {
    var t1 = [this.get('hours'), this.get('minutes'), this.get('seconds'), this.get('milliseconds')];
    var t2 = [dt.get('hours'), dt.get('minutes'), dt.get('seconds'), dt.get('milliseconds')];
    return SC.compare(t1, t2);
  },
  
  /**
    Returns a boolean value indicating whether the receiver's date part is
    equal to the current date.
    
    @returns {Boolean}
  */
  isToday: function() {
    return this.compareDate(SC.DateTime.create()) === 0;
  }
  
});

// Class Methods
SC.DateTime.mixin(
  /** @scope SC.DateTime */{
  
  /**
    The localized day names.

    @property
    @type {Array}
  */
  dayNames:'_SC.DateTime.dayNames'.loc().w(),
  
  /**
    The localized abbreviated day names.

    @property
    @type {Array}
  */
  abbreviatedDayNames: '_SC.DateTime.abbreviatedDayNames'.loc().w(),
  
  /**
    The localized month names.

    @property
    @type {Array}
  */
  monthNames: '_SC.DateTime.monthNames'.loc().w(),
  
  /**
    The localized abbreviated month names.

    @property
    @type {Array}
  */
  abbreviatedMonthNames: '_SC.DateTime.abbreviatedMonthNames'.loc().w(),
  
  /**
    Returns a DateTime object created from a given string parsed with a given
    format. Returns null if the parsing fails.

    @param {String} str the string to parse
    @param {String} fmt the format to parse the string with
    @returns {DateTime} the DateTime corresponding to the string parameter
  */
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
  
  /**
    Returns a bindings-ready transform method to display a DateTime object.
    {{{
      SC.Binding.transform(SC.DateTime.transform('%M:%H')).oneWay('myDate')
    }}}

    @param {String} format the format to use to format or parse the string
    @returns {Function} the binding-ready transform 
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
