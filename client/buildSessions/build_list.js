/**
 * Created by aryavpal on 1/19/17.
 */
Template.buildSessionList.helpers({
    buildSession: function() {
        return BuildSessions.find({}, {sort: {date: 1}});
    },
    comingnotcoming: function(sessionid){
       return _.contains(BuildSessions.findOne({_id: sessionid}).attend, Meteor.userId())?'not-coming':'coming';

    },
    team: function() {
        return Teams;
    },
    queryuser: function(users, teamid) {
        console.log(users);
        console.log(teamid);
        return Meteor.users.find({
            _id: {$in: users},
            profile: {team: teamid}
        });
    },
});

Template.buildSessionList.events({
    'click .not-coming': function(e) {
        e.preventDefault();
        BuildSessions.update({_id: e.target.id}, {$pull: {attend: Meteor.userId()}});
      },

    'click .coming': function (e) {
        e.preventDefault();
        BuildSessions.update({_id: e.target.id}, {$push: {attend: Meteor.userId()}});
    },
});