/**
 * Created by charlie on 1/29/17.
 */

Meteor.setInterval(function() {
    Meteor.call('sendAttendanceMessage');
}, 60000); // every 60000=1 minutes run
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
            createdBy: Meteor.userId(),
            attend: [],
            present: [],
            hasFood: e.food,
            purpose: [],
            attendMessageSent: false,
        };
        if(e.eventname.length>0) session['eventname'] = e.eventname;
        if(e.food)  session['food'] = [];

        BuildSessions.insert(session);

        // announce on slack:
        try {
            let hooks = Meteor.settings.slack.webhooks;

            for(let i = 0; i<hooks.length; i++) {
                const result = HTTP.call('POST', hooks[i].URL, {
                        data: { "text": (e.eventname.length>0?e.eventname:"A new build session")
                            + " has been added "
                            + moment(e.starttime).subtract(4, 'hours').calendar()} //shim for timezone on server....

                            // + moment.tz(e.starttime, "America/New_York").calendar()}
                    });
            }

            return true;
        } catch (e) {
            // Got a network error, timeout, or HTTP error in the 400 or 500 range.
            return false;
        }


    },
    sendAttendanceMessage: function() {
        let session = BuildSessions.findOne(
          {
            attendMessageSent: false,
            start: {$lte: moment().subtract(30, "minutes").toDate()}
          });
        if(!session) return;
        BuildSessions.update({_id:session._id}, {$set: {attendMessageSent: true}});

        let users = _.difference(session.attend, session.present);
        for(let i =0; i<users.length; i++) {
           let user = Meteor.users.findOne({_id: users[i]});
           if(!user.services.google) continue;
           console.log(user.services.google.email);
           Email.send({
             email: user.services.google.email,
             from: 'admin@buildsession.com',
             subject: 'Build Session Attendance',
             html: `
Hello ${user.username}, 
 
You signed up for a build session today but are not currently listed as in attendance.

If you are at the build session, please <a href="http://www.buildsession.com/present/${user._id}>click here</a> or go to buildsession.com and mark yourself here!

If you are not at the build session, you do not need to do anything, you have been marked absent.

For build sessions, our policy is that you should mark yourself present if you are here, and you
should not be at a build session without being marked present.  
             `});
        }
    },
    markPresent: function(userid) {
        BuildSessions.update(
          {start: {$lte: moment().toDate()}, end: {$gte: moment().toDate()}},
          {$addToSet: {present: userid}}
          );
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
                data: { "text": moment(session.start).subtract(4, 'hours').calendar() + //shim for timezone on server
                " we're working on " + e.purpose
                + " _(updated by " + Meteor.user().username + ")_"}
            });
            return true;
        } catch (e) {
            // Got a network error, timeout, or HTTP error in the 400 or 500 range.
            return false;
        }
    }


});