<?php
//mysql_connect('localhost','root','');mysql_select_db('test');
require_once 'db.php';
$userid = $_GET["id"];
//if(isset($_GET['data'])){$userid = $_GET['data'];} else {$userid = "amy";}
$query=mysql_query("SELECT id, timeSecond, latitudeDegree, longitudeDegree, route, eta FROM androidnavtable WHERE id='".$userid."' ORDER BY timeSecond DESC LIMIT 1") or die(mysql_error());
while($obj=mysql_fetch_assoc($query)){
	$output[]=$obj;
}
echo json_encode($output);
mysql_close();
?>
