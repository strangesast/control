export interface Application {
  _id: string;
  // like 'App App'
  name: string;
  // used for loadChildren
  modulePath: string;
  // used for url path
  path: string;
  // used to subscribe to / modify values
  //data: { [id: string]: any }
}
