import { Body, Controller, Post } from '@nestjs/common';
import { ApiImplicitBody, ApiOperation, ApiUseTags } from '@nestjs/swagger';

import { AuthPipe } from '@Auth/auth.pipe';
import { AuthService } from '@Auth/auth.service';
import { NewUserDTO } from '@Auth/interfaces/new_user.dto';
import { UserDTO } from '@Auth/interfaces/user.dto';

@ApiUseTags('user')
@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ title: 'Login', description: 'Log the user in' })
  @ApiImplicitBody({ name: 'user', type: UserDTO })
  async login(@Body('user') user: UserDTO): Promise<string> {
    return this.authService.login(user);
  }

  @Post('signup')
  @ApiOperation({ title: 'Signup', description: 'Sign the new user up' })
  @ApiImplicitBody({ name: 'user', type: NewUserDTO })
  async signup(@Body('user', AuthPipe) user: NewUserDTO): Promise<string> {
    return this.authService.signup(user);
  }
}