// Presentation only. Required-file validation remains CLASSIFIED_SCAN_BUNDLE_V3.
export function optionalRecordApplies(category: string, code: string) {
  if (code === 'unclassified_record') return true
  if (code === 'shade_photo') return ['FIXED_RESTORATION', 'IMPLANT_RESTORATION', 'REMOVABLE_PROSTHETICS'].includes(category)
  if (code === 'intraoral_photo') return ['FIXED_RESTORATION', 'IMPLANT_RESTORATION'].includes(category)
  if (code === 'old_denture_reference') return ['FIXED_RESTORATION', 'REMOVABLE_PROSTHETICS'].includes(category)
  return false
}

export function productRecordVisible(productCode: string, code: string) {
  return !(productCode === 'REMOVABLE_FLEXIBLE_DENTURE' && code === 'profile_photo')
}
