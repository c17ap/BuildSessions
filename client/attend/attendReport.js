/**
 * Created by student on 2/2/17.
 */
Template.attendReport.helpers({
    usersAttend: function (sdate, edate) {
        return Meteor.users.find({}, {
            transform: function (doc) {
                doc.sessions = [];
                BuildSessions.find({attend: doc._id}).forEach(function(s) {
                    doc.sessions.push(moment(s.date.date).format('dddd'));
                });
                doc.count = doc.sessions.length;
                return doc;
            },
            sort: {count: 1}
        });
    },
    noattend: function(count) {
        return count==0?'danger':'';
    }
});