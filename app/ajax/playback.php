<?php
	require_once 'db.php';
	$id = stripslashes($_GET["id"]);
	$time = $_GET["time"];
	$query=mysql_query("SELECT id, latitudeDegree, longitudeDegree, route FROM androidnavtable WHERE id IN ( ".$id." ) and timeSecond < ".$time." ORDER BY timeSecond ASC") or die(mysql_error());
	while($obj=mysql_fetch_assoc($query)){
		$output[]=$obj;
	}
	echo json_encode($output);
	mysql_close();
?>
