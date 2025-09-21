import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class PresignedUrlInput {
  @Field()
  @IsString()
  fileName: string;

  @Field()
  @IsString()
  fileType: string;

  @Field({ nullable: true, defaultValue: 'uploads' })
  @IsOptional()
  @IsString()
  folder?: string;
}
