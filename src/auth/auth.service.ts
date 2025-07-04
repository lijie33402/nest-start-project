import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthEntity } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity) private readonly auth: Repository<AuthEntity>,
    private readonly JwtService: JwtService,
    private readonly redisService: RedisService, // 注册redis控制器
  ) {}

  // 注册
  async signup(signupData: CreateAuthDto) {
    const findUser = await this.auth.findOne({
      where: { username: signupData.username },
    });
    if (findUser && findUser.username === signupData.username)
      return '用户已存在';
    // 对密码进行加密处理
    const hashedPassword = bcryptjs.hashSync(signupData.password, 10);
    const newUser = { ...signupData, password: hashedPassword };
    await this.auth.save(newUser);
    // 尝试将注册成功的用户存入redis中
    this.redisService.set(signupData.username, hashedPassword);
    return '注册成功';
  }

  // 登录
  async login(loginData: CreateAuthDto) {
    const findUser = await this.auth.findOne({
      where: { username: loginData.username },
    });
    // 没有找到
    if (!findUser) return new BadRequestException('用户不存在');

    // 找到了对比密码
    const compareRes: boolean = bcryptjs.compareSync(
      loginData.password,
      findUser.password,
    );
    // 密码不正确
    if (!compareRes) return new BadRequestException('密码不正确');
    const payload = { username: findUser.username };

    return {
      access_token: this.JwtService.sign(payload),
      msg: '登录成功',
    };
  }
}
