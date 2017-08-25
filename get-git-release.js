'use strict'

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
      const files = [];

      if(params.zipball) {
        files.push({
          url: json.zipball_url,
          fileName: params.zipball.fileName || (json.tag_name + ".zip")
        });
      }

      if(params.tarball) {
        files.push({
          url: json.tarball_url,
          fileName: params.tarball.fileName || (json.tag_name + ".tar.gz")
        });
      }

      if(params.binaries) {
        json.assets.forEach(function(asset) {
          files.push({
            url: asset.browser_download_url,
            fileName: asset.name
          });
        })
      }

      if(!fs.existsSync(params.saveDirectory))
        fs.mkdirSync(params.saveDirectory);

      files.forEach(function(file) {
        options.url = file.url;
        let savePath = params.saveDirectory + file.fileName;
  
        const stream = request(options).pipe(fs.createWriteStream(savePath));
        stream.on('finish', function() {
          callback(null, file.url);
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
