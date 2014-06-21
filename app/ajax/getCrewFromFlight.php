<?php
	require_once 'db.php';
	$flightid = $_GET["flightid"];
	$query=mysql_query("SELECT distinct id from androidnavtable where flightid='".$flightid."'") or die(mysql_error());
	while($obj=mysql_fetch_assoc($query)){
		$output[]=$obj;
	}
	echo json_encode($output);
	mysql_close();
?>
