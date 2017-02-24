db.getCollection('counterreports').find({})

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
    } 
},
{ 
    $group : {
        _id : { 
            year: { $year: "$timestamp_minute" } ,
            month: { $month: "$timestamp_minute" },  
            day: { $dayOfMonth: "$timestamp_minute" }, 
            hour: { $hour: "$timestamp_minute" }
        },
        count: { $sum: '$total_nums' }
    }
},
{ $sort: { _id: -1 } }
])

