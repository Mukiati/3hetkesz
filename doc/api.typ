#set text(14pt, font: "Noto Sans")
= Book catalog API routes
#show table.cell.where(y: 0): set text(weight: "bold")
#table(
  columns: 3,
  [Method], [Route], [Description],
  [POST], [/login], [Attempt to log in using name and password, returns token if successful],
  [POST], [/register], [Attempt to register using name and password, returns token if successful],
  [GET], [/me], [Return info about currently logged in user],
  [GET], [/books], [Return all books],
  [POST], [/books], [Create new book using author, title and details],
  [PUT], [/books/:id], [Edit book with specified id, author, title and details],
  [DELETE], [/books/:id], [Delete book with specified id],
  [GET], [/books/search/:title], [Return books whose title contains `title`],
  [GET], [/books/:id], [Return information about book with specified id],
)
The API routes accept data encoded as JSON. The user token (JWT) is returned as JSON when logging in, when an action needs authentication the token can be sent in the query or as a top-level attribute in the JSON body as `token`. Being logged in is required to add, edit or delete books, and for /me.
