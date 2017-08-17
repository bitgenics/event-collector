const EventController = require('./index');

const ec = new EventController({meta: 'data'});
ec.startJob('long job');
ec.addError('Errors!!');
ec.end({moar: 'data'});
console.log(JSON.stringify(ec.getEvent(), null, 2));