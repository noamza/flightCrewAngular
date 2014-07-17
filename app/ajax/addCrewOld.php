<?php 
	require_once 'db.php'; // The mysql database connection script
	$id=$_REQUEST['id'];
	$time=$_REQUEST['time'];
	$lat=$_REQUEST['latitude'];
	$lon=$_REQUEST['longitude']; //
	$route=$_REQUEST['route'];
	$eta=$_REQUEST['eta'];

	$query="INSERT INTO androidnavtable (id, timeSecond, latitudeDegree, longitudeDegree, route, eta, flightid) VALUES(".$id.",".$time.",".$lat.",".$lon.",".$route.",".$eta.",'test')";

	$q=mysql_query($query);
	if (!$q) {
    	die('Invalid query: ' . mysql_error());
	}

	$query = "SELECT * FROM androidnavtable limit 1";
	$q=mysql_query($query);
	while($e=mysql_fetch_assoc($q))
    	$output[]=$e;

	print(json_encode($output));
	mysql_close();

	/*
	if(isset($_GET['task'])){
		$task = $_GET['task'];
		$status = "0";
		$created = time();
		$query=mysql_query("INSERT INTO tasks(task,status,created_at)  VALUES ('$task', '$status', '$created')") or die(mysql_error());
	}
?>
*/

?>
