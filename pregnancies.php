<?php
include("inc/connect.php");
include("inc/auth.php");

$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if (!in_array((int)$_SESSION['log_role'], [1,2], true)) { http_response_code(403); exit('Only an administrator or healthcare professional can confirm or update pregnancy episodes.'); }
    if ($action === 'add') {
        $motherCheck=$db->prepare('SELECT COUNT(*) FROM tbl_mothers WHERE mother_id=? AND is_active=1 AND (?<>2 OR facility_id=?)');
        $motherCheck->execute([(int)($_POST['mother_id']??0),(int)$_SESSION['log_role'],(int)($_SESSION['facility_id']??0)]);
        if(!$motherCheck->fetchColumn()){http_response_code(403);exit('Mother is outside your facility.');}
        $source = $_POST['dating_source'] ?? 'lmp';
        $edd = $source === 'ultrasound' ? ($_POST['ultrasound_edd'] ?: null) : ($source === 'lmp' && !empty($_POST['lmp']) ? date('Y-m-d', strtotime($_POST['lmp'] . ' +280 days')) : null);
        $confidence = $_POST['dating_confidence'] ?? 'unknown';
        $stmt = $db->prepare("INSERT INTO tbl_pregnancies (mother_id,lmp,edd,dating_source,dating_confidence,ultrasound_edd,gravida,parity,confirmed_by,confirmed_at) VALUES (?,?,?,?,?,?,?,?,?,NOW())");
        $stmt->execute([$_POST['mother_id'], $_POST['lmp'] ?: null, $edd, $source, $confidence, $_POST['ultrasound_edd'] ?: null, $_POST['gravida'], $_POST['parity'], $_SESSION['u_id']]);
        audit_log($db, $_SESSION['u_id'], 'ADD_PREGNANCY', 'tbl_pregnancies', $db->lastInsertId(), null, $_POST);
        $msg = "Pregnancy confirmed successfully. EDD: $edd";
    } elseif ($action === 'update_status') {
        if(!in_array($_POST['pregnancy_status']??'', ['active','delivered','lost'], true)) { http_response_code(400); exit('Invalid pregnancy status.'); }
        $scope=(int)$_SESSION['log_role']===2?' AND mother_id IN (SELECT mother_id FROM tbl_mothers WHERE facility_id=?)':'';
        $params=[$_POST['pregnancy_status'],(int)$_POST['pregnancy_id']];if($scope)$params[]=(int)($_SESSION['facility_id']??0);
        $db->prepare("UPDATE tbl_pregnancies SET pregnancy_status=? WHERE pregnancy_id=?$scope")->execute($params);
        $msg = "Pregnancy status updated.";
    }
}

$mother_filter = isset($_GET['mother_id']) ? (int)$_GET['mother_id'] : null;
$filters = []; if ($mother_filter) $filters[] = "p.mother_id=$mother_filter"; if ((int)$_SESSION['log_role'] === 3) $filters[] = "m.chw_id=".(int)$_SESSION['u_id']; if (in_array((int)$_SESSION['log_role'],[2,4],true)) $filters[] = "m.facility_id=".(int)($_SESSION['facility_id']??0); $where = $filters ? 'WHERE '.implode(' AND ', $filters) : '';

$pregnancies = $db->query("SELECT p.*, CONCAT(m.f_name,' ',m.l_name) AS mother_name, m.phone,
    CONCAT(u.f_name,' ',u.l_name) AS confirmed_by_name,
    DATEDIFF(COALESCE(p.edd, NOW()), NOW()) AS days_to_edd,
    FLOOR((CASE WHEN p.lmp IS NOT NULL THEN DATEDIFF(CURDATE(),p.lmp) WHEN p.ultrasound_edd IS NOT NULL THEN 280-DATEDIFF(p.ultrasound_edd,CURDATE()) ELSE NULL END)/7) AS current_ga_weeks
    FROM tbl_pregnancies p
    JOIN tbl_mothers m ON p.mother_id=m.mother_id
    LEFT JOIN tbl_users u ON p.confirmed_by=u.u_id
    $where ORDER BY p.created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

$mothers = $db->query("SELECT mother_id, CONCAT(f_name,' ',l_name) AS name FROM tbl_mothers WHERE is_active=1".((int)$_SESSION['log_role']===3 ? ' AND chw_id='.(int)$_SESSION['u_id'] : (in_array((int)$_SESSION['log_role'],[2,4],true) ? ' AND facility_id='.(int)($_SESSION['facility_id']??0) : ''))." ORDER BY f_name")->fetchAll(PDO::FETCH_ASSOC);

$page_title = 'Pregnancies';
$breadcrumb = [['Home','home'],['Pregnancies','']];
include("inc/links.php");
include("inc/header.php");
?>
<div class="inner-wrapper">
<?php include("inc/sidebar.php"); ?>
<section role="main" class="content-body">
<?php include("inc/inner-header.php"); ?>

<?php if ($msg): ?><div class="alert alert-success"><?php echo htmlspecialchars($msg); ?></div><?php endif; ?>

<section class="panel">
    <header class="panel-heading">
        <h2 class="panel-title"><i class="fa fa-heart" style="color:#e91e8c"></i> Pregnancies</h2>
        <?php if(in_array((int)$_SESSION['log_role'],[1,2],true)): ?><div class="panel-actions">
            <a href="#addPregnancyModal" data-toggle="modal" class="btn btn-sm btn-primary"><i class="fa fa-plus"></i> Confirm Pregnancy</a>
        </div><?php endif; ?>
    </header>
    <div class="panel-body">
        <table class="table table-bordered table-striped" id="pregTable">
            <thead><tr><th>#</th><th>Mother</th><th>LMP</th><th>EDD</th><th>GA (wks)</th><th>Gravida</th><th>Parity</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
            <?php foreach ($pregnancies as $i => $p): ?>
                <tr>
                    <td><?php echo $i+1; ?></td>
                    <td><?php echo htmlspecialchars($p['mother_name']); ?><br><small class="text-muted"><?php echo $p['phone']; ?></small></td>
                    <td><?php echo $p['lmp'] ? date('d M Y', strtotime($p['lmp'])) : '-'; ?></td>
                    <td><?php echo $p['edd'] ? date('d M Y', strtotime($p['edd'])) : '-'; ?></td>
                    <td><?php echo $p['current_ga_weeks'] !== null && $p['current_ga_weeks'] >= 0 ? $p['current_ga_weeks'] . ' wks' : '-'; ?></td>
                    <td><?php echo $p['gravida']; ?></td>
                    <td><?php echo $p['parity']; ?></td>
                    <td>
                        <?php
                        $badges = ['active'=>'success','delivered'=>'primary','lost'=>'danger'];
                        $badge = $badges[$p['pregnancy_status']] ?? 'default';
                        ?>
                        <span class="badge badge-<?php echo $badge; ?>"><?php echo ucfirst($p['pregnancy_status']); ?></span>
                    </td>
                    <td>
                        <a href="anc_visits?pregnancy_id=<?php echo $p['pregnancy_id']; ?>" class="btn btn-xs btn-info"><i class="fa fa-stethoscope"></i> ANC</a>
                        <?php if(in_array((int)$_SESSION['log_role'],[1,2],true)): ?><button class="btn btn-xs btn-warning btn-update-status" data-id="<?php echo $p['pregnancy_id']; ?>" data-status="<?php echo $p['pregnancy_status']; ?>"><i class="fa fa-edit"></i></button><?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</section>

<?php if(in_array((int)$_SESSION['log_role'],[1,2],true)): ?><!-- Add Pregnancy Modal -->
<div class="modal fade" id="addPregnancyModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header" style="background:#e91e8c;color:#fff;">
                <button type="button" class="close" data-dismiss="modal" style="color:#fff">&times;</button>
                <h4 class="modal-title"><i class="fa fa-heart"></i> Confirm Pregnancy</h4>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="add">
                <div class="modal-body">
                    <div class="form-group"><label>Mother *</label>
                        <select name="mother_id" class="form-control select2" required>
                            <option value="">-- Select Mother --</option>
                            <?php foreach ($mothers as $m): ?>
                                <option value="<?php echo $m['mother_id']; ?>" <?php echo ($mother_filter == $m['mother_id']) ? 'selected' : ''; ?>><?php echo htmlspecialchars($m['name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group"><label>Dating source</label><select name="dating_source" class="form-control"><option value="lmp">LMP</option><option value="ultrasound">Ultrasound</option><option value="clinical">Clinical assessment</option><option value="unknown">Unknown / needs clinician dating</option></select></div>
                    <div class="row"><div class="col-md-6"><div class="form-group"><label>LMP (if known)</label><input type="date" name="lmp" class="form-control"></div></div><div class="col-md-6"><div class="form-group"><label>Ultrasound EDD (if available)</label><input type="date" name="ultrasound_edd" class="form-control"></div></div></div>
                    <div class="form-group"><label>Dating confidence</label><select name="dating_confidence" class="form-control"><option value="unknown">Needs review</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select><small class="text-muted">Dating method and confidence require confirmation by an authorized health professional. EDD from LMP uses the standard 280-day estimate.</small></div>
                    <div class="row">
                        <div class="col-md-6"><div class="form-group"><label>Gravida</label><input type="number" name="gravida" class="form-control" value="1" min="1"></div></div>
                        <div class="col-md-6"><div class="form-group"><label>Parity</label><input type="number" name="parity" class="form-control" value="0" min="0"></div></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Confirm</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php endif; ?>

<?php if(in_array((int)$_SESSION['log_role'],[1,2],true)): ?><!-- Update Status Modal -->
<div class="modal fade" id="updateStatusModal" tabindex="-1">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header"><h4 class="modal-title">Update Pregnancy Status</h4></div>
            <form method="POST">
                <input type="hidden" name="action" value="update_status">
                <input type="hidden" name="pregnancy_id" id="status_preg_id">
                <div class="modal-body">
                    <div class="form-group"><label>Status</label>
                        <select name="pregnancy_status" id="status_select" class="form-control">
                            <option value="active">Active</option>
                            <option value="delivered">Delivered</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-warning">Update</button>
                </div>
            </form>
        </div>
    </div>
</div>

</section>
</div>
<?php endif; ?>
</section>
<?php include("inc/footer.php"); ?>
<?php include("inc/scripts.php"); ?>
<script>
$('#pregTable').DataTable();
$('.btn-update-status').on('click', function() {
    $('#status_preg_id').val($(this).data('id'));
    $('#status_select').val($(this).data('status'));
    $('#updateStatusModal').modal('show');
});
</script>
