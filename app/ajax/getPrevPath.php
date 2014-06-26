<?php
    require_once 'db.php';
    $id = stripslashes($_GET["id"]);
    $query=mysql_query("SELECT latitudeDegree, longitudeDegree FROM androidnavtable WHERE id = '".$id."'") or die(mysql_error());
    while($obj=mysql_fetch_assoc($query)){
        $output[]=$obj;
    }
    echo json_encode($output);
    mysql_close();
?>