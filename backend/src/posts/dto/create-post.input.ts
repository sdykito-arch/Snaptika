import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsEnum, IsInt, Min, Max } from 'class-validator';
import { MediaType } from '@prisma/client';

@InputType()
export class CreatePostInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  caption?: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  mediaUrls: string[];

  @Field(() => MediaType)
  @IsEnum(MediaType)
  mediaType: MediaType;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(600) // 10 minutes max
  duration?: number;

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;
}
