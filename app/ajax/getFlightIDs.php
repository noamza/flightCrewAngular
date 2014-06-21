<?php
	require_once 'db.php';
	$query=mysql_query("SELECT distinct flightid from androidnavtable") or die(mysql_error());
	while($obj=mysql_fetch_assoc($query)){
		$output[]=$obj;
	}
	echo json_encode($output);
	mysql_close();
?>
