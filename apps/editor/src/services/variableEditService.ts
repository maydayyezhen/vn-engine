import type { VNProject, VNVariableDefinition, VNVariableType } from "@vn-engine/vn-schema";

/** 根据变量类型创建默认值。 */
export function createDefaultVariableValue(type: VNVariableType): boolean | number | string {
  if (type === "boolean") return false;
  if (type === "number") return 0;
  return "";
}

/** 创建空变量定义。 */
export function createEmptyVariable(existingVariables: VNVariableDefinition[] = []): VNVariableDefinition {
  const used = new Set(existingVariables.map((item) => item.name));
  let index = existingVariables.length + 1;
  let name = `var_${index}`;
  while (used.has(name)) {
    index += 1;
    name = `var_${index}`;
  }
  return {
    name,
    type: "boolean",
    defaultValue: false,
    description: ""
  };
}

/** 新增项目变量定义。 */
export function addVariable(project: VNProject, variable = createEmptyVariable(project.variables ?? [])): VNProject {
  return {
    ...project,
    variables: [...(project.variables ?? []), variable]
  };
}

/** 更新项目变量定义。 */
export function updateVariable(project: VNProject, variableName: string, patch: Partial<VNVariableDefinition>): VNProject {
  return {
    ...project,
    variables: (project.variables ?? []).map((variable) => {
      if (variable.name !== variableName) return variable;
      const nextType = patch.type ?? variable.type;
      const shouldResetDefault = patch.type !== undefined && patch.type !== variable.type;
      return {
        ...variable,
        ...patch,
        defaultValue: shouldResetDefault ? createDefaultVariableValue(nextType) : patch.defaultValue ?? variable.defaultValue
      };
    })
  };
}

/** 删除项目变量定义，不自动清理节点引用。 */
export function deleteVariable(project: VNProject, variableName: string): VNProject {
  return {
    ...project,
    variables: (project.variables ?? []).filter((variable) => variable.name !== variableName)
  };
}

/** 查找变量定义。 */
export function findVariable(project: VNProject, variableName: string | undefined): VNVariableDefinition | undefined {
  if (!variableName) return undefined;
  return (project.variables ?? []).find((variable) => variable.name === variableName);
}
