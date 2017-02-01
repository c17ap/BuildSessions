/**
 * Created by aryavpal on 1/19/17.
 */
Template.buildSessionList.helpers({
    buildSession: function() {
        return BuildSessions.find();
    },
    comingnotcoming: function(sessionid){
       console.log(_.contains(BuildSessions.findOne({_id: sessionid}).attend, Meteor.userId()));
       return _.contains(BuildSessions.findOne({_id: sessionid}).attend, Meteor.userId())?'not-coming':'coming';

    }
});

Template.buildSessionList.events({
 //    if(session.attend.includes(e.target.Id) e.gettext == add){
 //  //  if(check(session.attend), Meteor.userId == true){

    'click .not-coming': function(e) {
        e.preventDefault();
        BuildSessions.update({_id: e.target.id}, {$pull: {attend: Meteor.userId()}});
      },

    'click .coming': function (e) {
        e.preventDefault();
        BuildSessions.update({_id: e.target.id}, {$push: {attend: Meteor.userId()}});

}
});