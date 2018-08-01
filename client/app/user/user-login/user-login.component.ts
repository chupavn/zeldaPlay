import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { AlertService } from '../../alert/alert.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {

  username: string;
  password: string;
  loading = false;

  constructor(private router: Router, private userService: UserService, private alertService: AlertService) { }

  ngOnInit() {
    this.userService.logout();
  }

  login(): void {
    this.loading = true;
    this.userService.login(this.username, this.password)
      .subscribe(
        data => {
          localStorage.setItem('currentUser', data);
          this.router.navigate(['/']);
        },
        error => {
          this.loading = false;
          this.alertService.error(error.error.message);
        }
      );
  }

}
