const db = require('./db'),
      { ObjectId } = require('mongodb');

const floorNames = ['basement', 'ground', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

async function duplicateFloors(mongo, count=5, fact=0.001) {
  if (typeof count !== 'number' || count < 1) throw new Error('invalid count');
  let buildings = await mongo.collection('areas').find({ type: 'building' }).toArray();

  for (let building of buildings) {
    let existingFloors = await mongo.collection('areas').find({ type: 'floor' }).toArray();
    let copyFrom = existingFloors[0];
    let floors = floorNames.filter(n => !existingFloors.find(f => f.shortname.includes(n))).slice(0, count).map(n => {
      let f = Object.assign({}, copyFrom);
      delete f._id;
      f.name = n[0].toUpperCase() + n.substring(1)
      f.shortname = `floor_${ n }`;
      return f;
    });

    let { insertedIds, insertedCount } = await mongo.collection('areas').insertMany(floors);
    let areas = await mongo.collection('areas').find({ floor: copyFrom._id, building: building._id }).toArray();

    for (let floor of floors) {
      let parents = areas.filter(a => copyFrom._id.equals(a.parent));
      let parentMap = {};

      while (parents.length) {
        let ids = [];
        let copies = [];

        for (let parent of parents) {
          ids.push(parent._id);
          let copy = Object.assign({}, parent, {
            floor: floor._id,
            parent: parentMap[parent.parent],
            shortname: parent.shortname + `_${ floor.shortname }`
          });
          delete copy._id;
          copies.push(copy);
        }

        let { insertedCount, insertedIds } = await mongo.collection('areas').insertMany(copies);
        if (insertedCount !== parents.length) throw new Error('failed to insert at least one');
        for (let j=0; j < parents.length; j++) {
          parentMap[ids[j]] = insertedIds[j];
        }
        parents = areas.filter(a => ids.some(id => id.equals(a.parent)));
      }

      let copies = [];
      let points = await mongo.collection('points').find({ building: building._id }).toArray();
      for (let point of points) {
        if (parentMap[point.room]) {
          let copy = Object.assign({}, point, {
            room: parentMap[point.room]
          });
          delete copy._id;
          copies.push(copy)
        }
      }
      let { insertedCount } = await mongo.collection('points').insertMany(copies);
      if (insertedCount != copies.length) throw new Error('failed to save at least one point');
    }
  }
}

async function duplicateBuildings(mongo, count=9, fact=0.001) {
  if (typeof count !== 'number' || count < 1) throw new Error('invalid count');
  let buildings = await mongo.collection('areas').find({ type: 'building' }).toArray();

  for (let building of buildings) {
    let { geometry, type, properties } = building.feature;

    let g = spiral(count);
    g.next();

    let areas = (await mongo.collection('areas').find({ building: building._id }).toArray()).concat(building);

    for (let [x, y, i] of g) {
      let parents = areas.filter(a => a.parent == null);

      let parentMap = {};

      while (parents.length) {
        let ids = [];
        let copies = [];

        for (let parent of parents) {
          ids.push(parent._id);
          let copy = Object.assign({}, parent, {
            floor: parentMap[parent.floor],
            building: parentMap[parent.building],
            parent: parentMap[parent.parent],
            shortname: parent.shortname + `_${ i }`,
            feature: shift(parent.feature, x*fact, y*fact)
          });
          delete copy._id;
          copies.push(copy);
        }

        let { insertedCount, insertedIds } = await mongo.collection('areas').insertMany(copies);
        if (insertedCount !== parents.length) throw new Error('failed to insert at least one');
        for (let j=0; j < parents.length; j++) {
          parentMap[ids[j]] = insertedIds[j];
        }
        parents = areas.filter(a => ids.some(id => id.equals(a.parent)));
      }

      let copies = [];
      let points = await mongo.collection('points').find({ building: building._id }).toArray();
      for (let point of points) {
        let copy = Object.assign({}, point, {
          room: parentMap[point.room],
          building: parentMap[point.room],
          feature: shift(point.feature, x*fact, y*fact)
        });
        delete copy._id;
        copies.push(copy)
      }
      let { insertedCount } = await mongo.collection('points').insertMany(copies);
      if (insertedCount != points.length) throw new Error('failed to save at least one point');
    }
  }
}

module.exports = { duplicateBuildings, duplicateFloors };

if (require.main === module) {
  (async function main() {
    try {
      const config = require('./config')['development'];
      let { mongo } = await db(config);

      await duplicateFloors(mongo);
      await duplicateBuildings(mongo);

      mongo.close();
    } catch (e) {
      console.error(e.stack);
    }
  })(); 
}


function shift(feature, dx, dy) {
  let { type, properties, geometry } = feature;
  properties = Object.assign({}, properties);
  if (properties.cx != null && properties.cy != null) {
    properties.cx += dx;
    properties.cy += dy;
  }
  let newCoordinates = [];
  for (let poly of geometry.coordinates) {
    if (Array.isArray(poly[0])) {
      let newPoly = [];
      for (let coordinate of poly) {
        if (typeof coordinate[0] === 'number') {
          newPoly.push([
            coordinate[0] + dx,
            coordinate[1] + dy,
            coordinate[2]
          ]);
        } else {
          let nc = [];
          for (let c of coordinate) {
            nc.push([
              c[0] + dx,
              c[1] + dy,
              c[2]
            ]);
          }
          newPoly.push(nc);
        }
      }
      newCoordinates.push(newPoly);
    } else {
      newCoordinates = [ poly[0] + dx, poly[1] + dy ]
    }
  }

  return { type, properties, geometry: { type: geometry.type, coordinates: newCoordinates }};
}

function* spiral(n) {
  let x = 0, y = 0, dx = 0, dy = -1, s = Math.ceil(Math.sqrt(n));

  for (let i=0; i < n; i++) {
    if (-s/2 < x && x <= s/2 && -s/2 < y && y <= s/2) {
      yield [x, y, i];
    }

    if (x == y || (x < 0 && x == -y) || (x > 0 && x == 1-y)) {
      [dx, dy] = [-dy, dx];
    }

    [x, y] = [x+dx, y+dy]
  }
}
