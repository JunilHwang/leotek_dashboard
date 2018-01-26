<?php
	class Controller {
		private $callUrl = "http://aws.airtumbler.co:9350/ATDataService";
		static function run(){
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
				if($key == 'pwd') $val = base64_encode("leotek".$val);
				$columns .= "&{$key}={$val}";
			}
			$columns = "?". substr($columns,1);
			$content = file_get_contents("{$this->callUrl}/{$_GET['table']}{$columns}");
			echo $content;
			exit;
		}

		function getDevice(){
			$columns = "";
			foreach($_GET as $key=>$val){
				if(in_array($key,['method','table'])) continue;
				$columns .= "&{$key}={$val}";
			}
			$columns = "?". substr($columns,1);
			$path = APP_PATH."/json/device_info_{$_GET['userid']}.json";
			if(!file_exists($path)){
				setcookie("device_info","created",time()+6000);
				$content = file_get_contents("{$this->callUrl}/{$_GET['table']}{$columns}");
				$content = json_decode($content);
				if($content->Data) foreach($content->Data as $key=>$data){
					$device_info = file_get_contents("{$this->callUrl}/GetRealMeterData?serialNo={$data->DVC_SRNO}");
					$device_info = json_decode($device_info);
					$color = "color4";
					$score = 0;
					$data = (Array)$data;
					$data['co2'] = 0;
					$data['dust'] = 0;
					$data['tvoc'] = 0;
					$data['temp'] = 0;
					$data['hum'] = 0;
					if($device_info->Data){
						$score = ceil((intval($device_info->Data->CIAQI)/450)*100);
						if($score < 25){
							$color = "color4";
						} else if($score < 50){
							$color = "color3";
						} else if($score < 75){
							$color = "color2";
						} else if($score < 100){
							$color = "color1";
						}
						$data['co2'] = $device_info->Data->CO2_IDX;
						$data['dust'] = $device_info->Data->DUST_IDX;
						$data['tvoc'] = $device_info->Data->TVOC_IDX;
						$data['temp'] = $device_info->Data->TEMP;
						$data['hum'] = $device_info->Data->HUM;
					}
					$data['color'] = $color;
					$data['score'] = $score;
					$data = (Object)$data;
					$content->Data[$key] = $data;
				}
				$content = json_encode($content);
				file_put_contents($path,$content);
			} else {
				$content = file_get_contents($path);
				if(!isset($_COOKIE['device_info'])){
					@unlink($path);
				}
			}
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
			$member = $this->model->fetch("SELECT * FROM USR_MT where USR_ID = '{$_GET['id']}'");
			if($member){
				$_SESSION['member'] = $member = json_encode($member);
			} else {
				$member = "false";
			}
			echo $member;
			exit;
		}

		function logout(){
			session_destroy();
			exit;
		}

		function getGraph(){
			$start = isset($_GET['start']) ? $_GET['start'] : date("Y-m-d");
			$end = isset($_GET['end']) ? $_GET['end']." 23:59:59" : date("Y-m-d 23:59:59");
			$srno = isset($_GET['srno']) ? $_GET['srno'] : 'LT-AT-SH-0046435';
			$data_sql = "
				SELECT  *,
						left(convert(varchar, UPD_DT, 120),16) as upd_time
				FROM 	MTR_MI_HIS
				where 	DVC_SRNO = '{$srno}'
				AND		UPD_DT  BETWEEN '{$start}' and '{$end}'
			";
			$point_sql = "
				SELECT 
					MAX(t.CIAQI) as MAX_CIAQI,
					MAX(t.TVOC_IDX) as MAX_TVOC_IDX,
					MAX(t.CO2_IDX) as MAX_CO2_IDX,
					MAX(t.DUST_IDX) as MAX_DUST_IDX,
					MAX(t.TEMP) as MAX_TEMP,
					MAX(t.HUM) as MAX_HUM,
					MIN(t.CIAQI) as MIN_CIAQI,
					MIN(t.TVOC_IDX) as MIN_TVOC_IDX,
					MIN(t.CO2_IDX) as MIN_CO2_IDX,
					MIN(t.DUST_IDX) as MIN_DUST_IDX,
					MIN(t.TEMP) as MIN_TEMP,
					MIN(t.HUM) as MIN_HUM
				from ($data_sql) t
			";
			$data_sql .= " ORDER BY UPD_DT ASC";
			$data = $this->model->fetchAll($data_sql);
			$point = $this->model->fetch($point_sql);
			$json_data = [];
			$json_data['data'] = $data;
			$json_data['point'] = $point;
			echo json_encode($json_data);
/*			echo "<pre>";
			print_r($list);
			echo "</pre>";*/
			exit;
		}
	}