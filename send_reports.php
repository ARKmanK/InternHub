<?php
// Логирование в файл
$logFile = __DIR__ . '/send_reports.log';
file_put_contents($logFile, date('Y-m-d H:i:s') . " Script started\n", FILE_APPEND);

$supabaseUrl = 'https://uwmkkzuxftizosgqwzby.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bWtrenV4ZnRpem9zZ3F3emJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MjgwNDksImV4cCI6MjA2MzUwNDA0OX0.bZPTUPInSQD7XOJElkmzEchqmN6uwCNqoT1t-KA315A';

// Проверка подключения к Supabase
$ch = curl_init("$supabaseUrl/rest/v1/users?select=id,email&role=eq.employer");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey,
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

file_put_contents($logFile, date('Y-m-d H:i:s') . " HTTP response code for users: $httpCode\n", FILE_APPEND);
file_put_contents($logFile, date('Y-m-d H:i:s') . " Response: " . print_r($response, true) . "\n", FILE_APPEND);

if ($httpCode !== 200) {
    file_put_contents($logFile, date('Y-m-d H:i:s') . " Error: Failed to fetch employers, HTTP code: $httpCode\n", FILE_APPEND);
    exit;
}

$employers = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE || !$employers) {
    file_put_contents($logFile, date('Y-m-d H:i:s') . " Error: Failed to decode employers: " . json_last_error_msg() . "\n", FILE_APPEND);
    exit;
}

file_put_contents($logFile, date('Y-m-d H:i:s') . " Found " . count($employers) . " employers\n", FILE_APPEND);
foreach ($employers as $employer) {
    $employerId = $employer['id'];
    $email = $employer['email'];
    file_put_contents($logFile, date('Y-m-d H:i:s') . " Processing employer $employerId, email: $email\n", FILE_APPEND);

    // Получаем задачи работодателя
    $ch = curl_init("$supabaseUrl/rest/v1/tasks?select=id,title&employer_id=eq.$employerId");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey,
        'Content-Type: application/json'
    ]);
    $taskResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    file_put_contents($logFile, date('Y-m-d H:i:s') . " HTTP response code for tasks: $httpCode\n", FILE_APPEND);
    file_put_contents($logFile, date('Y-m-d H:i:s') . " Response: " . print_r($taskResponse, true) . "\n", FILE_APPEND);

    if ($httpCode !== 200) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " Error: Failed to fetch tasks for employer $employerId, HTTP code: $httpCode\n", FILE_APPEND);
        continue;
    }

    $tasks = json_decode($taskResponse, true);
    if (json_last_error() !== JSON_ERROR_NONE || !$tasks) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " Error: Failed to decode tasks for employer $employerId: " . json_last_error_msg() . "\n", FILE_APPEND);
        continue;
    }

    file_put_contents($logFile, date('Y-m-d H:i:s') . " Found " . count($tasks) . " tasks for employer $employerId\n", FILE_APPEND);
    $reportItems = [];
    foreach ($tasks as $task) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " Task ID: " . $task['id'] . ", Title: " . $task['title'] . "\n", FILE_APPEND);

        // Получаем активности для задачи
        $ch = curl_init("$supabaseUrl/rest/v1/task_activity?select=*&task_id=eq.{$task['id']}&status=eq.verifying");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . $supabaseKey,
            'Authorization: Bearer ' . $supabaseKey,
            'Content-Type: application/json',
            'Prefer: count=exact'
        ]);
        $activityResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        file_put_contents($logFile, date('Y-m-d H:i:s') . " HTTP response code for activity: $httpCode\n", FILE_APPEND);
        file_put_contents($logFile, date('Y-m-d H:i:s') . " Response: " . print_r($activityResponse, true) . "\n", FILE_APPEND);

        if ($httpCode !== 200) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " Error: Failed to fetch activities for task {$task['id']}, HTTP code: $httpCode\n", FILE_APPEND);
            continue;
        }

        $activityData = json_decode($activityResponse, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " Error: Failed to decode activities for task {$task['id']}: " . json_last_error_msg() . "\n", FILE_APPEND);
            continue;
        }

        $count = $activityData['count'] ?? count($activityData);
        file_put_contents($logFile, date('Y-m-d H:i:s') . " Found $count verifying activities for task {$task['id']}\n", FILE_APPEND);

        if ($count > 0) {
            $title = htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8');
            $title = strlen($title) > 30 ? substr($title, 0, 30) . '...' : $title;
            $reportItems[] = "Задача \"$title\" - $count новых записей";
        }
    }

    if (!empty($reportItems)) {
        $today = date('d.m.Y');
        $reportText = "Отчет за $today\n\n" . implode("\n", $reportItems);
        file_put_contents($logFile, date('Y-m-d H:i:s') . " Report for $email:\n$reportText\n", FILE_APPEND);

        // Отправка email
        $ch = curl_init('https://internhub.tw1.su/send_email.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'to' => $email,
            'subject' => 'InternHub: Отчет активности за неделю',
            'text' => $reportText,
            'html' => "" . nl2br(str_replace("\n", "<br>", $reportText)),
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        $emailResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        file_put_contents($logFile, date('Y-m-d H:i:s') . " HTTP response code for email: $httpCode\n", FILE_APPEND);
        file_put_contents($logFile, date('Y-m-d H:i:s') . " Email response: " . print_r($emailResponse, true) . "\n", FILE_APPEND);

        if ($httpCode !== 200) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " Error: Failed to send email to $email, HTTP code: $httpCode\n", FILE_APPEND);
        } else {
            $result = json_decode($emailResponse, true);
            if ($result['status'] === 'error') {
                file_put_contents($logFile, date('Y-m-d H:i:s') . " Email send failed: " . ($result['message'] ?? 'Unknown error') . "\n", FILE_APPEND);
            } else {
                file_put_contents($logFile, date('Y-m-d H:i:s') . " Email sent successfully to $email\n", FILE_APPEND);
            }
        }
    } else {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " No new activities for $email, email not sent\n", FILE_APPEND);
    }
}

// Завершение
file_put_contents($logFile, date('Y-m-d H:i:s') . " Script completed\n", FILE_APPEND);
exit;
?>