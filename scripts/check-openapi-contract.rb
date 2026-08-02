#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

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
