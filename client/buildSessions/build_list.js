/**
 * Created by aryavpal on 1/19/17.
 */

var thisuseriscoming = function (sessionid) {
    return _.contains(BuildSessions.findOne({_id: sessionid}).attend, Meteor.userId());
};

Template.buildSessionList.helpers({
    buildSession: function() {
        return BuildSessions.find();
    },
    dateMoment: function(date, st, et) {
        return moment(date).format('dddd M/D');
    },
    durationMoment: function(st, et) {
        return moment.duration(et).subtract(moment.duration(st)).humanize();
    },
    comingnotcoming: function(sessionid){
        return thisuseriscoming(sessionid)?'not-coming':'coming';
    },
    success: function(sessionid) {
        return thisuseriscoming(sessionid)?'success':'';
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