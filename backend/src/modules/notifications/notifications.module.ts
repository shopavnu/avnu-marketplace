import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './services/notification.service';
import { ProductIssuesListener } from './listeners/product-issues.listener';

@Module({
  imports: [ConfigModule],
  providers: [NotificationService, ProductIssuesListener],
  exports: [NotificationService],
})
export class NotificationsModule {}
