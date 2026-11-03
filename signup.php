<?php
// Event sign-up handler (signup.html). Emails each sign-up to the Post mailbox picked for that
// event in the site editor ("Online sign-up goes to"), plus a confirmation to the person.
// Runs on the Namecheap (cPanel) hosting. It does not run on GitHub Pages.

// ============================================================
//  SETTINGS: the only mailboxes a sign-up may be sent to.
//  Keep in sync with MAILBOXES in admin.js.
// ============================================================
$DOMAIN = 'conneautlegionpost151.org';
$MAILBOXES = ['commander', 'first-vice', 'second-vice', 'finance', 'adjutant', 'chaplain',
  'sal-commander', 'sal-adjutant', 'aux-president', 'aux-treasurer', 'aux-membership', 'aux-secretary',
  'bar-manager', 'kitchen-manager', 'hall-manager', 'hero-banners', 'sentinel', 'info', 'webadmin',
  'entertainment', 'media'];
$MAX_KIDS = 10;

date_default_timezone_set('America/New_York');

// One line of text, no header-injection characters.
function clean($v, $max) {
  $v = trim(preg_replace('/[\r\n\t]+/', ' ', (string)$v));
  return mb_substr($v, 0, $max);
}
function field($key, $max) { return clean($_POST[$key] ?? '', $max); }

$eventId = preg_replace('/[^a-z0-9\-]/', '', strtolower(field('event_id', 160)));
function back($code) {
  global $eventId;
  header('Location: signup.html?event=' . rawurlencode($eventId) . '&su=' . $code . '#signup-form', true, 303);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: events.html', true, 303);
  exit;
}

// Spam trap: real people never fill in the hidden "website" field.
if (field('website', 200) !== '') back('sent');

$box = field('to', 40);
if (!in_array($box, $MAILBOXES, true)) back('failed');
$to = $box . '@' . $DOMAIN;

$f = [];
foreach (['event_title' => 120, 'event_when' => 80, 'name' => 80, 'phone' => 30, 'email' => 120, 'member' => 80, 'adults' => 3,
          'signup_by' => 10, 'max_age' => 2] as $k => $max) {
  $f[$k] = field($k, $max);
}
$notes = mb_substr(trim(str_replace("\r\n", "\n", (string)($_POST['notes'] ?? ''))), 0, 1500);

foreach (['event_title', 'name', 'phone'] as $k) if ($f[$k] === '') back('missing');
if ($f['adults'] !== '' && !preg_match('/^\d{1,2}$/', $f['adults'])) back('missing');

// Sign-ups close at the end of the "sign up by" day.
if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $f['signup_by']) && date('Y-m-d') > $f['signup_by']) back('closed');
$maxAge = preg_match('/^\d{1,2}$/', $f['max_age']) ? (int)$f['max_age'] : 17;
if ($f['email'] !== '' && !filter_var($f['email'], FILTER_VALIDATE_EMAIL)) back('email');

// Children (only on kids events). Rows left empty are skipped.
$kids = [];
$names = (array)($_POST['kid_name'] ?? []);
$ages = (array)($_POST['kid_age'] ?? []);
$genders = (array)($_POST['kid_gender'] ?? []);
$isKids = count($names) > 0;
for ($i = 0; $i < min(count($names), $MAX_KIDS); $i++) {
  $n = clean(is_string($names[$i]) ? $names[$i] : '', 60);
  $a = clean(is_string($ages[$i] ?? '') ? ($ages[$i] ?? '') : '', 3);
  $g = clean(is_string($genders[$i] ?? '') ? ($genders[$i] ?? '') : '', 10);
  if ($n === '' && $a === '') continue;
  if ($n === '' || !preg_match('/^\d{1,2}$/', $a) || !in_array($g, ['Boy', 'Girl'], true)) back('kids');
  if ((int)$a > $maxAge) back('age');
  $kids[] = [$n, $a, $g];
}
if ($isKids && !$kids) back('kids');
if ($isKids && $f['member'] === '') back('member');

$host = preg_replace(['/:\d+$/', '/^www\./'], '', strtolower($_SERVER['HTTP_HOST'] ?? 'localhost'));
$host = preg_replace('/[^a-z0-9.\-]/', '', $host);
$from = 'website@' . $host;

$lines = [
  'New sign-up from the website',
  '',
  'EVENT:   ' . $f['event_title'],
  'When:    ' . ($f['event_when'] !== '' ? $f['event_when'] : '(see Events page)'),
  '',
  ($isKids ? 'PARENT / GUARDIAN' : 'WHO'),
  'Name:    ' . $f['name'],
  'Phone:   ' . $f['phone'],
  'Email:   ' . ($f['email'] !== '' ? $f['email'] : '(none given)'),
  'Member:  ' . ($f['member'] !== '' ? $f['member'] : '(none given)'),
  ($isKids ? 'Adults coming: ' : 'People coming: ') . ($f['adults'] !== '' ? $f['adults'] : '(not given)'),
];
if ($isKids) {
  $lines[] = '';
  $lines[] = 'CHILDREN (' . count($kids) . ')';
  foreach ($kids as $j => [$n, $a, $g]) {
    $lines[] = ($j + 1) . '. ' . $n . ', age ' . $a . ', ' . $g;
  }
}
$lines[] = '';
$lines[] = $notes !== '' ? "Notes:\r\n" . str_replace("\n", "\r\n", $notes) : 'Notes: (none)';
$lines[] = '';
if ($f['email'] !== '') $lines[] = 'Reply to this email to answer ' . $f['name'] . ' directly.';
$lines[] = 'Submitted ' . date('l, F j, Y g:i a T');

$subject = 'Sign-up: ' . $f['event_title'] . ' - ' . $f['name'] . ($isKids ? ' (' . count($kids) . (count($kids) === 1 ? ' child' : ' children') . ')' : '');
$headers = [
  'From: Post 151 Website <' . $from . '>',
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: base64',
];
if ($f['email'] !== '') array_splice($headers, 1, 0, 'Reply-To: ' . $f['email']);

$sent = mail(
  $to,
  '=?UTF-8?B?' . base64_encode($subject) . '?=',
  chunk_split(base64_encode(implode("\r\n", $lines))),
  implode("\r\n", $headers),
  '-f' . $from
);
if (!$sent) back('failed');

// Confirmation back to the person, if they gave an email. Wording is in the editor's Form Emails tab.
if ($f['email'] !== '') {
  require __DIR__ . '/form-emails.php';
  send_confirmation($f['email'], 'signup', ['name' => $f['name'], 'event' => $f['event_title'], 'date' => $f['event_when']], $from, $to,
    "You're signed up: {event}",
    "Hello {name},\n\nThank you for signing up for {event} ({date}) at American Legion Post 151. We look forward to seeing you!\n\nIf your plans change, please call the Post at 440-593-2205.\n\nAmerican Legion Cowle Post 151\n272 Broad St, Conneaut, OH 44030");
}
back('sent');
