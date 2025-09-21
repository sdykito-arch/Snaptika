import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreatePostInput } from './create-post.input';
import { IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class UpdatePostInput extends PartialType(CreatePostInput) {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
