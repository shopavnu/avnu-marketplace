import { Field, ObjectType } from '@nestjs/graphql';
import { UserRole } from '../../users/entities/user.entity';

@ObjectType()
class UserInfo {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  fullName: string;

  @Field({ nullable: true })
  profileImage?: string;

  @Field()
  isEmailVerified: boolean;

  @Field()
  isMerchant: boolean;

  @Field(() => String)
  role: UserRole;

  @Field(() => String, { nullable: true })
  merchantId?: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => UserInfo)
  user: UserInfo;
}
