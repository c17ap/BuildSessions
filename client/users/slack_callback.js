Template.slackCallback.rendered = function () {
	var urlParams = new URLSearchParams(window.location.search);
	var code = urlParams.get("code")
	Meteor.call('connectSlack', code, function (err, resp) {
		if (err) console.error(err)
		Router.go('profile')
	})
};