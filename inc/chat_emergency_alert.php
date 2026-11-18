<?php
/** Deterministic urgent-cue matching and in-app notification for maternal chat. */
function mcare_chat_emergency_cues(string $message): array
{
    $matchMessage=function_exists('mcare_chat_normalize_informal')?mcare_chat_normalize_informal($message):mb_strtolower($message,'UTF-8');
    $cues = [
        'severe headache' => ['severe headache', 'worst headache', 'my head hurts severely', 'bad headache', 'umutwe uribwa cyane', 'kuribwa umutwe cyane', 'ndwaye umutwe cyane', 'ndibwa umutwe cyane', 'umutwe urimo kurya cyane', 'umutwe urimo kurya cyanye', 'umutwe urababara cyane', 'ndumva umutwe undya cyane'],
        'vision changes' => ['blurred vision', 'vision changes', 'cannot see clearly', 'kutabona neza', 'amaso abona ibihu', 'kubona ibihu', 'ndabona ibihu'],
        'convulsions' => ['convulsion', 'convulsions', 'seizure', 'igicuri', 'gufatwa n’igicuri', "gufatwa n'igicuri", 'gutitira cyane'],
        'severe abdominal pain' => ['severe abdominal pain', 'severe stomach pain', 'ububabare bukabije mu nda', 'inda irandya cyane'],
        'vaginal bleeding' => ['vaginal bleeding', 'bleeding', 'bleed', 'heavy bleeding', 'bleeding heavily', 'bleeding a lot', 'kuva amaraso mu gitsina', 'kuva amaraso menshi', 'kuva amaraso', 'amaraso menshi', 'ndava amaraso'],
        'fever' => ['high fever', 'fever', 'umuriro mwinshi', 'mfite umuriro', 'ndafite umuriro', 'kugira umuriro'],
        'breathing difficulty' => ['difficulty breathing', 'trouble breathing', 'shortness of breath', 'cannot breathe', 'guhumeka bigoranye', 'kubura umwuka', 'ndabura umwuka', 'kunanirwa guhumeka'],
        'chest pain' => ['chest pain', 'tightness in my chest', 'kubabara mu gatuza', 'ububabare mu gatuza'],
        'reduced fetal movement' => ['reduced fetal movement', 'baby stopped moving', 'baby is not moving', 'umwana ntiyinyeganyega', 'umwana ntakinyeganyega', 'umwana yahagaritse kunyeganyega'],
        'immediate danger' => ['immediate danger', 'in immediate danger', 'i am in danger', 'i feel unsafe', 'ndi mu kaga', 'nri mu kaga'],
    ];
    $found = [];
    foreach ($cues as $label => $phrases) {
        foreach ($phrases as $phrase) {
            $pattern = '/(?<![\p{L}\p{N}])' . preg_quote($phrase, '/') . '(?![\p{L}\p{N}])/iu';
            $negated = function_exists('mcare_chat_phrase_is_negated') && mcare_chat_phrase_is_negated($matchMessage, $phrase);
            if (!$negated && preg_match($pattern, $matchMessage)) {
                $found[] = $label;
                break;
            }
        }
    }
    return $found;
}

/** Create a review alert and notify the assigned care team. Store only this flagged excerpt. */
function mcare_create_chat_emergency_alert(PDO $db, array $mother, int $motherId, int $actorId, string $message, array $cues): int
{
    $pregnancyQuery = $db->prepare("SELECT pregnancy_id FROM tbl_pregnancies WHERE mother_id=? AND pregnancy_status='active' ORDER BY created_at DESC LIMIT 1");
    $pregnancyQuery->execute([$motherId]);
    $pregnancyId = $pregnancyQuery->fetchColumn();
    $excerpt = mb_substr(trim($message), 0, 500, 'UTF-8');
    $alertText = 'Possible urgent warning sign detected in a maternal chatbot message (' . implode(', ', $cues) . '). Automated language cue only; not a diagnosis. A qualified health worker must review promptly. / Hashobora kuba hari ikimenyetso cy’akaga mu butumwa bwo kuri chatbot (' . implode(', ', $cues) . '). Ni ijambo ryabonwe na porogaramu, si isuzuma; umukozi w’ubuzima agomba kubusuzuma vuba. Message excerpt / Igice cy’ubutumwa: “' . $excerpt . '”.';

    $recipients = [];
    $admins = $db->query("SELECT u_id,preferred_language FROM tbl_users WHERE log_role=1 AND is_active=1 AND log_status=1")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($admins as $row) $recipients[(int)$row['u_id']] = $row['preferred_language'] ?? 'en';
    if (!empty($mother['chw_id'])) {
        $stmt = $db->prepare('SELECT u_id,preferred_language FROM tbl_users WHERE u_id=? AND log_role=3 AND is_active=1 AND log_status=1');
        $stmt->execute([(int)$mother['chw_id']]);
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) $recipients[(int)$row['u_id']] = $row['preferred_language'] ?? 'en';
    }
    if (!empty($mother['facility_id'])) {
        $stmt = $db->prepare('SELECT u_id,preferred_language FROM tbl_users WHERE facility_id=? AND log_role IN (2,4) AND is_active=1 AND log_status=1');
        $stmt->execute([(int)$mother['facility_id']]);
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) $recipients[(int)$row['u_id']] = $row['preferred_language'] ?? 'en';
    }

    $db->beginTransaction();
    try {
        $stmt = $db->prepare('INSERT INTO tbl_alerts (report_id,mother_id,pregnancy_id,alert_level,alert_message,assigned_to,facility_id) VALUES (NULL,?,?,\'critical\',?,?,?)');
        $stmt->execute([$motherId, $pregnancyId ?: null, $alertText, !empty($mother['chw_id']) ? (int)$mother['chw_id'] : null, !empty($mother['facility_id']) ? (int)$mother['facility_id'] : null]);
        $alertId = (int)$db->lastInsertId();
        $event = $db->prepare('INSERT INTO tbl_alert_events(alert_id,actor_user_id,event_type,to_user_id,event_note) VALUES(?,?,?,?,?)');
        $event->execute([$alertId, $actorId, 'created', null, 'Created from deterministic bilingual chatbot warning-cue match; requires human review and is not a diagnosis.']);
        if (!empty($mother['chw_id'])) $event->execute([$alertId, $actorId, 'assigned', (int)$mother['chw_id'], 'Assigned to the mother’s linked community health worker.']);
        $notification = $db->prepare('INSERT INTO tbl_notifications(user_id,notif_type,notif_message,reference_id,reference_type) VALUES(?,?,?,?,?)');
        foreach ($recipients as $userId => $language) {
            $text = $language === 'rw'
                ? 'Ubutumwa bwo mu mufasha wa M-CARE bushobora kuvuga ikimenyetso cy’akaga. Reba alert mu buryo bwihuse kandi ukurikize inzira y’ubuvuzi yemejwe. Iri ni ijambo ryabonwe na porogaramu; si isuzuma.'
                : 'A maternal chatbot message may describe an urgent warning sign. Review the alert promptly and follow the approved care pathway. This is an automated text cue, not a diagnosis.';
            $notification->execute([$userId, 'alert', $text, $alertId, 'alert']);
            $event->execute([$alertId, $actorId, 'notified', $userId, 'In-app notification sent to an authorized care-team reviewer.']);
        }
        audit_log($db, $actorId, 'CREATE_CHAT_EMERGENCY_ALERT', 'tbl_alerts', $alertId, null, ['mother_id' => $motherId, 'cue_count' => count($cues)]);
        $db->commit();
        return $alertId;
    } catch (Throwable $error) {
        if ($db->inTransaction()) $db->rollBack();
        throw $error;
    }
}
