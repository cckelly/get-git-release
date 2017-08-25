## Overview

A simple Node module that allows a user to get metadata about or download the latest release, or specific releases using an id or tag. It exposes the option to get either the zipball or the tarball, or both.

## Importing

Install get-git-release with the following:
```
npm install get-git-release
```

Require the module:
``` javascript
const rel = require('get-git-release');
```

## Usage

Each method requires a params object which contains metadata like the user of the repo, the repo name itself and specific release options.

### Get Release JSON

``` javascript
const params = {
  user: 'facebook',
  repo: 'react',
  tag: 'v15.5.0'
}

rel.getReleaseByTag(params, function(error, response) {
  if(!error && response.statusCode == 200)
    console.log(response.body);
});

rel.getLatestRelease(params, function(error, response) {
  if(!error && response.statusCode == 200)
    console.log(response.body);
});
```
There is also a `rel.getReleases()` method which follows the same syntax but gets all releases and a `rel.getSingleRelease()` which gets a release by id. To grab a release by id though, you must add an `id` field to the params object.

### Downloading Releases

```javascript
const params = {
  user: 'facebook',
  repo: 'react',
  saveDirectory: 'Downloads/ReactReleases/',
  zipball: {
    fileName: 'react.zip'
  }
}

rel.downloadReleaseByTag(params, function(error, response) {
  console.log(response); // download has finished from the URL
});
```

You can download just the tarball or both the zipball and tarball by adding a `tarball` property to the `params` object. If you don't set a `fileName` property, file will be saved with the original name. 

Also you can download other release files (binaries) by adding a `binaries` property.

```javascript
const params = {
  user: 'facebook',
  repo: 'react',
  saveDirectory: 'Downloads/ReactReleases/',
  binaries: true
}
```

Other download methods:

```javascript
rel.downloadLatestRelease(params, callback);
rel.downloadSingleRelease(params, callback);
```
## Notes

* If a release is not found given the supplied `params`, the response will return a `404` with a `Not Found` message.

## Roadmap

* Download private repositories
* Download all releases
* Unzip option
