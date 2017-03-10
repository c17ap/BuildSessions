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

        //make a build session object:
        var session = {
            start: e.starttime,
            end: e.endtime,
            locktime: e.locktime,
            createdBy: Meteor.userId(),
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
    },
    attendBuild: function(e) {
        BuildSessions.update({_id: e}, {$addtoset: {attend: Meteor.userId()}});
    },
    removeAttend: function(e) {
        BuildSessions.update({_id: e}, {$pull: {attend: Meteor.userId()}});
    },
    setTardy: function(e) {
        BuildSessions.update({_id: e}, {$addToSet: {absent: Meteor.userId()}});
    }
});
