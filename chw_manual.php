<?php
require_once __DIR__ . '/inc/connect.php';
require_once __DIR__ . '/inc/auth.php';
$page_title = 'CHW User Manual';
$breadcrumb = [['Home', 'home'], ['CHW User Manual', '']];
$manualPath = __DIR__ . '/docs/RAPIDPRO_CHW_USER_MANUAL.txt';
$manualText = is_readable($manualPath) ? file_get_contents($manualPath) : false;
include __DIR__ . '/inc/links.php';
include __DIR__ . '/inc/header.php';
?>
<div class="inner-wrapper">
<?php include __DIR__ . '/inc/sidebar.php'; ?>
<section role="main" class="content-body">
<?php include __DIR__ . '/inc/inner-header.php'; ?>
<section class="panel">
  <header class="panel-heading">
    <h2 class="panel-title">RapidPro CHW User Manual</h2>
    <div class="panel-actions"><button type="button" class="btn btn-default" onclick="window.print()"><i class="fa fa-print"></i> Print</button></div>
  </header>
  <div class="panel-body">
    <p class="text-muted">Reference guide for community health workers. Use the forms in M-CARE to enter records; contact your supervisor if a code or instruction is unclear.</p>
    <label for="manualSearch">Find a section</label>
    <input id="manualSearch" class="form-control" type="search" placeholder="Search the manual" style="max-width:420px;margin-bottom:16px">
    <?php if ($manualText === false): ?>
      <div class="alert alert-danger">The manual file could not be loaded.</div>
    <?php else: ?>
      <pre id="manualContent" style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:70vh;overflow:auto;background:#fff;padding:20px;border:1px solid #ddd;font-family:inherit"><?= htmlspecialchars($manualText, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></pre>
    <?php endif; ?>
  </div>
</section>
</section>
</div>
<?php include __DIR__ . '/inc/footer.php'; include __DIR__ . '/inc/scripts.php'; ?>
<script>
(function () {
  const input = document.getElementById('manualSearch');
  const content = document.getElementById('manualContent');
  if (!input || !content) return;
  const original = content.textContent;
  input.addEventListener('input', function () {
    const query = input.value.trim().toLocaleLowerCase();
    if (!query) { content.textContent = original; return; }
    content.textContent = original.split('\n').filter(line => line.toLocaleLowerCase().includes(query)).join('\n');
  });
}());
</script>
