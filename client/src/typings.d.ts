/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
declare module 'defaultAccounts.js' {
  const value: any;
  export default value;
}
