import type { DoctorGateway } from '../types/contracts'
import { LegacyHttpDoctorGateway } from './httpDoctorGateway'
import { MockDoctorGateway } from './mockDoctorGateway'

export type DoctorGatewayMode = 'mock' | 'api'

export function resolveDoctorGatewayMode(): DoctorGatewayMode {
  const configured = String(import.meta.env.VITE_DOCTOR_DATA_SOURCE ?? '').toLowerCase()
  const query = new URLSearchParams(window.location.search)
  if (configured === 'mock' || query.get('doctorMock') === '1') return 'mock'
  return 'api'
}

export function createDoctorGateway(options: {
  token: string
  displayName: string
  clinicName: string
}): DoctorGateway {
  if (resolveDoctorGatewayMode() === 'mock') return new MockDoctorGateway()
  const baseUrl = String(import.meta.env.VITE_DOCTOR_API_BASE_URL ?? '').replace(/\/$/, '')
  return new LegacyHttpDoctorGateway(options.token, { displayName: options.displayName, clinicName: options.clinicName }, baseUrl)
}
