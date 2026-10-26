<?php
// Shared by the form handlers: reads the formEmails wording from content.js (edited in the
// site editor's Form Emails tab) and sends the confirmation email back to the person.

function form_text($key, $fallback = '') {
  static $all = null;
  if ($all === null) {
    $all = [];
    $src = @file_get_contents(__DIR__ . '/content.js');
    if ($src !== false && preg_match('/^  formEmails:\s*\{/m', $src, $m, PREG_OFFSET_CAPTURE)) {
      $start = $m[0][1] + strlen($m[0][0]) - 1;
      $depth = 0; $len = strlen($src);
      for ($i = $start; $i < $len; $i++) {
        $c = $src[$i];
        if ($c === '"') { for ($i++; $i < $len && $src[$i] !== '"'; $i++) if ($src[$i] === '\\') $i++; continue; }
        if ($c === '{') $depth++;
        elseif ($c === '}' && --$depth === 0) break;
      }
      // The editor writes one "key: JSON string" per line, so quoting the keys makes it JSON.
      $json = preg_replace('/^(\s*)([A-Za-z_$][\w$]*)\s*:/m', '$1"$2":', substr($src, $start, $i - $start + 1));
      $all = json_decode($json, true) ?: [];
    }
  }
  return isset($all[$key]) && is_string($all[$key]) ? $all[$key] : $fallback;
}

// Fills {name}-style placeholders. Values are one-line form fields, already cleaned.
function form_fill($text, $vars) {
  foreach ($vars as $k => $v) $text = str_replace('{' . $k . '}', $v, $text);
  return $text;
}

// Sends the confirmation. An empty body in the editor means "don't send one".
function send_confirmation($to, $prefix, $vars, $from, $replyTo, $fallbackSubject = '', $fallbackBody = '') {
  $body = trim(form_text($prefix . 'Body', $fallbackBody));
  if ($body === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) return;
  $subject = form_fill(form_text($prefix . 'Subject', $fallbackSubject), $vars);
  $subject = preg_replace('/[\r\n]+/', ' ', $subject ?: 'Thank you from American Legion Post 151');
  $body = str_replace("\n", "\r\n", str_replace("\r\n", "\n", form_fill($body, $vars)));
  @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', chunk_split(base64_encode($body)), implode("\r\n", [
    'From: American Legion Post 151 <' . $from . '>',
    'Reply-To: ' . $replyTo,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ]), '-f' . $from);
}
