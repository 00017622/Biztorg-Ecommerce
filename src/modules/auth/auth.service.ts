import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleAsyncProvider } from "src/database/drizzle.provider";
import * as schema from 'src/database/schema';
import { AuthAdminResponseDto, AuthUserResponseDto, CustomAuthCredentialsDto, SendVerificationRequestDto, VerifyAndRegisterRequestDto } from "./dto/auth.dto";
import { and, eq } from "drizzle-orm";
import * as bcrypt from 'bcrypt';
import { UserRoleEnum, UserSchemaType } from "src/utils/zod.schema";
import { MailService } from "./mail.service";
import { GoogleService } from "./google.service";
import { FacebookService } from "./facebook.service";
import { TelegramGatewayService } from "./telegramGateway.service";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private googleService: GoogleService,
    private facebookService: FacebookService,
    private telegramGatewayService: TelegramGatewayService,
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
    private readonly mailService: MailService,
  ) {}


   async sendVerificatioCode(input: SendVerificationRequestDto) {

     if (!input.email) {
    throw new BadRequestException('Email is required');
      }

    const existingUser = await this.getUser(input.email);

    if (existingUser) {
      throw new ConflictException("User already exists");
    };

    const password = this.generateRandomPassword();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.mailService.sendVerificationEmail(input.email, password);

    const hashedPassword = await bcrypt.hash(password, 10);

   await this.db
    .insert(schema.tempCredentialsSchema)
    .values({
      email: input.email,
      password: hashedPassword,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: schema.tempCredentialsSchema.email,
      set: {
        password: hashedPassword,
        expiresAt,
      },
    });

    return { message: "Verification password sent to email" };
   };

   async verifyAndRegister(input: VerifyAndRegisterRequestDto): Promise<AuthUserResponseDto> {

        if (!input.email) {
    throw new BadRequestException('Email is required');
      }

        const temp = await this.db.query.tempCredentialsSchema.findFirst({
      where: eq(schema.tempCredentialsSchema.email, input.email),
    });

    if (!temp) {
      throw new BadRequestException("Email not found");
    };

    const isValid = await bcrypt.compare(input.password, temp.password);

    if (!isValid) {
      throw new UnauthorizedException("Invalid password");
    }


    if (temp.expiresAt < new Date()) {
      throw new UnauthorizedException("Password expired");
    };

    const existingUser = await this.getUser(input.email);

    if (existingUser) {
      throw new ConflictException("User already exists");
    };

    const passwordHash = await bcrypt.hash(input.password, 10);

    const [newUser] = await this.db.insert(schema.usersSchema).values({
      email: input.email,
      passwordHash: passwordHash,
      role: UserRoleEnum.USER,
    }).returning();

    await this.db.delete(schema.tempCredentialsSchema).where(eq(schema.tempCredentialsSchema.email, input.email));

    return this.generateTokens<AuthUserResponseDto>(newUser);
   }

   async customAuthLogin(input: CustomAuthCredentialsDto): Promise<AuthUserResponseDto> {

        if (!input.email) {
    throw new BadRequestException('Email is required');
      }

    const user = await this.getUser(input.email);

    if (!user) {
       throw new UnauthorizedException('Invalid credentials');
    }

     if (!user.passwordHash) {
    throw new BadRequestException('Password hash is required');
      }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException("Invalid password");
    }

    return this.generateTokens<AuthUserResponseDto>(user);
   }

   async adminLogin(input: CustomAuthCredentialsDto): Promise<AuthAdminResponseDto> {

     if (!input.email) {
    throw new BadRequestException('Email is required');
      }

    const user = await this.getUser(input.email);

    if (!user || user.role !== UserRoleEnum.ADMIN) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

     if (!user.passwordHash) {
    throw new BadRequestException('Password hash is required');
      }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    return this.generateTokens<AuthAdminResponseDto>(user);
   }

 
async googleLogin(token: string): Promise<AuthUserResponseDto> {
  const profile = await this.googleService.verifyAccessToken(token);

   if (!profile.email) {
    throw new BadRequestException('Email is required');
      }

  let user = await this.db.query.usersSchema.findFirst({
    where: eq(schema.usersSchema.email, profile.email),
  });

  if (user) {
    await this.db
      .update(schema.profilesSchema)
      .set({
        googleId: profile.id,
      })
      .where(eq(schema.profilesSchema.userId, user.id));

    user = await this.getUser(profile.email);
  } else {

      const hashedPassword = await bcrypt.hash(
      Math.random().toString(36).slice(-12),
      10,
    );
   
    const [newUser] = await this.db
      .insert(schema.usersSchema)
      .values({
        email: profile.email,
        name: profile.name ??  '',
        passwordHash: hashedPassword,
        role: UserRoleEnum.USER,
      })
      .returning();

    await this.db.insert(schema.profilesSchema).values({
      userId: newUser.id,
      googleId: profile.id,
    });

    user = newUser;
  }

if (!user) {
  throw new UnauthorizedException('User not found');
}

return this.generateTokens<AuthUserResponseDto>({
      id: user.id,
    email: user.email ?? null,
    role: user.role,
    phone: user.phone ?? null,
    name: user.name ?? null,
});
}

async facebookLogin(token: string): Promise<AuthUserResponseDto> {
    const profile = await this.facebookService.verifyAccessToken(token);

     if (!profile.email) {
    throw new BadRequestException('Email is required');
      }

    let user = await this.db.query.usersSchema.findFirst({
      where: eq(schema.usersSchema.email, profile.email),
    });

    if (user) {
      await this.db
        .update(schema.profilesSchema)
        .set({
          facebookId: profile.id,
        })
        .where(eq(schema.profilesSchema.userId, user.id));

      user = await this.getUser(profile.email);
    } else {
      const hashedPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-12),
        10,
      );

      const [newUser] = await this.db
        .insert(schema.usersSchema)
        .values({
          email: profile.email,
          name: profile.name ?? '',
          passwordHash: hashedPassword,
          role: UserRoleEnum.USER,
        })
        .returning();

      await this.db.insert(schema.profilesSchema).values({
        userId: newUser.id,
        facebookId: profile.id,
      });

      user = newUser;
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens<AuthUserResponseDto>({
       id: user.id,
  email: user.email ?? null,
  role: user.role,
  phone: user.phone ?? null,
  name: user.name ?? null,
    });
  }

async sendPhoneVerificationCode(input: { phone: string }) {

  const result = await this.telegramGatewayService.sendCode(input.phone);

  const expiresAt = new Date(Date.now() + 60_000);

  await this.db
    .insert(schema.tempPhoneCredentialsSchema)
    .values({
      phone: input.phone,
      requestId: result.request_id,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: schema.tempPhoneCredentialsSchema.phone,
      set: {
        requestId: result.request_id,
        expiresAt,
      },
    });

  return {
    requestId: result.request_id,
  };
}

async verifyPhoneCode(
  input: { phone: string; requestId: string; code: string },
): Promise<AuthUserResponseDto> {

  const record = await this.db.query.tempPhoneCredentialsSchema.findFirst({
    where: and(
      eq(schema.tempPhoneCredentialsSchema.phone, input.phone),
      eq(schema.tempPhoneCredentialsSchema.requestId, input.requestId),
    ),
  });

  if (!record) {
    throw new BadRequestException(
      'Запрос на подтверждение не найден. Попробуйте запросить код заново.',
    );
  }

  if (record.expiresAt < new Date()) {
    throw new UnauthorizedException(
      'Срок действия кода истёк. Запросите новый код.',
    );
  }

  const status = await this.telegramGatewayService.verifyCode(
    input.requestId,
    input.code,
  );

  if (status !== 'code_valid') {
    throw new UnauthorizedException(
      'Неверный код подтверждения.',
    );
  }

  let user = await this.getUserByPhone(input.phone);

  if (!user) {
    const [newUser] = await this.db
      .insert(schema.usersSchema)
      .values({
        phone: input.phone,
        role: UserRoleEnum.USER,
      })
      .returning();

    user = newUser;
  }

  await this.db
    .delete(schema.tempPhoneCredentialsSchema)
    .where(eq(schema.tempPhoneCredentialsSchema.phone, input.phone));

  return this.generateTokens<AuthUserResponseDto>({
    id: user.id,
    email: user.email ?? null,
    role: user.role,
    phone: user.phone ?? null,
    name: user.name ?? null,
  });
}

     private async generateTokens<
  T extends AuthUserResponseDto | AuthAdminResponseDto>(
  user: Pick<
    UserSchemaType,
    'id' | 'email' | 'role' | 'phone' | 'name'
  >
): Promise<T>
 {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    if (user.role === UserRoleEnum.ADMIN) {
  return {
    token,
    role: user.role,
    redirectTo: '/admin',
    user: {
      id: user.id,
      phone: user.phone ?? null,
      email: user.email ?? null,
      name: user.name ?? null,
    },
  } as T;
}

    if (user.role === UserRoleEnum.SHOP_OWNER) {
      return {
         token,
          role: user.role,
          redirectTo: '/',
          user: {
            id: user.id,
            phone: user.phone ?? null,
            email: user.email ?? null,
            name: user.name ?? null,
  },
      } as T;
    }

   return {
  token,
  role: user.role,
  redirectTo: '/',
  user: {
    id: user.id,
    phone: user.phone ?? null,
    email: user.email ?? null,
    name: user.name ?? null,
  },
} as T;
  }

    private generateRandomPassword(length = 8) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&";
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  };

  async getUser(email: string) {
    return this.db.query.usersSchema.findFirst({
      where: eq(schema.usersSchema.email, email),
    });
  }

  async getUserByPhone(phone: string) {
  return this.db.query.usersSchema.findFirst({
    where: eq(schema.usersSchema.phone, phone),
  });
}

}