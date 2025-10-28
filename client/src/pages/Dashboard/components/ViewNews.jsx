import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  X,
  ExternalLink,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

const ViewNews = ({ isOpen, onClose }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  const API_KEY = "UtbxZawSDOiWnKx4F4STEHpCWBmjtarw";
  const BASE_URL = "https://financialmodelingprep.com/stable/fmp-articles";

  // Fetch news from API
  const fetchNews = useCallback(async (page = 0, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          page,
          limit,
          apikey: API_KEY,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setNews(response.data);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch news"
      );
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch news when component opens
  useEffect(() => {
    if (isOpen) {
      fetchNews(currentPage);
    }
  }, [isOpen, fetchNews, currentPage]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Extract ticker symbols from content
  const extractTickers = (tickers) => {
    if (!tickers || tickers.length === 0) return [];
    return Array.isArray(tickers) ? tickers : [tickers];
  };

  // Get sentiment color based on content
  const getSentimentColor = (content) => {
    const positiveWords = [
      "surge",
      "increase",
      "rise",
      "gain",
      "positive",
      "strong",
      "outperform",
      "beat",
    ];
    const negativeWords = [
      "decline",
      "decrease",
      "fall",
      "drop",
      "negative",
      "weak",
      "underperform",
      "miss",
    ];

    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter((word) =>
      lowerContent.includes(word)
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      lowerContent.includes(word)
    ).length;

    if (positiveCount > negativeCount) return "#10b981"; // green
    if (negativeCount > positiveCount) return "#ef4444"; // red
    return "#6b7280"; // gray
  };

  // Filter news by category
  const filteredNews = news.filter((article) => {
    if (selectedCategory === "all") return true;
    const tickers = extractTickers(article.tickers);
    return tickers.some((ticker) =>
      ticker.includes(selectedCategory.toUpperCase())
    );
  });

  // Load more news
  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchNews(nextPage);
  };

  // Refresh news
  const refreshNews = () => {
    setCurrentPage(0);
    fetchNews(0);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "1200px",
          height: "90%",
          maxHeight: "800px",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #374151",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #374151",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "white",
                margin: "0 0 8px 0",
              }}
            >
              Financial News
            </h2>
            <p style={{ color: "#9ca3af", margin: 0 }}>
              Latest market updates and financial insights
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={refreshNews}
              disabled={loading}
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #374151",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {["all", "NYSE", "NASDAQ", "PNK"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                background:
                  selectedCategory === category ? "#3b82f6" : "#374151",
                color: "white",
                border: "none",
                borderRadius: "20px",
                padding: "6px 16px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                textTransform: "uppercase",
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Loading State */}
          {loading && news.length === 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #374151",
                  borderTop: "4px solid #3b82f6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "16px",
                }}
              ></div>
              <p style={{ color: "#9ca3af", margin: 0 }}>
                Loading financial news...
              </p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid #ef4444",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    color: "#f87171",
                    margin: "0 0 8px 0",
                    fontSize: "18px",
                  }}
                >
                  Error Loading News
                </h3>
                <p style={{ color: "#d1d5db", margin: "0 0 16px 0" }}>
                  {error}
                </p>
                <button
                  onClick={refreshNews}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* News List */}
          {!loading && !error && (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 24px",
              }}
            >
              {filteredNews.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#9ca3af",
                  }}
                >
                  <p>No news articles found for the selected category.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "16px",
                  }}
                >
                  {filteredNews.map((article, index) => {
                    const tickers = extractTickers(article.tickers);
                    const sentimentColor = getSentimentColor(article.content);

                    return (
                      <div
                        key={index}
                        style={{
                          background: "#1f2937",
                          borderRadius: "12px",
                          padding: "20px",
                          border: "1px solid #374151",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.borderColor = "#3b82f6";
                          e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.borderColor = "#374151";
                          e.target.style.transform = "translateY(0)";
                        }}
                        onClick={() => window.open(article.link, "_blank")}
                      >
                        {/* Article Header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "12px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <h3
                              style={{
                                color: "white",
                                fontSize: "18px",
                                fontWeight: "600",
                                margin: "0 0 8px 0",
                                lineHeight: "1.4",
                              }}
                            >
                              {article.title}
                            </h3>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "8px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  color: "#9ca3af",
                                  fontSize: "14px",
                                }}
                              >
                                <Calendar size={14} />
                                {formatDate(article.date)}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  color: "#9ca3af",
                                  fontSize: "14px",
                                }}
                              >
                                <DollarSign size={14} />
                                {article.author}
                              </div>
                            </div>
                          </div>
                          <ExternalLink
                            size={20}
                            style={{ color: "#9ca3af", flexShrink: 0 }}
                          />
                        </div>

                        {/* Image Thumbnail */}
                        {article.image && (
                          <div style={{ marginBottom: "12px" }}>
                            <img
                              src={article.image}
                              alt={article.title}
                              style={{
                                width: "100%",
                                maxHeight: "220px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "1px solid #374151",
                              }}
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Tickers */}
                        {tickers.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginBottom: "12px",
                              flexWrap: "wrap",
                            }}
                          >
                            {tickers.map((ticker, tickerIndex) => (
                              <span
                                key={tickerIndex}
                                style={{
                                  background: "#3b82f6",
                                  color: "white",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                }}
                              >
                                {ticker}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Content (HTML from API) */}
                        <div
                          style={{
                            color: "#d1d5db",
                            fontSize: "14px",
                            lineHeight: "1.7",
                            marginBottom: "12px",
                          }}
                          dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* Sentiment Indicator */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            paddingTop: "12px",
                            borderTop: "1px solid #374151",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: sentimentColor,
                            }}
                          ></div>
                          <span
                            style={{
                              color: "#9ca3af",
                              fontSize: "12px",
                            }}
                          >
                            Market Sentiment
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More Button */}
              {filteredNews.length > 0 && (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "24px",
                    padding: "16px",
                  }}
                >
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    style={{
                      background: "#374151",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {loading ? "Loading More..." : "Load More News"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewNews;
