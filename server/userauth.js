//NEXT STEP:
// Generate user initials after google login
Accounts.onCreateUser((options, user) => {
    if (! user.services.google) {
        // throw new Error('Expected login with google only.');
        return user;
    } else {
        user.username = user.services.google.name;
        user.profile = {};
        return user;
    }
});
Accounts.config({restrictCreationByEmailDomain: 'dalton.org'})
