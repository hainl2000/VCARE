import {
  BadRequestException,
  Injectable,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { admins, doctors, users } from '@prisma/client';
import { generateKeyPairSync } from 'crypto';
import { AdminService } from 'src/modules/admin/admin.service';
import { DoctorService } from 'src/modules/doctor/doctor.service';
import { UserService } from 'src/modules/user/user.service';
import { comparePassword } from 'src/utils/_security';
import { account, accountWithRole, role, roles } from './../constants/type';
import { AuthResponse, LoginDto, RegisterDto } from './auth.dto';
import { log } from 'console';
@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private tokenExpire: string;
  private refreshTokenExpire: string;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly doctorSerivce: DoctorService,
    private readonly adminService: AdminService,
  ) {}

  onApplicationBootstrap() {
    this.tokenExpire = this.configService.get<string>('jwt.expire') || '1d';
    this.refreshTokenExpire =
      this.configService.get<string>('jwt.refresh_expire') || '2d';
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    try {
      const { password, username } = data;
      const user = await this.userService.findUserByUserName(username);

      const validPassword = comparePassword(password, user.password);
      if (!validPassword) {
        throw new BadRequestException('Sai mật khẩu');
      }

      const { key, token, refreshToken } = await this.generateToken(
        user,
        roles.user,
      );

      await this.userService.update(user.id, { security_key: key });

      delete user.password;
      delete user.external_code;
      delete user.change_history;

      return {
        token,
        refreshToken,
        profile: user,
      };
    } catch (error) {
      throw error;
    }
  }

  async register(data: RegisterDto) {
    try {
      const user = await this.userService.create(data);

      const { key, token, refreshToken } = await this.generateToken(
        user,
        roles.user,
      );

      await this.userService.update(user.id, { security_key: key });

      delete user.password;
      delete user.external_code;
      delete user.change_history;
      delete user.security_key;

      return {
        token,
        refreshToken,
        profile: user,
      };
    } catch (error) {
      throw error;
    }
  }

  async loginDoctor(data: LoginDto): Promise<AuthResponse> {
    try {
      const { password, username } = data;
      const doctor = await this.doctorSerivce.findDoctorByUserName(username);

      const validPassword = comparePassword(password, doctor.password);
      if (!validPassword) {
        throw new BadRequestException('Sai mật khẩu');
      }

      const { key, token, refreshToken } = await this.generateToken(
        doctor,
        roles.doctor,
      );

      await this.doctorSerivce.update(doctor.id, { security_key: key });

      delete doctor.password;
      delete doctor.external_code;
      delete doctor.change_history;
      delete doctor.security_key;

      return {
        token,
        refreshToken,
        profile: doctor,
      };
    } catch (error) {
      throw error;
    }
  }

  async loginAdmin(data: LoginDto): Promise<AuthResponse> {
    try {
      const { password, username } = data;
      const admin = await this.adminService.findAdminByEmail(username);

      const validPassword = comparePassword(password, admin.password);
      if (!validPassword) {
        throw new BadRequestException('Sai mật khẩu');
      }

      const { key, token, refreshToken } = await this.generateToken(
        admin,
        roles.admin,
      );

      await this.adminService.update(admin.id, { security_key: key });

      delete admin.password;
      delete admin.security_key;

      return {
        token,
        refreshToken,
        profile: admin,
      };
    } catch (error) {
      throw error;
    }
  }

  async generateToken(target: account, role: role) {
    try {
      const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      const [token, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          { id: target.id, role },
          {
            secret: privateKey,
            algorithm: 'RS256',
            expiresIn: this.tokenExpire,
          },
        ),
        this.jwtService.signAsync(
          { id: target.id, role, refresh: true },
          {
            secret: privateKey,
            algorithm: 'RS256',
            expiresIn: this.refreshTokenExpire,
          },
        ),
      ]);

      return {
        token,
        refreshToken,
        key: publicKey,
      };
    } catch (error) {
      throw error;
    }
  }

  async validateAccount(token: string): Promise<accountWithRole> {
    try {
      const payload = this.jwtService.decode(token) as {
        id: number;
        role: role;
      };
      const { role, id } = payload;
      let target: account;
      switch (role) {
        case 'user':
          target = await this.userService.findById(id);
          break;
        case 'doctor':
          target = await this.doctorSerivce.findById(id);
          break;
        case 'admin':
          target = await this.adminService.findById(id);
          break;
        default:
          target = await this.userService.findById(id);
          break;
      }

      if (!target) {
        throw new UnauthorizedException();
      }

      const { security_key } = target;

      await this.jwtService.verifyAsync(token, {
        secret: security_key,
        algorithms: ['RS256'],
      });

      return { ...target, role };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
