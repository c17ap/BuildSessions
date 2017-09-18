ServiceConfiguration.configurations.upsert({
    service: "google"
}, {
    $set: {
        clientId: Meteor.settings.google.clientId,
        secret: Meteor.settings.google.secret
    }
});


Accounts.emailTemplates.siteName = "BuildSessions";
Accounts.emailTemplates.from     = "BuildSessions <cforster@dalton.org>";