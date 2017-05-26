import { GroupComponent } from './group/group.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { TabGroupComponent } from './tab-group/tab-group.component';
import { NumericInputComponent } from './numeric-input/numeric-input.component';
import { GraphComponent } from './graph/graph.component';
import { GaugeComponent } from './gauge/gauge.component';

const entryComponents = [GroupComponent, ToggleButtonComponent, TabGroupComponent, NumericInputComponent, GraphComponent, GaugeComponent];
export const componentNameMap = entryComponents.reduce((a, Component) => Object.assign(a, {[Component.name]: Component }), {});
export default entryComponents;
