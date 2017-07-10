import { GroupComponent } from './components/group/group.component';
import { ToggleButtonComponent } from './components/toggle-button/toggle-button.component';
import { TabGroupComponent } from './components/tab-group/tab-group.component';
import { NumericInputComponent } from './components/numeric-input/numeric-input.component';
import { GraphComponent } from './components/graph/graph.component';
import { GaugeComponent } from './components/gauge/gauge.component';
import { ListGroupComponent } from './components/list-group/list-group.component';
import { ThermostatGaugeComponent } from './components/thermostat-gauge/thermostat-gauge.component';
  
const entryComponents = [
  GroupComponent,
  ToggleButtonComponent,
  TabGroupComponent,
  NumericInputComponent,
  GraphComponent,
  GaugeComponent,
  ListGroupComponent,
  ThermostatGaugeComponent
];

export const componentNameMap = entryComponents.reduce((a, Component) => Object.assign(a, {[Component.name]: Component }), {});
export default entryComponents;
