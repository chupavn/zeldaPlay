import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '#Environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  register(username: string, password: string, confPass: string) {
    return this.http.post<any>(environment.apiUrl + '/users/signup', {
      user: {
        email: username,
        password,
        confirmationPassword: confPass
      }
    });
  }

  login(username: string, password: string) {
    return this.http.post<any>(environment.apiUrl + '/users/login', {
      user: {
        email: username,
        password
      }
    });
  }

  logout() {
    this.http
      .post<any>(
        environment.apiUrl + '/users/logout',
        {},
        {
          withCredentials: true
        }
      )
      .subscribe();
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('userToken');
  }
}