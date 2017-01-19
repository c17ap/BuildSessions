/**
 * Created by aryavpal on 1/19/17.
 */
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    waitOn: function() { return Meteor.subscribe('buildSessions'); }
});
Router.onBeforeAction('dataNotFound', {only: 'buildSessionList'});
Router.route('/', {name: 'buildSessionList'});
Router.route('/addsession', {name: 'addSession'});