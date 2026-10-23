<?php
// Sentinel newsletter sign-up handler (sentinel.html).
// Adds each sign-up to sentinel-subscribers.csv in the hosting account's home folder,
// one level ABOVE public_html, so the list can't be opened from the web and the
// site upload never overwrites it. Download it from cPanel > File Manager.
// Runs on the Namecheap (cPanel) hosting. It does not run on GitHub Pages.

// ============================================================
//  SETTINGS (optional): email address(es) to tell about each new sign-up.
//  Example: $NOTIFY = ['sentinel@conneautlegionpost151.org'];
// ============================================================
$NOTIFY = ['sentinel@conneautlegionpost151.org'];

date_default_timezone_set('America/New_York');
$LIST = dirname(__DIR__) . '/sentinel-subscribers.csv';

function back($code) {
  header('Location: sentinel.html?signup=' . $code . '#sub-form', true, 303);
  exit;
}

function clean($key, $max) {
  $v = isset($_POST[$key]) ? (string)$_POST[$key] : '';
  $v = trim(preg_replace('/[\r\n\t]+/', ' ', $v));
  return mb_substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: sentinel.html', true, 303);
  exit;
}

// Spam trap: real people never fill in the hidden "website" field.
if (clean('website', 200) !== '') back('sent');

$name  = clean('name', 80);
$email = strtolower(clean('email', 120));
if ($name === '') back('missing');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) back('email');

$fh = @fopen($LIST, 'c+');
if (!$fh) back('failed');
flock($fh, LOCK_EX);
$isNew = true;
while (($row = fgetcsv($fh, 0, ',', '"', '')) !== false) {
  if (isset($row[1]) && strtolower($row[1]) === $email) { $isNew = false; break; }
}
if ($isNew) {
  fseek($fh, 0, SEEK_END);
  if (ftell($fh) === 0) fputcsv($fh, ['Name', 'Email', 'Signed up'], ',', '"', '');
  // A leading = + - @ would be read as a formula by Excel.
  fputcsv($fh, [preg_replace('/^[=+\-@]+/', '', $name), $email, date('Y-m-d H:i')], ',', '"', '');
}
flock($fh, LOCK_UN);
fclose($fh);

if ($isNew && $NOTIFY) {
  $host = preg_replace(['/:\d+$/', '/^www\./'], '', strtolower($_SERVER['HTTP_HOST'] ?? 'localhost'));
  $host = preg_replace('/[^a-z0-9.\-]/', '', $host);
  $from = 'website@' . $host;
  @mail(implode(', ', $NOTIFY), 'New Sentinel sign-up: ' . $name,
    "$name <$email> signed up for The Sentinel.\r\n\r\nThe full list is sentinel-subscribers.csv in cPanel > File Manager (home folder).",
    "From: Post 151 Website <$from>\r\nContent-Type: text/plain; charset=UTF-8", '-f' . $from);
}
back('sent');
