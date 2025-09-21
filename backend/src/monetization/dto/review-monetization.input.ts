import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class ReviewMonetizationInput {
  @Field(() => ID)
  @IsString()
  requestId: string;

  @Field()
  @IsBoolean()
  approve: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}
