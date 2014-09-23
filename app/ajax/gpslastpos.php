<?php
require_once 'db.php';
$query=mysql_query("select * from androidnavtable where id='GO1' order by timeSecond desc limit 1") or die(mysql_error());
while($row=mysql_fetch_assoc($query)){
    $output[]=$row;
}
echo json_encode($output);
mysql_close();
?> 