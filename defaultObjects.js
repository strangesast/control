module.exports = {
  users: [
    {
      name: 'Guest Account',
      username: 'guest',
      password: 'guest',
      groups: ['guest'],
      applications: []
    },
    {
      name: 'User Account',
      username: 'user',
      password: 'user',
      groups: ['user'],
      applications: []
    },
    {
      name: 'Administrative Account',
      username: 'admin',
      password: 'admin',
      groups: ['admin'],
      applications: [ 'dashboard' ]
    }
  ],
  groups: [
    {
      _id: 'guest',
      name: 'Guest',
      description: 'Guest group with read access to the thermostat application.',
      applications: [
        'thermostat'
      ],
      defaultApplication: 'thermostat'
    },
    {
      _id: 'user',
      name: 'User',
      description: 'User group with read/write access to the thermostat application.',
      applications: [
        'thermostat',
        'topview',
        'topview-alternate',
        'energy'
      ],
      defaultApplication: 'topview'
    },
    {
      _id: 'admin',
      name: 'Administrator',
      description: 'Admin group with user/group/application control.',
      applications: [
        'dashboard'
      ],
      defaultApplication: 'dashboard'
    }
  ],
  applications: [
    {
      name: 'Dashboard',
      modulePath: 'app/modules/dashboard/dashboard.module#DashboardModule',
      _id: 'dashboard',
      path: 'dashboard'
    },
    {
      name: 'Quick View',
      modulePath: 'app/modules/topview/topview.module#TopviewModule',
      _id: 'topview',
      path: 'topview'
    },
    {
      name: 'Quick View 2',
      modulePath: 'app/modules/topview-alternate/topview-alternate.module#TopviewAlternateModule',
      _id: 'topview-alternate',
      path: 'topview-alternate'
    },
    {
      name: 'Thermostat',
      modulePath: 'app/modules/thermostat/thermostat.module#ThermostatModule',
      _id: 'thermostat',
      path: 'thermostat'
    },
    {
      name: 'Energy Profile',
      modulePath: 'app/modules/energy/energy.module#EnergyModule',
      _id: 'energy',
      path: 'energy-profile'
    }
  ]
};
