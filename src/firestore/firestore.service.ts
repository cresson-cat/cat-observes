import { Injectable } from '@nestjs/common';
// Google Cloud Client Library for Node.js
import { Firestore } from '@google-cloud/firestore';
import { ConfigService } from '@nestjs/config';

/**
 * Firestore にアクセスする基底クラス
 *
 * @todo
 * - いずれ update / delete ..等追加予定
 * - Result 型にする可能性あり
 * - 課題が出てくるまで一旦この方式で
 */
@Injectable()
export class FirestoreService {
  private _firestore: Firestore;
  private _collectionName: string;

  /**
   * コンストラクタ
   *
   * @param configService
   */
  constructor(protected readonly configService: ConfigService) {
    const projectId = this.configService.get<string>('CAT_OBSERVES_PJ_ID');
    const keyFilename = this.configService.get<string>('CAT_OBSERVES_KEY_FILE');
    this._firestore = new Firestore({ projectId, keyFilename });
  }

  /**
   * コレクション名を設定
   */
  set collectionName(name: string) {
    this._collectionName = name;
  }

  /**
   * データ取得
   *
   * @param docId ドキュメントID
   * @returns データ
   */
  async getData(docId?: string) {
    const docRef = this._firestore.collection(this._collectionName).doc(docId);
    const doc = await docRef.get();
    return doc.data();
  }

  /**
   * データ登録
   *
   * @param docId ドキュメントID
   * @returns WriteResult オブジェクト（Timestamp 等を持つ）
   */
  async setData<T>(data: T, docId?: string) {
    const collection = this._firestore.collection(this._collectionName);
    const docRef = docId ? collection.doc(docId) : collection.doc();
    return await docRef.set({ ...data, created_at: new Date() });
  }
}
