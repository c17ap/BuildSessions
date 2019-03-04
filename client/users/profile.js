Template.profile.helpers({
    attends: function () {
        return BuildSessions.find({ attend: Meteor.userId() },
            {
                transform: function (doc) {
                    doc.attend = moment(doc.start).format('MM/DD');
                    return doc;
                }
            }
        );
    },
});

Template.profile.rendered = function () {
    $.fn.editable.defaults.mode = 'inline';

    //team:
    var source = [];
    for (var i = 0; i < Teams.length; i++) {
        source.push({
            'value': Teams[i].value,
            'text': Teams[i].value + ": " + Teams[i].text
        });
    }

    $('#select').editable({
        emptytext: 'No Team Assigned',
        value: Meteor.user().profile.team, //source.find(o=>o.value===Meteor.user().profile.team).value,
        source: source,
        success: function (response, newValue) {
            Meteor.users.update({ _id: Meteor.userId() }, { $set: { "profile.team": newValue } });
        }
    });

    //allergies:
    $('#allergies').editable({
        emptytext: 'no allergies',
        value: Meteor.user().profile.allergies,
        source: source,
        success: function (response, newValue) {
            if (newValue == "") Meteor.users.update({ _id: Meteor.userId() }, { $unset: { "profile.allergies": "" } });
            else Meteor.users.update({ _id: Meteor.userId() }, { $set: { "profile.allergies": newValue } });
        }
    });

    Meteor.call("getSlackOAuthURL", function (err, url) {
        // alert(url);
        $("#slack-oauth-link").attr('href', url);
    })

    $("#disconnect-slack").click(function () {
        Meteor.users.update({ _id: Meteor.userId() }, { $unset: { "profile.slackUserToken": "" } });
        $("#slack-oauth-link").show();
        $(".slack-connected").hide();
    })

    if (Meteor.user().profile.slackUserToken) {
        $("#slack-oauth-link").hide();
    } else {
        $(".slack-connected").hide();
    }
};