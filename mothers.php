<?php
include("inc/connect.php");
include("inc/auth.php");

$msg = '';
$msge = '';

// Handle Add/Edit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ((int)$_SESSION['log_role']===4) { http_response_code(403); exit('Supervisors have read-only maternal access.'); }
    $action = $_POST['action'] ?? '';
    if ($action === 'add') {
        if ((int)$_SESSION['log_role']===2 && empty($_SESSION['facility_id'])) { http_response_code(403); exit('Assign your account to a facility before registering mothers.'); }
        $dupe = $db->prepare("SELECT mother_id,f_name,l_name FROM tbl_mothers WHERE is_active=1 AND ((? <> '' AND national_id=?) OR (? <> '' AND phone=?)) LIMIT 1");
        $dupe->execute([trim($_POST['national_id'] ?? ''),trim($_POST['national_id'] ?? ''),trim($_POST['phone'] ?? ''),trim($_POST['phone'] ?? '')]);
        $possibleDuplicate = $dupe->fetch(PDO::FETCH_ASSOC);
        if ($possibleDuplicate) {
            $msg = "Possible duplicate profile found: " . $possibleDuplicate['f_name'] . ' ' . $possibleDuplicate['l_name'] . " (#" . $possibleDuplicate['mother_id'] . "). Review that record before registering another.";
        } elseif (empty($_POST['consent_given'])) {
            $msg = "Registration needs documented consent before personal information is saved.";
        } else {
        $stmt = $db->prepare("INSERT INTO tbl_mothers (national_id,f_name,l_name,dob,phone,address,district,sector,cell,village,education_level,preferred_language,consent_given,consent_at,chw_id,facility_id,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1,NOW(),?,?,?)");
        $stmt->execute([
            $_POST['national_id'], $_POST['f_name'], $_POST['l_name'], $_POST['dob'],
            $_POST['phone'], $_POST['address'], $_POST['district'], $_POST['sector'],
            $_POST['cell'], $_POST['village'], $_POST['education_level'], (($_POST['preferred_language'] ?? '') === 'en' ? 'en' : 'rw'),
            ((int)$_SESSION['log_role']===3 ? $_SESSION['u_id'] : ($_POST['chw_id'] ?: null)), ((int)$_SESSION['log_role']===2 ? (int)($_SESSION['facility_id']??0) : ($_POST['facility_id'] ?: null)), $_SESSION['u_id']
        ]);
        $new_id = $db->lastInsertId();
        audit_log($db, $_SESSION['u_id'], 'ADD_MOTHER', 'tbl_mothers', $new_id, null, $_POST);
        $msg = "Mother registered successfully.";
        }
    } elseif ($action === 'edit') {
        if ((int)$_SESSION['log_role']===2 && empty($_SESSION['facility_id'])) { http_response_code(403); exit('Your account has no facility assignment.'); }
        $stmt = $db->prepare("UPDATE tbl_mothers SET national_id=?,f_name=?,l_name=?,dob=?,phone=?,address=?,district=?,sector=?,cell=?,village=?,education_level=?,chw_id=?,facility_id=? WHERE mother_id=? AND (?<>3 OR chw_id=?) AND (?<>2 OR facility_id=?)");
        $stmt->execute([
            $_POST['national_id'], $_POST['f_name'], $_POST['l_name'], $_POST['dob'],
            $_POST['phone'], $_POST['address'], $_POST['district'], $_POST['sector'],
            $_POST['cell'], $_POST['village'], $_POST['education_level'],
            ((int)$_SESSION['log_role']===3 ? $_SESSION['u_id'] : ($_POST['chw_id'] ?: null)), ((int)$_SESSION['log_role']===2 ? (int)($_SESSION['facility_id']??0) : ($_POST['facility_id'] ?: null)), $_POST['mother_id'], (int)$_SESSION['log_role'], $_SESSION['u_id'], (int)$_SESSION['log_role'], (int)($_SESSION['facility_id']??0)
        ]);
        audit_log($db, $_SESSION['u_id'], 'EDIT_MOTHER', 'tbl_mothers', $_POST['mother_id'], null, $_POST);
        $msg = "Mother updated successfully.";
    } elseif ($action === 'deactivate') {
        $db->prepare("UPDATE tbl_mothers SET is_active=0 WHERE mother_id=? AND (?<>3 OR chw_id=?) AND (?<>2 OR facility_id=?)")->execute([$_POST['mother_id'],(int)$_SESSION['log_role'],$_SESSION['u_id'],(int)$_SESSION['log_role'],(int)($_SESSION['facility_id']??0)]);
        $msg = "Mother deactivated.";
    }
}

// Fetch data
$chws = $db->query("SELECT u_id, CONCAT(f_name,' ',l_name) AS name FROM tbl_users WHERE log_role=3 AND is_active=1 ORDER BY f_name")->fetchAll(PDO::FETCH_ASSOC);
$facilities = $db->query("SELECT facility_id, facility_name FROM tbl_facilities WHERE is_active=1".((int)$_SESSION['log_role']===2 ? ' AND facility_id='.(int)($_SESSION['facility_id']??0) : '')." ORDER BY facility_name")->fetchAll(PDO::FETCH_ASSOC);

// Filter by CHW if role=3
$where = $_SESSION['log_role'] == 3 ? "WHERE m.is_active=1 AND m.chw_id=" . (int)$_SESSION['u_id'] : (in_array((int)$_SESSION['log_role'],[2,4],true) ? "WHERE m.is_active=1 AND m.facility_id=".(int)($_SESSION['facility_id']??0) : "WHERE m.is_active=1");
$mothers = $db->query("SELECT m.*, CONCAT(u.f_name,' ',u.l_name) AS chw_name, f.facility_name,
    (SELECT COUNT(*) FROM tbl_pregnancies p WHERE p.mother_id=m.mother_id AND p.pregnancy_status='active') AS active_preg
    FROM tbl_mothers m
    LEFT JOIN tbl_users u ON m.chw_id=u.u_id
    LEFT JOIN tbl_facilities f ON m.facility_id=f.facility_id
    $where ORDER BY m.created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

$page_title = 'Mothers';
$breadcrumb = [['Home','home'],['Mothers','']];
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
        <h2 class="panel-title"><i class="fa fa-female"></i> Registered Mothers</h2>
        <?php if ((int)$_SESSION['log_role']!==4): ?><div class="panel-actions">
            <a href="#addMotherModal" data-toggle="modal" class="btn btn-sm btn-primary"><i class="fa fa-plus"></i> Register Mother</a>
        </div><?php endif; ?>
    </header>
    <div class="panel-body">
        <table class="table table-bordered table-striped" id="mothersTable">
            <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>District</th><th>CHW</th><th>Facility</th><th>Active Preg.</th><th>Actions</th></tr></thead>
            <tbody>
            <?php foreach ($mothers as $i => $m): ?>
                <tr>
                    <td><?php echo $i+1; ?></td>
                    <td><?php echo htmlspecialchars($m['f_name'].' '.$m['l_name']); ?></td>
                    <td><?php echo htmlspecialchars($m['phone']); ?></td>
                    <td><?php echo htmlspecialchars($m['district']); ?></td>
                    <td><?php echo htmlspecialchars($m['chw_name'] ?? '-'); ?></td>
                    <td><?php echo htmlspecialchars($m['facility_name'] ?? '-'); ?></td>
                    <td><span class="badge <?php echo $m['active_preg'] > 0 ? 'badge-success' : 'badge-default'; ?>"><?php echo $m['active_preg']; ?></span></td>
                    <td>
                        <a href="mother_profile?id=<?php echo $m['mother_id']; ?>" class="btn btn-xs btn-info"><i class="fa fa-eye"></i></a>
                        <?php if ((int)$_SESSION['log_role']!==4): ?><button class="btn btn-xs btn-warning btn-edit-mother" data-id="<?php echo $m['mother_id']; ?>"
                            data-fname="<?php echo htmlspecialchars($m['f_name']); ?>"
                            data-lname="<?php echo htmlspecialchars($m['l_name']); ?>"
                            data-nid="<?php echo htmlspecialchars($m['national_id']); ?>"
                            data-dob="<?php echo $m['dob']; ?>"
                            data-phone="<?php echo htmlspecialchars($m['phone']); ?>"
                            data-address="<?php echo htmlspecialchars($m['address']); ?>"
                            data-district="<?php echo htmlspecialchars($m['district']); ?>"
                            data-sector="<?php echo htmlspecialchars($m['sector']); ?>"
                            data-cell="<?php echo htmlspecialchars($m['cell']); ?>"
                            data-village="<?php echo htmlspecialchars($m['village']); ?>"
                            data-edu="<?php echo htmlspecialchars($m['education_level']); ?>"
                            data-chw="<?php echo $m['chw_id']; ?>"
                            data-facility="<?php echo $m['facility_id']; ?>">
                            <i class="fa fa-edit"></i>
                        </button><?php endif; ?>
                        <a href="pregnancies?mother_id=<?php echo $m['mother_id']; ?>" class="btn btn-xs btn-success"><i class="fa fa-heart"></i></a>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</section>

<?php if ((int)$_SESSION['log_role']!==4): ?><!-- Add Mother Modal -->
<div class="modal fade" id="addMotherModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header" style="background:#e91e8c;color:#fff;">
                <button type="button" class="close" data-dismiss="modal" style="color:#fff">&times;</button>
                <h4 class="modal-title"><i class="fa fa-female"></i> Register Mother</h4>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="add">
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-4"><div class="form-group"><label>First Name *</label><input type="text" name="f_name" class="form-control" required></div></div>
                        <div class="col-md-4"><div class="form-group"><label>Last Name *</label><input type="text" name="l_name" class="form-control" required></div></div>
                        <div class="col-md-4"><div class="form-group"><label>National ID</label><input type="text" name="national_id" class="form-control"></div></div>
                    </div>
                    <div class="row">
                        <div class="col-md-4"><div class="form-group"><label>Date of Birth</label><input type="date" name="dob" class="form-control"></div></div>
                        <div class="col-md-4"><div class="form-group"><label>Phone *</label><input type="text" name="phone" class="form-control" required></div></div>
                        <div class="col-md-4"><div class="form-group"><label>Education Level</label>
                            <select name="education_level" class="form-control">
                                <option value="">-- Select --</option>
                                <option>None</option><option>Primary</option><option>Secondary</option><option>Tertiary</option>
                            </select>
                        </div></div>
                    </div>
                    <div class="row">
                        <div class="col-md-3"><div class="form-group"><label>District</label><input type="text" name="district" class="form-control"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Sector</label><input type="text" name="sector" class="form-control"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Cell</label><input type="text" name="cell" class="form-control"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Village</label><input type="text" name="village" class="form-control"></div></div>
                    </div>
                    <div class="row">
                        <div class="col-md-12"><div class="form-group"><label>Address</label><input type="text" name="address" class="form-control"></div></div>
                    </div>
                    <div class="row"><div class="col-md-4"><div class="form-group"><label>Preferred language</label><select name="preferred_language" class="form-control"><option value="rw">Kinyarwanda</option><option value="en">English</option></select></div></div><div class="col-md-8"><div class="checkbox"><label><input type="checkbox" name="consent_given" value="1" required> I have explained how M-CARE uses this information and recorded the mother's consent.</label></div></div></div>
                    <div class="row">
                        <div class="col-md-6"><div class="form-group"><label>Assigned CHW</label>
                            <select name="chw_id" class="form-control select2">
                                <option value="">-- Select CHW --</option>
                                <?php foreach ($chws as $c): ?><option value="<?php echo $c['u_id']; ?>"><?php echo htmlspecialchars($c['name']); ?></option><?php endforeach; ?>
                            </select>
                        </div></div>
                        <div class="col-md-6"><div class="form-group"><label>Facility</label>
                            <select name="facility_id" class="form-control select2">
                                <option value="">-- Select Facility --</option>
                                <?php foreach ($facilities as $f): ?><option value="<?php echo $f['facility_id']; ?>"><?php echo htmlspecialchars($f['facility_name']); ?></option><?php endforeach; ?>
                            </select>
                        </div></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Register</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Mother Modal -->
<div class="modal fade" id="editMotherModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header" style="background:#e67e22;color:#fff;">
                <button type="button" class="close" data-dismiss="modal" style="color:#fff">&times;</button>
                <h4 class="modal-title"><i class="fa fa-edit"></i> Edit Mother</h4>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="mother_id" id="edit_mother_id">
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-4"><div class="form-group"><label>First Name *</label><input type="text" name="f_name" id="edit_f_name" class="form-control" required></div></div>
                        <div class="col-md-4"><div class="form-group"><label>Last Name *</label><input type="text" name="l_name" id="edit_l_name" class="form-control" required></div></div>
                        <div class="col-md-4"><div class="form-group"><label>National ID</label><input type="text" name="national_id" id="edit_nid" class="form-control"></div></div>
                    </div>
                    <div class="row">
                        <div class="col-md-4"><div class="form-group"><label>Date of Birth</label><input type="date" name="dob" id="edit_dob" class="form-control"></div></div>
                        <div class="col-md-4"><div class="form-group"><label>Phone</label><input type="text" name="phone" id="edit_phone" class="form-control"></div></div>
                        <div class="col-md-4"><div class="form-group"><label>Education Level</label>
                            <select name="education_level" id="edit_edu" class="form-control">
                                <option value="">-- Select --</option>
                                <option>None</option><option>Primary</option><option>Secondary</option><option>Tertiary</option>
                            </select>
                        </div></div>
                    </div>
                    <div class="row">
                        <div class="col-md-3"><div class="form-group"><label>District</label><input type="text" name="district" id="edit_district" class="form-control"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Sector</label><input type="text" name="sector" id="edit_sector" class="form-control"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Cell</label><input type="text" name="cell" id="edit_cell" class="form-control"></div></div>
                        <div class="col-md-3"><div class="form-group"><label>Village</label><input type="text" name="village" id="edit_village" class="form-control"></div></div>
                    </div>
                    <div class="row">
                        <div class="col-md-12"><div class="form-group"><label>Address</label><input type="text" name="address" id="edit_address" class="form-control"></div></div>
                    </div>
                    <div class="row">
                        <div class="col-md-6"><div class="form-group"><label>Assigned CHW</label>
                            <select name="chw_id" id="edit_chw" class="form-control select2">
                                <option value="">-- Select CHW --</option>
                                <?php foreach ($chws as $c): ?><option value="<?php echo $c['u_id']; ?>"><?php echo htmlspecialchars($c['name']); ?></option><?php endforeach; ?>
                            </select>
                        </div></div>
                        <div class="col-md-6"><div class="form-group"><label>Facility</label>
                            <select name="facility_id" id="edit_facility" class="form-control select2">
                                <option value="">-- Select Facility --</option>
                                <?php foreach ($facilities as $f): ?><option value="<?php echo $f['facility_id']; ?>"><?php echo htmlspecialchars($f['facility_name']); ?></option><?php endforeach; ?>
                            </select>
                        </div></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-warning"><i class="fa fa-save"></i> Update</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php endif; ?>

</section>
</div>
</section>
<?php include("inc/footer.php"); ?>
<?php include("inc/scripts.php"); ?>
<script>
$('#mothersTable').DataTable();
$('.btn-edit-mother').on('click', function() {
    var d = $(this).data();
    $('#edit_mother_id').val(d.id);
    $('#edit_f_name').val(d.fname);
    $('#edit_l_name').val(d.lname);
    $('#edit_nid').val(d.nid);
    $('#edit_dob').val(d.dob);
    $('#edit_phone').val(d.phone);
    $('#edit_address').val(d.address);
    $('#edit_district').val(d.district);
    $('#edit_sector').val(d.sector);
    $('#edit_cell').val(d.cell);
    $('#edit_village').val(d.village);
    $('#edit_edu').val(d.edu);
    $('#edit_chw').val(d.chw).trigger('change');
    $('#edit_facility').val(d.facility).trigger('change');
    $('#editMotherModal').modal('show');
});
</script>
