import React, { useEffect, useState } from 'react';
import './App.css';
import logo from './logo2.png';

const categoryList = [
  'technology', 'sports', 'health', 'business',
  'entertainment', 'science', 'general'
];

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bookmarked, setBookmarked] = useState([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(true);

  useEffect(() => {
    if (!showBookmarksOnly && selectedCategory) {
      fetch(`http://localhost:5000/top-headlines?category=${selectedCategory}`)
        .then(res => res.json())
        .then(data => {
          setArticles(data.articles || []);
        })
        .catch(err => console.error("Error fetching articles:", err));
    }
  }, [selectedCategory, showBookmarksOnly]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    fetch('http://localhost:5000/api/bookmarks/all')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(b => ({
          title: b.title,
          url: b.link,
          description: "Saved bookmark",
          urlToImage: b.thumbnail || 'https://via.placeholder.com/300x200'
        }));
        setBookmarked(mapped);
      })
      .catch(err => console.error("Error loading bookmarks:", err));
  };

  const toggleBookmark = (article) => {
    const isBookmarked = bookmarked.some(b => b.url === article.url);

    if (isBookmarked) {
      fetch('http://localhost:5000/api/bookmarks/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: article.url }),
      })
        .then(() => {
          setBookmarked(bookmarked.filter(b => b.url !== article.url));
        })
        .catch(err => console.error("Error deleting bookmark:", err));
    } else {
      fetch('http://localhost:5000/api/bookmarks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          link: article.url,
          thumbnail: article.urlToImage || 'https://via.placeholder.com/300x200'
        }),
      })
        .then(() => {
          setBookmarked([...bookmarked, {
            ...article,
            urlToImage: article.urlToImage || 'https://via.placeholder.com/300x200'
          }]);
        })
        .catch(err => console.error("Error bookmarking:", err));
    }
  };

  const displayedArticles = showBookmarksOnly ? bookmarked : articles;

  return (
    <div className="app-container">
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="category-modal">
            <img src={logo} alt="App Logo" className="modal-logo" />
            <h2>Welcome to BuzzHive</h2>

            <p>Your One-Stop Hub for All Things News</p>
            <p>Select your favorite news category to get started</p>
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              defaultValue=""
              className="modal-select"
            >
              <option value="" disabled>Choose a category</option>
              {categoryList.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <button
              className="modal-continue-btn"
              onClick={() => setShowCategoryModal(false)}
              disabled={!selectedCategory}
            >
              🚀 Continue
            </button>
          </div>
        </div>
      )}

      {!showCategoryModal && (
        <>
          <header className="app-header">
            <img src={logo} alt="News Aggregator Logo" className="header-logo-full" />
            <div className="dropdown-container">
              <label htmlFor="category-select">Category:</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={showBookmarksOnly}
              >
                {categoryList.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="toggle-btn"
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            >
              {showBookmarksOnly ? '📰 Show All News' : '🔖 View Bookmarked'}
            </button>
          </header>

          <main className="news-container">
            {displayedArticles.length === 0 ? (
              <p style={{ textAlign: 'center', width: '100%' }}>
                No articles found.
              </p>
            ) : (
              displayedArticles.map((article, index) => (
                <div className="news-card glass" key={article.url || index}>
                  <img
                    src={article.urlToImage || 'https://via.placeholder.com/300x200'}
                    alt="thumbnail"
                  />
                  <div className="news-content">
                    <h3>{article.title || "No Title Available"}</h3>
                    <p>{article.description || "No Description"}</p>
                    <div className="card-footer">
                      <a href={article.url} target="_blank" rel="noreferrer">Read more</a>
                      <button
                        className="bookmark-btn"
                        onClick={() => toggleBookmark(article)}
                      >
                        {bookmarked.some(b => b.url === article.url)
                          ? '🔖 Bookmarked'
                          : '📑 Bookmark'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
