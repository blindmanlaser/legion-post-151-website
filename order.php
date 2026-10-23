<?php
// Hometown Hero flag order handler.
// Emails each online order, with the veteran's photo attached, to $RECIPIENTS.
// Runs on the Namecheap (cPanel) hosting. It does not run on GitHub Pages.

// ============================================================
//  SETTINGS: put the email address(es) that should get orders here.
//  Example: $RECIPIENTS = ['heroes@conneautlegionpost151.org'];
//  Until an address is added, the form tells people to use the PDF instead.
// ============================================================
$RECIPIENTS = ['hero-banners@conneautlegionpost151.org'];

date_default_timezone_set('America/New_York');
$MAX_PHOTO_BYTES = 10 * 1024 * 1024;
$ALLOWED_TYPES = [
  'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif',
  'image/webp' => 'webp', 'image/heic' => 'heic', 'image/heif' => 'heif',
];
$STATUSES = ['Active Duty', 'Honorably Discharged', 'Retired', 'Deceased'];
$PAYMENTS = ['Drop off at the Post', 'Mail a check'];

function back($code) {
  header('Location: hometown-heroes.html?order=' . $code . '#order-form', true, 303);
  exit;
}

// One line of text, no header-injection characters.
function clean($key, $max) {
  $v = isset($_POST[$key]) ? (string)$_POST[$key] : '';
  $v = trim(preg_replace('/[\r\n\t]+/', ' ', $v));
  return mb_substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: hometown-heroes.html#order-form', true, 303);
  exit;
}

// Upload bigger than post_max_size: PHP drops the whole body.
if (empty($_POST) && (int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) back('toolarge');

// Spam trap: real people never fill in the hidden "website" field.
if (clean('website', 200) !== '') {
  header('Location: hometown-heroes-thanks.html', true, 303);
  exit;
}

if (!$RECIPIENTS) back('notready');

$f = [
  'veteran_name'  => clean('veteran_name', 80),
  'branch'        => clean('branch', 40),
  'years'         => clean('years', 40),
  'status'        => clean('status', 30),
  'operation'     => clean('operation', 60),
  'contact_name'  => clean('contact_name', 80),
  'contact_email' => clean('contact_email', 120),
  'contact_phone' => clean('contact_phone', 30),
  'payment'       => clean('payment', 40),
];
$notes = mb_substr(trim((string)($_POST['notes'] ?? '')), 0, 1000);

foreach (['veteran_name', 'branch', 'years', 'contact_name', 'contact_phone'] as $k) {
  if ($f[$k] === '') back('missing');
}
if (!in_array($f['status'], $STATUSES, true) || !in_array($f['payment'], $PAYMENTS, true)) back('missing');
if (!filter_var($f['contact_email'], FILTER_VALIDATE_EMAIL)) back('email');

// Photo
$photo = $_FILES['photo'] ?? null;
if (!$photo || $photo['error'] === UPLOAD_ERR_NO_FILE) back('photo');
if (in_array($photo['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) || $photo['size'] > $MAX_PHOTO_BYTES) back('toolarge');
if ($photo['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($photo['tmp_name'])) back('failed');
$type = (new finfo(FILEINFO_MIME_TYPE))->file($photo['tmp_name']);
if (!isset($ALLOWED_TYPES[$type])) back('phototype');
$data = file_get_contents($photo['tmp_name']);
$safeName = preg_replace('/[^A-Za-z0-9]+/', '-', $f['veteran_name']);
$attachName = 'hometown-hero-' . trim($safeName, '-') . '.' . $ALLOWED_TYPES[$type];

// Email
$host = preg_replace(['/:\d+$/', '/^www\./'], '', strtolower($_SERVER['HTTP_HOST'] ?? 'localhost'));
$host = preg_replace('/[^a-z0-9.\-]/', '', $host);
$from = 'website@' . $host;

$lines = [
  'New Hometown Hero flag order from the website',
  '',
  'VETERAN',
  'Name on flag:   ' . $f['veteran_name'],
  'Branch:         ' . $f['branch'],
  'Years:          ' . $f['years'],
  'Status:         ' . $f['status'],
  'Operation/era:  ' . ($f['operation'] !== '' ? $f['operation'] : '(none given)'),
  '',
  'FAMILY CONTACT (for proof review)',
  'Name:           ' . $f['contact_name'],
  'Email:          ' . $f['contact_email'],
  'Phone:          ' . $f['contact_phone'],
  '',
  'PAYMENT ($200, cash or check to Sons of the American Legion Post 151)',
  'Method:         ' . $f['payment'],
  '',
  'NOTES',
  $notes !== '' ? $notes : '(none)',
  '',
  'The veteran\'s photo is attached.',
  'Submitted ' . date('l, F j, Y g:i a T'),
];
$text = implode("\r\n", $lines);

$boundary = 'hh-' . bin2hex(random_bytes(12));
$subject = '=?UTF-8?B?' . base64_encode('Hometown Hero flag order: ' . $f['veteran_name']) . '?=';
$headers = implode("\r\n", [
  'From: Post 151 Website <' . $from . '>',
  'Reply-To: ' . $f['contact_email'],
  'MIME-Version: 1.0',
  'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
]);
$body = "--$boundary\r\n"
  . "Content-Type: text/plain; charset=UTF-8\r\n"
  . "Content-Transfer-Encoding: base64\r\n\r\n"
  . chunk_split(base64_encode($text)) . "\r\n"
  . "--$boundary\r\n"
  . "Content-Type: $type; name=\"$attachName\"\r\n"
  . "Content-Transfer-Encoding: base64\r\n"
  . "Content-Disposition: attachment; filename=\"$attachName\"\r\n\r\n"
  . chunk_split(base64_encode($data)) . "\r\n"
  . "--$boundary--\r\n";

$sent = mail(implode(', ', $RECIPIENTS), $subject, $body, $headers, '-f' . $from);
if (!$sent) back('failed');

// Short confirmation to the family contact (no attachment).
$confirm = implode("\r\n", [
  'Hello ' . $f['contact_name'] . ',',
  '',
  'Thank you for ordering a Hometown Hero flag for ' . $f['veteran_name'] . '.',
  'American Legion Post 151 has received your order.',
  '',
  'Next steps:',
  '1. Send your $200 payment (cash or check made out to Sons of the American Legion Post 151).',
  '   Drop it off at the Post, or mail it to: Conneaut American Legion, Attn: George Sabo,',
  '   272 Broad St., Conneaut, OH 44030.',
  '2. We will contact you to review a proof of the flag before printing.',
  '',
  'Questions? Contact George Sabo at 440-813-3364.',
  '',
  'American Legion Cowle Post 151',
]);
@mail($f['contact_email'], '=?UTF-8?B?' . base64_encode('Your Hometown Hero flag order') . '?=', $confirm, implode("\r\n", [
  'From: American Legion Post 151 <' . $from . '>',
  'Reply-To: ' . $RECIPIENTS[0],
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
]), '-f' . $from);

header('Location: hometown-heroes-thanks.html', true, 303);
