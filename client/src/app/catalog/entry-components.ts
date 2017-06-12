import { GroupComponent } from './_components/group/group.component';
import { ToggleButtonComponent } from './_components/toggle-button/toggle-button.component';
import { TabGroupComponent } from './_components/tab-group/tab-group.component';
import { NumericInputComponent } from './_components/numeric-input/numeric-input.component';
import { GraphComponent } from './_components/graph/graph.component';
import { GaugeComponent } from './_components/gauge/gauge.component';
import { ListGroupComponent } from './_components/list-group/list-group.component';
import { ThermostatGaugeComponent } from './_components/thermostat-gauge/thermostat-gauge.component';
  
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
