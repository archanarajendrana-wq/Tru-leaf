<?php
// Receives the contact, careers and retail-brief forms and emails them to info@truleaf.in.
// Upload this file next to the .html files on Hostinger (public_html).

const TO_ADDRESS   = 'info@truleaf.in';
const FROM_ADDRESS = 'no-reply@truleaf.in'; // must be a mailbox/domain on this Hostinger account, or mail may be rejected
const MAX_UPLOAD   = 5 * 1024 * 1024;

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'POST only']);
}

// hidden "website" field: humans leave it empty, bots fill it in. Pretend success so they do not retry.
if (!empty($_POST['website'])) {
    respond(200, ['ok' => true]);
}

// header values must never carry line breaks (prevents header injection)
function clean_line(string $v): string {
    return trim(preg_replace('/[\r\n]+/', ' ', $v));
}

function field(string $key, int $max = 2000): string {
    $v = isset($_POST[$key]) ? (string)$_POST[$key] : '';
    $v = trim(str_replace("\0", '', $v));
    return mb_substr($v, 0, $max);
}

$type  = field('form', 20);
$name  = clean_line(field('name', 120));
$email = clean_line(field('email', 160));

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'error' => 'Name and a valid email are required.']);
}

$labels = [
    'contact' => 'Contact enquiry',
    'careers' => 'Careers application',
    'brief'   => 'Retail brief',
];
if (!isset($labels[$type])) {
    respond(422, ['ok' => false, 'error' => 'Unknown form.']);
}

$rows = ['Name' => $name, 'Email' => $email];
if ($type === 'careers') {
    $rows += [
        'Phone'     => field('phone', 40),
        'Link'      => field('link', 300),
        'Role'      => field('role', 120),
        'Note'      => field('note'),
    ];
} else {
    $phone = trim(field('phoneCode', 12) . ' ' . field('phone', 40));
    $rows += [
        'Phone'   => $phone,
        'Country' => field('country', 80),
        'Product' => field('product', 160),
        'Message' => field('message'),
    ];
}

$body = '';
foreach ($rows as $label => $value) {
    if ($value !== '') $body .= $label . ': ' . $value . "\n";
}
$body .= "\nSent from " . ($_SERVER['HTTP_HOST'] ?? 'truleaf.in') . ' (' . $labels[$type] . ')';

$subject = '[Truleaf] ' . $labels[$type] . ' from ' . $name;
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$headers  = 'From: Truleaf Website <' . FROM_ADDRESS . ">\r\n";
$headers .= 'Reply-To: ' . $name . ' <' . $email . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";

$message = '';
$attachment = null;

if ($type === 'careers') {
    $f = $_FILES['resume'] ?? null;
    if (!$f || $f['error'] !== UPLOAD_ERR_OK || $f['size'] > MAX_UPLOAD || !preg_match('/\.(pdf|docx?)$/i', $f['name'])) {
        respond(422, ['ok' => false, 'error' => 'Please attach a PDF, DOC or DOCX under 5 MB.']);
    }
    $attachment = $f;
}

if ($attachment) {
    $boundary = 'tl_' . bin2hex(random_bytes(12));
    $headers .= 'Content-Type: multipart/mixed; boundary="' . $boundary . "\"\r\n";
    $filename = preg_replace('/[^\w.\- ]+/', '_', basename($attachment['name']));
    $message  = '--' . $boundary . "\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n";
    $message .= $body . "\r\n";
    $message .= '--' . $boundary . "\r\n";
    $message .= 'Content-Type: application/octet-stream; name="' . $filename . "\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n";
    $message .= 'Content-Disposition: attachment; filename="' . $filename . "\"\r\n\r\n";
    $message .= chunk_split(base64_encode(file_get_contents($attachment['tmp_name']))) . "\r\n";
    $message .= '--' . $boundary . '--';
} else {
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";
    $message = $body;
}

$sent = mail(TO_ADDRESS, $encodedSubject, $message, $headers, '-f' . FROM_ADDRESS);

if (!$sent) {
    respond(500, ['ok' => false, 'error' => 'Could not send right now.']);
}
respond(200, ['ok' => true]);
