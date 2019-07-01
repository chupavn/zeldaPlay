import { Body, Controller, Post } from '@nestjs/common';
import { Auth, Login, Signup } from '@tabletop-companion/api-interface';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginBody: Login): Observable<Auth> {
    return this.authService.login(loginBody);
  }

  @Post('signup')
  signup(@Body() signupBody: Signup): Observable<Auth> {
    return this.authService.signup(signupBody);
  }
}
