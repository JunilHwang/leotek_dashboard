<?php
	class Controller {

		function run(){
			$obj = new Controller();
			$obj->init();
			$obj->index();
			$obj->end();
		}

		function init(){
			$this->model = new Model();
			$this->is_member = isset($_SESSION['member']);
			$this->memberInfo = $this->is_member ? $_SESSION['member'] : NULL;
			$method = isset($_GET['method']) ? $_GET['method'] : NULL;
			if($method && method_exists($this,$method)) $this->$method();
		}

		function index(){
			$arr = (Array)$this;
			extract($arr);
			include_once(PUBLIC_PATH."/index.html");
		}

		function end(){
			$ob = ob_get_contents();
			
			$before = [
				'="css/',
				'="js/',
				'="img/',
				'="template/'
			];

			$after = [
				'="'.ROOT_URL.'/css/',
				'="'.ROOT_URL.'/js/',
				'="'.ROOT_URL.'/img/',
				'="'.ROOT_URL.'/template/'
			];

			$ob = str_replace($before,$after,$ob);
			
			ob_clean();
			
			echo $ob;
		}

		function getData(){
			$columns = "";
			foreach($_GET as $key=>$val){
				if(in_array($key,['method','table'])) continue;
				$columns .= "&{$key}={$val}";
			}
			$columns = "?". substr($columns,1);
			$content = file_get_contents("http://aws.airtumbler.co:9350/ATDataService/{$_GET['table']}{$columns}");
			echo $content;
			exit;
		}

		function getMember(){
			if($this->is_member){
				echo $this->memberInfo;
			} else {
				echo "false";
			}
			exit;
		}

		function getLogin(){
			$_SESSION['member'] = $this->model->getJSON("SELECT * FROM USR_MT where usr_nm = 'test'");
			echo $_SESSION['member'];
			exit;
		}

		function logout(){
			session_destroy();
			exit;
		}
	}