_users_
  username: string
  password: string
  name: string
  applications: id[]
  groups: id[]

_groups_
  name: string
  description: string
  applications: id[]

_applications_
  \_id: id
  name: string
  description: string
  component: id

_components_
  \_id: id
  name: string
  type: string
  attributes: attribute[]

_attribute_
  name: string
  type: "number"|"string"|"boolean"|"array"
  value: any
  point: id
