/** 角色表情与素材的映射。 */
export interface CharacterExpression {
  /** 表情唯一标识。 */
  id: string;
  /** 表情显示名称。 */
  name: string;
  /** 表情对应的角色图片素材 id。 */
  assetId: string;
}

/** 视觉小说中的角色定义。 */
export interface Character {
  /** 角色唯一标识。 */
  id: string;
  /** 角色名称。 */
  name: string;
  /** 运行时展示名称。 */
  displayName?: string;
  /** 角色默认立绘素材 id。 */
  defaultAssetId?: string;
  /** 角色台词名称颜色。 */
  color?: string;
  /** 角色说明。 */
  description?: string;
  /** 角色表情列表。 */
  expressions?: CharacterExpression[];
}
