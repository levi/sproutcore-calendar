// ==========================================================================
// Project:   Calendar Unit Test
// Copyright: ©2009 Martin Ottenwaelter
// ==========================================================================
/*globals Calendar module test ok equals same stop start */

module('Time');

var testHash = {year: 1985, month: 5, day: 8, hours: 1, minutes: 0, seconds: 22, milliseconds: 925};

function timeShouldBeEqualToHash(t, h) {
  if (h === undefined) h = testHash;
  
  equals(t.get('year'), h.year);
  equals(t.get('month'), h.month);
  equals(t.get('day'), h.day);
  equals(t.get('hours'), h.hours);
  equals(t.get('minutes'), h.minutes);
  equals(t.get('seconds'), h.seconds);
  equals(t.get('milliseconds'), h.milliseconds);
}

test('Setters and Getters', function() {
  var t;
  
  t = SC.Time.create(testHash);
  timeShouldBeEqualToHash(t);

  t = SC.Time.create().change(testHash);
  timeShouldBeEqualToHash(t);
  
  t = SC.Time.create();
  t.set('year', 1985);
  t.set('month', 5);
  t.set('day', 8);
  t.set('hours', 1);
  t.set('minutes', 0);
  t.set('seconds', 22);
  t.set('milliseconds', 925);
  timeShouldBeEqualToHash(t);
  
});

test('Advance', function() {
  var t = SC.Time.create(testHash);
  t._advance({year: 1, month: 1, day: 1, hours: 1, minutes: 1, seconds: 1, milliseconds: 1});
  timeShouldBeEqualToHash(t, {year: 1986, month: 6, day: 9, hours: 2, minutes: 1, seconds: 23, milliseconds: 926});
});

test('Beginning of week', function() {
  var t = SC.Time.create(testHash);
  t._beginning_of_week();
  timeShouldBeEqualToHash(t, {year: 1985, month: 5, day: 6, hours: 0, minutes: 0, seconds: 0, milliseconds: 0});
});

test('Format', function() {
  var t = SC.Time.create(testHash);
  equals(
    t.toFormattedString('%a %A %b %B %d %H %I %m %M %p %S %w %y %Y %%a'),
    'Wed Wednesday May May 08 01 01 05 00 AM 22 3 85 1985 %a');
});