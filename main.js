chrome.storage.sync.get('isToggled', function(data) {
    if (data.isToggled === undefined) {
        chrome.storage.sync.set({isToggled: false}, function() {
            console.log('Initial value of isToggled is set to false');
        });
    }
});

var toggleSwitch = document.getElementById('switch');
var toggleContent = document.getElementsByClassName('toggle-content');
var isToggled;

toggleSwitch.addEventListener('change', function() {
    isToggled = this.checked;  
    console.log('isToggled:', isToggled);

    chrome.storage.sync.get(['isHourly', 'interval'], function(data) {
        var delayInMinutes;
        var period;
        if (isToggled && data.isHourly) {
            var now = new Date();
            delayInMinutes = (60 - now.getMinutes()) % 60; // 다음 정각까지의 시간을 분으로 계산
            period = 60;  // 매시간마다
        } else if (isToggled && !data.isHourly) {
            if (data.interval === undefined) {
                period = 30;  // 기본값
            } else {
                period = parseInt(data.interval, 10);  
                if (isNaN(period)) {
                    period = 30;  // 기본값
                }
            }
            delayInMinutes = period;
        } else {
            chrome.alarms.clear("reminder");
            return;
        }

        if (isNaN(delayInMinutes) || isNaN(period) || !isFinite(delayInMinutes) || !isFinite(period)) {
            console.error("Invalid values for delayInMinutes or period: ", delayInMinutes, period);
            return;
        }

        chrome.alarms.create("reminder", {
            delayInMinutes: delayInMinutes, periodInMinutes: period
        });

    });
    for (var i = 0; i < toggleContent.length; i++) {
        toggleContent[i].style.display = isToggled ? 'block' : 'none';
    }

    chrome.storage.sync.set({isToggled: isToggled}, function() {
        console.log('isToggled value is set to ', isToggled);
    });
});

document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.sync.get('isToggled', function(data) {  
        toggleSwitch.checked = data.isToggled;
        isToggled = data.isToggled;  

        for (var i = 0; i < toggleContent.length; i++) {
            toggleContent[i].style.display = isToggled ? 'block' : 'none';
        }
    });

    chrome.storage.sync.get(['isHourly', 'interval'], function(data) {
        console.log('Values currently are ', data.isHourly, data.interval);
        document.querySelector('.option-large input').checked = data.isHourly;
        document.querySelector('.option-small input').checked = !data.isHourly;
        document.querySelector('#intervalInput').value = data.interval;
    });

    var alertOptionElements = document.getElementsByName('alert-option');
    for(var i = 0; i < alertOptionElements.length; i++) {
        alertOptionElements[i].addEventListener('change', updateButton);
    }

    document.getElementById('intervalInput').addEventListener('input', updateButton);
});


document.querySelector('#applyButton').addEventListener('click', function() {
    var isHourly = document.querySelector('.option-large input').checked;
    var interval = document.querySelector('#intervalInput').value;

    chrome.storage.sync.set({
        isHourly: isHourly,
        interval: interval,
        isToggled: isToggled  
    }, function() {
        console.log('Values are set to ', isHourly, interval, isToggled);
    });

    toggleSwitch.checked = isToggled;
    for (var i = 0; i < toggleContent.length; i++) {
        toggleContent[i].style.display = isToggled ? 'block' : 'none';
    }

    resetButton();
});

var intervalInput = document.getElementById("intervalInput");

intervalInput.addEventListener("wheel", function(event) {
    event.preventDefault(); 

    var delta = Math.sign(event.deltaY);

    var currentValue = parseInt(intervalInput.value, 10);
    if (isNaN(currentValue)) {
        currentValue = 30;
    }

    var newValue = currentValue + delta;

    newValue = Math.min(59, Math.max(1, newValue));

    intervalInput.value = newValue;

    updateButton();
});

function updateButton() {
    document.getElementById('applyButton').classList.add('modified');
}

function resetButton() {
    document.getElementById('applyButton').classList.remove('modified');
}
