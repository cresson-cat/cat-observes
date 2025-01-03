import { Injectable } from '@nestjs/common';
// Google Cloud Client Library for Node.js
import { Firestore } from '@google-cloud/firestore';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirestoreService {
  private firestore: Firestore;

  constructor(private readonly configService: ConfigService) {
    const projectId = this.configService.get<string>('CAT_OBSERVES_PJ_ID');
    this.firestore = new Firestore({ projectId });
  }

  async getData(collectionName: string, docId?: string) {
    const docRef = this.firestore.collection(collectionName).doc(docId);
    const doc = await docRef.get();
    return doc.data();
  }

  async setData<T>(collectionName: string, data: T, docId?: string) {
    const docRef = this.firestore.collection(collectionName).doc(docId);
    return await docRef.set(data);
  }
}
