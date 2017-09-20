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
            attend: [],
            hasFood: e.food,
            purpose: []
        };
        if(e.food)  session['food'] = [];

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

    setTeam: function(e) {
        let loggedInUser = Meteor.user();

        // //if this is a user changing
        // if(Meteor.userId()==e.userid) {
        //     Meteor.users.update({_id: e.userid}, {$set: {"profile.team": e.teamid}});
        // }

        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser,
                ['admin'])) {
            throw new Meteor.Error(403, "Access denied: you must be logged in as an admin")
        }

        if(e.teamid==='0') {
            Meteor.users.update({_id: e.userid}, {$unset: {"profile.team": ''}});
        } else {
            Meteor.users.update({_id: e.userid}, {$set: {"profile.team": e.teamid}});
        }
    },
    updatePurpose: function(e) {
        BuildSessions.update({'_id': e.sessionid}, {$pull: {'purpose': {'teamid': e.teamid}}});
        BuildSessions.update({'_id': e.sessionid}, {$push: {'purpose': {'teamid': e.teamid, 'value': e.purpose}}});

        try {
            let session = BuildSessions.findOne({'_id': e.sessionid});
            let hooks = Meteor.settings.slack.webhooks;

            const result = HTTP.call('POST', hooks.filter(hook => hook.teamid===e.teamid)[0].URL, {
                data: { "text": moment(session.start).calendar() + " we're working on " + e.purpose}
            });
            return true;
        } catch (e) {
            // Got a network error, timeout, or HTTP error in the 400 or 500 range.
            return false;
        }
    }


});