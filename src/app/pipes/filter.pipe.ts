import { Pipe, PipeTransform } from '@angular/core';
import { Saga } from '../interfaces/saga';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: Saga[], args: string): unknown {
    var result=[];
    if(args==""){
      return value
    }
    if(value.length>0){
      for (const saga of value) {
        if(saga.name.toLocaleLowerCase().indexOf(args.toLocaleLowerCase())>-1){
          result.push(saga);
        };
      };
      return result;
    }else{
      return value
    }
  }

}
