//os 
db.getCollection('pvs').aggregate([
{
    $project: { 
        "userAgent":1
        "visitTime": { $add: [ "$visitTime", 8*60*60000 ] }
    }
},
{ 
    $match: {
        "visitTime":{"$gte":ISODate("2017-02-1T10:12:00.000Z"),"$lt":ISODate("2017-02-27T10:12:00.000Z")}
    } 
},
{ 
    $group : {
        _id: "$userAgent.os.name",
        count: { $sum: 1 }
    }
},
{ $sort: { _id: -1 } }
]);

//browser
db.getCollection('pvs').aggregate([
{
    $project: { 
        "userAgent":1
        "visitTime": { $add: [ "$visitTime", 8*60*60000 ] }
    }
},
{ 
    $match: {
        "visitTime":{"$gte":ISODate("2017-02-1T10:12:00.000Z"),"$lt":ISODate("2017-02-27T10:12:00.000Z")}
    } 
},
{ 
    $group : {
        _id: "$userAgent.browser.name",
        count: { $sum: 1 }
    }
},
{ $sort: { _id: -1 } }
]);