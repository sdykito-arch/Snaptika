import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { NotificationType } from '@prisma/client';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateNotificationInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  senderId?: string;

  @Field(() => ID)
  @IsString()
  receiverId: string;

  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  message: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  data?: any;
}
