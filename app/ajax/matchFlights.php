<?php 
	require_once 'db.php';

	$query=mysql_query("SELECT distinct(vrd_flight_data_1day.flightid) AS flightID FROM vrd_flight_data_1day INNER JOIN androidnavtable ON vrd_flight_data_1day.flightID = androidnavtable.flightid ") or die(mysql_error());
	
	while($row=mysql_fetch_assoc($query))
	{
	    $output[]=$row;
	}
	echo json_encode($output);

	mysql_close();

?>
