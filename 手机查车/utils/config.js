/**
 * 小程序配置文件
 */
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

//开发环境
//var strservicef = 'http://192.168.1.86/ExsunBoss.ServiceAccessComponent'
//测试环境
 //var strservicef = 'http://192.168.1.236:10200'
//外网环境
 var strservicef = 'https://webapi.bss.comlbs.com'

// http://192.168.1.249:24282/api/AppVehicleStat/QueryAlarmDetail



var config = {
  strservicef,
  // 登录地址
  loginUrl: strservicef + '/api/AppUserLogin/Login',
  UserApplyUrl: strservicef + '/api/AppUserLogin/UserApply',

  

  getUserPlatAllUrl: strservicef + '/api/AppVehicleData/GetUserPlatAll/',
  getRegionalVehicleFromRectangleUrl: strservicef + '/api/AppVehicleData/GetRegionalVehicleFromRectangle',
  GetDevVehicleByVehicleNoUrl: strservicef + '/api/AppVehicleData/GetDevVehicleByVehicleNo',
  GetDevVehicleStateUrl: strservicef + '/api/AppVehicleData/GetDevVehicleState',
  DrivingBehaviorsStatUrl: strservicef + '/api/AppVehicleStat/DrivingBehaviorsStat',
  DrivingMileageStatUrl: strservicef + '/api/AppVehicleStat/DrivingMileageStat',
  QueryAlarmStatUrl: strservicef + '/api/AppVehicleStat/QueryAlarmStat',
  QueryAlarmDetailUrl: strservicef + '/api/AppVehicleStat/QueryAlarmDetail',

  GetDeviceFirstConfigUrl: strservicef + '/api/DeviceInfo/GetDeviceFirstConfig',
  GetDevInfoByDeviceNoUrl: strservicef + '/api/DeviceInfo/GetDevInfoByDeviceNo',
  


  HisLocStatUrl: strservicef + '/api/AppVehicleStat/HisLocStat',
  HisLocPayUrl: strservicef + '/api/AppVehicleStat/HisLocPay',
  GetDrivingMediasUrl: strservicef + '/api/AppVehicleStat/GetDrivingMedias',
  
  GetRegionListUrl: strservicef + '/api/AppVehicleData/GetRegionList',
  GetUserEnterpriseListUrl: strservicef + '/api/AppVehicleData/GetUserEnterpriseList',

  
  
};

module.exports = config
