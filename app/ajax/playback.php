<?php
	require_once 'db.php';
	$id = stripslashes($_GET["id"]);
	$timeUpper = $_GET["timeUpper"];
	$timeLower = $_GET["timeLower"];
	$query=mysql_query("SELECT id, latitudeDegree, longitudeDegree, route, timeSecond FROM androidnavtable WHERE id IN ( ".$id." ) and timeSecond <= ".$timeUpper." and timeSecond >= ".$timeLower." ORDER BY timeSecond ASC") or die(mysql_error());
	while($obj=mysql_fetch_assoc($query)){
		$output[]=$obj;
	}
	echo json_encode($output);
	mysql_close();
?>
