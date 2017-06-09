import { Component, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { ConfigurationService } from '../configuration.service';

class User {
  name: string;
  username: string;
  password: string;
  groups: string[];
  applications: string[];
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.less']
})
export class UserProfileComponent implements OnInit {
  user: User;

  constructor(private configuration: ConfigurationService, private http: Http) { }

  ngOnInit() {
    this.configuration.user.flatMap((user: any) => {
      let token = user.token;
      let headers = new Headers({'Content-Type': 'application/json', 'Authorization': 'JWT ' + token });
      console.log(headers);
      let options = new RequestOptions({ headers });
      return this.http.get('/api/user', options).map(res => {
        let json = res.json();
        console.log('json', json);
      });
    }).subscribe();
  }
}
