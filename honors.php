<?php
// Funeral honors request handler (funeral-honors.html).
// Emails each request to the people who arrange the Honor Guard.
// Runs on the Namecheap (cPanel) hosting. It does not run on GitHub Pages.

// ============================================================
//  SETTINGS: who gets funeral honors requests.
// ============================================================
$RECIPIENTS = ['commander@conneautlegionpost151.org', 'chaplain@conneautlegionpost151.org'];

date_default_timezone_set('America/New_York');
$BRANCHES = ['Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force', 'Merchant Marine', 'Other / not sure'];
$TYPES = ['Graveside', 'Funeral home', 'Church', 'Memorial service', 'Other'];
$RELATIONS = ['Family member', 'Funeral director', 'Friend', 'Other'];

function back($code) {
  header('Location: funeral-honors.html?honors=' . $code . '#honors-form', true, 303);
  exit;
}

// One line of text, no header-injection characters.
function clean($key, $max) {
  $v = isset($_POST[$key]) ? (string)$_POST[$key] : '';
  $v = trim(preg_replace('/[\r\n\t]+/', ' ', $v));
  return mb_substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: funeral-honors.html#honors-form', true, 303);
  exit;
}

// Spam trap: real people never fill in the hidden "website" field.
if (clean('website', 200) !== '') back('sent');

$f = [];
foreach (['veteran' => 100, 'branch' => 40, 'era' => 80, 'date' => 10, 'time' => 5, 'type' => 40, 'funeral_home' => 100,
          'location' => 200, 'name' => 80, 'relation' => 40, 'phone' => 30, 'email' => 120] as $k => $max) {
  $f[$k] = clean($k, $max);
}
$notes = mb_substr(trim(str_replace("\r\n", "\n", (string)($_POST['notes'] ?? ''))), 0, 2000);

foreach (['veteran', 'location', 'name', 'phone'] as $k) if ($f[$k] === '') back('missing');
if (!in_array($f['branch'], $BRANCHES, true) || !in_array($f['type'], $TYPES, true) || !in_array($f['relation'], $RELATIONS, true)) back('missing');
$when = DateTime::createFromFormat('Y-m-d H:i', $f['date'] . ' ' . $f['time']);
if (!$when) back('missing');
if (!filter_var($f['email'], FILTER_VALIDATE_EMAIL)) back('email');

$host = preg_replace(['/:\d+$/', '/^www\./'], '', strtolower($_SERVER['HTTP_HOST'] ?? 'localhost'));
$host = preg_replace('/[^a-z0-9.\-]/', '', $host);
$from = 'website@' . $host;

$soon = $when->getTimestamp() - time() < 2 * 86400 ? 'SOON: ' : '';
$text = implode("\r\n", [
  'Funeral honors request from the website',
  '',
  'VETERAN',
  'Name:    ' . $f['veteran'],
  'Branch:  ' . $f['branch'],
  'Era:     ' . ($f['era'] !== '' ? $f['era'] : '(not given)'),
  '',
  'SERVICE',
  'When:    ' . $when->format('l, F j, Y \a\t g:i a'),
  'Type:    ' . $f['type'],
  'Where:   ' . $f['location'],
  'Funeral home: ' . ($f['funeral_home'] !== '' ? $f['funeral_home'] : '(none given)'),
  '',
  'REQUESTED BY',
  'Name:    ' . $f['name'] . ' (' . $f['relation'] . ')',
  'Phone:   ' . $f['phone'],
  'Email:   ' . $f['email'],
  '',
  $notes !== '' ? "Notes:\r\n" . str_replace("\n", "\r\n", $notes) : 'Notes: (none)',
  '',
  'Reply to this email to answer ' . $f['name'] . ' directly.',
  'Submitted ' . date('l, F j, Y g:i a T'),
]);

$sent = mail(
  implode(', ', $RECIPIENTS),
  '=?UTF-8?B?' . base64_encode($soon . 'Funeral honors request: ' . $f['veteran'] . ', ' . $when->format('D M j')) . '?=',
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
back($sent ? 'sent' : 'failed');
