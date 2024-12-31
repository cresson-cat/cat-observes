import { Module } from '@nestjs/common';
import { UsageHistoryRepository } from './usage-history/usage-history.repository';
import { FirestoreService } from './firestore.service';

@Module({
  providers: [UsageHistoryRepository, FirestoreService],
  exports: [UsageHistoryRepository],
})
export class FirestoreModule {}
