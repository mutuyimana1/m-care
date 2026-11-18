<?php if (!empty($guidanceData)): ?>
<div class="table-responsive mcare-guidance-table-wrap">
<table class="table table-bordered mcare-guidance-table">
<thead><tr><th scope="col"><?=$e($guidanceData['symptoms_title'])?></th><th scope="col"><?=$e($guidanceData['action_title'])?></th></tr></thead>
<tbody><tr>
<td><ul><?php foreach($guidanceData['symptoms'] as $reportedSymptom): ?><li><?=$e($reportedSymptom)?></li><?php endforeach; ?></ul></td>
<td class="<?=$guidanceData['urgent']?'mcare-guidance-action-urgent':''?>"><p><?=$e($guidanceData['action'])?></p></td>
</tr></tbody>
</table>
</div>
<div class="mcare-guidance-note"><strong><?=$e($guidanceData['note_title'])?>:</strong> <?=$e($guidanceData['note'])?></div>
<p class="mcare-guidance-reference"><strong><?=$e($guidanceData['reference_title'])?>:</strong> <?=$e($guidanceData['reference'])?></p>
<?php endif; ?>
