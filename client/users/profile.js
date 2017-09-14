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
        value: source.find(o=>o.value===Meteor.user().profile.team).value,
        source: source,
        success: function (response, newValue) {
            Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.team": newValue}});
        }
    });
};