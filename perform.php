<?php
// "Perform at the Post" handler (perform.html): bands, DJs and other entertainers.
// Emails each submission to the entertainment mailbox and a confirmation back to the sender.
// Runs on the Namecheap (cPanel) hosting. It does not run on GitHub Pages.

// ============================================================
//  SETTINGS: who gets entertainment submissions.
// ============================================================
$RECIPIENTS = ['entertainment@conneautlegionpost151.org'];

date_default_timezone_set('America/New_York');
$TYPES = ['Band', 'Solo / duo', 'DJ', 'Karaoke', 'Trivia host', 'Comedy', 'Other'];

function back($code) {
  header('Location: perform.html?perform=' . $code . '#perform-form', true, 303);
  exit;
}

// One line of text, no header-injection characters.
function clean($key, $max) {
  $v = isset($_POST[$key]) ? (string)$_POST[$key] : '';
  $v = trim(preg_replace('/[\r\n\t]+/', ' ', $v));
  return mb_substr($v, 0, $max);
}
function para($key, $max) {
  return mb_substr(trim(str_replace("\r\n", "\n", (string)($_POST[$key] ?? ''))), 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: perform.html#perform-form', true, 303);
  exit;
}

// Spam trap: real people never fill in the hidden "website" field.
if (clean('website', 200) !== '') back('sent');

$f = [];
foreach (['act' => 100, 'type' => 40, 'genre' => 100, 'hometown' => 80, 'links' => 300, 'dates' => 150, 'rate' => 80,
          'name' => 80, 'phone' => 30, 'email' => 120] as $k => $max) {
  $f[$k] = clean($k, $max);
}
$needs = para('needs', 1000);
$notes = para('notes', 2000);

foreach (['act', 'links', 'name', 'phone'] as $k) if ($f[$k] === '') back('missing');
if (!in_array($f['type'], $TYPES, true)) back('missing');
if (!filter_var($f['email'], FILTER_VALIDATE_EMAIL)) back('email');

$host = preg_replace(['/:\d+$/', '/^www\./'], '', strtolower($_SERVER['HTTP_HOST'] ?? 'localhost'));
$host = preg_replace('/[^a-z0-9.\-]/', '', $host);
$from = 'website@' . $host;

$opt = function ($v) { return $v !== '' ? $v : '(not given)'; };
$text = implode("\r\n", [
  'New "Perform at the Post" submission from the website',
  '',
  'ACT',
  'Name:      ' . $f['act'],
  'Type:      ' . $f['type'],
  'Style:     ' . $opt($f['genre']),
  'Hometown:  ' . $opt($f['hometown']),
  'Links:     ' . $f['links'],
  '',
  'BOOKING',
  'Dates:     ' . $opt($f['dates']),
  'Rate:      ' . $opt($f['rate']),
  'Brings / needs:',
  $needs !== '' ? str_replace("\n", "\r\n", $needs) : '(not given)',
  '',
  'CONTACT',
  'Name:      ' . $f['name'],
  'Phone:     ' . $f['phone'],
  'Email:     ' . $f['email'],
  '',
  $notes !== '' ? "Notes:\r\n" . str_replace("\n", "\r\n", $notes) : 'Notes: (none)',
  '',
  'Reply to this email to answer ' . $f['name'] . ' directly.',
  'Submitted ' . date('l, F j, Y g:i a T'),
]);

$sent = mail(
  implode(', ', $RECIPIENTS),
  '=?UTF-8?B?' . base64_encode('Entertainment: ' . $f['act'] . ' (' . $f['type'] . ')') . '?=',
  chunk_split(base64_encode($text)),
  implode("\r\n", [
    'From: Post 151 Website <' . $from . '>',
    'Reply-To: ' . $f['email'],
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ]),
  '-f' . $from
);
if (!$sent) back('failed');

// Confirmation back to the performer. Wording is in the editor's Form Emails tab.
require __DIR__ . '/form-emails.php';
send_confirmation($f['email'], 'perform', ['name' => $f['name'], 'act' => $f['act']], $from, $RECIPIENTS[0]);
back('sent');
