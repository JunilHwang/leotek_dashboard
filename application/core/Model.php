<?php
	Class Model {
		private $HOST = "52.79.37.159";
		private $DB_NAME = "AirTumbler";
		private $DB_USER = "designtalktalk";
		private $DB_PW = "elwkdlsxhrxhr1@";

		function Model(){
			$this->db = new PDO("sqlsrv:server={$this->HOST};Database={$this->DB_NAME}",$this->DB_USER,$this->DB_PW);
			$this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE,PDO::FETCH_OBJ);
		}		

		function query($sql = false){
			if(!$sql) $sql = $this->sql;
			return $this->db->query($sql);
		}	

		function fetch($sql = false){
			if(!$sql) $sql = $this->sql;
			return $this->query($sql)->fetch();
		}

		function fetchAll($sql = false){
			if(!$sql) $sql = $this->sql;
			return $this->query($sql)->fetchAll();
		}

		function cnt($sql = false){
			if(!$sql) $sql = $this->sql;
			return $this->query($sql)->rowCount();
		}

		function getJSON($sql = false){
			if(!$sql) $sql = $this->sql;
			return json_encode($this->fetchAll($sql));
		}
	}