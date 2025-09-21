import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

@ArgsType()
export class PostsArgs {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field({ nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @Field({ nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;
}
