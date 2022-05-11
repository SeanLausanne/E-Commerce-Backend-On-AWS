
exports.getUniqueId = function(type) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    if (type === 'product') {
        return 'pr' + id;
    }
    else if (type === 'purchase') {
        return 'pu' + id;
    }else if (type === 'user') {
        return 'us' + id;
    }
    return "";
}

// https://tecadmin.net/get-current-date-time-javascript/
exports.getCurrentTime = function() {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    return date + '-' + time;
}