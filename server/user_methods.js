/**
 * Created by charlie on 1/29/17.
 */

var Botkit = require('botkit');
var request = require('request');

var controller = Botkit.slackbot({
    clientId: Meteor.settings.slack.clientID,
    clientSecret: Meteor.settings.slack.clientSecret,
    clientSigningSecret: Meteor.settings.slack.clientSigningSecret,
    scopes: ['bot'],
});

controller.on('channel_join', function (bot, message) {
    bot.reply(message, 'Hi! I\'m BuildSessions');
});

var bot = controller.spawn({
    token: Meteor.settings.slack.botUserOAuthToken
})

Meteor.setInterval(function () {
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
        if (e.eventname.length > 0) session['eventname'] = e.eventname;
        if (e.slackChannel.length > 0 && Meteor.user().profile.slackUserToken) {
            request.post("https://slack.com/api/channels.create", {
                json: {
                    name: e.slackChannel,
                    validate: false
                },
                auth: {
                    bearer: Meteor.user().profile.slackUserToken
                }
            }, Meteor.bindEnvironment((err, resp, body) => {
                session.slackId = body.channel.id
                session.slackName = body.channel.name
                if (e.food) session['food'] = [];
                BuildSessions.insert(session);
            }))
        } else {
            if (e.food) session['food'] = [];
            BuildSessions.insert(session);
        }

        // announce on slack:
        try {
            let teams = Meteor.settings.slack.channels;

            for (let i = 0; i < teams.length; i++) {
                bot.say(
                    {
                        text: `Hey, ${teams[i].teamfriendlyname}! There's a new build session ${moment(e.starttime).subtract(4, 'hours').calendar()}.${
                            session['eventname'] ? ` It's called ${session['eventname']}.` : ""
                            }`,
                        channel: teams[i].channelid // a valid slack channel, group, mpim, or im ID
                    }
                );
            }

            return true;
        } catch (e) {
            // Got a network error, timeout, or HTTP error in the 400 or 500 range.
            return false;
        }


    },
    sendAttendanceMessage: function () {
        let session = BuildSessions.findOne(
            {
                attendMessageSent: false,
                start: { $lte: moment().subtract(30, "minutes").toDate() }
            });
        if (!session) return;
        BuildSessions.update({ _id: session._id }, { $set: { attendMessageSent: true } });

        let users = _.difference(session.attend, session.present);
        for (let i = 0; i < users.length; i++) {
            let user = Meteor.users.findOne({ _id: users[i] });
            let email;
            if (user.services.google) {
                email = user.services.google.email;
            } else if (user.emails) {
                email = user.emails[0].address;
            } else {
                console.log("err: no email");
                console.log(user);
                continue;
            }

            console.log("notification email: " + email);
            Email.send({
                to: email,
                from: 'admin@buildsession.com',
                subject: 'Build Session Attendance',
                html: `
<!DOCTYPE html><html lang="en">
<body><p>Hello ${user.username},</p>
 
<p>You signed up for a build session today but are not currently listed as in attendance.</p>

<p>If you are at the build session, please <a href='http://www.buildsession.com/present/${user._id}'>click here</a> or go to buildsession.com and mark yourself here!</p>

<p>If you are not at the build session, you do not need to do anything, you have been marked absent.

<p>For build sessions, our policy is that you should mark yourself present if you are here, and you
should not be at a build session without being marked present. </p> 
</body>
</html>
             `});
        }
    },
    markPresent: function (userid) {
        BuildSessions.update(
            { start: { $lte: moment().toDate() }, end: { $gte: moment().toDate() } },
            { $addToSet: { present: userid } }
        );
    },
    removeSession: function (e) {
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

        if (loggedInUser == e.targetUserId) {
            throw new Meteor.Error(403, "Access denied: you can't change your own permissions");
        }

        if (e.hasPermission) {
            Roles.addUsersToRoles(e.targetUserId, ['admin']);
        } else {
            Roles.removeUsersFromRoles(e.targetUserId, ['admin']);
        }
    },

    setTeam: function (e) {
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

        if (e.teamid === '0') {
            Meteor.users.update({ _id: e.userid }, { $unset: { "profile.team": '' } });
        } else {
            Meteor.users.update({ _id: e.userid }, { $set: { "profile.team": e.teamid } });
        }
    },
    updatePurpose: function (e) {
        BuildSessions.update({ '_id': e.sessionid }, { $pull: { 'purpose': { 'teamid': e.teamid } } });
        BuildSessions.update({ '_id': e.sessionid }, { $push: { 'purpose': { 'teamid': e.teamid, 'value': e.purpose } } });

        try {
            let session = BuildSessions.findOne({ '_id': e.sessionid });
            let channels = Meteor.settings.slack.channels;

            for (i in channels) {
                if (channels[i].teamid == e.teamid) {
                    bot.say(
                        {
                            text: `Hey, ${channels[i].teamfriendlyname}! During the build session ${moment(session.start).subtract(4, 'hours').calendar()}, we're working on ${e.purpose}. (Updated by ${Meteor.user().username()})`,
                            channel: channels[i].channelid // a valid slack channel, group, mpim, or im ID
                        }
                    );
                }
            }
            return true;
        } catch (e) {
            // Got a network error, timeout, or HTTP error in the 400 or 500 range.
            return false;
        }
    },
    getSlackOAuthURL: function () {
        return `https://slack.com/oauth/authorize?scope=channels:write&client_id=${encodeURIComponent(Meteor.settings.slack.OAuthClientID)}&redirect_uri=${encodeURIComponent(Meteor.settings.slack.OAuthCallbackURL)}`
    },
    connectSlack: function (code) {
        request.post("https://slack.com/api/oauth.access", {
            form: {
                client_id: Meteor.settings.slack.OAuthClientID,
                client_secret: Meteor.settings.slack.OAuthClientSecret,
                code: code,
                redirect_uri: Meteor.settings.slack.OAuthCallbackURL,
            }
        }, Meteor.bindEnvironment((err, resp, body) => {
            var bodyObj = JSON.parse(body);
            var token = bodyObj.access_token;
            Meteor.users.update({ _id: Meteor.userId() }, { $set: { "profile.slackUserToken": token } })
        }));
    },
    joinSlackChannel: function (name) {
        request.post("https://slack.com/api/channels.join", {
            json: {
                name: `#${name}`,
                validate: false
            },
            auth: {
                bearer: Meteor.user().profile.slackUserToken
            },
        })
    },
    // Yes, join takes a channel name, while leave takes an ID
    leaveSlackChannel: function (id) {
        request.post("https://slack.com/api/channels.leave", {
            json: {
                channel: id,
            },
            auth: {
                bearer: Meteor.user().profile.slackUserToken
            }
        })
    }

});