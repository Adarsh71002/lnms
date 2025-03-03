package handlers

import (
	"net/http"
	"time"

	"lms/backend/config"
	"lms/backend/middlewares"
	"lms/backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// search for books by title, author, or publisher.
func SearchBooks(c *gin.Context) {
	user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
	libID := user.LibID

	title := c.Query("title")
	author := c.Query("author")
	publisher := c.Query("publisher")

	var books []models.Book
	query := config.DB.Where("lib_id = ?", libID)
	if title != "" {
		query = query.Where("title ILIKE ?", "%"+title+"%")
	}
	if author != "" {
		query = query.Where("authors ILIKE ?", "%"+author+"%")
	}
	if publisher != "" {
		query = query.Where("publisher ILIKE ?", "%"+publisher+"%")
	}
	if err := query.Find(&books).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error searching books"})
		return
	}

	var result []gin.H
	for _, book := range books {
		availability := "Available"
		if book.AvailableCopies <= 0 {
			var issue models.IssueRegistry
			err := config.DB.Where("isbn = ?", book.ISBN).Order("expected_return_date ASC").First(&issue).Error
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					availability = "Not available"
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error fetching return date"})
					return
				}
			} else {
				availability = "Not available, expected return: " + issue.ExpectedReturnDate.Format("2006-01-02")
			}
		}
		result = append(result, gin.H{
			"isbn":             book.ISBN,
			"title":            book.Title,
			"authors":          book.Authors,
			"publisher":        book.Publisher,
			"version":          book.Version,
			"total_copies":     book.TotalCopies,
			"available_copies": book.AvailableCopies,
			"availability":     availability,
		})
	}
	c.JSON(http.StatusOK, gin.H{"books": result})
}

type RaiseRequest struct {
	ISBN string `json:"ISBN" binding:"required"`
}
/*
func RaiseIssueRequest(c *gin.Context) {
	var req RaiseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing ISBN in request"})
		return
	}
	user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
	libID := user.LibID

	var book models.Book
	if err := config.DB.Where("isbn = ? AND lib_id = ?", req.ISBN, libID).First(&book).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}
	if book.AvailableCopies <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Book is not available for issue"})
		return
	}
	issueRequest := models.RequestEvent{
		BookID:      req.ISBN,
		ReaderID:    user.ID,
		RequestType: "IssueRequest",
		RequestDate: time.Now(),
	}
	if err := config.DB.Create(&issueRequest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error raising issue request"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Issue request raised successfully"})
}
*/
func RaiseIssueRequest(c *gin.Context) {
    var req RaiseRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Missing ISBN in request"})
        return
    }
    user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
    libID := user.LibID

    var book models.Book
    if err := config.DB.Where("isbn = ? AND lib_id = ?", req.ISBN, libID).First(&book).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
        return
    }
    if book.AvailableCopies <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Book is not available for issue"})
        return
    }
    
    // Check if the reader already has an issued copy of this book.
    var existingIssue models.IssueRegistry
    err := config.DB.Where("isbn = ? AND reader_id = ? AND issue_status = ?", req.ISBN, user.ID, "Issued").First(&existingIssue).Error
    if err == nil {
        // Found an active issue for this book.
        c.JSON(http.StatusBadRequest, gin.H{"error": "You already have an issued copy of this book. Please return it before requesting another copy."})
        return
    }
    // If the error is not a record not found error, something went wrong.
    if err != nil && err != gorm.ErrRecordNotFound {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking active issues"})
        return
    }

    issueRequest := models.RequestEvent{
        BookID:      req.ISBN,
        ReaderID:    user.ID,
        RequestType: "IssueRequest",
        RequestDate: time.Now(),
    }
    if err := config.DB.Create(&issueRequest).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error raising issue request"})
        return
    }
    c.JSON(http.StatusCreated, gin.H{"message": "Issue request raised successfully"})
}
