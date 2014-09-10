<?php 
	require_once 'db.php'; // The mysql database connection script
	//$id="'".stripslashes($_REQUEST['id'])."'";
    $id=$_REQUEST['id'];
	$time=$_REQUEST['time'];
	$lat=$_REQUEST['lat'];
	$lon=$_REQUEST['lon']; //
	$destlat=$_REQUEST['destlat'];
	$destlon=$_REQUEST['destlon'];

    print("lat " + $lat);
    echo "lon " + $lon;

	$url = "http://maps.googleapis.com/maps/api/directions/json?origin="  . $lat . "," . $lon . "&destination=" . $destlat . "," . $destlon . "&sensor=false&units=metric&mode=driving";

	//print($url); //URL working

	$jsondata = file_get_contents($url); //this is working too, I think...
	//print_r($jsondata);
	$routes = json_decode($jsondata);
	//print_r($routes);
	$encoded = (string) $routes->routes[0]->overview_polyline->points;
	//print($encoded); //OMG I GOT THE STRING
	

	$polyline = "";
	$len = strlen($encoded);
	$index = 0;
	$first = true;

	while ($index < $len) {
        $b = 0; 
        $shift = 0;
        $result = 0;
        do {
            $b = $encoded[$index++] - 63;
            $result |= ($b & 0x1f) << $shift;
            $shift += 5;
        } while ($b >= 0x20);
        $dlat = (($result & 1) != 0 ? ~($result >> 1) : ($result >> 1));
        $lat += $dlat;
        $shift = 0;
        $result = 0;
        do {
            $b = $encoded[$index++] - 63;
            $result |= ($b & 0x1f) << $shift;
            $shift += 5;
        } while ($b >= 0x20);
        $dlng = (($result & 1) != 0 ? ~($result >> 1) : ($result >> 1));
        $lon += $dlng;

       	$plat = $lat / 1E5;
       	$plong = $lng / 1E5;

       	if(!$first) {
       		$polyline = $polyline . "|";
       	}

       	$polyline = $polyline . $lat . "," . $lon;
       	$first = false;
    }

    $polyline = "'" . $polyline . "'"; //add quotes around polyline

    //print($polyline); //I THINK THIS WORKS!!!

    $eta=(string)$routes->routes[0]->legs[0]->duration->value;
    //print_r($eta);
    
    
    //$query="INSERT INTO androidnavtable (id, timeSecond, latitudeDegree, longitudeDegree, route, eta) VALUES(".$id.",".$time.",".$lat.",".$lon.",".$polyline.",".$eta.")";
    $query="INSERT INTO androidnavtable (id, timeSecond, latitudeDegree, longitudeDegree, route, eta, flightid) VALUES(".$id.",".$time.",".$lat.",".$lon.",".$polyline.",".$eta.",'test')";

    //print($query); check this if something breaks

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

?>
