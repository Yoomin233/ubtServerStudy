//页面转化率, PageA --> PageB 公式PageB来源(pageA)/PageA总量

// PageA总量
db.getCollection('pvs').find({
    "pvID":"pageA",
    "visitTime":{"$gte":ISODate("2017-02-1T10:12:00.000Z"),"$lt":ISODate("2017-02-27T10:12:00.000Z")}
 }).count()
 
// PageB来源
db.getCollection('pvs').aggregate([
{
    $project: { 
        "pvId":1,
        "prePV":1,
        "visitTime": { $add: [ "$visitTime", 8*60*60000 ] }
    }
},
{ 
    $match: {
        "pvId":"PageB",
        "visitTime":{"$gte":ISODate("2017-02-1T10:12:00.000Z"),"$lt":ISODate("2017-02-27T10:12:00.000Z")}
    } 
},
{ 
    $group : {
        _id: "$prePV"
    }
},
{ $sort: { _id: -1 } }
]);