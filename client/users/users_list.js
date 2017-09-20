/**
 * Created by charlie on 1/29/17.
 */
Template.usersList.helpers({
    user: function() {
        return Meteor.users.find({}, {sort: {'profile.team': -1}}); //{_id: {$ne: Meteor.user()._id}}
    },
    isAdmin: function(user) {
        return Roles.userIsInRole(user, ['admin']);
    },
    revokegrant: function (user) {
        return Roles.userIsInRole(user, ['admin'])?'revoke':'grant';
    },
    isNotMe: function(user) {
        return !(user===Meteor.userId());
    }
});

Template.usersList.events({
    'click .revoke': function (e){
        e.preventDefault();

        Meteor.call('setAdmin', {
            targetUserId: e.target.id,
            hasPermission: false
        });
    },
    'click .grant': function(e) {
        e.preventDefault();

        Meteor.call('setAdmin', {
            targetUserId: e.target.id,
            hasPermission: true
        });
    }
});

Template.usersList.rendered = function () {
    $.fn.editable.defaults.mode = 'inline';

    let source = [];
    for(let i = 0; i<Teams.length; i++) {
        source.push({
            'value': Teams[i].value,
            'text': Teams[i].value + ": " +Teams[i].text
        });
    }

    source.push({
        'value': '0',
        'text': 'no team'
    });

    $('.team').editable({
        emptytext: 'No Team Assigned',
        source: source,
        display: function(value, sourceData) {
            //the existence of this function avoids a duplicating bug in x-editable
        },
        success: function (response, newValue) {
            console.log(this);
            Meteor.call('setTeam', {
               userid: this.id,
               teamid: newValue
            });
        }
    });



};