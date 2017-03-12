/**
 * Created by charlie on 3/12/17.
 */
Meteor.publish("usersByWeek", function() {
// Remember, ReactiveAggregate doesn't return anything
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

