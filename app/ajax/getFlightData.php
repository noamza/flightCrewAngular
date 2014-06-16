<?php 

	require_once 'db.php';
	//echo mysql_info();
	$query=mysql_query("select * from vrd_flight_data_1day") or die(mysql_error());
	while($row=mysql_fetch_assoc($query)){
	    $output[]=$row;
	}
	echo json_encode($output);
	mysql_close();

?>