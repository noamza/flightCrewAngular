<?php 
	require_once 'db.php'; // The mysql database connection script

	$id=$_REQUEST['id'];
	$time=$_REQUEST['time'];
	$locationid=$_REQUEST['locationid'];

	$query="INSERT INTO checkinlocation (id, time, locationid) VALUES(".$id.",".$time.",".$locationid.")";

	$q=mysql_query($query);
	if (!$q) {
    	die('Invalid query: ' . mysql_error());
	}

	$query = "SELECT * FROM checkinlocation";
	$q=mysql_query($query);
	while($e=mysql_fetch_assoc($q))
    	$output[]=$e;

	print(json_encode($output));
	mysql_close();

?>
