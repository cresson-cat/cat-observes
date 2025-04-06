import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firestore.service';
import { classNameToSnakeCase } from '../firestore.utils';
import { WriteResult } from '@google-cloud/firestore';
import { ConfigService } from '@nestjs/config';

/**
 * UsageHistory アクセスクラス
 *
 * @description
 * 必ず <collection-name ※ >Repository の形式の名称を付ける
 * ※ lowerCamelCase
 */
@Injectable()
export class UsageHistoryRepository extends FirestoreService {
  /**
   * コンストラクタ
   *
   * @param configService
   * @description コンストラクタは定型文
   */
  constructor(protected readonly configService: ConfigService) {
    super(configService);
    super.collectionName = classNameToSnakeCase(this.constructor.name);
  }

  /**
   * データ取得
   *
   * @param docId ドキュメントID
   * @returns データ
   */
  public async fetch(docId?: string) {
    return await super.getData(docId);
  }

  /**
   * 最新のデータ取得
   *
   * @returns 最新のデータ
   */
  public async fetchRecentHistory() {
    return await super.getLatestData();
  }

  /**
   * データ登録
   *
   * @param data データ
   * @param docId ドキュメントID
   * @returns 登録結果
   */
  public async save<T>(data: T, docId?: string): Promise<WriteResult> {
    return await super.setData(data, docId);
  }
}
