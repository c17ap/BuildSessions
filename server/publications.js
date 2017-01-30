/**
 * Created by aryavpal on 1/19/17.
 */
Meteor.publish('buildSessions', function(){
    return BuildSessions.find();
});
// // in server/publish.js
Meteor.publish(null, function (){
    return Meteor.roles.find();
})
Meteor.publish(null, function() {
    return Meteor.users.find();
});