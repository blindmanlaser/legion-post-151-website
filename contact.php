<?php
// "Send Us a Message" handler for the Visit page.
// Emails each message to the people for the chosen topic.
// Runs on the Namecheap (cPanel) hosting. It does not run on GitHub Pages.

// ============================================================
//  SETTINGS: who gets messages for each topic.
//  Example: 'Hall rental' => ['hall@conneautlegionpost151.org'],
//  A topic left empty goes to $DEFAULT. Until $DEFAULT has an address,
//  the form asks people to call the Post instead.
// ============================================================
$DEFAULT = ['info@conneautlegionpost151.org'];
$ROUTES = [
  'General question'                                => ['info@conneautlegionpost151.org'],
  'Hall rental'                                     => ['hall-manager@conneautlegionpost151.org'],
  'Legionnaire membership'                          => ['adjutant@conneautlegionpost151.org'],
  'Sons membership'                                 => ['sal-adjutant@conneautlegionpost151.org'],
  'Auxiliary membership'                            => ['aux-membership@conneautlegionpost151.org'],
  'American Legion Auxiliary (other questions)'     => ['aux-president@conneautlegionpost151.org'],
  'Sons of the American Legion (other questions)'   => ['sal-commander@conneautlegionpost151.org'],
  'Hometown Heroes flags'                           => ['hero-banners@conneautlegionpost151.org'],
];

date_default_timezone_set('America/New_York');

function back($code) {
  header('Location: contact.html?contact=' . $code . '#contact-form', true, 303);
  exit;
}

// One line of text, no header-injection characters.
function clean($key, $max) {
  $v = isset($_POST[$key]) ? (string)$_POST[$key] : '';
  $v = trim(preg_replace('/[\r\n\t]+/', ' ', $v));
  return mb_substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: contact.html#contact-form', true, 303);
  exit;
}

// Spam trap: real people never fill in the hidden "website" field.
if (clean('website', 200) !== '') back('sent');

$name  = clean('name', 80);
$email = clean('email', 120);
$phone = clean('phone', 30);
$topic = clean('topic', 60);
$message = mb_substr(trim(str_replace("\r\n", "\n", (string)($_POST['message'] ?? ''))), 0, 3000);

if ($name === '' || $message === '' || !array_key_exists($topic, $ROUTES)) back('missing');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) back('email');

$to = $ROUTES[$topic] ?: $DEFAULT;
if (!$to) back('notready');

$host = preg_replace(['/:\d+$/', '/^www\./'], '', strtolower($_SERVER['HTTP_HOST'] ?? 'localhost'));
$host = preg_replace('/[^a-z0-9.\-]/', '', $host);
$from = 'website@' . $host;

$text = implode("\r\n", [
  'New message from the website contact form',
  '',
  'Topic:  ' . $topic,
  'Name:   ' . $name,
  'Email:  ' . $email,
  'Phone:  ' . ($phone !== '' ? $phone : '(none given)'),
  '',
  str_replace("\n", "\r\n", $message),
  '',
  'Reply to this email to answer ' . $name . ' directly.',
  'Submitted ' . date('l, F j, Y g:i a T'),
]);

$sent = mail(
  implode(', ', $to),
  '=?UTF-8?B?' . base64_encode('Website message (' . $topic . '): ' . $name) . '?=',
  chunk_split(base64_encode($text)),
  implode("\r\n", [
    'From: Post 151 Website <' . $from . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ]),
  '-f' . $from
);
if (!$sent) back('failed');

// Confirmation back to the sender. Wording is in the editor's Form Emails tab.
require __DIR__ . '/form-emails.php';
send_confirmation($email, 'contact', ['name' => $name, 'topic' => $topic], $from, $to[0]);
back('sent');
