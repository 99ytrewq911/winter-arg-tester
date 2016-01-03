/** Took some inspiration from Dinnerbone's code (https://gist.github.com/Dinnerbone/fa3152176653398b312e) **/

var http = require('http');

function tryPassword(password, app, callback) {
	var req = http.request({
		hostname: 'store.steampowered.com',
		path: '/actions/clues?key=' + encodeURIComponent(password) + '&_=' + (new Date().getTime()),
		headers: {
			Referer: 'http://store.steampowered.com/app/' + app + '/'
		}
	}, function(res) {
		res.on('data', function(data) {
			req.response = (req.response || '') + data.toString();
		}).on('end', function() {
			if (res.statusCode !== 200) {
				return callback({error: 'Status code !== 200 (' + res.statusCode + '). Rate limited?', response: req.response}, undefined);
			}

			var result = undefined;
			try {
				result = JSON.parse(req.response);
				if (result && Array.isArray(result) && result.length === 0) {
					return callback(undefined, undefined);
				} else {
					return callback(undefined, result);
				}
			} catch (e) {
				return callback(e, undefined);
			}
		});
	});
	req.on('error', function(err) {
		setTimeout(function() {
			tryPassword(password, app, callback);
		}, 2000);
	});
	req.end();
}

function tryWintercomic(password, callback) {
	var req = http.request({
		hostname: 'store.steampowered.com',
		path: '/wintercomic/' + encodeURIComponent(password)
	}, function(res) {
		res.on('data', function(data) {
			req.response = (req.response || '') + data.toString();
		}).on('end', function() {
			if (res.statusCode === 200) {
				return callback(undefined, undefined);
			} else {
				return callback(undefined, {
					url: res.headers.location ? res.headers.location : undefined,
					headers: res.headers,
					statusCode: res.statusCode,
					body: req.response
				});
			}
		});
	});
	req.on('error', function(err) {
		setTimeout(function() {
			tryWintercomic(password, callback);
		}, 2000);
	});
	req.end();
}

function ensureValid(callback) {
	tryPassword('94050999014715', 6900, function(err, result) {
		if (!err && result && result.response && result.response === 'ic/4f21ca7') {
			return callback(true);
		} else {
			return callback(false);
		}
	});
}

module.exports = {
	tryPassword: tryPassword,
	tryWintercomic: tryWintercomic,
	ensureValid: ensureValid
}
