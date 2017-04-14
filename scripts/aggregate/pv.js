//pv
db.getCollection('pvs').aggregate([
{
    $project: { 
        "static":1,
        "visitTime": { $add: [ "$static.visitTime", 8*60*60000 ] }
    }
},
{ 
    $match: {
        "static.title":"太极八法",
        "visitTime":{"$gte":new Date(2017,1,17),"$lt":new Date(2017,10,17)}
    } 
},
{ 
    $group : {
        _id: {
            day: { $dayOfMonth: "$visitTime" }, 
            month: { $month: "$visitTime" },  
            year: { $year: "$visitTime" } 
        },
        count: { $sum: 1 }
    }
},
{ $sort: { _id: -1 } }
]);