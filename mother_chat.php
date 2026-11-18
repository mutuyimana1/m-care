<?php
require_once __DIR__ . '/inc/connect.php';
require_once __DIR__ . '/inc/auth.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
if ((int)$_SESSION['log_role'] !== 5) { http_response_code(403); echo json_encode(['error'=>'Unauthorized']); exit; }
$account=$db->prepare('SELECT u.mother_id,m.chw_id,m.facility_id FROM tbl_users u JOIN tbl_mothers m ON m.mother_id=u.mother_id WHERE u.u_id=? AND u.is_active=1 AND m.is_active=1');
$account->execute([(int)$_SESSION['u_id']]);$mother=$account->fetch(PDO::FETCH_ASSOC);
if(!$mother){http_response_code(403);echo json_encode(['error'=>'No active maternal profile is linked.']);exit;}
$motherId=(int)$mother['mother_id'];$userId=(int)$_SESSION['u_id'];$partner=(int)($_POST['partner_id']??$_GET['partner_id']??0);
$authorized=$db->prepare('SELECT u.u_id,CONCAT(u.f_name," ",u.l_name) display_name FROM tbl_users u WHERE u.u_id=? AND u.is_active=1 AND ((u.u_id=? AND u.log_role=3) OR (u.facility_id=? AND u.log_role IN (2,4)) OR (u.log_role=1 AND EXISTS (SELECT 1 FROM tbl_messages x WHERE x.mother_id=? AND ((x.sender_id=u.u_id AND x.receiver_id=?) OR (x.sender_id=? AND x.receiver_id=u.u_id)))))');
$authorized->execute([$partner,(int)($mother['chw_id']??0),(int)($mother['facility_id']??0),$motherId,$userId,$userId]);$contact=$authorized->fetch(PDO::FETCH_ASSOC);
if(!$contact){http_response_code(403);echo json_encode(['error'=>'This care-team member is not assigned to your profile.']);exit;}
if($_SERVER['REQUEST_METHOD']==='POST'){
    $body=trim((string)($_POST['message_body']??''));$topic=(string)($_POST['topic']??'');$validTopics=['Symptoms or how I feel','Pregnancy questions','After-birth or postpartum care','Nutrition','Appointment or referral','Other'];
    $rawTopics=$_POST['topics']??($topic!==''?[$topic]:[]);
    if(!is_array($rawTopics))$rawTopics=[];
    $topics=array_values(array_unique(array_filter(array_map(static fn($value)=>is_string($value)?trim($value):'',$rawTopics))));
    if($body===''||mb_strlen($body)>4000){http_response_code(422);echo json_encode(['error'=>'Write a message of up to 4,000 characters.']);exit;}
    if(!$topics||array_diff($topics,$validTopics)){http_response_code(422);echo json_encode(['error'=>'Choose at least one concern topic.']);exit;}
    $ids=array_values(array_unique(array_filter(array_map('intval',$_POST['symptoms']??[]))));$symptomNames=[];
    if($ids){$marks=implode(',',array_fill(0,count($ids),'?'));$q=$db->prepare("SELECT symptom_name FROM tbl_symptoms WHERE is_active=1 AND symptom_id IN ($marks)");$q->execute($ids);$symptomNames=$q->fetchAll(PDO::FETCH_COLUMN);}
    $topicLabel=implode(', ',$topics);$context='Topics: '.$topicLabel;if($symptomNames)$context.="\nSelected symptoms: ".implode(', ',$symptomNames);
    try{
        $db->beginTransaction();
        $db->prepare('INSERT INTO tbl_messages(sender_id,receiver_id,mother_id,subject,message_body) VALUES(?,?,?,?,?)')->execute([$userId,$partner,$motherId,'Mother chat: '.$topicLabel,$context."\n\n".$body]);
        $db->prepare('INSERT INTO tbl_notifications(user_id,notif_type,notif_message,reference_id,reference_type) VALUES(?,?,?,?,?)')->execute([$partner,'message','A woman in your care sent a new chat message.',$motherId,'mother_message']);
        $db->commit();
    }catch(Throwable $error){
        if($db->inTransaction())$db->rollBack();
        error_log('Mother care-team message could not be saved: '.$error->getMessage());
        http_response_code(500);echo json_encode(['error'=>'Your message could not be saved. Please try again.']);exit;
    }
}
if($_SERVER['REQUEST_METHOD']!=='GET'&&$_SERVER['REQUEST_METHOD']!=='POST'){http_response_code(405);echo json_encode(['error'=>'Method not allowed']);exit;}
$q=$db->prepare('SELECT message_id,sender_id,message_body,sent_at,is_read FROM tbl_messages WHERE mother_id=? AND ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)) ORDER BY sent_at DESC LIMIT 100');
$q->execute([$motherId,$userId,$partner,$partner,$userId]);$rows=array_reverse($q->fetchAll(PDO::FETCH_ASSOC));
$db->prepare('UPDATE tbl_messages SET is_read=1 WHERE mother_id=? AND sender_id=? AND receiver_id=? AND is_read=0')->execute([$motherId,$partner,$userId]);
echo json_encode(['messages'=>$rows,'partner'=>['id'=>$partner,'name'=>$contact['display_name']]],JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);
