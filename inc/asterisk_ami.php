<?php
declare(strict_types=1);

/** Small AMI client for originate requests. AMI must be bound to loopback. */
function mcare_ami_settings(): array
{
    $host = trim((string)getenv('MCARE_AMI_HOST')) ?: '127.0.0.1';
    $port = (int)(getenv('MCARE_AMI_PORT') ?: 5038);
    $username = trim((string)getenv('MCARE_AMI_USERNAME'));
    $secret = (string)getenv('MCARE_AMI_SECRET');
    $endpoint = trim((string)getenv('MCARE_OUTBOUND_PJSIP_ENDPOINT'));
    $callerId = trim((string)getenv('MCARE_OUTBOUND_CALLER_ID'));
    $numberFormat = trim((string)getenv('MCARE_OUTBOUND_NUMBER_FORMAT'));
    $numberPrefix = trim((string)(getenv('MCARE_OUTBOUND_NUMBER_PREFIX')?:''));
    if ($host !== '127.0.0.1' && $host !== '::1') {
        throw new RuntimeException('Asterisk AMI must be reachable only on loopback.');
    }
    if ($port < 1 || $port > 65535 || $username === '' || $secret === '') {
        throw new RuntimeException('Asterisk AMI credentials are not configured.');
    }
    if (!preg_match('/^[A-Za-z0-9_.-]{1,80}$/', $endpoint)) {
        throw new RuntimeException('The authorized outbound PJSIP endpoint is not configured.');
    }
    if (!preg_match('/^\+?[0-9]{7,15}$/', $callerId)) {
        throw new RuntimeException('The provider-authorized caller ID is not configured.');
    }
    if (!in_array($numberFormat,['rwanda_e164','national'],true)) {
        throw new RuntimeException('Set the outbound number format supplied by the provider.');
    }
    if ($numberPrefix!==''&&!preg_match('/^[0-9]{1,8}$/',$numberPrefix)) {
        throw new RuntimeException('Outbound dialing prefix must contain digits only.');
    }
    return compact('host', 'port', 'username', 'secret', 'endpoint', 'callerId', 'numberFormat', 'numberPrefix');
}

function mcare_ami_read_message($socket, float $deadline): array
{
    $message = [];
    while (microtime(true) < $deadline) {
        $line = fgets($socket, 8192);
        if ($line === false) {
            $meta = stream_get_meta_data($socket);
            if (!empty($meta['timed_out'])) break;
            if (feof($socket)) break;
            continue;
        }
        $line = rtrim($line, "\r\n");
        if ($line === '') {
            if ($message) return $message;
            continue;
        }
        if (str_contains($line, ':')) {
            [$key, $value] = explode(':', $line, 2);
            $message[trim($key)] = trim($value);
        }
    }
    return $message;
}

function mcare_ami_send_action(array $settings, array $headers, int $timeout = 5): array
{
    $errno = 0;
    $error = '';
    $socket = @stream_socket_client('tcp://' . $settings['host'] . ':' . $settings['port'], $errno, $error, $timeout, STREAM_CLIENT_CONNECT);
    if (!$socket) throw new RuntimeException('Could not connect to the local Asterisk AMI.');
    stream_set_timeout($socket, $timeout);
    try {
        fgets($socket, 2048); // AMI greeting
        fwrite($socket, "Action: Login\r\nUsername: {$settings['username']}\r\nSecret: {$settings['secret']}\r\nEvents: off\r\n\r\n");
        $login = mcare_ami_read_message($socket, microtime(true) + $timeout);
        if (($login['Response'] ?? '') !== 'Success') throw new RuntimeException('Asterisk AMI authentication failed.');
        $wire = '';
        foreach ($headers as $key => $value) {
            if (preg_match('/[\r\n]/', (string)$value)) throw new RuntimeException('Invalid AMI action value.');
            $wire .= $key . ': ' . $value . "\r\n";
        }
        fwrite($socket, $wire . "\r\n");
        $response = mcare_ami_read_message($socket, microtime(true) + $timeout);
        fwrite($socket, "Action: Logoff\r\n\r\n");
        if (($response['Response'] ?? '') !== 'Success') {
            throw new RuntimeException('Asterisk rejected the outbound call request.');
        }
        return $response;
    } finally {
        fclose($socket);
    }
}

function mcare_ami_originate(array $settings, string $number, int $callId, string $actionId): array
{
    $number = preg_replace('/\D+/', '', $number);
    if ($settings['numberFormat']==='national' && str_starts_with($number,'250')) $number='0'.substr($number,3);
    $number=$settings['numberPrefix'].$number;
    if (!preg_match('/^[0-9]{7,15}$/', $number) || $callId < 1 || !preg_match('/^[A-Za-z0-9-]{1,80}$/', $actionId)) {
        throw new RuntimeException('Invalid outbound call request.');
    }
    $timeout = max(15000, min(60000, (int)(getenv('MCARE_OUTBOUND_RING_TIMEOUT_MS') ?: 45000)));
    return mcare_ami_send_action($settings, [
        'Action' => 'Originate',
        'ActionID' => $actionId,
        'Channel' => 'PJSIP/' . $number . '@' . $settings['endpoint'],
        'Context' => 'mcare-outbound',
        'Exten' => (string)$callId,
        'Priority' => '1',
        'Timeout' => (string)$timeout,
        'CallerID' => $settings['callerId'],
        'Variable' => 'MC_OUTBOUND_CALL_ID=' . $callId,
        'Async' => 'true',
    ], 8);
}

function mcare_ami_hangup(array $settings, string $channel, string $actionId): array
{
    if (!preg_match('~^PJSIP/[A-Za-z0-9+_.@-]{1,240}$~', $channel) || !preg_match('/^[A-Za-z0-9-]{1,80}$/', $actionId)) {
        throw new RuntimeException('Invalid Asterisk channel for call cancellation.');
    }
    return mcare_ami_send_action($settings, ['Action'=>'Hangup','ActionID'=>$actionId,'Channel'=>$channel], 5);
}
