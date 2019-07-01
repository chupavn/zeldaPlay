import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest
              .fn()
              .mockReturnValue(
                of(Math.floor(Math.random() * 1000).toString(8))
              ),
            signup: jest
              .fn()
              .mockReturnValue(of(Math.floor(Math.random() * 1000).toString(8)))
          }
        }
      ]
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
  it('should return a value for login', (done) => {
    resolver
      .login({ email: 'testEmail', password: 'testPassword' })
      .subscribe((result) => {
        expect(typeof result).toBe('string');
        done();
      });
  });
  it('should return a value for signup', (done) => {
    resolver
      .signup({
        email: 'testEmail',
        password: 'testPassword',
        confirmationPassword: 'testPassword',
        consentToEmail: false,
        firstName: 'Test',
        lastName: 'Test',
        role: ['player']
      })
      .subscribe((result) => {
        expect(typeof result).toBe('string');
        done();
      });
  });
});
