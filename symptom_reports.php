<?php
include("inc/connect.php");
include("inc/auth.php");
require_once __DIR__ . '/inc/report_analysis.php';

$msg = ''; $msge = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'add') {
    $symptoms_selected = $_POST['symptoms'] ?? [];
    $symptoms_selected = array_values(array_unique(array_filter(array_map('intval', $symptoms_selected))));
    if (!$symptoms_selected) { $msge = 'Select at least one symptom.'; }
    else {
    $symptoms_json = json_encode($symptoms_selected);
    $reference_code = 'MC-' . strtoupper(bin2hex(random_bytes(5)));

    $mother_check=$db->prepare("SELECT COUNT(*) FROM tbl_mothers WHERE mother_id=? AND is_active=1 AND (?<>3 OR chw_id=?) AND (? NOT IN (2,4) OR facility_id=?)");$mother_check->execute([(int)$_POST['mother_id'],(int)$_SESSION['log_role'],(int)$_SESSION['u_id'],(int)$_SESSION['log_role'],(int)($_SESSION['facility_id']??0)]);
    $pregnancy_id = $_POST['pregnancy_id'] ? (int)$_POST['pregnancy_id'] : null;
    if ($pregnancy_id) {$preg_check=$db->prepare('SELECT COUNT(*) FROM tbl_pregnancies WHERE pregnancy_id=? AND mother_id=?');$preg_check->execute([$pregnancy_id,(int)$_POST['mother_id']]);if(!$preg_check->fetchColumn())$pregnancy_id=null;}
    if(!$mother_check->fetchColumn()){$msge='Select a valid active mother record.';}
    else {
    $stmt = $db->prepare("SELECT symptom_id,symptom_name,severity_weight FROM tbl_symptoms WHERE is_active=1 AND symptom_id IN (".implode(',',array_fill(0,count($symptoms_selected),'?')).")");$stmt->execute($symptoms_selected);$selectedRows=$stmt->fetchAll(PDO::FETCH_ASSOC);
    $db->beginTransaction();
    $stmt = $db->prepare("INSERT INTO tbl_symptom_reports (mother_id,pregnancy_id,reported_by,symptoms_json,onset_at,severity,symptom_pattern,worsening,already_sought_care,reported_temperature,reported_systolic,reported_diastolic,reference_code,additional_notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->execute([$_POST['mother_id'], $pregnancy_id, $_SESSION['u_id'], $symptoms_json, $_POST['onset_at'] ?: null, $_POST['severity'] ?: null, $_POST['symptom_pattern'] ?: null, (int)isset($_POST['worsening']), (int)isset($_POST['already_sought_care']), $_POST['reported_temperature'] ?: null, $_POST['reported_systolic'] ?: null, $_POST['reported_diastolic'] ?: null, $reference_code, $_POST['additional_notes']]);
    $report_id = $db->lastInsertId();
    $mother_context=$db->prepare('SELECT mother_id,chw_id,facility_id FROM tbl_mothers WHERE mother_id=?');$mother_context->execute([(int)$_POST['mother_id']]);$mother_route=$mother_context->fetch(PDO::FETCH_ASSOC)?:[];
    mcare_create_report_analysis($db,(int)$report_id,(int)$_POST['mother_id'],$reference_code,[
        'onset_at'=>$_POST['onset_at']??'','severity'=>$_POST['severity']??'','symptom_pattern'=>$_POST['symptom_pattern']??'',
        'worsening'=>(int)isset($_POST['worsening']),'already_sought_care'=>(int)isset($_POST['already_sought_care']),
        'reported_temperature'=>$_POST['reported_temperature']??'','reported_systolic'=>$_POST['reported_systolic']??'',
        'reported_diastolic'=>$_POST['reported_diastolic']??'','additional_notes'=>$_POST['additional_notes']??'',
    ],$selectedRows);

    // Auto-generate alert based on symptom severity
    if (!empty($symptoms_selected)) {
        $placeholders = implode(',', array_fill(0, count($symptoms_selected), '?'));
        $sev_q = $db->prepare("SELECT MAX(severity_weight) AS max_sev FROM tbl_symptoms WHERE symptom_id IN ($placeholders)");
        $sev_q->execute($symptoms_selected);
        $max_sev = (int)$sev_q->fetchColumn();

        // These catalogue weights are an operational prompt only until approved by the clinical governance team.
        $alert_level = match(true) {
            $max_sev >= 3 => 'critical',
            $max_sev == 2 => 'high',
            default       => 'medium'
        };

        // Assign to CHW of the mother
        $chw_q = $db->prepare("SELECT chw_id,facility_id FROM tbl_mothers WHERE mother_id=?");
        $chw_q->execute([$_POST['mother_id']]);
        $mother_route = $chw_q->fetch(PDO::FETCH_ASSOC);
        $chw_id = $mother_route['chw_id'] ?? null;
        $facility_id = $mother_route['facility_id'] ?? null;

        $alert_msg = "Symptom report submitted. Catalogue routing priority: " . strtoupper($alert_level) . ". A system-generated intake summary is available for professional review; it is not a diagnosis.";
        $db->prepare("INSERT INTO tbl_alerts (report_id,mother_id,pregnancy_id,alert_level,alert_message,assigned_to,facility_id) VALUES (?,?,?,?,?,?,?)")
           ->execute([$report_id, $_POST['mother_id'], $pregnancy_id, $alert_level, $alert_msg, $chw_id ?: null, $facility_id ?: null]);
        $alert_id=(int)$db->lastInsertId();
        $db->prepare('INSERT INTO tbl_alert_events(alert_id,actor_user_id,event_type,to_user_id,event_note) VALUES(?,?,?,?,?)')->execute([$alert_id,(int)$_SESSION['u_id'],'created',$chw_id?:null,'Generated from selected catalogue symptom weights; routing priority is not a diagnosis.']);
        if($chw_id)$db->prepare('INSERT INTO tbl_alert_events(alert_id,actor_user_id,event_type,to_user_id,event_note) VALUES(?,?,?,?,?)')->execute([$alert_id,(int)$_SESSION['u_id'],'assigned',(int)$chw_id,'Assigned to the mother’s linked community health worker.']);

        $db->prepare("UPDATE tbl_symptom_reports SET alert_generated=1 WHERE report_id=?")->execute([$report_id]);
        $recipients=mcare_notify_report_reviewers($db,$mother_route,(int)$report_id,$reference_code,$alert_level);
        foreach($recipients as $recipient)$db->prepare('INSERT INTO tbl_alert_events(alert_id,actor_user_id,event_type,to_user_id,event_note) VALUES(?,?,?,?,?)')->execute([$alert_id,(int)$_SESSION['u_id'],'notified',$recipient,'In-app report review notification sent; generated intake summary is available.']);
    }
    audit_log($db, $_SESSION['u_id'], 'ADD_SYMPTOM_REPORT', 'tbl_symptom_reports', $report_id, null, ['mother_id'=>$_POST['mother_id']]);
    $db->commit();
    $msg = "Report submitted. Reference: " . $reference_code . ". A worker will follow the approved workflow; this is not an emergency service.";
    }
    }
}

// Fetch reports
$chw_filter = $_SESSION['log_role'] == 3 ? "AND m.chw_id=" . (int)$_SESSION['u_id'] : (in_array((int)$_SESSION['log_role'],[2,4],true) ? "AND m.facility_id=".(int)($_SESSION['facility_id']??0) : '');
$reports = $db->query("SELECT r.*, CONCAT(m.f_name,' ',m.l_name) AS mother_name,
    CONCAT(u.f_name,' ',u.l_name) AS reporter_name,ra.summary_text AS analysis_summary,ra.review_status AS analysis_review_status
    FROM tbl_symptom_reports r
    JOIN tbl_mothers m ON r.mother_id=m.mother_id
    LEFT JOIN tbl_users u ON r.reported_by=u.u_id
    LEFT JOIN tbl_report_analyses ra ON ra.report_id=r.report_id
    WHERE 1=1 $chw_filter ORDER BY r.report_date DESC")->fetchAll(PDO::FETCH_ASSOC);

$symptoms_list = $db->query("SELECT * FROM tbl_symptoms WHERE is_active=1 ORDER BY severity_weight DESC, symptom_name")->fetchAll(PDO::FETCH_ASSOC);
$mothers = $db->query("SELECT m.mother_id, CONCAT(m.f_name,' ',m.l_name) AS name FROM tbl_mothers m WHERE m.is_active=1".((int)$_SESSION['log_role']===3 ? ' AND m.chw_id='.(int)$_SESSION['u_id'] : (in_array((int)$_SESSION['log_role'],[2,4],true) ? ' AND m.facility_id='.(int)($_SESSION['facility_id']??0) : ''))." ORDER BY m.f_name")->fetchAll(PDO::FETCH_ASSOC);
$pregnancies = $db->query("SELECT p.pregnancy_id, CONCAT(m.f_name,' ',m.l_name) AS label, p.mother_id FROM tbl_pregnancies p JOIN tbl_mothers m ON p.mother_id=m.mother_id WHERE p.pregnancy_status='active'" . ((int)$_SESSION['log_role']===3 ? ' AND m.chw_id='.(int)$_SESSION['u_id'] : (in_array((int)$_SESSION['log_role'],[2,4],true) ? ' AND m.facility_id='.(int)($_SESSION['facility_id']??0) : '')))->fetchAll(PDO::FETCH_ASSOC);

$page_title = 'Symptom Reports';
$breadcrumb = [['Home','home'],['Symptom Reports','']];
include("inc/links.php");
include("inc/header.php");
?>
<div class="inner-wrapper">
<?php include("inc/sidebar.php"); ?>
<section role="main" class="content-body">
<?php include("inc/inner-header.php"); ?>

<?php if (!empty($msg)): ?><div class="alert alert-success"><?php echo htmlspecialchars($msg); ?></div><?php endif; ?>
<?php if (!empty($msge)): ?><div class="alert alert-danger"><?php echo htmlspecialchars($msge); ?></div><?php endif; ?>

<section class="panel">
    <header class="panel-heading">
        <h2 class="panel-title"><i class="fa fa-list-alt"></i> Symptom Reports</h2>
        <div class="panel-actions">
            <a href="#addReportModal" data-toggle="modal" class="btn btn-sm btn-danger"><i class="fa fa-plus"></i> Report Symptoms</a>
        </div>
    </header>
    <div class="panel-body">
        <table class="table table-bordered table-striped" id="reportsTable">
            <thead><tr><th>Reference</th><th>Mother</th><th>Date</th><th>Symptoms</th><th>Automatic summary</th><th>Alert</th><th>Status</th><th>Reported By</th></tr></thead>
            <tbody>
            <?php foreach ($reports as $i => $r): ?>
                <?php $syms = json_decode($r['symptoms_json'], true) ?? []; $symptom_names = []; if ($syms) { $sq=$db->prepare('SELECT symptom_name FROM tbl_symptoms WHERE symptom_id IN ('.implode(',', array_fill(0,count($syms),'?')).') ORDER BY symptom_name'); $sq->execute(array_map('intval',$syms)); $symptom_names=$sq->fetchAll(PDO::FETCH_COLUMN); } ?>
                <tr>
                    <td><?php echo htmlspecialchars($r['reference_code'] ?? ('Report '.$r['report_id'])); ?></td>
                    <td><?php echo htmlspecialchars($r['mother_name']); ?></td>
                    <td><?php echo date('d M Y H:i', strtotime($r['report_date'])); ?></td>
                    <td><?php echo htmlspecialchars(implode(', ', $symptom_names) ?: 'No symptom details'); ?></td>
                    <td><?php if(!empty($r['analysis_summary'])): ?><details><summary>Review summary · <?=htmlspecialchars(ucfirst((string)$r['analysis_review_status']))?></summary><p style="min-width:280px;max-width:460px;white-space:normal;margin-top:8px"><?=nl2br(htmlspecialchars($r['analysis_summary']))?></p><small class="text-muted">Structured summary only; not a diagnosis.</small></details><?php else: ?><span class="text-muted">Not available</span><?php endif; ?></td>
                    <td><?php echo $r['alert_generated'] ? '<span class="badge badge-danger">Yes</span>' : '<span class="badge badge-default">No</span>'; ?></td>
                    <td><?php echo ucfirst($r['status']); ?></td>
                    <td><?php echo htmlspecialchars($r['reporter_name'] ?? '-'); ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</section>

<!-- Add Report Modal -->
<div class="modal fade" id="addReportModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header" style="background:#e74c3c;color:#fff;">
                <button type="button" class="close" data-dismiss="modal" style="color:#fff">&times;</button>
                <h4 class="modal-title"><i class="fa fa-exclamation-triangle"></i> Report Symptoms</h4>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="add">
                <div class="modal-body">
                    <div class="mcare-emergency"><strong>Need urgent help?</strong> If you have severe symptoms or feel in danger, seek immediate medical assessment now or use your local emergency pathway. </div>
                    <div class="row">
                        <div class="col-md-6"><div class="form-group"><label>Mother *</label>
                            <select name="mother_id" class="form-control select2" required>
                                <option value="">-- Select Mother --</option>
                                <?php foreach ($mothers as $m): ?><option value="<?php echo $m['mother_id']; ?>"><?php echo htmlspecialchars($m['name']); ?></option><?php endforeach; ?>
                            </select>
                        </div></div>
                        <div class="col-md-6"><div class="form-group"><label>Pregnancy (if applicable)</label>
                            <select name="pregnancy_id" class="form-control select2">
                                <option value="">-- Select --</option>
                                <?php foreach ($pregnancies as $p): ?><option data-mother="<?php echo (int)$p['mother_id']; ?>" value="<?php echo $p['pregnancy_id']; ?>"><?php echo htmlspecialchars($p['label']); ?></option><?php endforeach; ?>
                            </select>
                        </div></div>
                    </div>
                    <div class="row"><div class="col-md-3 form-group"><label>When did it start?</label><input type="datetime-local" name="onset_at" class="form-control"></div><div class="col-md-3 form-group"><label>How severe?</label><select class="form-control" name="severity"><option value="">Choose</option><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option></select></div><div class="col-md-3 form-group"><label>Pattern</label><select class="form-control" name="symptom_pattern"><option value="">Choose</option><option value="continuous">Continuous</option><option value="comes_goes">Comes and goes</option></select></div><div class="col-md-3 form-group"><label><input type="checkbox" name="worsening"> Getting worse</label><br><label><input type="checkbox" name="already_sought_care"> Already sought care</label></div></div>
                    <div class="row"><div class="col-md-4 form-group"><label>Temperature (°C), if known</label><input type="number" name="reported_temperature" step="0.1" class="form-control"></div><div class="col-md-4 form-group"><label>Blood pressure systolic, if known</label><input type="number" name="reported_systolic" class="form-control"></div><div class="col-md-4 form-group"><label>Blood pressure diastolic, if known</label><input type="number" name="reported_diastolic" class="form-control"></div></div>
                    <div class="form-group">
                        <label>Symptoms Reported *</label>
                        <div class="row">
                        <?php foreach ($symptoms_list as $s): ?>
                            <div class="col-md-4">
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="symptoms[]" value="<?php echo $s['symptom_id']; ?>">
                                        <?php echo htmlspecialchars($s['symptom_name']); ?>
                                        <?php if ($s['severity_weight'] == 3): ?><span class="label label-danger">High</span><?php elseif ($s['severity_weight'] == 2): ?><span class="label label-warning">Med</span><?php endif; ?>
                                    </label>
                                </div>
                            </div>
                        <?php endforeach; ?>
                        </div>
                    </div>
                    <div class="form-group"><label>Additional Notes</label><textarea name="additional_notes" class="form-control" rows="3" placeholder="Describe symptoms in more detail..."></textarea></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger"><i class="fa fa-paper-plane"></i> Submit Report</button>
                </div>
            </form>
        </div>
    </div>
</div>

</section>
</div>
</section>
<?php include("inc/footer.php"); ?>
<?php include("inc/scripts.php"); ?>
<script>$('#reportsTable').DataTable();(function(){var mother=document.querySelector('[name=mother_id]'), pregnancy=document.querySelector('[name=pregnancy_id]');if(!mother||!pregnancy)return;function filterPregnancies(){Array.prototype.forEach.call(pregnancy.options,function(o){if(!o.value)return;o.hidden=o.getAttribute('data-mother')!==mother.value;if(o.hidden&&o.selected)pregnancy.value='';});}mother.addEventListener('change',filterPregnancies);filterPregnancies();})();</script>
