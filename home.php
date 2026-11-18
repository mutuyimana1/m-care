<?php
include("inc/connect.php");
include("inc/auth.php");

if ((int)($_SESSION['log_role'] ?? 0) === 5) {
    header('Location: mother_portal');
    exit;
}

// Scope operational figures to the signed-in worker's assigned catchment.
$uid=(int)$_SESSION['u_id']; $role=(int)$_SESSION['log_role']; $fid=(int)($_SESSION['facility_id']??0);
$motherScope = $role===3 ? "m.chw_id=$uid" : (in_array($role,[2,4],true) ? "m.facility_id=$fid" : '1=1');
$alertScope = $role===3 ? "(a.assigned_to=$uid OR m.chw_id=$uid)" : ($role===2 ? "(a.assigned_to=$uid OR a.facility_id=$fid)" : ($role===4 ? "m.facility_id=$fid" : '1=1'));
$total_mothers = $db->query("SELECT COUNT(*) FROM tbl_mothers m WHERE m.is_active=1 AND $motherScope")->fetchColumn();
$active_pregnancies = $db->query("SELECT COUNT(*) FROM tbl_pregnancies p JOIN tbl_mothers m ON m.mother_id=p.mother_id WHERE p.pregnancy_status='active' AND $motherScope")->fetchColumn();
$open_alerts = $db->query("SELECT COUNT(*) FROM tbl_alerts a JOIN tbl_mothers m ON m.mother_id=a.mother_id WHERE a.status IN ('open','acknowledged') AND $alertScope")->fetchColumn();
$critical_alerts = $db->query("SELECT COUNT(*) FROM tbl_alerts a JOIN tbl_mothers m ON m.mother_id=a.mother_id WHERE a.alert_level='critical' AND a.status='open' AND $alertScope")->fetchColumn();
$pending_referrals = $db->query("SELECT COUNT(*) FROM tbl_referrals r JOIN tbl_mothers m ON m.mother_id=r.mother_id WHERE r.status='pending' AND $motherScope")->fetchColumn();
$anc_this_month = $db->query("SELECT COUNT(*) FROM tbl_anc_visits v JOIN tbl_mothers m ON m.mother_id=v.mother_id WHERE MONTH(v.visit_date)=MONTH(NOW()) AND YEAR(v.visit_date)=YEAR(NOW()) AND $motherScope")->fetchColumn();
$avg_ack_minutes = $db->query("SELECT ROUND(AVG(TIMESTAMPDIFF(MINUTE,a.created_at,a.acknowledged_at))) FROM tbl_alerts a JOIN tbl_mothers m ON m.mother_id=a.mother_id WHERE a.acknowledged_at IS NOT NULL AND a.created_at >= DATE_SUB(NOW(),INTERVAL 30 DAY) AND $alertScope")->fetchColumn();
$referral_completion = $db->query("SELECT COUNT(CASE WHEN r.status='completed' THEN 1 END),COUNT(*) FROM tbl_referrals r JOIN tbl_mothers m ON m.mother_id=r.mother_id WHERE r.referral_date >= DATE_SUB(NOW(),INTERVAL 30 DAY) AND $motherScope")->fetch(PDO::FETCH_NUM);
$referral_completion_rate = $referral_completion[1] ? round($referral_completion[0] * 100 / $referral_completion[1]) : 0;

// Recent alerts
$recent_alerts = $db->query("SELECT a.*, CONCAT(m.f_name,' ',m.l_name) AS mother_name FROM tbl_alerts a JOIN tbl_mothers m ON a.mother_id=m.mother_id WHERE $alertScope ORDER BY a.created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);

// Recent ANC visits
$recent_anc = $db->query("SELECT v.*, CONCAT(m.f_name,' ',m.l_name) AS mother_name FROM tbl_anc_visits v JOIN tbl_mothers m ON v.mother_id=m.mother_id WHERE $motherScope ORDER BY v.created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);

$page_title = 'Dashboard';
include("inc/links.php");
include("inc/header.php");
?>
<div class="inner-wrapper">
<?php include("inc/sidebar.php"); ?>
<section role="main" class="content-body">
<?php include("inc/inner-header.php"); ?>

<div class="row">
    <div class="col-md-3 col-sm-6">
        <section class="panel panel-featured-left panel-featured-primary">
            <div class="panel-body">
                <div class="widget-summary">
                    <div class="widget-summary-col widget-summary-col-icon">
                        <div class="summary-icon bg-primary"><i class="fa fa-female"></i></div>
                    </div>
                    <div class="widget-summary-col">
                        <div class="summary"><h4 class="title">Registered Mothers</h4><div class="info"><strong class="amount"><?php echo $total_mothers; ?></strong></div></div>
                        <div class="footer"><a href="mothers" class="text-muted text-uppercase">View All <i class="fa fa-arrow-right"></i></a></div>
                    </div>
                </div>
            </div>
        </section>
    </div>
    <div class="col-md-3 col-sm-6">
        <section class="panel panel-featured-left panel-featured-secondary">
            <div class="panel-body">
                <div class="widget-summary">
                    <div class="widget-summary-col widget-summary-col-icon">
                        <div class="summary-icon bg-success"><i class="fa fa-heart"></i></div>
                    </div>
                    <div class="widget-summary-col">
                        <div class="summary"><h4 class="title">Active Pregnancies</h4><div class="info"><strong class="amount"><?php echo $active_pregnancies; ?></strong></div></div>
                        <div class="footer"><a href="pregnancies" class="text-muted text-uppercase">View All <i class="fa fa-arrow-right"></i></a></div>
                    </div>
                </div>
            </div>
        </section>
    </div>
    <div class="col-md-3 col-sm-6">
        <section class="panel panel-featured-left" style="border-left-color:#e74c3c">
            <div class="panel-body">
                <div class="widget-summary">
                    <div class="widget-summary-col widget-summary-col-icon">
                        <div class="summary-icon" style="background:#e74c3c"><i class="fa fa-bell"></i></div>
                    </div>
                    <div class="widget-summary-col">
                        <div class="summary"><h4 class="title">Open Alerts</h4><div class="info"><strong class="amount"><?php echo $open_alerts; ?></strong> <?php if ($critical_alerts > 0): ?><span class="badge badge-danger"><?php echo $critical_alerts; ?> critical</span><?php endif; ?></div></div>
                        <div class="footer"><a href="alerts" class="text-muted text-uppercase">View All <i class="fa fa-arrow-right"></i></a></div>
                    </div>
                </div>
            </div>
        </section>
    </div>
    <div class="col-md-3 col-sm-6">
        <section class="panel panel-featured-left" style="border-left-color:#e67e22">
            <div class="panel-body">
                <div class="widget-summary">
                    <div class="widget-summary-col widget-summary-col-icon">
                        <div class="summary-icon" style="background:#e67e22"><i class="fa fa-ambulance"></i></div>
                    </div>
                    <div class="widget-summary-col">
                        <div class="summary"><h4 class="title">Pending Referrals</h4><div class="info"><strong class="amount"><?php echo $pending_referrals; ?></strong></div></div>
                        <div class="footer"><a href="referrals" class="text-muted text-uppercase">View All <i class="fa fa-arrow-right"></i></a></div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>

<div class="row">
    <div class="col-md-6"><section class="panel"><div class="panel-body"><div class="row"><div class="col-xs-2"><div class="summary-icon bg-primary"><i class="fa fa-clock-o"></i></div></div><div class="col-xs-10"><h4 class="title">Average alert acknowledgement</h4><div class="amount" style="font-size:26px;font-weight:700"><?php echo $avg_ack_minutes !== null ? (int)$avg_ack_minutes . ' min' : 'No data yet'; ?></div><small class="text-muted">Acknowledged alerts in the last 30 days</small></div></div></div></section></div>
    <div class="col-md-6"><section class="panel"><div class="panel-body"><div class="row"><div class="col-xs-2"><div class="summary-icon bg-success"><i class="fa fa-check-circle"></i></div></div><div class="col-xs-10"><h4 class="title">Referral completion</h4><div class="amount" style="font-size:26px;font-weight:700"><?php echo $referral_completion_rate; ?>%</div><small class="text-muted">Of referrals created in the last 30 days</small></div></div></div></section></div>
</div>

<div class="row">
    <div class="col-md-6">
        <section class="panel">
            <header class="panel-heading">
                <h2 class="panel-title"><i class="fa fa-bell text-danger"></i> Recent Alerts</h2>
                <div class="panel-actions"><a href="alerts" class="btn btn-xs btn-default">View All</a></div>
            </header>
            <div class="panel-body">
                <table class="table table-bordered table-striped table-condensed">
                    <thead><tr><th>Mother</th><th>Level</th><th>Status</th><th>Date</th><th></th></tr></thead>
                    <tbody>
                    <?php foreach ($recent_alerts as $al): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($al['mother_name']); ?></td>
                            <td><span class="badge badge-<?php echo $al['alert_level']; ?>"><?php echo strtoupper($al['alert_level']); ?></span></td>
                            <td><?php echo ucfirst($al['status']); ?></td>
                            <td><?php echo date('d M Y', strtotime($al['created_at'])); ?></td>
                            <td><a href="alerts?id=<?php echo $al['alert_id']; ?>" class="btn btn-xs btn-primary">View</a></td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if (empty($recent_alerts)): ?><tr><td colspan="5" class="text-center text-muted">No alerts</td></tr><?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
    <div class="col-md-6">
        <section class="panel">
            <header class="panel-heading">
                <h2 class="panel-title"><i class="fa fa-stethoscope text-primary"></i> Recent ANC Visits</h2>
                <div class="panel-actions"><a href="anc_visits" class="btn btn-xs btn-default">View All</a></div>
            </header>
            <div class="panel-body">
                <table class="table table-bordered table-striped table-condensed">
                    <thead><tr><th>Mother</th><th>Visit #</th><th>Date</th><th>GA (wks)</th><th></th></tr></thead>
                    <tbody>
                    <?php foreach ($recent_anc as $anc): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($anc['mother_name']); ?></td>
                            <td><?php echo $anc['visit_number']; ?></td>
                            <td><?php echo date('d M Y', strtotime($anc['visit_date'])); ?></td>
                            <td><?php echo $anc['gestational_age_weeks'] ?? '-'; ?></td>
                            <td><a href="anc_visits?id=<?php echo $anc['anc_id']; ?>" class="btn btn-xs btn-primary">View</a></td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if (empty($recent_anc)): ?><tr><td colspan="5" class="text-center text-muted">No ANC visits</td></tr><?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</div>

<div class="row">
    <div class="col-md-4">
        <section class="panel">
            <header class="panel-heading"><h2 class="panel-title"><i class="fa fa-stethoscope"></i> ANC Visits This Month</h2></header>
            <div class="panel-body text-center">
                <h1 style="color:#e91e8c;font-size:60px;"><?php echo $anc_this_month; ?></h1>
                <p class="text-muted">ANC visits recorded in <?php echo date('F Y'); ?></p>
                <a href="anc_visits" class="btn btn-sm btn-primary">View Details</a>
            </div>
        </section>
    </div>
    <div class="col-md-8">
        <section class="panel">
            <header class="panel-heading"><h2 class="panel-title"><i class="fa fa-bolt"></i> Quick Actions</h2></header>
            <div class="panel-body">
                <div class="row">
                    <?php if(in_array((int)$_SESSION['log_role'],[1,2,3],true)): ?>
                    <div class="col-sm-3 text-center" style="margin-bottom:15px;">
                        <a href="mothers?action=add" class="btn btn-lg btn-block" style="background:#e91e8c;color:#fff;padding:20px 10px;">
                            <i class="fa fa-user-plus fa-2x"></i><br>Register Mother
                        </a>
                    </div>
                    <?php endif; ?>
                    <div class="col-sm-3 text-center" style="margin-bottom:15px;">
                        <?php if(in_array((int)$_SESSION['log_role'],[1,2],true)): ?>
                        <a href="anc_visits?action=add" class="btn btn-lg btn-block btn-primary" style="padding:20px 10px;"><i class="fa fa-stethoscope fa-2x"></i><br>Record ANC</a>
                        <?php elseif((int)$_SESSION['log_role']===4): ?>
                        <a href="mothers" class="btn btn-lg btn-block btn-primary" style="padding:20px 10px;"><i class="fa fa-female fa-2x"></i><br>View Mothers</a>
                        <?php else: ?>
                        <a href="chw_visits" class="btn btn-lg btn-block btn-primary" style="padding:20px 10px;"><i class="fa fa-home fa-2x"></i><br>Record Home Visit</a>
                        <?php endif; ?>
                    </div>
                    <?php if(in_array((int)$_SESSION['log_role'],[1,2,3],true)): ?>
                    <div class="col-sm-3 text-center" style="margin-bottom:15px;">
                        <a href="symptom_reports?action=add" class="btn btn-lg btn-block btn-danger" style="padding:20px 10px;">
                            <i class="fa fa-exclamation-triangle fa-2x"></i><br>Report Symptoms
                        </a>
                    </div>
                    <?php endif; ?>
                    <div class="col-sm-3 text-center" style="margin-bottom:15px;">
                        <?php if((int)$_SESSION['log_role']===4): ?>
                        <a href="report_alerts" class="btn btn-lg btn-block btn-warning" style="padding:20px 10px;">
                            <i class="fa fa-bar-chart fa-2x"></i><br>View Reports
                        </a>
                        <?php else: ?>
                        <a href="referrals?action=add" class="btn btn-lg btn-block btn-warning" style="padding:20px 10px;">
                            <i class="fa fa-ambulance fa-2x"></i><br>New Referral
                        </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>

</section>
</div>
</section>
<?php include("inc/footer.php"); ?>
<?php include("inc/scripts.php"); ?>
