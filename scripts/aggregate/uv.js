//uv
db.getCollection('pvs').aggregate([
{
    $project: { 
        "pvId":1,
        "uid":1,
        "visitTime": { $add: [ "$visitTime", 8*60*60000 ] }
    }
},
{ 
    $match: {
        "pvId":"xxx",
        "uid":{"$ne" : ""},
        "visitTime":{"$gte":ISODate("2017-02-1T10:12:00.000Z"),"$lt":ISODate("2017-02-27T10:12:00.000Z")}
    } 
},
{ 
    $group : {
        _id: {
            day: { $dayOfMonth: "$visitTime" }, 
            month: { $month: "$visitTime" },  
            year: { $year: "$visitTime" } 
        },
        "uid": "$uid"
    }
},
{ 
    $group : {
        _id: "$_id",
        uv: { $sum: 1 }
    }
},
{ $sort: { _id: -1 } }
]);

db.getCollection('pvs').aggregate([
{
    $project: { 
        "pvId":1,
        "uid":1,
        "deviceid":1,
        "visitTime": { $add: [ "$visitTime", 8*60*60000 ] }
    }
},
{ 
    $match: {
        "pvId":"xxx",
        "uid":{"$eq" : ""},
        "deviceid":{"$ne" : ""},
        "visitTime":{"$gte":ISODate("2017-02-1T10:12:00.000Z"),"$lt":ISODate("2017-02-27T10:12:00.000Z")}
    } 
},
{ 
    $group : {
        _id: {
            day: { $dayOfMonth: "$visitTime" }, 
            month: { $month: "$visitTime" },  
            year: { $year: "$visitTime" } 
        },
        "deviceid": "$deviceid"
    }
},
{ 
    $group : {
        _id: "$_id",
        uv: { $sum: 1 }
    }
},
{ $sort: { _id: -1 } }
]);
