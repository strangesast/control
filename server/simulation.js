const path = require('path'),
      fs = require('fs'),
      { importFromGeo } = require('./import');

var defaultSettings = {
  recalcInterval: 2000,
  initTemp: 70,
  initTempSpread: 4,
  precision: 10
};

const collections = [
  {
    name: 'users',
    config: {
      validator: {
        '$and': [
          { username: { '$type': 'string' }},
          { password: { '$type': 'string' }} ]
      }
    },
    indicies: [
      { name: 'username', config: { name: 'username', unique: true }}
    ]
  },
  {
    name: 'groups',
    config: null,
    indicies: [
      { name: 'name', config: { name: 'name', unique: true }}
    ]
  },
  {
    name: 'applications',
    config: null,
    indicies: []
  }
];

module.exports = async function({ mongo, influx }, dataDir, settings={}) {
  settings = Object.assign({}, defaultSettings, settings);
  // create collections
  for (let { name, config, indicies } of collections) {
    let exists = (await mongo.listCollections({ name }).toArray()).length > 0;
    if (exists) {
      await mongo.collection(name).drop()
    }
    try {
      await mongo.createCollection(name, config);
    } catch (err) {
      console.log('fuck this');
    }
    for (let index of indicies) {
      await mongo.collection(name).ensureIndex(index.name, index.config);
    }
  }
  let { users } = await readDataFile(dataDir, 'users.json');
  await mongo.collection('users').insertMany(users); 
  let { groups } = await readDataFile(dataDir, 'groups.json');
  await mongo.collection('groups').insertMany(groups);
  let { applications } = await readDataFile(dataDir, 'applications.json');
  await mongo.collection('applications').insertMany(applications);

  await importFromGeo(mongo, path.join(dataDir, 'geo'));
  
  let databaseName = influx.options.database;
  let names = await influx.getDatabaseNames();
  if (names.includes(databaseName)) {
    await influx.dropDatabase(databaseName);
  }
  await influx.createDatabase(databaseName);

  let points = [];
  // setpoints from unique areas from sensors
  for (let room of await mongo.collection('areas').find({ type: 'room' }).toArray()) {
    points.push({
      measurement: 'setpoints',
      tags: { room: room._id },
      fields: {
        value: generateInitTemp(settings),
        by: 'init',
        nonce: '1234'
      }
    });
  }
  for (let point of await mongo.collection('points').find({}).toArray()) {
    points.push({
      measurement: 'temperatures',
      tags: { room: point.room, point: point._id },
      fields: { value: generateInitTemp(settings) }
    });
  }
  await influx.writePoints(points);

  // thermostat loop
  let timeout, done;
  (async function loop(sleepTime) {
    let successful = true;
    while (successful && !done) {
      let setPoints = await influx.query(`SELECT last(value) FROM temperatures GROUP BY room`);
      let setPointMap = {};
      for (let { room, last } of setPoints) {
        setPointMap[room] = last;
      }

      let temps = await influx.query(`SELECT last(value) FROM temperatures GROUP BY room,point`);
      let values = [];
      for (let { room, point, last } of temps) {
        let sp = setPointMap[room];
        let dt = calcTempChange(last, sp, settings.precision);
        if (Math.abs(dt) > 0) {
          values.push({
            measurement: 'temperatures',
            tags: { room, point },
            fields: { value: last + dt }
          });
        }
      }

      try {
        if (values.length > 0) {
          //console.log('writing...');
          await influx.writePoints(values);
          //console.log('written');
        }
        await new Promise((r) => timeout = setTimeout(r, sleepTime));
          
      } catch (e) {
        successful = false;
        console.log('thermostat loop failed');
        console.error(e)
      }
    }
  })(settings.recalcInterval);

  return function() {
    done = true;
    clearTimeout(timeout);
    console.log(`canceling simulation...`);
  }
}

function readDataFile(dataDir, name) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(dataDir, name), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

function generateInitTemp(settings) {
  let { initTemp, initTempSpread, precision } = settings;
  let t = initTemp + (Math.random() - 1)*initTempSpread;
  return Math.floor(t*precision)/precision;
}

function calcTempChange(t, sp, p) {
  let v = sp - t;
  let dt = Math.sign(v)*(Math.random()-0.5)*Math.pow(Math.E, -Math.pow(v, 2)) + v/2;
  return Math.floor(dt*p)/p;
}
