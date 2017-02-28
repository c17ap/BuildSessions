/**
 * Created by charlie on 1/29/17.
 */
Meteor.methods({
    /**
     * add a build session
     *
     * @method addSession
     * @param {String} startime the time for the build session to start
     * @param {String} length the amount of time the build session lasts
     */
    addSession: function (e) {
        var loggedInUser = Meteor.user()

        //logged in user must be admin
        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser,
                ['admin'])) {
            throw new Meteor.Error(403, "Access denied")
        }

        var start = moment(e.date).add(
            moment.duration(moment(e.starttime, ["h:mm A"]).format("HH:mm")));

        var end = moment(e.date).add(
            moment.duration(moment(e.endtime, ["h:mm A"]).format("HH:mm")));

        //make a build session object:
        var session = {
            start: start._d,
            end: end._d,
            locktime: e.locktime,
            createdBy: loggedInUser,
            attend: []
        };

        BuildSessions.insert(session);
    },
    removeSession: function(e) {
        var loggedInUser = Meteor.user()

        //logged in user must be admin
        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser,
                ['admin'])) {
            throw new Meteor.Error(403, "Access denied")
        }

        BuildSessions.remove(e.sessionId);
    },

    setAdmin: function (e) {
        var loggedInUser = Meteor.user();

        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser,
                ['admin'])) {
            throw new Meteor.Error(403, "Access denied: you must be logged in as an admin")
        }

        if(loggedInUser==e.targetUserId) {
            throw new Meteor.Error(403, "Access denied: you can't change your own permissions");
        }

        if(e.hasPermission) {
            Roles.addUsersToRoles(e.targetUserId, ['admin']);
        } else {
            Roles.removeUsersFromRoles(e.targetUserId, ['admin']);
        }
    }

});