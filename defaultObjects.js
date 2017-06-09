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
      applications: []
    }
  ],
  groups: [
    {
      id: 'guest',
      name: 'Guest',
      description: 'Guest group with read access to the thermostat application.',
      applications: [
        {
          id: 'thermostat',
          write: false
        }
      ]
    },
    {
      id: 'user',
      name: 'User',
      description: 'User group with read/write access to the thermostat application.',
      applications: [
        {
          id: 'thermostat',
          write: true,
        },
        {
          id: 'topview',
          write: true
        },
        {
          id: 'energy_analysis',
          write: true
        }
      ]
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Admin group with user/group/application control.',
      applications: [
        {
          id: 'dashboard',
          write: true
        }
      ]
    }
  ],
  applications: [
    {
      id: 'dashboard'
    },
    {
      id: 'thermostat'
    },
    {
      id: 'energy_analysis'
    }
  ]
};
