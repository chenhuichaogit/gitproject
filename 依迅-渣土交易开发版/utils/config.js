//开发环境
var strservicef = 'https://api.trading.comlbs.com'
//测试环境
//var strservicef = 'http://192.168.1.138:4830'



//李玄测试环境
// var strservicef = 'http://192.168.1.236:10200'
var config = {
  strservicef,
  // 登录地址
  loginUrl: strservicef + '/api/login/jscode',
  userInfoUrl: strservicef + '/api/Login/GetUserInfo',

  muckListUrl: strservicef + '/api/SoilTrade/List',
  muckInformationUrl: strservicef + '/api/SoilTrade/Detail',
  //muckSubmitUrl: strservicef + '/api/SoilTrade/Submit',
  muckSubmitUrl: strservicef + '/api/SoilTrade/SoilSubmit',

  carListUrl: strservicef + '/api/SoilCarTrade/List',
  carInformationUrl: strservicef + '/api/SoilCarTrade/Detail',
  carSubmitUrl: strservicef + '/api/SoilCarTrade/Submit',
  carCodeUrl: strservicef + '/api/SoilCarTrade/ValidateSmsCode',

  imgUploadUrl: strservicef + '/api/FileInfo/UploadFile',
  SendMessageUrl: strservicef +'/api/Login/GetPhoneCode',
  sendMoudleUrl: strservicef +'/api/Login/SendModule',
};

module.exports = config
