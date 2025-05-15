# Book catalog

Most of the implementation is in `web/`, where the entrypoint is `server.js`, which imports `web.js` (the website) and `api.js` (the API).
The desktop program, which uses the API is in `desktop/`.

For testing, you might want to use `web/maketestdata.js`, which fills the database with believable-looking testing data.
