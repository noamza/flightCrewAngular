<?php 
require_once 'db.php'; // The mysql database connection script
if(isset($_GET['taskID'])){
$status = $_GET['status'];
$taskID = $_GET['taskID'];
$query=mysql_query("update tasks set status='$status' where id='$taskID'") or die(mysql_error());
while($obj = mysql_fetch_object($query)) {
    $arr[] = $obj;
}
$json_response = json_encode($arr);
}

#mysql_close();

/*
mysql_connect('localhost','root','');
mysql_select_db('test');
$userid = $_GET["data"];
#$q=mysql_query("SELECT id, timeSecond, latitudeDegree, longitudeDegree, route, eta FROM androidnavtable");
$q=mysql_query("SELECT id, timeSecond, latitudeDegree, longitudeDegree, route, eta FROM androidnavtable WHERE id='".$userid."' ORDER BY timeSecond DESC LIMIT 1");
while($e=mysql_fetch_assoc($q))
        $output[]=$e;

        #print(json_encode($output));
        echo json_encode($output);
        mysql_close();
//////////////////
require_once 'db.php'; // The mysql database connection script
$status = '%';
if(isset($_GET['status'])){
$status = $_GET['status'];
}
$query=mysql_query("select ID, TASK, STATUS from tasks where status like '$status' order by status,id desc") or die(mysql_error());

# Collect the results
while($obj = mysql_fetch_object($query)) {
    $arr[] = $obj;
}
# JSON-encode the response
echo $json_response = json_encode($arr);
*/

?>