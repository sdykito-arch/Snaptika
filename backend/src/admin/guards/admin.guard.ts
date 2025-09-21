import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user is admin (you can customize this logic)
    const adminUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    // For demo purposes, any user with email containing 'admin' is considered admin
    // In production, you'd have a proper role system
    if (!adminUser || !adminUser.email.includes('admin')) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
