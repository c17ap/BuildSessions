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
    purpose: function(sessionid, teamid) {
        p = BuildSessions.findOne({_id: sessionid, 'purpose.teamid': teamid});
        if(p) {
            return p.purpose.find(o => o.teamid==='4174').value;
        }
        else {
            return '...';
        }
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
    anybodycoming: function(session, teamid) {
        editpurpose()

        //give all the users attending
        return Meteor.users.find({
            _id: {$in: session.attend},
            profile: {team: teamid}
        }).count()> 0;
    },
    lockMoment: function() {
        l = moment(this.start).subtract(this.locktime, 'hours')
        if(l.isBefore(moment())) return "attendance locked"
        else return "locked " + l.fromNow();
    }
});

//set up the editable purpose:
function editpurpose() {
    $('.purpose').editable({
        success: function (response, newValue) {
            sid = this.id.split('-')[0];
            tid = this.id.split('-')[1];

            console.log(tid);
            BuildSessions.update({'_id': sid}, {$pull: {'purpose': {'teamid': tid}}});
            BuildSessions.update({'_id': sid}, {$push: {'purpose': {'teamid': tid, 'value': newValue}}});
        }
    });
}

Template.buildSessionList.rendered = function () {
    $.fn.editable.defaults.mode = 'inline';
    editpurpose()
};

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
            BuildSessions.update({_id: this._id}, {$addToSet: {absent: Meteor.userId()}});
        } else {
            BuildSessions.update({_id: this._id}, {$pull: {attend: Meteor.userId()}});
        }
      },

    'click .coming': function (e) {
        e.preventDefault();
        BuildSessions.update({_id: e.target.id}, {$addToSet: {attend: Meteor.userId()}});
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