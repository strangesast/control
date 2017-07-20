const fs = require('fs'),
      path = require('path')

const roomdata = JSON.parse(fs.readFileSync('./data/rooms.geojson'));

let rooms = roomdata.features.reduce((a, feature) => {
  let { name, parent } = feature.properties;
  console.log('name', name);
  let id = parseInt(name.substr(4));
  a[name] = { id, name: `Room ${ id }`, parent };
  return a;
}, {});


const sensordata = JSON.parse(fs.readFileSync('./data/sensors.geojson'));

let sensors = sensordata.features.reduce((a, feature) => {
  let { id, area } = feature.properties;
  name = `Sensor ${ id }`;
}, {});
