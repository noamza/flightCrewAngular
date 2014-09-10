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
	
    /*

	$polyline = "";
	$len = strlen($encoded);
	$index = 0;
	$first = true;
    $lat2 = $lat;
    $lon2 = $lon;

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
        $lat2 += $dlat;
        $shift = 0;
        $result = 0;
        do {
            $b = $encoded[$index++] - 63;
            $result |= ($b & 0x1f) << $shift;
            $shift += 5;
        } while ($b >= 0x20);
        $dlng = (($result & 1) != 0 ? ~($result >> 1) : ($result >> 1));
        $lon2 += $dlng;

       	$plat = $lat2 / 1E5;
       	$plong = $lng / 1E5;

       	if(!$first) {
       		$polyline = $polyline . "|";
       	}

       	$polyline = $polyline . $lat2 . "," . $lon2;
       	$first = false;
    }

    $polyline = "'" . $polyline . "'"; //add quotes around polyline

*/


    $polyline = "";
    $index = 0;
    $len = strlen($encoded);
    $lat2 = 0; 
    $lng2 = 0;
    $counter = 0;
    while ($index < $len) {
        $counter++;
        int $b; 
        $shift = 0; 
        $result = 0;
        do {
            $b = $encoded[$index++] - 63;
            $result |= ($b & 0x1f) << $shift;
            $shift += 5;
        } while ($b >= 0x20);
        $dlat = (($result & 1) != 0 ? ~($result >> 1) : ($result >> 1));
        $lat2 += $dlat;
        $shift = 0;
        $result = 0;
        do {
            $b = $encoded[$index++] - 63;
            $result |= ($b & 0x1f) << $shift;
            $shift += 5;
        } while ($b >= 0x20);
        $dlng = (($result & 1) != 0 ? ~($result >> 1) : ($result >> 1));
        $lng2 += $dlng;
        //LatLng position = new LatLng((double) lat / 1E5, (double) lng / 1E5);
        $latf = $lat2 / 1E5;
        $lonf = $lng2 / 1E5;
        if (($counter % 5) == 0) {
            //NSString * temp = [NSString stringWithFormat:@"%f,%f|",latf, lonf];
            //[poly appendString:temp];
            $polyline += $latf +","+$lonf+"|";
        }
        else {
            continue;
        }
        
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
