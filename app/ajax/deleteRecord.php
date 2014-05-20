<?php 
require_once 'db.php'; // The mysql database connection script
if(isset($_GET['taskID'])){
$taskID = $_GET['taskID'];
$query=mysql_query("delete from tasks where id='$taskID'") or die(mysql_error());
while($obj = mysql_fetch_object($query)) {
    $arr[] = $obj;
}
$json_response = json_encode($arr);
}
?>