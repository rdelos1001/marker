import { Pipe, PipeTransform } from '@angular/core';
import { Saga } from '../interfaces/saga';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any[], args: string): unknown {
    var result=[];
    if(args==""){
      return value
    }
    if(value && value.length>0){
      for (const i of value) {
        if(i.name.toLocaleLowerCase().indexOf(args.toLocaleLowerCase())>-1){
          result.push(i);
        };
      };
      return result;
    }else{
      return value
    }
  }

}
