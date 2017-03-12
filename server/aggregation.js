/**
 * Created by charlie on 3/12/17.
 */
Meteor.publish("usersByWeek", function() {
    ReactiveAggregate(this, BuildSessions, [
    {
        $unwind: "$attend"
    }, {
        $group:
            {
                _id: {$week: "$start"},
                attending: { $addToSet: "$attend" }
            }
    }, {
        $project: {
            attending: '$attending'
        }
    }],
        { clientCollection: "attendReportWeekly" });
});

Meteor.publish("hoursByTeam", function() {
    ReactiveAggregate(this, BuildSessions, [
            {
                $match: {
                    start: {
                        $gte: moment().startOf('week').toDate(),
                        $lt: moment().endOf('week').toDate()
                    }
                }
            },
            {
                $unwind: "$attend"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "attend",
                    foreignField: "_id",
                    as: "user_doc"
                }
            },
            {
                $unwind: "$user_doc"
            },
            {
                $group:
                    {
                        _id: "$user_doc.profile.team",
                        totaltime: { $sum: {$subtract: ["$end", "$start"]} }
                    }
            }, {
                $project: {
                    totaltime: '$totaltime'
                }
            }

            ],
        { clientCollection: "hoursReportTeam" });
});
