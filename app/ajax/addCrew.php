<?php 
	require_once 'db.php'; // The mysql database connection script
	//$id="'".stripslashes($_REQUEST['id'])."'";
    $id=$_REQUEST['id'];
	$time=$_REQUEST['time'];
	$lat=$_REQUEST['lat'];
	$lon=$_REQUEST['lon']; //
	$destlat=$_REQUEST['destlat'];
	$destlon=$_REQUEST['destlon'];
    print($id);
    print("lat " + $lat);
    echo "lon " + $lon;
    print("\n");

	$url = "http://maps.googleapis.com/maps/api/directions/json?origin="  . $lat . "," . $lon . "&destination=" . $destlat . "," . $destlon . "&sensor=false&units=metric&mode=driving";

	//print($url); //URL working

	$jsondata = file_get_contents($url); //this is working too, I think...
	//print_r($jsondata);
	$routes = json_decode($jsondata);
	//print_r($routes);
	$encoded = (string) $routes->routes[0]->overview_polyline->points;
	//print($encoded); //OMG I GOT THE STRING

	    $string = $encoded;
        $points = array();
        $index = $i = 0;
        $previous = array(0,0);
        while ($i < strlen($string)) {
            $shift = $result = 0x00;
            do {
                $bit = ord(substr($string, $i++)) - 63;
                $result |= ($bit & 0x1f) << $shift;
                $shift += 5;
            } while ($bit >= 0x20);

            $diff = ($result & 1) ? ~($result >> 1) : ($result >> 1);
            $number = $previous[$index % 2] + $diff;
            $previous[$index % 2] = $number;
            $index++;
            $point = $number * 1 / pow(10, 5);
                #print($point . "*");
            $points[] = $point;
        }
        
        for($i = 0; $i < sizeof($points); $i += 2) {
            $polyline = $polyline . $points[$i] . "," . $points[$i+1] . "|";
        }

    $polyline = "'" . $polyline . "'";
    
    //print($polyline); //I THINK THIS WORKS!!!

    $eta=(string)$routes->routes[0]->legs[0]->duration->value;
    //print_r($eta);
    
    
    //$query="INSERT INTO androidnavtable (id, timeSecond, latitudeDegree, longitudeDegree, route, eta) VALUES(".$id.",".$time.",".$lat.",".$lon.",".$polyline.",".$eta.")";
    print("lat " + $lat);
    echo "lon " + $lon;
    print("\n");
    $query="INSERT INTO androidnavtable (id, timeSecond, latitudeDegree, longitudeDegree, route, eta, flightid) VALUES(".$id.",".$time.",".$lat.",".$lon.",".$polyline.",".$eta.",'test')";

    print($query); # check this if something breaks

	$q=mysql_query($query);
	if (!$q) {
    	die('Invalid query: ' . mysql_error());
	}

	#$query = "SELECT * FROM androidnavtable limit 1";
	#$q=mysql_query($query);
	#while($e=mysql_fetch_assoc($q))
    #	$output[]=$e;

	#print(json_encode($output));
	mysql_close();

?>
