/**
 * クラス名からスネークケース名を取得する
 *
 * @param className クラス名
 * @returns スネークケース名
 * @description
 * - someRepository というクラス名から、some（スネークケース名）を取得する
 */
export const classNameToSnakeCase = (className: string) => {
  const result = /(.*)(?=Repository)/.exec(className);
  const name = result ? result[0] : className;
  const replaced = name
    ? name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    : name;
  return replaced.startsWith('_') ? replaced.slice(1) : replaced;
};
