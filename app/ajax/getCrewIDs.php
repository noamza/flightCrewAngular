<?php
require_once 'db.php';
//echo mysql_info();
$query=mysql_query("select distinct(id) from androidnavtable") or die(mysql_error());
while($row=mysql_fetch_assoc($query)){
    $output[]=$row;
}
echo json_encode($output);
mysql_close();
?>