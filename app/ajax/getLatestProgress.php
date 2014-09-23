<?php
require_once 'db.php';
$userid = $_GET["id"];

//if(isset($_GET['data'])){$userid = $_GET['data'];} else {$userid = "amy";}
$query=mysql_query("SELECT id, time, locationid FROM checkinlocation WHERE id='".$userid."' ORDER BY time DESC LIMIT 1") or die(mysql_error());
while($obj=mysql_fetch_assoc($query)){
	$output[]=$obj;
}
echo json_encode($output);
mysql_close();
?>
