<?php 
	require_once 'db.php'; // The mysql database connection script
	$userid = '%';
	if(isset($_GET['data'])){
		$userid = $_GET['data'];
	} else {
		$userid = "amy";
	}


	$query=mysql_query("SELECT id, timeSecond, latitudeDegree, longitudeDegree, route, eta FROM androidnavtable WHERE id='".$userid."' ORDER BY timeSecond DESC LIMIT 1") or die(mysql_error());

	while($obj=mysql_fetch_assoc($query)){
		$output[]=$obj;
	}
	#echo $output;
	echo json_encode($output);
?>