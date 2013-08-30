
var serverUrl = 'http://sms.varsoftng.com/http/';
//var serverUrl = 'http://sms.initsng.com/http/';
//var serverUrl = 'http://localhost/sms_proxy.php/';
var isBlackberry = false;
var activeView = '#dashboard';

var curUsername, curPassword, curSenderId;
var deviceIsOnline = false;

var apiUrls = {
        login: serverUrl + 'creditBalance/',
        creditBalance: serverUrl + 'creditBalance/',
        sendSms: serverUrl + 'sendSms/',
        register: serverUrl + 'register',
        creditTransfer: serverUrl + 'creditTransfer',
}


if (window.location.hostname != 'localhost') {

}

if (typeof(console) == "undefined") {
        window.console = {
                log: function() {
                }
        };
}


if (typeof(blackberry) != 'undefined' && typeof(blackberry.invoke) != 'undefined') {
        isBlackberry = true;
}





$().ready(function() {

        $(window).on('hashchange', function() {
                handleBrowserStateChange();
        });
        
        initializeSavedData();
        
        if (navigator.onLine) {
                deviceOnline();
        } else {
                deviceOffline();
        }
        
        window.addEventListener('online', deviceOnline, false);
        window.addEventListener('offline', deviceOffline, false);
        
        
        goToPage("#loginPage");
        
        if (curUsername && curPassword) {
                goToPage('#dashboard');
        } else {
                goToPage('#loginPage');
        }

        
});

function initializeSavedData() {
        curUsername = localStorage.getItem("curUsername");
        curPassword = localStorage.getItem("curPassword");

        console.log('curLogin', curUsername, curPassword);

        $('.usernameHolder').val(curUsername);
        $('.passwordHolder').val(curPassword);
        $('.senderIdHolder').val(curSenderId);
}

function saveLoginDetails() {
        localStorage.setItem("curUsername", curUsername);
        localStorage.setItem("curPassword", curPassword);
        localStorage.setItem("curSenderId", curSenderId);

}

function handleBrowserStateChange( ) {

        var fullPageId = window.location.hash;

        if (!fullPageId || fullPageId == '#')
                return;

        console.log('New Page', fullPageId);

        if (fullPageId == '#singleEvents' || fullPageId == '#upcomingEvents') { //this is a hack
//                fullPageId = "#upcomingEvents";

        }
        $(activeView).hide();
        activeView = fullPageId;
        $(fullPageId).show();

}
function clearCreateForm() {
        $('#sendSms').find("input[type=text], textarea").val("");
}

function goToPage(pageId) {
        location.href = pageId;
}

function deviceOnline(e) {
        console.log('Device is Online :)');
        deviceIsOnline = true;
}

function deviceOffline(e) {
        console.log('Device is Offline :(');
        deviceIsOnline = false;

}

function sendToServer(urlToCall, postData, onResponse, onError) {
        if(!navigator.onLine){
              //showMessage("No internet connection was detected. Please try again");
              //return;
        }
        
        $('.loadingMsg').show();
        console.log('Calling ', urlToCall);
        console.log('With ', postData);
        $.ajax({
                url: urlToCall,
                data: postData,
                type: "GET",
                cache: false,
                timeout: 600000,
//                dataType: "jsonp",
                crossDomain: true,
                success: function(data) {
                        $('.loadingMsg').hide();
                        onResponse(data);

                },
                error: function(xhr, errorType, error) {
                        console.log(xhr, errorType, error);
                        $('.loadingMsg').hide();
                        onError(xhr, errorType, error);
                }
        });
        return false;

}
function onServerError(xhr, errorType, error) {
        console.log(xhr, errorType, error);
        $('#loginButton').attr('disabled', null);
        alert("Unable to connect.\n" + error + "\n Please try again");
}

function processLoginResponse(data) {
        console.log('response', data);
        $('#loginButton').attr('disabled', null);

        if (data == 'BAD_AUTH') {
                showMessage("Invalid Username/Password Combination.\nPlease check and try again");
                return;
        }
        creditBalance = data;
        curUsername = $('#username').val();
        curPassword = $('#password').val();
        $('.usernameHolder').val(curUsername);
        $('.passwordHolder').val(curPassword);
        showMessage("You are  now logged in.\n Your credit balance is " + creditBalance);
        saveLoginDetails();
        goToPage('#sendSms');
}

function tryLogin() {


        curUsername = $('#username').val();
        curPassword = $('#password').val();
        
        if(!curUsername){
                showMessage("Please enter your username/email address");
                return;
        }
        if(!curPassword){
                showMessage("Please enter your password");
                return;
        }

        //Assuming validation has been done
        var postData = $('#loginForm').serialize();
        $('#loginButton').attr('disabled', true);
        console.log('Calling Login');
        sendToServer(apiUrls.login, postData, processLoginResponse, onServerError);

        return false;


}

function showMessage(msg) {
        alert(msg);
}

function sendSms() {
        if (!curUsername) {
                alert('Please login first to continue');
                goToPage('#loginPage');
                return;
        }
var errors = new Array();
if(!$('#recipients').val()){
        errors.push("Please enter the number or numbers you wish to send this message to.");
}
if(!$('#message').val()){
        errors.push("Please enter the message you wish to send");
}
if(!$('#senderId').val()){
        errors.push("Please enter your sender id.\n This is the number or name which will be displayed as the sender");
}
if(errors.length){
        errors = errors.join("\n");
        showMessage(errors);
        return false;
}

 if(!curUsername){
                showMessage("Please enter your username/email address");
                return false;
        }
        if(!curPassword){
                showMessage("Please enter your password");
                return  false;
        }


        console.log("Sending SMS");
        var postData = $('#smsForm').serialize();
        $('.submitButton').attr('disabled', true);

        sendToServer(apiUrls.sendSms, postData, processSendResponse, onServerError);

        saveLoginDetails();

        return false;
}

function processSendResponse(response) {

        console.log(response);
        if(response=='BAD_AUTH'){
                showMessage("There was an authentication problem. Please log in again");
                goToPage('#loginPage');
                clearCreateForm();
                return;
        }else if(response=='MESSAGE_SEND_ERROR'){
                showMessage("API Error. Could not send message. Contact Provider.");
                return;
        }else{
                showMessage("Message sent!! Message ID: "+response );
        }
}

function logout(){
        curUsername=curPassword=curSenderId="";
        saveLoginDetails();
        initializeSavedData();
        location.href="index.html";
        
        return false;
}