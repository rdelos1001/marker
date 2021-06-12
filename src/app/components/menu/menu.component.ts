import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  pages:any[]=[]
  constructor(private router:Router) { }

  ngOnInit() {
    this.pages=[
      {
        name:"Series",
        path:"/serie"
      },{
        name:"Configuración",
        path:"/configuration"
      },
    ];
  }
  navigate(path:string){
    this.router.navigate([path])
  }
}
