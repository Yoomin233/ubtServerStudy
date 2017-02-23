db.getCollection('counterreports').find({})

db.getCollection('counterreports').aggregate(
[
{ 
    $match: {
        "type":"ERROR",
    } 
},
{ 
    $group : {
        _id : { 
            hour: { $hour: "$timestamp_minute" },
            day: { $dayOfMonth: "$timestamp_minute" }, 
            month: { $month: "$timestamp_minute" },  
            year: { $year: "$timestamp_minute" } 
        },
        count: { $sum: '$total_nums' }
    }
},
{ $sort: { _id: -1 } }
])

