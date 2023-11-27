chrome.storage.sync.get(['isHourly', 'interval'], function(data) {
    var delayInMinutes;
    var period;
    if (data.isHourly) {
        var now = new Date();
        delayInMinutes = (60 - now.getMinutes()) % 60; // 다음 정각까지의 시간을 분으로 계산
        period = 60;  // 매시간마다
    } else {
        if (data.interval === undefined) {
            period = 30;  // 기본값
        } else {
            period = parseInt(data.interval, 10);  // 사용자가 선택한 주기
            if (isNaN(period)) {
                console.error("Invalid value for data.interval: ", data.interval);
                return;
            }
        }
        delayInMinutes = period;
    }

    chrome.alarms.create("reminder", {
        delayInMinutes: delayInMinutes, periodInMinutes: period
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "reminder") {
        chrome.storage.sync.get(['isHourly', 'interval'], function(data) {
            var message;
            if (data.isHourly) {
                message = '정각입니다! 스트레칭 한번 하시는 것을 추천합니다😎';
            } else {
                message = data.interval + '분이 지났습니다!';
            }

            chrome.notifications.create('reminder', {
                type: 'basic',
                iconUrl: 'icon128.png',
                title: '알림',
                message: message
            });
        });
    }
});

chrome.storage.sync.get('isToggled', function(data) {
    if (data.isToggled === undefined) {
        chrome.storage.sync.set({isToggled: false}, function() {
            console.log('Initial value of isToggled is set to false');
        });
    }
});
