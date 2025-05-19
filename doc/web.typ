#set text(14pt, font: "Noto Sans")
= Book catalog website routes
#show table.cell.where(y: 0): set text(weight: "bold")
#table(
  columns: 3,
  [Method], [Route], [Description],
  [GET], [/], [Page containing all books, sorted by last updated first, may be filtered using `search` query string],
  [GET], [/book/:id], [Info about specific book],
  [GET], [/login], [Login/register page],
  [POST],
  [/login],
  [Form on GET /login posts to this, either redirects to homepage if successful, or returns login page with error message],

  [POST], [/register], [Same as POST /login, but for registering],
  [GET], [/logout], [Clears user cookie, then redirects to homepage],
  [GET], [/newbook], [Returns empty new book form],
  [POST],
  [/newbook],
  [New book form submits here, redirects to homepage if successful else returns form with error message],

  [GET], [/editbook/:id], [Returns edit book form for book with specific id],
  [POST],
  [/editbook/:id],
  [Edit book form submits here, redirects to homepage if successful else returns form with error message],

  [GET], [/deletebook/:id], [Deletes book with specific id, then redirects to homepage],
  [GET], [/me], [Shows information about the currently logged in user],
)
The POST routes accept form data using an URL-encoded body. The user token (JWT) is stored as a cookie. Being logged in is required to add, edit or delete books, and for /me.
