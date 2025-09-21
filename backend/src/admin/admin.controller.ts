import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
@UseGuards(GqlAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('export/users')
  async exportUsers() {
    // Implementation for exporting user data
    return { message: 'User export functionality' };
  }

  @Get('export/content')
  async exportContent() {
    // Implementation for exporting content data
    return { message: 'Content export functionality' };
  }
}
