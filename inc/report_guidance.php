<?php
/** Build clear, non-diagnostic next steps from the report in the mother's language. */
function mcare_report_guidance_data(array $symptomRows, string $severity, bool $worsening, string $language, string $reference): array
{
    $urgentNames=['Blurred vision','Chest pain','Convulsions','Difficulty breathing','Severe abdominal pain','Severe headache','Vaginal bleeding','Reduced fetal movement','Fever'];
    $urgent=(bool)array_filter($symptomRows,static fn(array $row):bool=>in_array((string)$row['symptom_name'],$urgentNames,true));
    $symptoms=array_values(array_unique(array_map(static function(array $row)use($language):string{
        return $language==='rw'?(string)($row['symptom_name_rw']?:$row['symptom_name']):(string)$row['symptom_name'];
    },$symptomRows)));

    if($urgent){
        $action=$language==='rw'
            ?'Jya ku kigo nderabuzima cyangwa kwa muganga ubu, cyangwa ukoreshe inzira y’ubutabazi yo mu gace urimo. '
            :'Go to a health facility now or use your local emergency pathway. ';
        $note=$language==='rw'
            ?'Ubu butumwa bwikora bushingiye ku bimenyetso wahisemo. Ntibusuzuma indwara kandi ntibusimbura ubuvuzi bw’umukozi w’ubuzima.'
            :'This automated message is based on the symptoms you selected. It is not a diagnosis and does not replace care from a health worker.';
    }elseif($severity==='severe'||$worsening){
        $action=$language==='rw'
            ?'Vugana n’umukozi w’ubuzima cyangwa ikigo nderabuzima vuba kugira ngo bakugire inama. Niba urembye cyangwa ubonye ikimenyetso cy’akaga, hita ujya kwa muganga.'
            :'Contact your health worker or facility promptly for advice. If you feel seriously unwell or develop a warning sign, seek urgent care now.';
        $note=$language==='rw'
            ?'Ubu bufasha bwikora ntibusuzuma indwara kandi ntibubwira umuntu umuti agomba gufata.'
            :'This automated guidance does not diagnose or recommend medicine.';
    }else{
        $action=$language==='rw'
            ?'Raporo yawe yoherejwe kugira ngo itsinda ry’ubuzima riyisuzume. Niba ibimenyetso bikomera, birushaho kuba bibi cyangwa uhangayitse, vugana n’umukozi w’ubuzima. Ku kimenyetso cy’akaga, hita ujya kwa muganga.'
            :'Your report was sent for your care team to review. If symptoms become severe, worsen, or worry you, contact a health worker. Seek urgent care for any warning sign.';
        $note=$language==='rw'
            ?'Ubu bufasha bwikora ntibushobora kumenya impamvu y’ikimenyetso cyangwa kukubwira umuti.'
            :'This automated helper cannot determine the cause of a symptom or recommend medicine.';
    }

    return [
        'urgent'=>$urgent,
        'symptoms_title'=>$language==='rw'?'Ibimenyetso watanze raporo':'Symptoms in your report',
        'symptoms'=>$symptoms,
        'action_title'=>$language==='rw'?'Icyo wakora ubu':'What to do now',
        'action'=>$action,
        'note_title'=>$language==='rw'?'Icyitonderwa':'Important',
        'note'=>$note,
        'reference_title'=>$language==='rw'?'Nomero ya raporo':'Report reference',
        'reference'=>$reference,
    ];
}

function mcare_format_report_guidance(array $guidance): string
{
    return $guidance['symptoms_title'].":\n• ".implode("\n• ",$guidance['symptoms'])
        ."\n\n".$guidance['action_title'].":\n".$guidance['action']
        ."\n\n".$guidance['note_title'].":\n".$guidance['note']
        ."\n\n".$guidance['reference_title'].': '.$guidance['reference'];
}

function mcare_build_immediate_report_guidance(array $symptomRows, string $severity, bool $worsening, string $language, string $reference): string
{
    return mcare_format_report_guidance(mcare_report_guidance_data($symptomRows,$severity,$worsening,$language,$reference));
}

/** Rebuild structured guidance from the saved report in the mother's current language. */
function mcare_guidance_for_saved_report(PDO $db, int $reportId, int $motherId, string $language): ?array
{
    $reportQuery=$db->prepare('SELECT symptoms_json,severity,worsening,reference_code FROM tbl_symptom_reports WHERE report_id=? AND mother_id=?');
    $reportQuery->execute([$reportId,$motherId]);
    $report=$reportQuery->fetch(PDO::FETCH_ASSOC);
    if(!$report)return null;
    $symptomIds=array_values(array_unique(array_filter(array_map('intval',json_decode((string)$report['symptoms_json'],true)?:[]))));
    if(!$symptomIds)return null;
    $marks=implode(',',array_fill(0,count($symptomIds),'?'));
    $symptomQuery=$db->prepare("SELECT symptom_name,symptom_name_rw FROM tbl_symptoms WHERE symptom_id IN ($marks)");
    $symptomQuery->execute($symptomIds);
    return mcare_report_guidance_data($symptomQuery->fetchAll(PDO::FETCH_ASSOC),(string)($report['severity']??''),(bool)$report['worsening'],$language,(string)$report['reference_code']);
}
