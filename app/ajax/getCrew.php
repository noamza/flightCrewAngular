<?php
mysql_connect('localhost','root','');
mysql_select_db('test');
echo mysql_info();
echo mysql_info();
#$q=mysql_query("SELECT id, timeSecond, latitudeDegree, longitudeDegree, route, eta FROM androidnavtable");
$q=mysql_query("select distinct(id) from androidnavtable") or die(mysql_error());
while($e=mysql_fetch_assoc($q)){
    $output[]=$e;
}
        #print(json_encode($output));
echo json_encode($output);
mysql_close();
?>