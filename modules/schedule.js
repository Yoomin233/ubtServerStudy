var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.second = 1;
//rule.hour = 2;

var j = schedule.scheduleJob(rule, function(){
  console.log('The answer to life, the universe, and everything!'+new Date());
});