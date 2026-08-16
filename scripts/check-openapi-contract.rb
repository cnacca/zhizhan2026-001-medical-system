#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"
require "pathname"

path = "docs/api/openapi.yaml"
data = YAML.load_file(path)
paths = data.fetch("paths")

http_methods = %w[get post put delete patch].freeze
required_error_responses = %w[400 401 403 404 409 503 default].freeze
required_paths = %w[
  /files/{fileId}/complete
  /process-instance/nodes/{nodeInstanceId}/start
  /process-instance/nodes/{nodeInstanceId}/complete
  /process-instance/nodes/{nodeInstanceId}/skip
  /notifications
  /notifications/unread-count
  /notifications/{notificationId}/read
  /notifications/read-all
].freeze

operation_ids = []
errors = []

paths.each do |api_path, operations|
  next if api_path.start_with?("x-")

  operations.each do |method, operation|
    next unless http_methods.include?(method)

    operation_id = operation["operationId"]
    if operation_id.nil? || operation_id.strip.empty?
      errors << "#{method.upcase} #{api_path} missing operationId"
    else
      operation_ids << operation_id
    end

    responses = operation["responses"] || {}
    required_error_responses.each do |status|
      errors << "#{method.upcase} #{api_path} missing #{status} response" unless responses.key?(status)
    end
  end
end

controller_root = Pathname("backend/platform-server/src/main/java")
controller_operations = {}
controller_root.glob("**/*.java").each do |controller_path|
  source = controller_path.read
  next unless source.include?("@RestController") || source.include?("@Controller")

  class_declaration = source.index(/\b(?:class|record)\s+\w+/) || source.length
  controller_header = source[0...class_declaration]
  class_mapping = controller_header.match(/@RequestMapping\s*\(\s*"([^"]*)"\s*\)/m)
  class_path = class_mapping&.[](1).to_s
  parsed_method_count = 0
  source.scan(/@(Get|Post|Put|Delete|Patch)Mapping\s*\(\s*(?:value\s*=\s*)?"([^"]*)"/m) do |kind, method_path|
    parsed_method_count += 1
    method = kind.downcase
    full_path = "#{class_path}#{method_path}".gsub(%r{/+}, "/")
    full_path = "/#{full_path}" unless full_path.start_with?("/")
    normalized_path = full_path.gsub(/\{[^}]+\}/, "{}")
    controller_operations[[method, normalized_path]] = controller_path.to_s
  end
  declared_mapping_count = source.scan(/@(Get|Post|Put|Delete|Patch|Request)Mapping\b/).length
  expected_method_count = declared_mapping_count - (class_mapping.nil? ? 0 : 1)
  if parsed_method_count != expected_method_count
    errors << "unsupported Spring mapping syntax in #{controller_path}; " \
              "parsed #{parsed_method_count} of #{expected_method_count} controller methods"
  end
end

contract_operations = {}
paths.each do |api_path, operations|
  next if api_path.start_with?("x-")

  http_methods.each do |method|
    next unless operations.key?(method)

    normalized_path = api_path.gsub(/\{[^}]+\}/, "{}")
    contract_operations[[method, normalized_path]] = api_path
  end
end

# WebSocket handshake is intentionally documented in OpenAPI for integration consumers,
# but it is registered by WebSocketConfig rather than a Spring MVC controller.
non_rest_contract_operations = [["get", "/ws/connect"]].freeze

(controller_operations.keys - contract_operations.keys).sort.each do |method, normalized_path|
  source = controller_operations.fetch([method, normalized_path])
  errors << "controller operation missing from OpenAPI: #{method.upcase} #{normalized_path} (#{source})"
end

(contract_operations.keys - controller_operations.keys - non_rest_contract_operations).sort.each do |method, normalized_path|
  api_path = contract_operations.fetch([method, normalized_path])
  errors << "OpenAPI operation has no controller: #{method.upcase} #{api_path}"
end

operation_id_counts = Hash.new(0)
operation_ids.each { |operation_id| operation_id_counts[operation_id] += 1 }
duplicates = operation_id_counts.select { |_operation_id, count| count > 1 }.keys
duplicates.each { |operation_id| errors << "duplicate operationId #{operation_id}" }

required_paths.each do |required_path|
  errors << "missing required Task 8B path #{required_path}" unless paths.key?(required_path)
end

form_config_methods = paths.fetch("/form-configs").keys.select { |method| http_methods.include?(method) }.sort
unless form_config_methods == %w[get post]
  errors << "/form-configs methods expected get,post but got #{form_config_methods.join(',')}"
end

production_review = paths.dig("/orders/{orderId}/production-review", "post") || {}
production_review_description = production_review["description"].to_s
unless production_review_description.include?("workflow:review-production") &&
       production_review_description.include?("普通 WORKER") &&
       production_review_description.include?("CS 返回 403") &&
       production_review_description.include?("设计确认门禁")
  errors << "production review contract must describe authorized WORKER, ADMIN fallback, forbidden ordinary roles, and design gate"
end

production_review_schema = data.dig("components", "schemas", "ProductionReviewRequest") || {}
production_review_schema_description = production_review_schema["description"].to_s
unless production_review_schema_description.include?("reject_reason") &&
       production_review_schema_description.include?("branch_params")
  errors << "ProductionReviewRequest must document conditional reject reason and branch selection validation"
end

reassign_schema = paths.dig(
  "/orders/{orderId}/process-instance/nodes/{nodeInstanceId}/reassign",
  "post",
  "requestBody",
  "content",
  "application/json",
  "schema"
) || {}
unless Array(reassign_schema["required"]).include?("reason")
  errors << "process reassignment contract must require reason"
end

skip_description = paths.dig(
  "/process-instance/nodes/{nodeInstanceId}/skip",
  "post",
  "description"
).to_s
unless skip_description.include?("仅 ADMIN") &&
       skip_description.include?("WORKER 与 CS 均不得")
  errors << "optional node skip contract must remain ADMIN-only"
end

confirm_receipt = paths.dig("/orders/{orderId}/confirm-receipt", "post") || {}
confirm_receipt_description = confirm_receipt["description"].to_s
unless confirm_receipt_description.include?("DOCTOR") &&
       confirm_receipt_description.include?("SHIPPED") &&
       confirm_receipt_description.include?("DELIVERED_PENDING_CONFIRMATION") &&
       confirm_receipt_description.include?("delivered_at")
  errors << "receipt confirmation contract must remain doctor-only and require shipped logistics"
end
unless confirm_receipt.dig("responses", "409", "description").to_s.include?("尚未发货")
  errors << "receipt confirmation contract must document the unshipped 409 gate"
end

if errors.any?
  warn "OpenAPI contract check failed:"
  errors.each { |error| warn "- #{error}" }
  exit 1
end

puts "openapi contract ok"
puts "paths=#{paths.length}"
puts "operations=#{operation_ids.length}"
puts "operationIds=#{operation_ids.uniq.length}"
