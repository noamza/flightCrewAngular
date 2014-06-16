<?php 

	require_once 'db.php'; // The mysql database connection script
	$flightId=$_REQUEST['flightId'];
	$aircraftType=$_REQUEST['aircraftType'];
	$departureAirport=$_REQUEST['departureAirport'];
	$arrivalAirport=$_REQUEST['arrivalAirport'];
	$departureTime = $_REQUEST['departureTime'];
	$arrivalTime=$_REQUEST['arrivalTime']; 

	$query="INSERT INTO vrd_flight_data_1day (flightId, aircraftType, departureAirport, arrivalAirport, departureTime, arrivalTime) VALUES(".$flightId.",".$aircraftType.",".$departureAirport.",".$arrivalAirport.",".$departureTime.", ".$arrivalTime.")";

	$q=mysql_query($query);
	if (!$q) {
    	die('Invalid query: ' . mysql_error());
	}

	$query = "SELECT * FROM vrd_flight_data_1day limit 1";
	$q=mysql_query($query);
	while($e=mysql_fetch_assoc($q))
    	$output[]=$e;

	print(json_encode($output));
	mysql_close();

?>
