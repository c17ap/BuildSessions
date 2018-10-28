Template.session.helpers({
    session: function() {
      let d = BuildSessions.findOne({_id: Router.current().params.sessionid}).start

      return  BuildSessions.find(
          {start:
            {
              $gte: new Date(d.setHours(0, 0, 0)),
              $lt: new Date(d.setHours(23, 59, 59))
            }
          },
          {sort: { start : 1 } })
    },
    team: function() {
      return Teams;
    },
  food: function(sessionid) {
    return BuildSessions.findOne(sessionid).hasFood;
  },
  anybodycoming: function(session, teamid) {

    //give all the users attending
    return Meteor.users.find({
      _id: {$in: session.attend},
      profile: {team: teamid}
    }).count()> 0;
  },
  eating: function(session) {
    return Meteor.users.find({
        _id: {$in: session.food}
      }
      // , {
      // transform: function (doc) {
      //     if(!Meteor.userId()) doc.username = doc.username.replace(/[\w-]/g, 'x'); //anon if not logged in
      //     return doc;
      // }
      // }
    );
  },
  queryuser: function(users, teamid, sessionid) {
    return Meteor.users.find({
        _id: {$in: users},
        profile: {team: teamid}
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
  purpose: function(sessionid, teamid) {
    p = BuildSessions.findOne({_id: sessionid, 'purpose.teamid': teamid});
    if(p) {
      return p.purpose.find(o => o.teamid===teamid).value;
    }
    else {
      return '...';
    }
  },
});


//           {{dateMoment session.start}}
//<small>{{durationMoment session.start session.end}}</small>

