/**
 * Created by aryavpal on 1/19/17.
 */
Template.addSession.events({
    'submit form': function(e) {
        e.preventDefault();

        Meteor.call('addSession', {
            starttime: $('#starttime').val(),
            length: $('#length').val()
        }, (err, res) => {
            if (err) {
                alert(err);
            } else {
                // success!
            }
        });
    }
});

Template.addSession.onRendered(function() {
   this.$('#datetimepicker').datetimepicker();
});