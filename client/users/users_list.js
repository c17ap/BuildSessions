/**
 * Created by charlie on 1/29/17.
 */
Template.usersList.helpers({
    user: function() {
        return Meteor.users.find(); //{_id: {$ne: Meteor.user()._id}}
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
})