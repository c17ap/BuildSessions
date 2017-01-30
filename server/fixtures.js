/**
 * Created by charlie on 1/29/17.
 */
if ( Meteor.users.find().count() === 0 ) {
    var id = Accounts.createUser({
        username: 'admin',
        password: 'password'
    });

    Roles.addUsersToRoles(id, ['admin']);
}