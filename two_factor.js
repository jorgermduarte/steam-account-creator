var SteamUser = require('steam-user');
var readlineSync = require('readline-sync');
var fs = require('fs');

var username, password;

var user = new SteamUser();

console.log('2fa enabling process beginning...');
logOn();

function startProcess(u,pw) {
  username = u;
  password = pw;
  user.logOn({
    'accountName': username,
    'password': password
  });
}

user.on('loggedOn', function(response) {
  console.log('Logged onto Steam...');
  console.log('Beginning 2fa authentication');
  enableTwoFactor();
});

function enableTwoFactor() {
  user.enableTwoFactor(function(err,response) {
    if(err == null){
      console.log(response);
      var status = response.status;
      if (status == 1) {
        console.log('>> Successfully requested 2fa enabling.');
        console.log('>> Saving valuable data to ' + username + '.maFile');
        saveFile(response);
        finalizeTwoFactor(response);
      }else{
        console.log('>> Erorr while enabling 2fa. Error code: ' + status);
        process.exit(1);
      }
    }
  });
}

function saveFile(response) {
  fs.writeFileSync('accounts/'+ username + '.2fa', JSON.stringify(response));
}

function finalizeTwoFactor(response) {
  console.log('>> Verifying 2fa activation.');
  var code = readlineSync.question('Code sent by SMS: ');
  try{
    user.finalizeTwoFactor(response.shared_secret, code, function (err) {
      if (err) {
        console.log('>> Error while verifying 2fa. Error: ' + err.message);
      } else {
        console.log('>> Successfully verified 2fa authentication.');
        console.log('>> Run test_login.js if you wish to test your login. (Do not remove .maFile file from the accounts directory)');
      }
    });
  }catch{
  }
}

// * Pass your steam account username and password to the startProcess function
startProcess("yourUsername","yourPassword");