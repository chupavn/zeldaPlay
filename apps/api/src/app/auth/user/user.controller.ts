import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserDTO, UserIdDTO, UserUpdateDataDTO } from './models';
import { CookieGuard } from '../../guards/cookie.guard';
import { UserService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get(':id')
  getUser(@Param() userId: UserIdDTO): Observable<UserDTO> {
    return this.usersService.getById(userId);
  }

  @UseGuards(CookieGuard)
  @Patch(':id')
  updateUser(@Body() userData: UserUpdateDataDTO): Observable<UserDTO> {
    return this.usersService.updateUser(userData);
  }

  @UseGuards(CookieGuard)
  @Delete(':id')
  deleteUser(@Body() userId: UserIdDTO): Observable<any> {
    return this.usersService.deleteUser(userId);
  }
}
