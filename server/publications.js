/**
 * Created by aryavpal on 1/19/17.
 */
Meteor.publish('buildSessions', function(){
    return BuildSessions.find();
})