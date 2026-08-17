<script setup lang="ts">
import type { ProductOption } from './types/contracts'
import { useDoctorI18n } from './doctorI18n'

const { t } = useDoctorI18n()

const fieldLabelsEn: Record<string, string> = {
  shade: 'Shade', margin: 'Margin Design', implant_system: 'Implant System', pontic: 'Pontic Design',
  denture_scope: 'Restoration Scope', framework: 'Framework Material', arch: 'Arch', thickness: 'Material Thickness',
  attachment: 'Attachment Preference', design_output: 'Design Output', software_format: 'File Format'
}

const optionLabelsEn: Record<string, string> = {
  浅凹肩: 'Light Chamfer', 深凹肩: 'Deep Chamfer', 刃状: 'Knife Edge',
  改良盖嵴式: 'Modified Ridge Lap', 卫生型: 'Hygienic', 骑跨式: 'Ridge Lap',
  上颌: 'Upper Arch', 下颌: 'Lower Arch', 上下颌: 'Both Arches',
  钴铬合金: 'Cobalt-Chromium Alloy', 纯钛: 'Pure Titanium', 树脂基托: 'Acrylic Base',
  由设计师建议: 'Designer Recommendation', 尽量减少: 'Minimize', 医生指定: 'Doctor Specified',
  冠桥设计: 'Crown & Bridge Design', 美学蜡型: 'Diagnostic Wax-up', 种植导板: 'Implant Guide', 数字排牙: 'Digital Tooth Setup'
}

function fieldLabel(key: string, source: string) {
  return t(source, fieldLabelsEn[key] ?? key.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))
}

function optionLabel(value: string) {
  return t(value, optionLabelsEn[value] ?? value)
}

const props = defineProps<{
  fields: ProductOption['form_fields']
  modelValue: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

function setValue(key: string, event: Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  emit('update:modelValue', { ...props.modelValue, [key]: target.value })
}
</script>

<template>
  <div class="dv2-form-stack">
    <label v-for="configField in fields" :key="configField.key">
      <span>{{ fieldLabel(configField.key, configField.label) }} <i v-if="configField.required">*</i></span>
      <select
        v-if="configField.type === 'SELECT'"
        :value="modelValue[configField.key]"
        @change="setValue(configField.key, $event)"
      >
        <option value="">{{ t('请选择', 'Select') }}</option>
        <option v-for="selectOption in configField.options || []" :key="selectOption" :value="selectOption">
          {{ optionLabel(selectOption) }}
        </option>
      </select>
      <textarea
        v-else-if="configField.type === 'TEXTAREA'"
        :value="modelValue[configField.key]"
        rows="4"
        @input="setValue(configField.key, $event)"
      />
      <input
        v-else
        :value="modelValue[configField.key]"
        :type="configField.type === 'NUMBER' ? 'number' : 'text'"
        @input="setValue(configField.key, $event)"
      >
    </label>
  </div>
</template>
