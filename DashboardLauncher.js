var logger = require('./logger.js');
var program = require('commander');
var fs  = require("fs");
var child_process = require('child_process');
var server_code_path =__dirname+"\\index.js";
var mongod_path ='"C:\\Program Files\\MongoDB\\Server\\3.0\\bin\\mongod.exe"'
var mongodb_path = '"B:\\mongodb"'
var browser='"C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe" http://localhost:8080"'
program
  .version('0.0.1')
  .option('-s, --server <>' , 'server code (.js)', server_code_path)
  .option('-m, --mongo <>' , 'mongod path (.exe)', mongod_path)
  .option('-d, --mongodb <>' , 'monogodb path', mongodb_path)
  .option('-b, --browser <>' , 'browser name', browser)
  .parse(process.argv);


server_code_path  = program.server
mongod_path = program.mongo
mongodb_path = program.mongodb
browser = program.browser


logger.statlog(server_code_path);
logger.statlog(mongod_path);
logger.statlog(mongodb_path);
logger.statlog(browser);

var LogCallBacks = function (p,pname){
  p.stdout.on('data', function(data) {
    logger.statlog(pname+" "+data);
    //console.log(`stdout: ${data}`);
  });

  p.stderr.on('data', function(data) {
    logger.errlog(pname+" "+data)
  //  console.log(`stderr: ${data}`);
  });

  p.on('close', function(data) {
    logger.statlog(pname +' exited with code'+data);
    //console.log(`child process exited with code ${code}`);
  });
}

logger.statlog("launching mongod...");
var p1= child_process.exec(mongod_path+" --dbpath "+mongodb_path)
LogCallBacks(p1,"mongod")

logger.statlog("launching server...");
var p2=child_process.exec("node "+ server_code_path)
LogCallBacks(p2,"server")

logger.statlog("launching browser...");
var p3 = child_process.exec(browser)
LogCallBacks(p3,"browser")
