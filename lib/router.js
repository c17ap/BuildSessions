/**
 * Created by aryavpal on 1/19/17.
 */
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    waitOn: function() { return [
        Meteor.subscribe('buildSessions'),
        Meteor.subscribe('usersByWeek'),
        Meteor.subscribe('hoursByTeam')
    ]; }
});
Router.onBeforeAction('dataNotFound', {only: 'buildSessionList'});
Router.route('/', {name: 'buildSessionList'});
Router.route('/addsession', {name: 'addSession'});
Router.route('/users', {name: 'usersList'});
Router.route('/attendance', {name: 'attendReport'});
Router.route('/profile', {name: 'profile'});
Router.route('/session/:sessionid', {name: 'session'});
Router.route('/present/:uid', function () {
  Meteor.call('markPresent', this.params.uid);
  this.render('buildSessionList');
});

//routes that require login:
var requireLogin = function() {
    if(!Meteor.user()) {
        if(Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    }
    else {
        this.next();
    }
}
Router.onBeforeAction(requireLogin, {only: ['profile', 'session']});

//routes that require admin:
var requireAdmin = function() {
    if(!Meteor.user()) {
        if(Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        if (Roles.userIsInRole(Meteor.user(), ['admin'])) {
            this.next();
        }
        else {
            this.render('accessDenied');
        }
    }
};
Router.onBeforeAction(requireAdmin, {only: ['usersList', 'addSession', 'attendReport']});
