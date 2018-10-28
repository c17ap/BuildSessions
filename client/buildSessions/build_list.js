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
    food: function(sessionid) {
        return BuildSessions.findOne(sessionid).hasFood;
    },
    anyEating: function(sessionid) {
        return BuildSessions.findOne(sessionid).hasFood && BuildSessions.findOne(sessionid).food.length>0;
    },
    iseating: function(sessionid) {
        return _.contains(BuildSessions.findOne({_id: sessionid}).food, Meteor.userId());;
    },
    comingnotcoming: function(sessionid){
        return thisuseriscoming(sessionid)?'not-coming':'coming';
    },
    iscoming: function(sessionid) {
        return thisuseriscoming(sessionid);
    },
    isHere: function() {
      return _.contains(BuildSessions.findOne({_id: this._id}).present, Meteor.userId());
    },
    isNow: function() {
        // console.log('hello world')
        // console.log(moment())
        return this.start<moment()
    },
    success: function(sessionid) {
        return thisuseriscoming(sessionid)?'success':'';
    },
    purpose: function(sessionid, teamid) {
        p = BuildSessions.findOne({_id: sessionid, 'purpose.teamid': teamid});
        if(p) {
            return p.purpose.find(o => o.teamid===teamid).value;
        }
        else {
            return '...';
        }
    },
    purposeEnabled: function() {
        return Meteor.userId()?"false":"true";
    },
    purposeDisabledStyle: function() {
        return Meteor.userId()?"":"editable-disabled";
    },
    team: function() {
        return Teams;
    },
    supervisorWrap: function(value) {
        return value=='0'?'supervisor':value;
    },
    notZero: function(value) {
        return value!=='0';
    },
    queryuser: function(users, teamid, sessionid) {
        return Meteor.users.find({
            _id: {$in: users},
            'profile.team': teamid
        }, {
            transform: function (doc) {
                    doc.isAbsent = BuildSessions.find({_id: sessionid, present: doc._id}).count()==0
                    doc.present = doc.isAbsent?"":"present";
                    doc.sessionid = sessionid;
                    // if(!Meteor.userId()) doc.username = doc.username.replace(/[\w-]/g, 'x'); //anon if not logged in
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
           'profile.team': teamid
        }).count()> 0;
    },
    eating: function(session) {
        return Meteor.users.find({
            _id: {$in: session.food}
        });
    },
    eatingCount: function(session) {
        return Meteor.users.find({
          _id: {$in: session.food}
        }).count();
    }
});

//set up the editable purpose:
function editpurpose() {
    $('.purpose').editable({
        display: function(value, sourceData) {
            //the existence of this function avoids a duplicating bug in x-editable
        },
        success: function (response, newValue) {
            sid = this.id.split('-')[0];
            tid = this.id.split('-')[1];

            if (Meteor.userId()) {
                Meteor.call('updatePurpose', {
                    sessionid: sid,
                    teamid: tid,
                    purpose: newValue
                }, (err, res) => {
                    if (err) {
                        alert(err);
                    } else {
                        // success!
                    }
                });

                $(this).editable('setValue', newValue);
            }
        }
    });
}
    // Deps.autorun(function () {
    //     if(!Meteor.userId())
    //     {
    //         $('.purpose').editable({
    //             disabled: true
    //         });
    //         console.log('disabled');
    //     }
    //     else {
    //         $('.purpose').editable({
    //             disabled: false
    //         });
    //     }
    // });





Template.buildSessionList.rendered = function () {
    $.fn.editable.defaults.mode = 'inline';
    editpurpose()
};

Template.buildSessionList.events({
    //if you click on a person
      'click li': function() {
        if(Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            if(this.isAbsent) BuildSessions.update({_id: this.sessionid}, {$addToSet: {present: this._id}});
            else BuildSessions.update({_id: this.sessionid}, {$pull: {present: this._id}});
        }
      },

  'click .present': function(e) {
    e.preventDefault();
    BuildSessions.update({_id: this._id}, {$addToSet: {present: Meteor.userId()}});
  },
  'click .notpresent': function(e) {
    e.preventDefault();
    BuildSessions.update({_id: this._id}, {$pull: {present: Meteor.userId()}});
  },

    'click .not-coming': function(e) {
        e.preventDefault();

        //convert the startime to 24 hour time, make a duration out of that, add it to the start date.
        // var eventstart = moment(this.date.date).add(moment.duration(moment(this.starttime, ["h:mm A"]).format("HH:mm")));

        BuildSessions.update({_id: this._id}, {$pull: {attend: Meteor.userId()}});
        BuildSessions.update({_id: this._id}, {$pull: {present: Meteor.userId()}});
        BuildSessions.update({_id: this._id}, {$pull: {food: Meteor.userId()}});
    },

    'click .coming': function (e) {
        e.preventDefault();
        BuildSessions.update({_id: e.target.id}, {$addToSet: {attend: Meteor.userId()}});
    },
    'click .eating': function (e) {
        e.preventDefault();
        BuildSessions.update({_id: e.target.id}, {$addToSet: {food: Meteor.userId()}});
    },
    'click .not-eating': function(e) {
        e.preventDefault();
        BuildSessions.update({_id: this._id}, {$pull: {food: Meteor.userId()}});
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