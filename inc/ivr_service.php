<?php
declare(strict_types=1);

function ivr_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, private');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function ivr_actor_scope(PDO $db, int $role, int $userId, int $callId): ?array
{
    $sql = 'SELECT * FROM ivr_calls WHERE ivr_call_id=? AND is_test=1';
    $params = [$callId];
    if ($role === 4) {
        $sql .= ' AND created_by=?';
        $params[] = $userId;
    }
    $query = $db->prepare($sql);
    $query->execute($params);
    return $query->fetch(PDO::FETCH_ASSOC) ?: null;
}

function ivr_config(PDO $db, string $key, string $fallback): string
{
    try {
        $query = $db->prepare('SELECT config_value FROM ivr_test_config WHERE config_key=?');
        $query->execute([$key]);
        $value = $query->fetchColumn();
        return $value === false ? $fallback : (string)$value;
    } catch (Throwable $exception) {
        return $fallback;
    }
}

function ivr_log_event(PDO $db, int $callId, string $type, ?string $menu, ?string $value = null, array $payload = []): void
{
    $query = $db->prepare('INSERT INTO ivr_call_events(ivr_call_id,event_type,menu_key,event_value,event_payload) VALUES(?,?,?,?,?)');
    $query->execute([$callId, $type, $menu, $value, $payload ? json_encode($payload, JSON_UNESCAPED_UNICODE) : null]);
}

function ivr_prompt(PDO $db, string $key, string $language, string $fallback): array
{
    $query = $db->prepare('SELECT prompt_text,audio_path FROM ivr_voice_prompts WHERE prompt_key=? AND language=? AND is_active=1 LIMIT 1');
    $query->execute([$key, $language]);
    $prompt = $query->fetch(PDO::FETCH_ASSOC);
    return $prompt ?: ['prompt_text' => $fallback, 'audio_path' => null];
}

function ivr_options(PDO $db, string $menu, string $language): array
{
    $query = $db->prepare('SELECT digit,option_label,action_key FROM ivr_menu_options WHERE menu_key=? AND language=? AND is_active=1 ORDER BY sort_order,digit');
    $query->execute([$menu, $language]);
    return $query->fetchAll(PDO::FETCH_ASSOC);
}

function ivr_call_view(PDO $db, array $call): array
{
    $callId = (int)$call['ivr_call_id'];
    $language = in_array($call['language'] ?? '', ['en', 'rw'], true) ? $call['language'] : 'en';
    $menu = (string)$call['current_menu'];
    $promptKey = in_array($menu, ['welcome','main','education','emergency','queue','ended'], true) ? $menu : '';
    $prompt = $promptKey ? ivr_prompt($db, $promptKey, $language, '') : ['prompt_text'=>'','audio_path'=>null];
    $eventQuery = $db->prepare('SELECT event_type,menu_key,event_value,event_payload,created_at FROM ivr_call_events WHERE ivr_call_id=? ORDER BY event_id DESC LIMIT 20');
    $eventQuery->execute([$callId]);
    $rows=$eventQuery->fetchAll(PDO::FETCH_ASSOC);$events=[];
    foreach($rows as $event){$payload=json_decode((string)($event['event_payload']??''),true);$events[]=['type'=>$event['event_type'],'menu'=>$event['menu_key'],'value'=>$event['event_value'],'message'=>$payload['message']??null,'created_at'=>$event['created_at']];}
    $last=$events[0]??null;
    return [
        'call_id'=>$callId,'call_uuid'=>$call['call_uuid'],'call_source'=>$call['call_source'],'caller_number'=>$call['caller_number'],
        'fixture'=>$call['caller_fixture'],'language'=>$call['language'],'state'=>$call['state'],
        'menu'=>$menu,'status'=>$call['status'],'is_test'=>true,'started_at'=>$call['started_at'],
        'duration_seconds'=>$call['duration_seconds'],'waiting_seconds'=>$call['waiting_seconds'],'error_message'=>$call['error_message']??null,
        'prompt'=>$prompt['prompt_text'],'audio_path'=>$prompt['audio_path'],'options'=>ivr_options($db,$menu,$language),
        'last_event'=>$last,'events'=>$events,
    ];
}

function ivr_get_education(PDO $db, string $language, ?int $trimester, string $category): array
{
    if ($category === 'nutrition') {
        $nutrition=$db->prepare('SELECT title,content_body,trimester FROM tbl_nutrition_content WHERE is_active=1 AND language=? AND (trimester=? OR trimester="all" OR trimester IS NULL) ORDER BY created_at DESC LIMIT 3');
        $nutrition->execute([$language,$trimester===null?'all':(string)$trimester]);
        return $nutrition->fetchAll(PDO::FETCH_ASSOC);
    }
    $query = $db->prepare("SELECT title,content_body,trimester FROM tbl_education_content WHERE is_active=1 AND language=? AND (category IN ('anc','pregnancy','danger_signs') OR category IS NULL) AND (trimester=? OR trimester='all' OR trimester IS NULL) ORDER BY created_at DESC LIMIT 3");
    $query->execute([$language, $trimester === null ? 'all' : (string)$trimester]);
    return $query->fetchAll(PDO::FETCH_ASSOC);
}
