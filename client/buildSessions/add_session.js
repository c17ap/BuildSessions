/**
 * Created by aryavpal on 1/19/17.
 */
Template.addSession.events({
    'submit form': function(e) {
        e.preventDefault();

        var session = {
            starttime: $('#starttime').val(),
            length: $('#length').val(),
            attend: []
        };

        BuildSessions.insert(session);
    }
});

Template.addSession.onRendered(function() {
   this.$('#datetimepicker').datetimepicker();
});