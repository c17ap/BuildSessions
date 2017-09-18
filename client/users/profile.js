Template.profile.helpers({
    attends: function () {
        return BuildSessions.find({attend: Meteor.userId()},
            { transform: function (doc) {
                doc.attend = moment(doc.start).format('MM/DD');
                return doc;
            }
            });
    }
});

Template.profile.rendered = function () {
    $.fn.editable.defaults.mode = 'inline';

    var source = [];
    for(var i = 0; i<Teams.length; i++) {
        source.push({
            'value': Teams[i].value,
            'text': Teams[i].value + ": " +Teams[i].text
        });
    }

    $('#select').editable({
        emptytext: 'No Team Assigned',
        value: Meteor.user().profile.team, //source.find(o=>o.value===Meteor.user().profile.team).value,
        source: source,
        success: function (response, newValue) {
            Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.team": newValue}});
        }
    });



};