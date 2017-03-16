function PipeLineBuilder() {

}

PipeLineBuilder.prototype.hour=function(){
  var d=new Date();
  var dStartTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0);
  dStartTime.setHours(dStartTime.getHours()-1);
  var dEndTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0);
  return {startTime:dStartTime,endTime:dEndTime};
}
PipeLineBuilder.prototype.hourGroupID=function(){
  return {
        minutes: { $minute: "$visitTime" },
        hour: { $hour: "$visitTime" },
        day: { $dayOfMonth: "$visitTime" }, 
        month: { $month: "$visitTime" },  
        year: { $year: "$visitTime" } 
  };
}

PipeLineBuilder.prototype.day=function(){
  var d=new Date();
  var dStartTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), 5, 0, 0);
  dStartTime.setDate(dStartTime.getDate()-1);
  var dEndTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), 5, 0, 0);
  //dEndTime.setDate(dEndTime.getDate()+2);
  return {startTime:dStartTime,endTime:dEndTime};
}
PipeLineBuilder.prototype.dayGroupID=function(){
  return {
        hour: { $hour: "$visitTime" },
        day: { $dayOfMonth: "$visitTime" }, 
        month: { $month: "$visitTime" },  
        year: { $year: "$visitTime" } 
  };
}

PipeLineBuilder.prototype.week=function(){
  var d=new Date();
  var dStartTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  dStartTime.setDate(dStartTime.getDate()-7);
  var dEndTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  return {startTime:dStartTime,endTime:dEndTime};
}
PipeLineBuilder.prototype.weekGroupID=function(){
  return {
        day: { $dayOfMonth: "$visitTime" }, 
        month: { $month: "$visitTime" },  
        year: { $year: "$visitTime" } 
  };
}

/*
  period:hour,day,week
*/
PipeLineBuilder.prototype.time = function(period,fieldName,fieldValue) {
  var range=this[period]();
  var period_id=period+"GroupID";
  var groupID=this[period_id]();

  var _pipeline={
    project:{
      "meta":1,
      "static":1,
      "visitTime": "$static.visitTime"
    },
    match:{
      "meta.state":"FINISH",
      "visitTime":{"$gte":range.startTime,"$lt":range.endTime}
    },
    group:{
      _id:groupID,
      count: { $sum: 1 }
    },
    sort:{
      _id: -1
    }
  };
  _pipeline.match[fieldName]=fieldValue;

  return _pipeline;
};

PipeLineBuilder.prototype.groupID = function(fieldName,appName) {
  var dStartTime=new Date();
  dStartTime.setDate(dStartTime.getDate()-30);
  var _fieldName='$'+fieldName;

  var _pipeline={
    project:{
      "meta":1,
      "static":1,
      "visitTime": "$static.visitTime"
    },
    match:{
      "meta.state":"FINISH",
      "visitTime":{"$gte":dStartTime}
    },
    group:{
      _id:_fieldName,
      count: { $sum: 1 }
    },
    sort:{
      _id: -1
    }
  };
  _pipeline.match["static.appName"]=appName;

  return _pipeline;
};

var builder=new PipeLineBuilder();

module.exports = builder;
