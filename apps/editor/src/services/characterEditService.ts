import type { Character, CharacterExpression, VNProject } from "@vn-engine/vn-schema";

/** 生成短随机 id。 */
function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** 创建空角色。 */
export function createEmptyCharacter(): Character {
  return {
    id: createId("character"),
    name: "新角色",
    displayName: "新角色",
    description: "",
    expressions: []
  };
}

/** 创建空角色表情。 */
export function createEmptyExpression(assetId = ""): CharacterExpression {
  return {
    id: createId("expression"),
    name: "新表情",
    assetId
  };
}

/** 新增角色。 */
export function addCharacter(project: VNProject, character: Character): VNProject {
  return {
    ...project,
    characters: [...project.characters, character]
  };
}

/** 更新角色。 */
export function updateCharacter(project: VNProject, characterId: string, patch: Partial<Character>): VNProject {
  return {
    ...project,
    characters: project.characters.map((character) => (character.id === characterId ? { ...character, ...patch } : character))
  };
}

/** 删除角色。 */
export function deleteCharacter(project: VNProject, characterId: string): VNProject {
  return {
    ...project,
    characters: project.characters.filter((character) => character.id !== characterId)
  };
}

/** 新增角色表情。 */
export function addCharacterExpression(project: VNProject, characterId: string, expression: CharacterExpression): VNProject {
  return {
    ...project,
    characters: project.characters.map((character) =>
      character.id === characterId
        ? { ...character, expressions: [...(character.expressions ?? []), expression] }
        : character
    )
  };
}

/** 更新角色表情。 */
export function updateCharacterExpression(project: VNProject, characterId: string, expressionId: string, patch: Partial<CharacterExpression>): VNProject {
  return {
    ...project,
    characters: project.characters.map((character) =>
      character.id === characterId
        ? {
            ...character,
            expressions: (character.expressions ?? []).map((expression) =>
              expression.id === expressionId ? { ...expression, ...patch } : expression
            )
          }
        : character
    )
  };
}

/** 删除角色表情。 */
export function deleteCharacterExpression(project: VNProject, characterId: string, expressionId: string): VNProject {
  return {
    ...project,
    characters: project.characters.map((character) =>
      character.id === characterId
        ? { ...character, expressions: (character.expressions ?? []).filter((expression) => expression.id !== expressionId) }
        : character
    )
  };
}
