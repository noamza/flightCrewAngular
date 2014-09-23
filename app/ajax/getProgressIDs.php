<?php
require_once 'db.php';

$query=mysql_query("select distinct(id) from checkinlocation") or die(mysql_error()); //order by id
while($row=mysql_fetch_assoc($query)){
    $output[]=$row;
}
echo json_encode($output);
mysql_close();
?>