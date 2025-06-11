<?php
header('Access-Control-Allow-Origin: *');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $to = $data['to'] ?? '';
    $subject = $data['subject'] ?? '';
    $text = $data['text'] ?? '';
    $html = $data['html'] ?? $text;

    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Неверный email получателя']);
        exit;
    }

    $headers = "From: admin@internhub.tw1.su\r\n";
    $headers .= "Reply-To: admin@internhub.tw1.su\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

    $result = mail($to, $subject, $html, $headers);
    if ($result) {
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Не удалось отправить email']);
    }
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Недопустимый метод запроса']);
}
?>