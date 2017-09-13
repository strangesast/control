import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameFromAttr'
})
export class NameFromAttrPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value.attributes) {
      let attr = value.attributes.find(({ name }) => name == 'name')
      if (attr && attr.value) return attr.value;
    }
    return 'Unknown';
  }

}
