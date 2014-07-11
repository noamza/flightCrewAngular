<?php     

	require_once 'db.php'; //The mysql database connection script

	$result = mysql_query("SHOW TABLES LIKE 'routes'");
	$tableExists = mysql_num_rows($result) > 0;

	if(!$tableExists) 
	{
	    //add the table
		$query = "CREATE TABLE routes (id VARCHAR(25) NOT NULL, timeSecond BIGINT(20) NOT NULL, route LONGTEXT NOT NULL)";
		
		$q=mysql_query($query);
		
		if(!$q) 
		{
	    	die('Error creating table: ' . mysql_error());
		}
		else
		{
			echo "Table created. ";
		}

	}
	else
	{
		echo "Table exists. ";
	}

	$id=$_REQUEST['id'];
	$timeSecond=$_REQUEST['timeSecond'];
	$route=$_REQUEST['route'];

	$route = implode(",", $route); //makes a string

    $sql="INSERT INTO routes(id, timeSecond, route)VALUES('$id', '$timeSecond', '$route')";
   
	$result=mysql_query($sql);

	if($result)
	{
		echo "Data inserted successfuly.";
	}
	else 
	{
		die('Error inserting data: ' .mysql_error());
	}
	

	mysql_close();

?>
