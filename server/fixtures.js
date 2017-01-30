/**
 * Created by charlie on 1/29/17.
 */
if ( Meteor.users.find().count() === 0 ) {
    console.log('creating the admin user, email admin@admin.com, password is password');
    var id = Accounts.createUser({
        username: 'admin',
        email: 'admin@admin.com',
        password: 'password'
    });

    Roles.addUsersToRoles(id, ['admin']);
}