import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { MediaType } from '@prisma/client';

@InputType()
export class CreateStoryInput {
  @Field()
  @IsString()
  mediaUrl: string;

  @Field(() => MediaType)
  @IsEnum(MediaType)
  mediaType: MediaType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  caption?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30) // 30 seconds max for stories
  duration?: number;
}
