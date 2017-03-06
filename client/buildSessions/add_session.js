/**
 * Created by aryavpal on 1/19/17.
 */
Template.addSession.events({
    'submit form': function(e) {
        e.preventDefault();

        var startms = moment.duration(moment($('#starttimepicker').data().date, ["h:mm A Z"]).format("HH:mm"))
        var endms = moment.duration(moment($('#endtimepicker').data().date, ["h:mm A Z"]).format("HH:mm"));

        Meteor.call('addSession', {
            date: $('#datepicker').data().date,
            starttime: startms._milliseconds,
            endtime: endms._milliseconds,
            locktime: $('#locktime').val()
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