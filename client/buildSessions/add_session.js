/**
 * Created by aryavpal on 1/19/17.
 */
Template.addSession.events({
    'submit form': function(e) {
        e.preventDefault();

        Meteor.call('addSession', {
            date: $('#datepicker').data(),
            starttime: $('#starttimepicker').data().date,
            endtime: $('#endtimepicker').data().date
        }, (err, res) => {
            if (err) {
                alert(err);
            } else {
                // success!
            }
        });

        Router.go('buildSessionList');
    }
});

Template.addSession.onRendered(function() {
    this.$('#datepicker').datetimepicker({
        format: 'LL',
        allowInputToggle: true,
        inline: true,
        defaultDate: moment()
    });
    this.$('#starttimepicker').datetimepicker({
        format: 'LT',
        allowInputToggle: true,
        inline: true,
        defaultDate: moment().hours(15).minutes(30).seconds(0)
    });
    this.$('#endtimepicker').datetimepicker({
        format: 'LT',
        allowInputToggle: true,
        inline: true,
        defaultDate: moment().hours(19).minutes(0).seconds(0)
    });

});