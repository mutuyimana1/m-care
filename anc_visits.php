<?php
include("inc/connect.php");
include("inc/auth.php");

$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'add') {
    if (!in_array((int)$_SESSION['log_role'], [1,2], true)) { http_response_code(403); exit('Only an administrator or healthcare professional can record a clinical ANC encounter.'); }
    $scope=(int)$_SESSION['log_role']===2?' AND m.facility_id=?':'';
    $check=$db->prepare("SELECT COUNT(*) FROM tbl_pregnancies p JOIN tbl_mothers m ON m.mother_id=p.mother_id WHERE p.pregnancy_id=? AND p.mother_id=? AND p.pregnancy_status='active' AND m.is_active=1$scope");
    $checkParams=[(int)($_POST['pregnancy_id']??0),(int)($_POST['mother_id']??0)];if($scope)$checkParams[]=(int)($_SESSION['facility_id']??0);$check->execute($checkParams);
    if(!$check->fetchColumn()){http_response_code(403);exit('The pregnancy and mother must match an active case in your authorized facility.');}
    $stmt = $db->prepare("INSERT INTO tbl_anc_visits (pregnancy_id,mother_id,visit_number,visit_date,gestational_age_weeks,weight,bp_systolic,bp_diastolic,fundal_height,fetal_heart_rate,hemoglobin,urine_protein,urine_glucose,hiv_status,syphilis_status,height_cm,temperature_c,respiratory_rate,tetanus_dose,iron_folic_given,itn_given,next_visit_date,notes,recorded_by,facility_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->execute([
        $_POST['pregnancy_id'], $_POST['mother_id'], $_POST['visit_number'], $_POST['visit_date'],
        $_POST['gestational_age_weeks'] ?: null, $_POST['weight'] ?: null,
        $_POST['bp_systolic'] ?: null, $_POST['bp_diastolic'] ?: null,
        $_POST['fundal_height'] ?: null, $_POST['fetal_heart_rate'] ?: null,
        $_POST['hemoglobin'] ?: null, $_POST['urine_protein'], $_POST['urine_glucose'],
        $_POST['hiv_status'], $_POST['syphilis_status'], $_POST['height_cm'] ?: null, $_POST['temperature_c'] ?: null, $_POST['respiratory_rate'] ?: null, $_POST['tetanus_dose'],
        isset($_POST['iron_folic_given']) ? 1 : 0, isset($_POST['itn_given']) ? 1 : 0,
        $_POST['next_visit_date'] ?: null, $_POST['notes'],
        $_SESSION['u_id'], $_POST['facility_id'] ?: null
    ]);
    $anc_id = $db->lastInsertId();
    audit_log($db, $_SESSION['u_id'], 'ADD_ANC_VISIT', 'tbl_anc_visits', $anc_id, null, $_POST);

    // Auto-create reminder for next visit
    if (!empty($_POST['next_visit_date'])) {
        $db->prepare("INSERT INTO tbl_reminders (mother_id,reminder_type,reminder_message,reminder_date) VALUES (?,?,?,?)")
           ->execute([$_POST['mother_id'], 'anc_appointment', 'ANC visit #' . ($_POST['visit_number']+1) . ' due', $_POST['next_visit_date']]);
    }
    $msg = "ANC visit recorded successfully.";
}

$preg_filter = isset($_GET['pregnancy_id']) ? (int)$_GET['pregnancy_id'] : null;
$filters=[]; if($preg_filter)$filters[]="v.pregnancy_id=$preg_filter"; if((int)$_SESSION['log_role']===3)$filters[]="m.chw_id=".(int)$_SESSION['u_id']; if(in_array((int)$_SESSION['log_role'],[2,4],true))$filters[]="m.facility_id=".(int)($_SESSION['facility_id']??0); $where=$filters?'WHERE '.implode(' AND ',$filters):'';

$visits = $db->query("SELECT v.*, CONCAT(m.f_name,' ',m.l_name) AS mother_name,
    CONCAT(u.f_name,' ',u.l_name) AS recorded_by_name
    FROM tbl_anc_visits v
    JOIN tbl_mothers m ON v.mother_id=m.mother_id
    LEFT JOIN tbl_users u ON v.recorded_by=u.u_id
    $where ORDER BY v.visit_date DESC")->fetchAll(PDO::FETCH_ASSOC);

$mothers = $db->query("SELECT m.mother_id, CONCAT(m.f_name,' ',m.l_name) AS name FROM tbl_mothers m WHERE m.is_active=1".((int)$_SESSION['log_role']===3 ? ' AND m.chw_id='.(int)$_SESSION['u_id'] : (in_array((int)$_SESSION['log_role'],[2,4],true) ? ' AND m.facility_id='.(int)($_SESSION['facility_id']??0) : ''))." ORDER BY m.f_name")->fetchAll(PDO::FETCH_ASSOC);
$pregnancies = $db->query("SELECT p.pregnancy_id, CONCAT(m.f_name,' ',m.l_name,' (EDD: ',COALESCE(p.edd,'N/A'),')') AS label, p.mother_id FROM tbl_pregnancies p JOIN tbl_mothers m ON p.mother_id=m.mother_id WHERE p.pregnancy_status='active'".((int)$_SESSION['log_role']===3 ? ' AND m.chw_id='.(int)$_SESSION['u_id'] : (in_array((int)$_SESSION['log_role'],[2,4],true) ? ' AND m.facility_id='.(int)($_SESSION['facility_id']??0) : ''))." ORDER BY m.f_name")->fetchAll(PDO::FETCH_ASSOC);
$facilities = $db->query("SELECT facility_id, facility_name FROM tbl_facilities WHERE is_active=1")->fetchAll(PDO::FETCH_ASSOC);

$page_title = 'ANC Visits';
$breadcrumb = [['Home','home'],['ANC Visits','']];
include("inc/links.php");
include("inc/header.php");
?>
<div class="inner-wrapper">
<?php include("inc/sidebar.php"); ?>
<section role="main" class="content-body">
<?php include("inc/inner-header.php"); ?>

<?php if (!empty($msg)): ?><div class="alert alert-success"><?php echo htmlspecialchars($msg); ?></div><?php endif; ?>

<section class="panel">
    <header class="panel-heading">
        <h2 class="panel-title"><i class="fa fa-stethoscope"></i> ANC Visits</h2>
        <?php if(in_array((int)$_SESSION['log_role'],[1,2],true)): ?><div class="panel-actions">
            <a href="#addANCModal" data-toggle="modal" class="btn btn-sm btn-primary"><i class="fa fa-plus"></i> Record ANC Visit</a>
        </div><?php endif; ?>
    </header>
    <div class="panel-body">
        <table class="table table-bordered table-striped table-condensed" id="ancTable">
            <thead><tr><th>#</th><th>Mother</th><th>Visit #</th><th>Date</th><th>GA (wks)</th><th>BP</th><th>Weight</th><th>FHR</th><th>Next Visit</th><th>Recorded By</th></tr></thead>
            <tbody>
            <?php foreach ($visits as $i => $v): ?>
                <tr>
                    <td><?php echo $i+1; ?></td>
                    <td><?php echo htmlspecialchars($v['mother_name']); ?></td>
                    <td><span class="badge badge-primary"><?php echo $v['visit_number']; ?></span></td>
                    <td><?php echo date('d M Y', strtotime($v['visit_date'])); ?></td>
                    <td><?php echo $v['gestational_age_weeks'] ? $v['gestational_age_weeks'].' wks' : '-'; ?></td>
                    <td><?php echo ($v['bp_systolic'] && $v['bp_diastolic']) ? $v['bp_systolic'].'/'.$v['bp_diastolic'] : '-'; ?></td>
                    <td><?php echo $v['weight'] ? $v['weight'].' kg' : '-'; ?></td>
                    <td><?php echo $v['fetal_heart_rate'] ? $v['fetal_heart_rate'].' bpm' : '-'; ?></td>
                    <td><?php echo $v['next_visit_date'] ? date('d M Y', strtotime($v['next_visit_date'])) : '-'; ?></td>
                    <td><?php echo htmlspecialchars($v['recorded_by_name'] ?? '-'); ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</section>

<?php if(in_array((int)$_SESSION['log_role'],[1,2],true)): ?><!-- Add ANC Modal -->
<div class="modal fade" id="addANCModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header" style="background:#3498db;color:#fff;">
                <button type="button" class="close" data-dismiss="modal" style="color:#fff">&times;</button>
                <h4 class="modal-title"><i class="fa fa-stethoscope"></i> Record ANC Visit</h4>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="add">
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6"><div class="form-group"><label>Pregnancy *</label>
                            <select name="pregnancy_id" id="preg_select" class="form-control select2" required>
                                <option value="">-- Select Pregnancy --</option>
                                <?php foreach ($pregnancies as $p): ?><option value="<?php echo $p['pregnancy_id']; ?>" data-mother="<?php echo $p['mother_id']; ?>"><?php echo htmlspecialchars($p['label']); ?></option><?php endforeach; ?>
                            </select>
                        </div></div>
                        <input type="hidden" name="mother_id" id="anc_mother_id">
                        <div class="col-md-3"><div class="form-group"><label>Visit Number *</label><input type="number" name="visit_number" class="form-control" value="1" min="1" required></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Visit Date *</label><input type="date" name="visit_date" class="form-control" value="<?php echo date('Y-m-d'); ?>" required></div></div>
                    </div>
                    <div class="row">
                        <div class="col-md-3"><div class="form-group"><label>GA (weeks)</label><input type="number" name="gestational_age_weeks" class="form-control" min="1" max="42"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Weight (kg)</label><input type="number" name="weight" class="form-control" step="0.1"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>BP Systolic</label><input type="number" name="bp_systolic" class="form-control"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>BP Diastolic</label><input type="number" name="bp_diastolic" class="form-control"></div></div>
                    </div>
                    <div class="row">
                        <div class="col-md-3"><div class="form-group"><label>Fundal Height (cm)</label><input type="number" name="fundal_height" class="form-control" step="0.1"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Fetal Heart Rate</label><input type="number" name="fetal_heart_rate" class="form-control"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Hemoglobin (g/dL)</label><input type="number" name="hemoglobin" class="form-control" step="0.1"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Urine Protein</label>
                            <select name="urine_protein" class="form-control"><option value="">-</option><option>Negative</option><option>Trace</option><option>1+</option><option>2+</option><option>3+</option></select>
                        </div></div>
                    </div>
                    <div class="row"><div class="col-md-4"><div class="form-group"><label>Height (cm)</label><input type="number" name="height_cm" class="form-control" step="0.1"></div></div><div class="col-md-4"><div class="form-group"><label>Temperature (°C)</label><input type="number" name="temperature_c" class="form-control" step="0.1"></div></div><div class="col-md-4"><div class="form-group"><label>Respiratory rate (/min)</label><input type="number" name="respiratory_rate" class="form-control"></div></div></div>
                    <div class="row">
                        <div class="col-md-3"><div class="form-group"><label>Urine Glucose</label>
                            <select name="urine_glucose" class="form-control"><option value="">-</option><option>Negative</option><option>Trace</option><option>1+</option><option>2+</option></select>
                        </div></div>
                        <div class="col-md-3"><div class="form-group"><label>HIV Status</label>
                            <select name="hiv_status" class="form-control"><option value="">-</option><option>Negative</option><option>Positive</option><option>Unknown</option></select>
                        </div></div>
                        <div class="col-md-3"><div class="form-group"><label>Syphilis Status</label>
                            <select name="syphilis_status" class="form-control"><option value="">-</option><option>Negative</option><option>Positive</option><option>Unknown</option></select>
                        </div></div>
                        <div class="col-md-3"><div class="form-group"><label>Tetanus Dose</label>
                            <select name="tetanus_dose" class="form-control"><option value="">-</option><option>TT1</option><option>TT2</option><option>TT3</option><option>TT4</option><option>TT5</option></select>
                        </div></div>
                    </div>
                    <div class="row">
                        <div class="col-md-4"><div class="form-group"><label>Facility</label>
                            <select name="facility_id" class="form-control select2">
                                <option value="">-- Select --</option>
                                <?php foreach ($facilities as $f): ?><option value="<?php echo $f['facility_id']; ?>"><?php echo htmlspecialchars($f['facility_name']); ?></option><?php endforeach; ?>
                            </select>
                        </div></div>
                        <div class="col-md-4"><div class="form-group"><label>Next Visit Date</label><input type="date" name="next_visit_date" class="form-control"></div></div>
                        <div class="col-md-4"><div class="form-group"><label>Supplements Given</label>
                            <div class="checkbox"><label><input type="checkbox" name="iron_folic_given" value="1"> Iron/Folic Acid</label></div>
                            <div class="checkbox"><label><input type="checkbox" name="itn_given" value="1"> ITN (Mosquito Net)</label></div>
                        </div></div>
                    </div>
                    <div class="form-group"><label>Notes</label><textarea name="notes" class="form-control" rows="2"></textarea></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save ANC Visit</button>
                </div>
            </form>
        </div>
    </div>
</div><?php endif; ?>

</section>
</div>
</section>
<?php include("inc/footer.php"); ?>
<?php include("inc/scripts.php"); ?>
<script>
$('#ancTable').DataTable();
$('#preg_select').on('change', function() {
    var motherId = $(this).find(':selected').data('mother');
    $('#anc_mother_id').val(motherId);
});
</script>
