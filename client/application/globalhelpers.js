Template.registerHelper('isAdmin', () => {
  return Roles.userIsInRole(Meteor.userId(), ['admin']);
});
Template.registerHelper('dateMoment', (start) => {
  return moment(start).format('dddd M/D @ h:mm');
});
Template.registerHelper('durationMoment', (start, end) => {
  return moment(end).to(moment(start), true);
});


