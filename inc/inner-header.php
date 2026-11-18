<?php
$page_title = $page_title ?? 'Dashboard';
$breadcrumb = $breadcrumb ?? [['Home', 'home'], [$page_title, '']];
?>
<header class="page-header">
    <h2><?php echo htmlspecialchars($page_title); ?></h2>
    <div class="right-wrapper pull-right">
        <ol class="breadcrumbs">
            <?php foreach ($breadcrumb as $i => $crumb): ?>
                <?php if ($i < count($breadcrumb) - 1): ?>
                    <li><a href="<?php echo $crumb[1]; ?>"><i class="fa fa-home"></i> <?php echo htmlspecialchars($crumb[0]); ?></a></li>
                <?php else: ?>
                    <li class="active"><span><?php echo htmlspecialchars($crumb[0]); ?></span></li>
                <?php endif; ?>
            <?php endforeach; ?>
        </ol>
    </div>
</header>
