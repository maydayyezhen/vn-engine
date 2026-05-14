import type { ConditionBranch, ConditionExpression, ConditionOperator, VariableValue } from "@vn-engine/vn-schema";
import { VariableStore } from "../variable/VariableStore";

/** 条件求值失败时的记录回调。 */
export type ConditionErrorHandler = (message: string) => void;

/** 条件求值器，用于判断结构化条件和旧版条件分支是否成立。 */
export class ConditionEvaluator {
  /** 变量存储。 */
  private readonly variables: VariableStore;
  /** 求值错误回调。 */
  private readonly onError?: ConditionErrorHandler;

  /** 创建条件求值器。 */
  constructor(variables: VariableStore, onError?: ConditionErrorHandler) {
    this.variables = variables;
    this.onError = onError;
  }

  /** 判断旧版条件分支是否成立。 */
  evaluate(branch: ConditionBranch): boolean {
    const actual = this.variables.get(branch.variable);
    return this.compareLegacy(branch.operator, actual, branch.value);
  }

  /** 判断结构化条件表达式是否成立。 */
  evaluateExpression(expression: ConditionExpression): boolean {
    try {
      if (expression.kind === "variable") {
        const actual = this.variables.get(expression.variableName);
        return this.compare(expression.operator, actual, expression.value);
      }
      if (expression.kind === "and") return expression.conditions.every((condition) => this.evaluateExpression(condition));
      if (expression.kind === "or") return expression.conditions.some((condition) => this.evaluateExpression(condition));
      if (expression.kind === "not") return !this.evaluateExpression(expression.condition);
      this.onError?.("未知条件表达式。");
      return false;
    } catch (error) {
      this.onError?.(error instanceof Error ? error.message : "条件求值失败。");
      return false;
    }
  }

  /** 根据新版运算符比较变量值。 */
  private compare(operator: ConditionOperator, actual: VariableValue | undefined, expected: VariableValue): boolean {
    if (operator === "eq") return actual === expected;
    if (operator === "ne") return actual !== expected;
    if (operator === "gt") return Number(actual) > Number(expected);
    if (operator === "gte") return Number(actual) >= Number(expected);
    if (operator === "lt") return Number(actual) < Number(expected);
    if (operator === "lte") return Number(actual) <= Number(expected);
    if (operator === "contains") return typeof actual === "string" && typeof expected === "string" && actual.includes(expected);
    if (operator === "notContains") return typeof actual === "string" && typeof expected === "string" && !actual.includes(expected);
    this.onError?.(`不支持的条件运算符：${String(operator)}`);
    return false;
  }

  /** 根据旧版分支运算符比较变量值。 */
  private compareLegacy(operator: ConditionBranch["operator"], actual: VariableValue | undefined, expected: VariableValue | undefined): boolean {
    if (operator === "exists") return actual !== undefined && actual !== null;
    if (operator === "equals") return actual === expected;
    if (operator === "notEquals") return actual !== expected;
    if (operator === "greaterThan") return Number(actual) > Number(expected);
    if (operator === "lessThan") return Number(actual) < Number(expected);
    this.onError?.(`不支持的旧版条件运算符：${String(operator)}`);
    return false;
  }
}
