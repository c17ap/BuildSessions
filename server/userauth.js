//NEXT STEP:
// Generate user initials after google login
Accounts.onCreateUser((options, user) => {
    if (! user.services.google) {
        throw new Error('Please use your google account to login');
        return user;
    } else {
        user.username = user.services.google.name;
        user.profile = {};
        return user;
    }
});
Accounts.config({
    restrictCreationByEmailDomain: 'dalton.org',
    // forbidClientAccountCreation: true
});
