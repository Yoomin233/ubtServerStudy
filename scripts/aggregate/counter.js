// 实时计数类统计
db.getCollection('counterreports').aggregate(
[
{
    $project: { 
        "total_nums":1,
        "type":1,
        "timestamp_minute": { $add: [ "$timestamp_minute", 8*60*60000 ] }
    }
},
{ 
    $match: {
        "type":"ERROR",
        "timestamp_minute": {"$gte":ISODate("2017-02-27T10:12:00.000Z")}
    } 
},
{ 
    $group : {
        _id : {
            day: { $dayOfMonth: "$timestamp_minute" }, 
            month: { $month: "$timestamp_minute" },  
            year: { $year: "$timestamp_minute" } 
        },
        count: { $sum: '$total_nums' }
    }
},
{ $sort: { _id: -1 } }
])