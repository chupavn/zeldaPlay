import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiImplicitBody,
  ApiOkResponse,
  ApiOperation,
  ApiUseTags
} from '@nestjs/swagger';

import { AuthPipe } from '@Auth/auth.pipe';
import { AuthService } from '@Auth/auth.service';
import { JwtReturnDTO } from '@Models/auth/jwtReturn.dto';
import { NewUserDTO } from '@Models/auth/new_user.dto';
import { UserDTO } from '@Models/auth/user.dto';

@ApiUseTags('user')
@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ title: 'Login', description: 'Log the user in' })
  @ApiImplicitBody({ name: 'user', type: UserDTO })
  @ApiOkResponse({ type: JwtReturnDTO })
  async login(@Body('user') user: UserDTO): Promise<JwtReturnDTO> {
    return this.authService.login(user);
  }

  @Post('signup')
  @ApiOperation({ title: 'Signup', description: 'Sign the new user up' })
  @ApiImplicitBody({ name: 'user', type: NewUserDTO })
  @ApiOkResponse({ type: JwtReturnDTO })
  async signup(
    @Body('user', AuthPipe) user: NewUserDTO
  ): Promise<JwtReturnDTO> {
    return this.authService.signup(user);
  }

  @Post('logout')
  @ApiOperation({ title: 'Logout', description: 'Allow the user to log out.' })
  async logout(): Promise<void> {
    return;
  }
}
