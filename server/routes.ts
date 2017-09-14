import { Router } from 'express';
import { ObjectID } from 'mongodb';
import * as passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import * as multer from 'multer'; 
const upload = multer();

import * as authController from './controllers/authentication.controller';

const precision = 10;
const env = process.env.NODE_ENV || 'testing';
console.log('env', env);
import config from './config';
const secret = config[env].secret;

import { connection } from './db';
const mongo = connection();

const opts = {
  secretOrKey: secret,
  // use Authorization: Bearer header from request
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}; 

const strategy = new JwtStrategy(opts, async function(payload, next) {
  let username = payload.username;
  let user = username && await mongo.collection('users').findOne({ username }, { password: 0 });
  if (user) {
    let { _id, username } = user;
    next(null, { id: _id, username });
  } else {
    let err: any = new Error('No user found');
    err.status = 401;
    next(err, null);
  }
});

const router = Router();

passport.use(strategy);

router.use(passport.initialize());

router.route('/login').post(authController.loginUser)

router.route('/register').post(upload.array(), authController.registerUser);

router.delete('/unregister', authController.deleteUser);

router.all('/logout', authController.logoutUser);

router.get('/status', authController.emptyResponse);

router.route('/users').get(authController.listUsers);

// should replace with call to next on failed auth
router.use(passport.authenticate('jwt', { session: false }));

// routes
router.get('/', authController.registerUser);

router.get('/applications', authController.listUserApplications);

// map building / areas / layers
router.use([
  '/buildings/:building',
  '/buildings/:building/areas',
  '/buildings/:building/layers',
  '/buildings/:building/points'
], authController.addBuildingToReq);

router.get('/buildings', authController.listBuildings);

router.get('/buildings/:building', authController.returnBuilding);

router.get('/buildings/:building/areas', authController.listBuildingAreas);

router.get('/buildings/:building/layers', authController.listDistinctBuildingLayers);

router.get('/buildings/:building/floors', authController.listBuildingFloors);

router.get('/buildings/:building/points', authController.listBuildingPoints);

router.get('/buildings/:building/areas/:id', authController.returnBuildingArea);

router.get('/buildings/:building/points/:id', authController.returnBuildingPoint);

router.get('/points', authController.listPoints);

router.get('/points/:id', authController.returnPoint);

// catch-all error handler
router.use(authController.handleRoutedError);

export default router;
