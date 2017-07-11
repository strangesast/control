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
        'energy-profile'
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
      _id: 'dashboard',
      path: 'dashboard'
    },
    {
      name: 'Quick View',
      _id: 'topview',
      path: 'topview'
    },
    {
      name: 'Thermostat',
      _id: 'thermostat',
      path: 'thermostat'
    },
    {
      name: 'Energy Profile',
      _id: 'energy-profile',
      path: 'energy-profile'
    }
  ]
};
