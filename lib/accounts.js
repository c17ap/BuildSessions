/**
 * Created by charlie on 1/23/17.
 */
AccountsTemplates.addField({
    _id: 'username',
    type: 'text',
    displayName: 'Full Name',
    placeholder: {
        signUp: "Please insert your full name here"
    },
    required: true
});



//stuff from this page here:
//https://github.com/meteor-useraccounts/core/blob/master/Guide.md#form-fields-configuration
//add a user type:
// AccountsTemplates.addField({
//     _id: 'administrator',
//     type: 'password',
//     placeholder: {
//         signUp: "At least six characters"
//     },
//     required: true,
//     minLength: 6,
//     re: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
//     errStr: 'At least 1 digit, 1 lowercase and 1 uppercase',
// });
//actually use this: https://atmospherejs.com/alanning/roles