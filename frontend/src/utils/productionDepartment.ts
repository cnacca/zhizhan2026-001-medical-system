// Keep ordered keyword rules aligned with WorkflowExecutionService.workbenchDepartmentKey.
export function productionDepartmentKey(node: { stage_name?: string | null; process_name?: string; node_category?: string | null }) {
  const text = `${node.stage_name ?? ''} ${node.process_name ?? ''} ${node.node_category ?? ''}`.toUpperCase()
  const rules: Array<[string, string[]]> = [
    ['QC', ['质检', '检验', '终检', 'CHECK']], ['DISPATCH', ['发货', '出货', '物流', '包装']],
    ['PRINTING_3D', ['3D', '打印']], ['IMPLANT', ['种植', 'IMPLANT']],
    ['STEEL_FRAMEWORK', ['钢托', '钢架', 'STEEL']], ['ACRYLIC', ['胶托', 'ACRYLIC']],
    ['FLEXIBLE', ['隐形', 'FLEXIBLE']], ['ORTHO', ['正畸', 'ORTHO']],
    ['PORCELAIN', ['车瓷', 'PORCELAIN']], ['STAINING', ['上瓷', '上釉', '烧结', 'STAIN']],
    ['MILLING', ['车金', '切削', '研磨', 'MILL']], ['CAD', ['CAD', '设计', '排版', 'DESIGN']]
  ]
  return rules.find(([, words]) => words.some((word) => text.includes(word)))?.[0] ?? 'DATA_REVIEW'
}
