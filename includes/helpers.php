<?php
/**
 * helpers.php — Shared utility functions for Flower Perfumes PHP backend
 */

/**
 * Send a JSON response and exit.
 */
function jsonResponse(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Sanitize a string input value.
 */
function sanitize(?string $value): string {
    return htmlspecialchars(trim((string)($value ?? '')), ENT_QUOTES, 'UTF-8');
}

/**
 * Get a POST field, sanitized.
 */
function postField(string $key, string $default = ''): string {
    return isset($_POST[$key]) ? sanitize($_POST[$key]) : $default;
}

/**
 * Parse a sizes JSON string into a clean PHP array.
 * Input can be: JSON string like ["100ml","50ml"] or comma-separated "100ml,50ml"
 */
function parseSizes(string $sizesInput): array {
    if (empty($sizesInput)) return [];

    // Try JSON first
    $decoded = json_decode($sizesInput, true);
    if (is_array($decoded)) {
        return array_values(array_filter(array_map('trim', $decoded)));
    }

    // Fall back to comma-separated
    return array_values(array_filter(array_map('trim', explode(',', $sizesInput))));
}

/**
 * Return boolean from various truthy input values.
 */
function parseBool($value): bool {
    if (is_bool($value)) return $value;
    if (is_int($value)) return $value !== 0;
    $s = strtolower(trim((string)$value));
    return in_array($s, ['1', 'true', 'yes', 'on'], true);
}
