/**
 * Created by aryavpal on 2/14/17.
 */
Template.header.helpers({
    isAdmin: function () {
        return Roles.userIsInRole(Meteor.user(), ['admin']);
    },
});