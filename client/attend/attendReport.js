/**
 * Created by student on 2/2/17.
 */


Template.attendReport.helpers({
    usersAttend: function () {
        //initialize:
        if(typeof Session.get('start') === 'undefined') {
            Session.set('start', moment().startOf('week').add(1, 'days')._d);
            Session.set('end', moment().hour(23)._d);
        }
        return Meteor.users.find({'profile.team': {$exists: true}}, {
            transform: function (doc) {
                doc.sessions = [];
                BuildSessions.find({
                    'start': {
                        $gte: Session.get('start'),
                        $lte: Session.get('end')
                    },
                    attend: doc._id,
                    absent: {$nin: [doc._id]}
                }).forEach(function(s) {
                    doc.sessions.push(moment(s.start).format('MM/DD'));
                });
                doc.count = doc.sessions.length;
                return doc;
            },
            sort: {'profile.team': 1, 'username': 1}
        });
    },
    noattend: function(count) {
        return count==0?'danger':'';
    }
});

Template.attendReport.onRendered (function () {

    function cb(start, end) {
        $('#reportrange span').html(moment(start).format('MMMM D, YYYY') + ' - ' + moment(end).format('MMMM D, YYYY'));
        Session.set('start', start._d);
        Session.set('end', end._d);
    }

    let school_year_start = moment().month('september').date(1);
    if(school_year_start.isAfter(moment())) school_year_start.subtract(1,'year');

    $('#reportrange').daterangepicker({
        startDate: moment(Session.get('start')),
        endDate: moment(Session.get('end')),
        ranges: {
            'This week': [moment().startOf('week').add(1, 'days'), moment()],
            'Last week': [moment().startOf('week').subtract(6, 'days'), moment().startOf('week').hour(23)],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This school year': [school_year_start, moment()]
        }

    }, cb);

    cb(Session.get('start'), Session.get('end'));


});