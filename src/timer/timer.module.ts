import { Module } from '@nestjs/common';
import { TimerService } from './timer.service';
import { TimerController } from './timer.controller';
import { ScheduleModule } from '@nestjs/schedule'; // 导入调度模块

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [TimerController],
  providers: [TimerService],
})
export class TimerModule {}
