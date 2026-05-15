import type { AnimationParamsSchema } from "../types/AnimationParamsSchema";

/** 按 paramsSchema 合并默认参数和节点参数。 */
export function normalizeAnimationParams(schema: AnimationParamsSchema, params: Record<string, unknown> | undefined): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(schema)) {
    result[key] = params?.[key] ?? item.default;
  }
  for (const [key, value] of Object.entries(params ?? {})) {
    if (!(key in result)) result[key] = value;
  }
  return result;
}

/** 读取数字参数。 */
export function numberParam(params: Record<string, unknown>, key: string, fallback: number): number {
  const value = params[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** 读取字符串参数。 */
export function stringParam(params: Record<string, unknown>, key: string, fallback: string): string {
  const value = params[key];
  return typeof value === "string" ? value : fallback;
}
