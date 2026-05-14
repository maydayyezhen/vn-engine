import type { ConditionExpression, ConditionOperator, VNProject } from "@vn-engine/vn-schema";
import { findVariable } from "./variableEditService";

/** 条件运算符选项。 */
export const conditionOperatorOptions: ConditionOperator[] = ["eq", "ne", "gt", "gte", "lt", "lte", "contains", "notContains"];

/** 创建默认变量条件。 */
export function createDefaultVariableCondition(project: VNProject): ConditionExpression {
  const variable = project.variables?.[0];
  return {
    kind: "variable",
    variableName: variable?.name ?? "",
    operator: "eq",
    value: variable?.defaultValue ?? true
  };
}

/** 根据变量类型转换条件比较值。 */
export function coerceConditionValue(project: VNProject, variableName: string, value: string | number | boolean): string | number | boolean {
  const variable = findVariable(project, variableName);
  if (variable?.type === "boolean") return Boolean(value);
  if (variable?.type === "number") return Number(value);
  return String(value);
}
