# anfema Work

- Create branches based on issues
- Create Pull Requests from the command line
- Create changelogs from merged pull requests

And

- Batch update GitHub labels


## Installation

If you have Node.js and Yarn installed, you can use install via:

```sh
yarn global add anfema/work
```


## Configuration

This tool will ask for any required configuration. If you want to adjust default settings, you can add a JSON object to `.config/work` to adjust settings as necessary. Note: This should not be the case for anfema repositories.


## Credits

The changelog feature is more based on than inspired by [lerna-changelog](https://github.com/lerna/lerna-changelog) which didn't quite match what we needed. It's a great project to look at and learn.
