import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firestore.service';

@Injectable()
export class UsageHistoryRepository extends FirestoreService {}
