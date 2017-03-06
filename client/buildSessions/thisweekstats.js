/**
 * Created by charlie on 3/2/17.
 */
Template.thisweekstats.helpers({
    notusers: function () {
        let WEEKSTART = moment().startOf('isoWeek').toDate();
        let WEEKEND = moment().endOf('isoWeek').toDate();

        return Meteor.users.find({}, {
            transform: function (doc) {
                if(typeof BuildSessions.findOne({
                        attend: doc._id,
                        start: {$gte: WEEKSTART, $lte: WEEKEND}
                    }) != 'undefined') doc.attendthisweek=true;
                else doc.attendthisweek=false;
                return doc;
            }
        });

    }
});