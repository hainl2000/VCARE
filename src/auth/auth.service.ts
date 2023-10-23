import {
  BadRequestException,
  Injectable,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { users } from '@prisma/client';
import { generateKeyPairSync } from 'crypto';
import * as dayjs from 'dayjs';
import { AdminService } from 'src/modules/admin/admin.service';
import { DoctorService } from 'src/modules/doctor/doctor.service';
import { UserService } from 'src/modules/user/user.service';
import { generateOtp } from 'src/utils';
import {
  comparePassword,
  generateHashPass,
  getAccountSafeData,
} from 'src/utils/_security';
import { account, accountWithRole, role, roles } from './../constants/type';
import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './auth.dto';
import { SendMailService } from 'src/shared/mailer.service';
import { HospitalService } from 'src/modules/hospital/hospital.service';
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
    private readonly hospitalService: HospitalService,
    private readonly sendMailService: SendMailService,
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

      return {
        token,
        refreshToken,
        profile: getAccountSafeData(user),
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
        profile: getAccountSafeData(user),
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

  async loginHospital(data: LoginDto): Promise<AuthResponse> {
    try {
      const { password, username } = data;
      const hospital =
        await this.hospitalService.findHospitalByUsername(username);

      const validPassword = comparePassword(password, hospital.password);
      if (!validPassword) {
        throw new BadRequestException('Sai mật khẩu');
      }

      const { key, token, refreshToken } = await this.generateToken(
        hospital,
        roles.hospital,
      );

      await this.hospitalService.update(hospital.id, { security_key: key });

      delete hospital.password;
      delete hospital.security_key;

      return {
        token,
        refreshToken,
        profile: hospital,
      };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(username: string) {
    try {
      const user = await this.userService.findUserByUserName(username);

      const otp = generateOtp();
      const ttl = dayjs().valueOf() + 5 * 60 * 1000;

      await this.userService.update(user, { otp_data: { otp, ttl } });

      await this.sendMailService.sendOTPMail(
        user.email,
        otp,
        dayjs().add(5, 'minute').format('HH:mm:ss DD/MM/YYYY'),
      );

      return {
        status: true,
        message: 'OTP đã được gửi đến email của bạn',
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    try {
      const { username, otp, password } = data;
      const user = await this.userService.findUserByUserName(username);

      const { otp_data } = user;

      if (!otp_data && !otp_data['otp']) {
        throw new BadRequestException('Tài khoản chưa yêu cầu gửi mã OTP');
      }

      if (dayjs().valueOf() > otp_data['ttl']) {
        throw new BadRequestException('Hết hạn OTP');
      }

      if (otp !== otp_data['otp']) {
        throw new BadRequestException('Sai OTP');
      }

      await this.userService.update(user, {
        otp_data: {},
        password: generateHashPass(password),
      });

      return {
        status: true,
        message: 'Tạo mật khẩu mới thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshAccount(refresh: string) {
    try {
      const target: accountWithRole = await this.validateRefresh(refresh);

      const { key, refreshToken, token } = await this.generateToken(
        target,
        target.role,
      );

      switch (target.role) {
        case 'user':
          await this.userService.update(target as users, { security_key: key });
          break;
        case 'doctor':
          await this.doctorSerivce.update(target.id, { security_key: key });
          break;
        case 'admin':
          await this.adminService.update(target.id, { security_key: key });
          break;
        default:
          await this.userService.update(target as users, { security_key: key });
          break;
      }

      return {
        token,
        refreshToken,
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

  async validateRefresh(token: string): Promise<accountWithRole> {
    try {
      const payload = this.jwtService.decode(token) as {
        id: number;
        role: role;
        refresh: boolean;
      };
      if (!payload.refresh) {
        throw new UnauthorizedException();
      }
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
        case 'hospital':
          target = await this.hospitalService.findById(id);
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
