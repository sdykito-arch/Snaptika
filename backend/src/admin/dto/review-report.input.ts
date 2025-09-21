import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsIn, IsOptional } from 'class-validator';

@InputType()
export class ReviewReportInput {
  @Field(() => ID)
  @IsString()
  reportId: string;

  @Field()
  @IsString()
  @IsIn(['resolve', 'dismiss'])
  action: 'resolve' | 'dismiss';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}
