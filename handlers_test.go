// handlers_test.go
package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"lms/backend/config"
	"lms/backend/handlers"
	"lms/backend/models"
	"lms/backend/middlewares"
)

// setupTestDB creates a new mock database and assigns it to config.DB.
func setupTestDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock database: %v", err)
	}
	gdb, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open gorm DB: %v", err)
	}
	// Assign the mock DB to the global config
	config.DB = gdb
	return gdb, mock
}

// ----------------------
// CreateAdmin Tests
// ----------------------

// Test when no user is present in context.
func TestCreateAdmin_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	req, _ := http.NewRequest("POST", "/api/owner/admin/create", nil)
	c.Request = req

	handlers.CreateAdmin(c)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 Unauthorized, got %d", w.Code)
	}
}

// Test when user role is not Owner.
func TestCreateAdmin_Forbidden(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqBody := map[string]string{
		"name":           "Admin",
		"email":          "admin@example.com",
		"contact_number": "12345",
	}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/owner/admin/create", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Set a user with a non-owner role
	nonOwner := middlewares.User{
		ID: 2, Name: "User", Email: "user@example.com", Role: "Reader", LibID: 1,
	}
	c.Set(string(middlewares.UserContextKey), nonOwner)
	handlers.CreateAdmin(c)
	if w.Code != http.StatusForbidden {
		t.Errorf("expected 403 Forbidden, got %d", w.Code)
	}
}

// Test successful creation of admin.
func TestCreateAdmin_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqBody := map[string]string{
		"name":           "Admin",
		"email":          "admin@example.com",
		"contact_number": "12345",
	}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/owner/admin/create", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	owner := middlewares.User{
		ID: 1, Name: "Owner", Email: "owner@example.com", Role: "Owner", LibID: 1,
	}
	c.Set(string(middlewares.UserContextKey), owner)

	mock.ExpectBegin()
	// Expect an INSERT into the "users" table with the provided fields.
	mock.ExpectExec(`INSERT INTO "users"`).
		WithArgs(sqlmock.AnyArg(), reqBody["name"], reqBody["email"], reqBody["contact_number"], "LibraryAdmin", owner.LibID).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	handlers.CreateAdmin(c)
	if w.Code != http.StatusCreated {
		t.Errorf("expected 201 Created, got %d", w.Code)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}

// ----------------------
// CreateReader Tests
// ----------------------

// Test CreateReader success flow.
func TestCreateReader_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqBody := map[string]interface{}{
		"name":           "Reader",
		"email":          "reader@example.com",
		"contact_number": "9876543210",
		"lib_id":         1,
	}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/reader/create", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Expect a library lookup query.
	rows := sqlmock.NewRows([]string{"id", "name"}).AddRow(1, "Test Library")
	mock.ExpectQuery(`SELECT \* FROM libraries WHERE id = \?`).
		WithArgs(reqBody["lib_id"]).
		WillReturnRows(rows)

	mock.ExpectBegin()
	mock.ExpectExec(`INSERT INTO "users"`).
		WithArgs(sqlmock.AnyArg(), reqBody["name"], reqBody["email"], reqBody["contact_number"], "Reader", reqBody["lib_id"]).
		WillReturnResult(sqlmock.NewResult(2, 1))
	mock.ExpectCommit()

	handlers.CreateReader(c)
	if w.Code != http.StatusCreated {
		t.Errorf("expected 201 Created, got %d", w.Code)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}

// ----------------------
// CreateLibrary Tests
// ----------------------

// Test duplicate library case.
func TestCreateLibrary_Duplicate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqBody := map[string]string{
		"libraryName":  "Test Library",
		"OwnerName":    "Owner",
		"ownerEmail":   "owner@example.com",
		"ownerContact": "1234567890",
	}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/library/create", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Expect a query that finds an existing library.
	rows := sqlmock.NewRows([]string{"id", "name"}).AddRow(1, "Test Library")
	mock.ExpectQuery(`SELECT \* FROM libraries WHERE name = \?`).
		WithArgs(reqBody["libraryName"]).
		WillReturnRows(rows)

	handlers.CreateLibrary(c)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", w.Code)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}

// ----------------------
// AddBook Tests
// ----------------------

// Test adding a new book (record not found).
func TestAddBook_New(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqBody := map[string]interface{}{
		"ISBN":      "12345",
		"Title":     "Test Book",
		"Authors":   "Author1, Author2",
		"Publisher": "Test Publisher",
		"Version":   "1.0",
		"Copies":    5,
	}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/admin/books", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	// Expect SELECT query returns not found.
	mock.ExpectQuery(`SELECT \* FROM books WHERE isbn = \? AND lib_id = \?`).
		WithArgs(reqBody["ISBN"], user.LibID).
		WillReturnError(gorm.ErrRecordNotFound)

	mock.ExpectBegin()
	mock.ExpectExec(`INSERT INTO "books"`).
		WithArgs(reqBody["ISBN"], user.LibID, reqBody["Title"], reqBody["Authors"], reqBody["Publisher"], reqBody["Version"], reqBody["Copies"], reqBody["Copies"]).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	handlers.AddBook(c)
	if w.Code != http.StatusCreated {
		t.Errorf("expected 201 Created, got %d", w.Code)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}

// ----------------------
// RemoveBook Tests
// ----------------------

// Test RemoveBook when the book is not found.
func TestRemoveBook_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	isbn := "12345"
	reqBody := map[string]int{"CopiesToRemove": 1}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("DELETE", "/api/admin/books/"+isbn, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	mock.ExpectQuery(`SELECT \* FROM books WHERE isbn = \? AND lib_id = \?`).
		WithArgs(isbn, user.LibID).
		WillReturnError(gorm.ErrRecordNotFound)

	handlers.RemoveBook(c)
	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404 Not Found, got %d", w.Code)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}

// ----------------------
// UpdateBook Tests
// ----------------------

// Test UpdateBook with no update fields provided.
func TestUpdateBook_NoFields(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	isbn := "12345"
	reqBody := map[string]interface{}{} // empty update data
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("PUT", "/api/admin/books/"+isbn, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	handlers.UpdateBook(c)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", w.Code)
	}
}

// ----------------------
// ListIssueRequests Tests
// ----------------------

// Test ListIssueRequests when DB returns an error.
func TestListIssueRequests_Error(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)
	req, _ := http.NewRequest("GET", "/api/admin/requests", nil)
	c.Request = req

	mock.ExpectQuery(`SELECT r\.\* FROM request_events r JOIN books b ON r.book_id = b.isbn WHERE b.lib_id = \?`).
		WithArgs(user.LibID).
		WillReturnError(gorm.ErrInvalidTransaction)

	handlers.ListIssueRequests(c)
	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected 500 Internal Server Error, got %d", w.Code)
	}
}

// ----------------------
// ApproveIssueRequest Tests
// ----------------------

// Test ApproveIssueRequest when book is unavailable.
func TestApproveIssueRequest_BookUnavailable(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqIDStr := "1"
	req, _ := http.NewRequest("POST", "/api/admin/requests/"+reqIDStr+"/approve", nil)
	c.Request = req

	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	// Return a request event with nil ApprovalDate.
	rowsReq := sqlmock.NewRows([]string{"id", "book_id", "reader_id", "approval_date"}).
		AddRow(1, "12345", 2, nil)
	mock.ExpectQuery(`SELECT \* FROM request_events WHERE id = \?`).
		WithArgs(reqIDStr).
		WillReturnRows(rowsReq)

	// Return a book with available copies 0.
	rowsBook := sqlmock.NewRows([]string{"isbn", "lib_id", "available_copies"}).
		AddRow("12345", user.LibID, 0)
	mock.ExpectQuery(`SELECT \* FROM books WHERE isbn = \? AND lib_id = \?`).
		WithArgs("12345", user.LibID).
		WillReturnRows(rowsBook)

	handlers.ApproveIssueRequest(c)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", w.Code)
	}
}

// ----------------------
// RejectIssueRequest Tests
// ----------------------

// Test RejectIssueRequest with invalid request ID.
func TestRejectIssueRequest_InvalidReqID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	req, _ := http.NewRequest("POST", "/api/admin/requests/abc/reject", nil)
	c.Request = req

	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	handlers.RejectIssueRequest(c)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", w.Code)
	}
}

// ----------------------
// SignIn Tests
// ----------------------

// Test SignIn when user is not found.
func TestSignIn_UserNotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqBody := map[string]string{"email": "nonexistent@example.com"}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/signin", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	mock.ExpectQuery(`SELECT \* FROM users WHERE email = \?`).
		WithArgs(reqBody["email"]).
		WillReturnError(gorm.ErrRecordNotFound)

	handlers.SignIn(c)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 Unauthorized, got %d", w.Code)
	}
}

// Test successful SignIn.
func TestSignIn_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqBody := map[string]string{"email": "user@example.com"}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/signin", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	rows := sqlmock.NewRows([]string{"id", "name", "email", "contact_number", "role", "lib_id"}).
		AddRow(1, "Test User", reqBody["email"], "123456", "Reader", 1)
	mock.ExpectQuery(`SELECT \* FROM users WHERE email = \?`).
		WithArgs(reqBody["email"]).
		WillReturnRows(rows)

	handlers.SignIn(c)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200 OK, got %d", w.Code)
	}
}
