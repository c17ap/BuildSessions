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
    },
    totalHours: function(teamid) {
        let teamhours = hoursReportTeam.findOne({_id: teamid});
        if(teamhours) return moment.duration(teamhours.totaltime).hours();
        else return "0";
    }
});