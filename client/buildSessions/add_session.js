/**
 * Created by aryavpal on 1/19/17.
 */

Template.addSession.events({
    'submit form': function (e) {
        e.preventDefault();

        Meteor.call('addSession', {
            starttime: starttime.toDate(),
            endtime: endtime.toDate(),
            eventname: e.target.eventname.value,
            food: $('#foodsignup').prop('checked'),
            slackChannel: e.target.slackchannel.value
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

Template.addSession.onRendered(function () {
    starttime = moment().hours(15).minutes(30).seconds(0);
    endtime = moment().hours(19).minutes(0).seconds(0);
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
        defaultDate: starttime
    });
    this.$('#endtimepicker').datetimepicker({
        format: 'LT',
        allowInputToggle: true,
        inline: true,
        defaultDate: endtime
    });
    this.$("#starttimepicker").on("dp.change", function (e) {
        starttime.hours(e.date.hours()).minutes(e.date.minutes());
    });
    this.$("#endtimepicker").on("dp.change", function (e) {
        endtime.hours(e.date.hours()).minutes(e.date.minutes());
    });
    this.$("#datepicker").on("dp.change", function (e) {
        starttime.month(e.date.month()).date(e.date.date()).year(e.date.year());
        endtime.month(e.date.month()).date(e.date.date()).year(e.date.year());
    });

});