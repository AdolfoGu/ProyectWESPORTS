const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo/WeSports')
.then(db => console.log('Base conectada',db.connection.host))
.catch(err => console.error('ERROR',err))