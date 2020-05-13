Read on to learn how to actually start being productive.

## Usage
* `npm run dev` Compiles and hot-reloads for development
* `npm run build` Compiles and minifies for production
* `npm run test` Run your tests
* `npm run lint` Lints and fixes files

## Heroku Deploy
1. Add env variable `APP_BUILD_MODE=production`
2. Configure Bitbucket pipeline variables `HEROKU_API_KEY` & `HEROKU_APP_NAME_PROD`
3. Just push commit

## Directory structure

The repository root contains auxiliary files like `package.json`, `.gitignore`, etc.


- `public`: public files, by default available at `/`.
- `src`: the actual source for the app goes here. Duh.
	- `_tables`: Main tables view.
	- `assets`: Your assets files.
	- `data`: A Project csv files.
	- `components`: A main components.
	- `containers`: Router containers. `Panel` for authorized admin users, `Common` for common :)
	- `lib`: stuff that helps the app start up, e.g. environment, logger, the container configuration, etc.
	- `mixins`: app mixins.
	- `scss`: a source of app styles.
	- `store`: vuex storage in modules style.
	- `utils`: your useful scripts.
	- `views`: a global views, like 404 pages.


## App Modules
This boilerplate provide simple attaching of modules, all files that match by `src/_{*}/index.js` will import automaticly.
Important to export `routes` array and router `container` name, research some modules to more...

for adding more containters, check the `MAP_ROUTE_CONTAINTERS` in `src/rounter.js`
