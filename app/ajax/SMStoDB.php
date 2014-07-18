<?php
	require_once 'mysql.php';
	require_once 'GoogleVoice.php';
	$tableName = "gpstest";

	$voice = new GoogleVoice($_POST['user'], $_POST['pass']);
	$stop = false;

//while(true) { //this is super buggy...for persistence try JS events
	if(isset($_POST['kill']))
		$stop = true;
	if($stop) {
		mysql_query("stop");
		echo "Stopped...";
	}
	$sms = $voice->getUnreadSMS();
	$msgIDs = array();
	$query = "insert into " . $tableName . "(id, time, lat, lng) values "; //edit as needed
	$first = true;
	if($sms[0]!=null) {
		foreach($sms as $s) {
			$id = "'" . $s->phoneNumber . "'";
			$time = "'" . $s->startTime . "'";
			$message = $s->messageText;
			/* This WOULD be nice but Google changed the way messages are sent, it seems...
			if(!in_array($s->id, $msgIDs)) {
				// Mark the message as read in your Google Voice Inbox.
				$voice->markMessageRead($s->id);
				$msgIDs[] = $s->id;
			}
			*/
			$voice->deleteMessage($s->id); //delete msg from inbox
			//echo 'Message from: '.$s->phoneNumber.' on '.$s->displayStartDateTime.': '.$s->messageText."<br><br>\n"; //for debug
			$comma = strpos($message, ",");
			$lat = generateCoordFloat(substr($message, 0, $comma));
			$lng = generateCoordFloat(substr($message, $comma + 1));
			echo 'lat: ' . $lat . ' lng: ' . $lng . '<br><br>';

			
			if(!$first) //adds comma if this isn't the first value
				$query = $query . ",";
			else
				$first = false;

			$query = $query . " (" . $id . "," . $time . "," . $lat . "," . $lng . ")"; //probably needs more parsing, etc. 
			
		}
		
		if(!$first) { //will be false as long as there is more than 0 values
			//echo $query; //for debug
			$q=mysql_query($query);
			if (!$q) {
	    		die('Invalid query: ' . mysql_error());
			}
		}
	}
	//sleep($interval);
//}
		function generateCoordFloat($str) {
			$plus=strpos($str, '+');
			return substr($str, 0, $plus) . substr(floatval(substr($str, $plus + 1))/60, 1);
		}
?>