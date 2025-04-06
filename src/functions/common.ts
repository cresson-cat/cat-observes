import { ValidationError, validateOrReject } from 'class-validator';

/**
 * 共通の検証処理
 *
 * @param unverified 検証前のデータ
 * @description class-validator で共通の検証処理をおこなう
 */
export const valid = async <T extends object>(unverified: T): Promise<void> =>
  validateOrReject(unverified);

/**
 * ValidationError の判定
 *
 * @param errors エラー
 * @returns true: 引数は ValidationError[] / false: 引数は ValidationError[] 以外のError
 */
export const isValidationErrors = (
  errors: unknown,
): errors is ValidationError[] =>
  Array.isArray(errors) &&
  errors.length > 0 &&
  errors.every((e) => e instanceof ValidationError);

/**
 * 再スロー用のエラー
 *
 * @param message エラーメッセージ
 * @param cause 伝搬元のエラー
 * @returns エラー
 */
export const errorForRethrow = (message: string, cause: unknown) =>
  Object.assign(new Error(message), { cause });
