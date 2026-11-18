<aside id="sidebar-left" class="sidebar-left">
    <div class="sidebar-header">
        <div class="sidebar-toggle hidden-xs" data-toggle-class="sidebar-left-collapsed" data-target="html" data-fire-event="sidebar-left-toggle">
            <i class="fa fa-bars" aria-label="Toggle sidebar"></i>
        </div>
    </div>
    <div class="nano">
        <div class="nano-content">
            <nav id="menu" class="nav-main" role="navigation">
                <ul class="nav nav-main">

                    <li><a href="home"><i class="fa fa-home"></i><span><?= (int)$_SESSION['log_role'] === 5 && isset($t) ? htmlspecialchars($t('Dashboard')) : 'Dashboard' ?></span></a></li>
                    <?php if (in_array((int)($_SESSION['log_role'] ?? 0), [1,2,3,4], true)): ?><li><a href="chw_manual"><i class="fa fa-book"></i><span>CHW User Manual</span></a></li><?php endif; ?>
                    <?php if (in_array((int)($_SESSION['log_role'] ?? 0), [1,4], true)): ?><li><a href="ivr_dashboard"><i class="fa fa-phone-square"></i><span>IVR development lab</span></a></li><?php endif; ?>
                    <?php if (in_array((int)($_SESSION['log_role'] ?? 0), [1,2,3], true)): ?><li><a href="outbound_calls"><i class="fa fa-phone"></i><span>Outbound calls</span></a></li><?php endif; ?>
                    <?php if (in_array((int)$_SESSION['log_role'], [1,2,3,4], true)): ?><li><a href="maternal_intelligence"><i class="fa fa-stethoscope"></i><span>Maternal intelligence review</span></a></li><?php endif; ?>
                    <?php if (in_array((int)$_SESSION['log_role'], [1,2,4], true)): ?><li><a href="ai_training"><i class="fa fa-flask"></i><span>AI datasets & training</span></a></li><?php endif; ?>

                    <?php if ($_SESSION['log_role'] == 1): // Administrator ?>

                    <li class="nav-parent">
                        <a><i class="fa fa-users"></i><span>Maternal Management</span></a>
                        <ul class="nav nav-children">
                            <li><a href="mothers"><i class="fa fa-female fa-fw"></i> Mothers</a></li>
                            <li><a href="pregnancies"><i class="fa fa-heart fa-fw"></i> Pregnancies</a></li>
                            <li><a href="anc_visits"><i class="fa fa-stethoscope fa-fw"></i> ANC Visits</a></li>
                        </ul>
                    </li>
                    <li class="nav-parent">
                        <a><i class="fa fa-exclamation-triangle"></i><span>Alerts & Symptoms</span></a>
                        <ul class="nav nav-children">
                            <li><a href="alerts"><i class="fa fa-bell fa-fw"></i> All Alerts</a></li>
                            <li><a href="symptom_reports"><i class="fa fa-list-alt fa-fw"></i> Symptom Reports</a></li>
                        </ul>
                    </li>
                    <li class="nav-parent">
                        <a><i class="fa fa-ambulance"></i><span>Referrals</span></a>
                        <ul class="nav nav-children">
                            <li><a href="referrals"><i class="fa fa-share fa-fw"></i> All Referrals</a></li>
                        </ul>
                    </li>
                    <li class="nav-parent">
                        <a><i class="fa fa-home"></i><span>CHW Follow-up</span></a>
                        <ul class="nav nav-children">
                            <li><a href="chw_visits"><i class="fa fa-map-marker fa-fw"></i> Home Visits</a></li>
                        </ul>
                    </li>
                    <li class="nav-parent">
                        <a><i class="fa fa-leaf"></i><span>Nutrition</span></a>
                        <ul class="nav nav-children">
                            <li><a href="nutrition_content"><i class="fa fa-book fa-fw"></i> Nutrition Content</a></li>
                            <li><a href="nutrition_checkins"><i class="fa fa-check-square-o fa-fw"></i> Nutrition Check-ins</a></li>
                        </ul>
                    </li>
                    <li class="nav-parent">
                        <a><i class="fa fa-graduation-cap"></i><span>Education</span></a>
                        <ul class="nav nav-children">
                            <li><a href="education_content"><i class="fa fa-file-text fa-fw"></i> Education Content</a></li>
                            <li><a href="reminders"><i class="fa fa-clock-o fa-fw"></i> Reminders</a></li>
                        </ul>
                    </li>
                    <li><a href="messages"><i class="fa fa-envelope"></i><span>Messages</span></a></li>
                    <li class="nav-parent">
                        <a><i class="fa fa-bar-chart"></i><span>Reports</span></a>
                        <ul class="nav nav-children">
                            <li><a href="report_maternal"><i class="fa fa-file fa-fw"></i> Maternal Summary</a></li>
                            <li><a href="report_alerts"><i class="fa fa-bell fa-fw"></i> Alerts Report</a></li>
                            <li><a href="report_referrals"><i class="fa fa-share fa-fw"></i> Referrals Report</a></li>
                            <li><a href="report_anc"><i class="fa fa-stethoscope fa-fw"></i> ANC Report</a></li>
                        </ul>
                    </li>
                    <li class="nav-parent">
                        <a><i class="fa fa-cog"></i><span>Settings</span></a>
                        <ul class="nav nav-children">
                            <li><a href="users"><i class="fa fa-user fa-fw"></i> User Accounts</a></li>
                            <li><a href="facilities"><i class="fa fa-hospital-o fa-fw"></i> Facilities</a></li>
                            <li><a href="symptoms_settings"><i class="fa fa-list fa-fw"></i> Symptom Settings</a></li>
                            <li><a href="system_settings"><i class="fa fa-wrench fa-fw"></i> System Settings</a></li>
                            <li><a href="audit_log"><i class="fa fa-history fa-fw"></i> Audit Log</a></li>
                        </ul>
                    </li>

                    <?php elseif ($_SESSION['log_role'] == 2): // Healthcare Professional ?>

                    <li class="nav-parent">
                        <a><i class="fa fa-users"></i><span>Maternal Management</span></a>
                        <ul class="nav nav-children">
                            <li><a href="mothers"><i class="fa fa-female fa-fw"></i> Mothers</a></li>
                            <li><a href="pregnancies"><i class="fa fa-heart fa-fw"></i> Pregnancies</a></li>
                            <li><a href="anc_visits"><i class="fa fa-stethoscope fa-fw"></i> ANC Visits</a></li>
                        </ul>
                    </li>
                    <li class="nav-parent">
                        <a><i class="fa fa-exclamation-triangle"></i><span>Alerts</span></a>
                        <ul class="nav nav-children">
                            <li><a href="alerts"><i class="fa fa-bell fa-fw"></i> Alerts</a></li>
                            <li><a href="symptom_reports"><i class="fa fa-list-alt fa-fw"></i> Symptom Reports</a></li>
                        </ul>
                    </li>
                    <li><a href="referrals"><i class="fa fa-ambulance"></i><span>Referrals</span></a></li>
                    <li class="nav-parent">
                        <a><i class="fa fa-leaf"></i><span>Nutrition</span></a>
                        <ul class="nav nav-children">
                            <li><a href="nutrition_content"><i class="fa fa-book fa-fw"></i> Nutrition Content</a></li>
                            <li><a href="nutrition_checkins"><i class="fa fa-check-square-o fa-fw"></i> Check-ins</a></li>
                        </ul>
                    </li>
                    <li><a href="messages"><i class="fa fa-envelope"></i><span>Messages</span></a></li>
                    <li class="nav-parent">
                        <a><i class="fa fa-bar-chart"></i><span>Reports</span></a>
                        <ul class="nav nav-children">
                            <li><a href="report_maternal"><i class="fa fa-file fa-fw"></i> Maternal Summary</a></li>
                            <li><a href="report_alerts"><i class="fa fa-bell fa-fw"></i> Alerts Report</a></li>
                            <li><a href="report_anc"><i class="fa fa-stethoscope fa-fw"></i> ANC Report</a></li>
                        </ul>
                    </li>

                    <?php elseif ($_SESSION['log_role'] == 3): // CHW ?>

                    <li><a href="mothers"><i class="fa fa-female"></i><span>My Mothers</span></a></li>
                    <li><a href="pregnancies"><i class="fa fa-heart"></i><span>Pregnancies</span></a></li>
                    <li><a href="anc_visits"><i class="fa fa-stethoscope"></i><span>ANC Visits</span></a></li>
                    <li><a href="symptom_reports"><i class="fa fa-list-alt"></i><span>Symptom Reports</span></a></li>
                    <li><a href="alerts"><i class="fa fa-bell"></i><span>Alerts</span></a></li>
                    <li><a href="chw_visits"><i class="fa fa-map-marker"></i><span>Home Visits</span></a></li>
                    <li><a href="referrals"><i class="fa fa-ambulance"></i><span>Referrals</span></a></li>
                    <li><a href="nutrition_checkins"><i class="fa fa-leaf"></i><span>Nutrition Check-ins</span></a></li>
                    <li><a href="messages"><i class="fa fa-envelope"></i><span>Messages</span></a></li>

                    <?php elseif ($_SESSION['log_role'] == 4): // Supervisor ?>

                    <li class="nav-parent">
                        <a><i class="fa fa-users"></i><span>Maternal Management</span></a>
                        <ul class="nav nav-children">
                            <li><a href="mothers"><i class="fa fa-female fa-fw"></i> Mothers</a></li>
                            <li><a href="pregnancies"><i class="fa fa-heart fa-fw"></i> Pregnancies</a></li>
                            <li><a href="anc_visits"><i class="fa fa-stethoscope fa-fw"></i> ANC Visits</a></li>
                        </ul>
                    </li>
                    <li class="nav-parent">
                        <a><i class="fa fa-exclamation-triangle"></i><span>Alerts & Symptoms</span></a>
                        <ul class="nav nav-children">
                            <li><a href="alerts"><i class="fa fa-bell fa-fw"></i> Alerts</a></li>
                            <li><a href="symptom_reports"><i class="fa fa-list-alt fa-fw"></i> Symptom Reports</a></li>
                        </ul>
                    </li>
                    <li><a href="referrals"><i class="fa fa-ambulance"></i><span>Referrals</span></a></li>
                    <li><a href="chw_visits"><i class="fa fa-map-marker"></i><span>CHW Visits</span></a></li>
                    <li class="nav-parent">
                        <a><i class="fa fa-leaf"></i><span>Nutrition</span></a>
                        <ul class="nav nav-children">
                            <li><a href="nutrition_content"><i class="fa fa-book fa-fw"></i> Nutrition Content</a></li>
                            <li><a href="nutrition_checkins"><i class="fa fa-check-square-o fa-fw"></i> Check-ins</a></li>
                        </ul>
                    </li>
                    <li><a href="messages"><i class="fa fa-envelope"></i><span>Messages</span></a></li>
                    <li class="nav-parent">
                        <a><i class="fa fa-bar-chart"></i><span>Reports</span></a>
                        <ul class="nav nav-children">
                            <li><a href="report_maternal"><i class="fa fa-file fa-fw"></i> Maternal Summary</a></li>
                            <li><a href="report_alerts"><i class="fa fa-bell fa-fw"></i> Alerts Report</a></li>
                            <li><a href="report_referrals"><i class="fa fa-share fa-fw"></i> Referrals Report</a></li>
                            <li><a href="report_anc"><i class="fa fa-stethoscope fa-fw"></i> ANC Report</a></li>
                        </ul>
                    </li>

                    <?php elseif ($_SESSION['log_role'] == 5): // Pregnant/postpartum woman ?>
                    <li><a href="mother_roadmap"><i class="fa fa-map-signs"></i><span><?= isset($t) ? htmlspecialchars($t('My pregnancy roadmap')) : 'My pregnancy roadmap' ?></span></a></li>
                    <li><a href="mother_report"><i class="fa fa-heart"></i><span><?= isset($t) ? htmlspecialchars($t('Report a symptom')) : 'Report a symptom' ?></span></a></li>
                    <li><a href="mother_messages"><i class="fa fa-comments-o"></i><span><?= isset($t) ? htmlspecialchars($t('Live chat')) : 'Live chat' ?></span></a></li>
                    <li><a href="mother_chatbot"><i class="fa fa-comments"></i><span><?= isset($t) ? htmlspecialchars($t('M-CARE maternal chatbot')) : 'M-CARE chatbot' ?></span></a></li>
                    <li><a href="mother_education"><i class="fa fa-book"></i><span><?= isset($t) ? htmlspecialchars($t('Health education')) : 'Health education' ?></span></a></li>
                    <li><a href="mother_nutrition"><i class="fa fa-leaf"></i><span><?= isset($t) ? htmlspecialchars($t('Nutrition check-in')) : 'Nutrition check-in' ?></span></a></li>
                    <li><a href="mother_followup"><i class="fa fa-list-alt"></i><span><?= isset($t) ? htmlspecialchars($t('My reports and referrals')) : 'My reports and referrals' ?></span></a></li>
                    <li><a href="mother_updates"><i class="fa fa-bell"></i><span><?= isset($t) ? htmlspecialchars($t('Updates')) : 'Updates' ?></span></a></li>

                    <?php endif; ?>

                </ul>
            </nav>
        </div>
    </div>
</aside>
