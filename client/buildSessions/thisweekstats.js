/**
 * Created by charlie on 3/2/17.
 */
Template.thisweekstats.helpers({
    notusers: function (teamid) {
        return Meteor.users.find(
            {_id: {$nin: attendReportWeekly.findOne({_id: moment().week()}).attending},
                profile: {team: teamid}});
    },
    teams: function() {
        return Teams;
    }
});