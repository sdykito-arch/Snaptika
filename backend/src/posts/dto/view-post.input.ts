import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

@InputType()
export class ViewPostInput {
  @Field(() => ID)
  @IsString()
  postId: string;

  @Field({ nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;
}
