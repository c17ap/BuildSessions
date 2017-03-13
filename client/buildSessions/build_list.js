/**
 * Created by aryavpal on 1/19/17.
 */

var thisuseriscoming = function (sessionid) {
    return _.contains(BuildSessions.findOne({_id: sessionid}).attend, Meteor.userId());
};

Template.buildSessionList.helpers({
    buildSession: function() {
        return BuildSessions.find(
            {end: {$gte: moment().toDate()}},
            {sort: { start : 1 } });
    },
    isAdmin: function() {
        return Roles.userIsInRole(Meteor.userId(), ['admin']);
    },
    dateMoment: function(start) {
        return moment(start).format('dddd M/D @ h:mm');
    },
    durationMoment: function(start, end) {
        return moment(end).to(moment(start), true);
    },
    comingnotcoming: function(sessionid){
        return thisuseriscoming(sessionid)?'not-coming':'coming';
    },
    iscoming: function(sessionid) {
        return thisuseriscoming(sessionid);
    },
    success: function(sessionid) {
        return thisuseriscoming(sessionid)?'success':'';
    },
    team: function() {
        return Teams;
    },
    queryuser: function(users, teamid, sessionid) {
        return Meteor.users.find({
            _id: {$in: users},
            profile: {team: teamid}
        }, {
            transform: function (doc) {
                    doc.isAbsent = BuildSessions.find({_id: sessionid, absent: doc._id}).count()>0
                    doc.absent = doc.isAbsent?"absent":"";
                    doc.sessionid = sessionid;
                    return doc;
                }
            }
        );
    },
    anybodycoming: function(users, teamid) {
        return Meteor.users.find({
            _id: {$in: users},
            profile: {team: teamid}
        }).count()> 0;
    },
    lockMoment: function() {
        l = moment(this.start).subtract(this.locktime, 'hours')
        if(l.isBefore(moment())) return "attendance locked"
        else return "locked " + l.fromNow();
    }
});

Template.buildSessionList.events({

    //if you click on a person
    'click li': function() {
        if(Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            if(this.isAbsent) BuildSessions.update({_id: this.sessionid}, {$pull: {absent: this._id}});
            else BuildSessions.update({_id: this.sessionid}, {$addToSet: {absent: this._id}});
        }
    },
    'click .not-coming': function(e) {
        e.preventDefault();

        //convert the startime to 24 hour time, make a duration out of that, add it to the start date.
        // var eventstart = moment(this.date.date).add(moment.duration(moment(this.starttime, ["h:mm A"]).format("HH:mm")));

        if(moment(this.start).diff(moment(), 'hours')<this.locktime) {//if it is too late
            Meteor.call('setTardy', this._id);
        } else {
            Meteor.call('removeAttend', this._id);
        }
      },

    'click .coming': function (e) {
        e.preventDefault();
        Meteor.call('attendBuild', this._id);
    },
    'click .delete': function(e) {
        e.preventDefault();

        var sessionId = this._id;

        new Confirmation({
            message: "Are you sure you want to delete this build session?",
            title: "Confirmation",
            cancelText: "Cancel",
            okText: "Ok",
            success: true, // whether the button should be green or red
            focus: "cancel" // which button to autofocus, "cancel" (default) or "ok", or "none"
        }, function (ok) {
            if(ok) {

                Meteor.call('removeSession', {
                    sessionId: sessionId
                }, (err, res) => {
                    if (err) {
                        alert(err);
                    } else {
                        // success!
                    }
                });
            }
        });
    }
});
