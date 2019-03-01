/**
 * Created by aryavpal on 1/19/17.
 */
Meteor.publish('buildSessions', function () {
    return BuildSessions.find();
});
// // in server/publish.js
Meteor.publish(null, function () {
    return Meteor.roles.find();
});

Meteor.publishTransformed(null, function () {
    let cursor = Meteor.users.find({}, {
        fields: {
            username: 1,
            profile: 1,
            roles: 1
        }
    });

    //if logged in, make the username x-ed out
    if (!this.userId) {
        cursor.serverTransform(function (doc) {
            doc.username = doc.username.replace(/[\w-]/g, 'x');
            return doc;
        });
    }
    return cursor;

});

