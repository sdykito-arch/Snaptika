import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ReportStatus, ReportReason } from '@prisma/client';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

// Register enums for GraphQL
registerEnumType(ReportStatus, {
  name: 'ReportStatus',
});

registerEnumType(ReportReason, {
  name: 'ReportReason',
});

@ObjectType()
export class Report {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  reporterId: string;

  @Field(() => ID, { nullable: true })
  reportedUserId?: string;

  @Field(() => ID, { nullable: true })
  postId?: string;

  @Field(() => ReportReason)
  reason: ReportReason;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ReportStatus)
  status: ReportStatus;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  reviewedAt?: Date;

  @Field(() => User)
  reporter: User;

  @Field(() => User, { nullable: true })
  reportedUser?: User;

  @Field(() => Post, { nullable: true })
  post?: Post;
}

@ObjectType()
export class ReportsResponse {
  @Field(() => [Report])
  reports: Report[];

  @Field()
  total: number;

  @Field()
  hasMore: boolean;
}
