const request = require('request');
const fs = require('fs');

module.exports = {
	getReleases,
	getSingleRelease,
	getLatestRelease,
	getReleaseByTag,
	downloadLatestRelease,
	downloadReleaseByTag,
	downloadSingleRelease
}

function getReleases(params, callback) {
	const url = createBaseUrl(params.user, params.repo);
	const options = createOptionsFromUrl(url);
	request(options, function(error, response, body) {
		if(callback) callback(error, response);
	});
}

function getSingleRelease(params, callback) {
	const url = createIdUrl(params.user, params.repo, params.id);
	const options = createOptionsFromUrl(url);
	request(options, function(error, response, body) {
		if(callback) callback(error, response);
	});
}

function getLatestRelease(params, callback) {
	const url = createLatestUrl(params.user, params.repo);
	const options = createOptionsFromUrl(url);
	request(options, function(error, response, body) {
		if(callback) callback(error, response);
	});
}

function getReleaseByTag(params, callback) {
	const url = createTagUrl(params.user, params.repo, params.tag);
	const options = createOptionsFromUrl(url);
	request(options, function(error, response, body) {
		if(callback) callback(error, response);
	});
}

function downloadLatestRelease(params, callback) {
	const url = createLatestUrl(params.user, params.repo);
	const options = createOptionsFromUrl(url);
	sendDownloadRequest(options, params, callback);
}

function downloadReleaseByTag(params, callback) {
	const url = createTagUrl(params.user, params.repo, params.tag);
	const options = createOptionsFromUrl(url);
	sendDownloadRequest(options, params, callback);
}

function downloadSingleRelease(params, callback) {
	const url = createIdUrl(params.user, params.repo, params.id);
	const options = createOptionsFromUrl(url);
	sendDownloadRequest(options, params, callback);
}

function sendDownloadRequest(options, params, callback) {
	request(options, function(error, response, body) {

		if(!error && response.statusCode == 200) {
			const json = JSON.parse(body);
			const urls = [];

			if(params.zipball) 
				urls.push(json.zipball_url);
			if(params.tarball) 
				urls.push(json.tarball_url);

			if(!fs.existsSync(params.saveDirectory))
				fs.mkdirSync(params.saveDirectory);

			urls.forEach(function(value) {
				options.url = value;
				let savePath = '';
				if(value == json.zipball_url)
					savePath = params.saveDirectory + params.zipball.fileName;
				else if(value == json.tarball_url)
					savePath = params.saveDirectory + params.tarball.fileName;
				const stream = request(options).pipe(fs.createWriteStream(savePath));
				stream.on('finish', function() {
					callback(null, value);
				});
				stream.on('error', function(e) {
					callback(e, null);
				});
			});
		} else {
			callback(error, response);
		}

	});
}

function createOptionsFromUrl(url) {
	return {
		url: url,
		headers: {
			'User-Agent': 'git-release'
		}
	}
}

function createBaseUrl(user, repo) {
	return 'https://api.github.com/repos/' + user + '/' + repo + '/releases';
}

function createLatestUrl(user, repo) {
	return createBaseUrl(user, repo) + '/latest';
}

function createTagUrl(user, repo, tag) {
	return createBaseUrl(user, repo) + '/tags/' + tag;
}

function createIdUrl(user, repo, id) {
	return createBaseUrl(user, repo) + '/' + id;
}
