import { useState, useEffect, useMemo } from 'react';
import adviceApi from '../services/adviceApi';
import logger from '../utils/logger';

function AdviceCard({ article, onClick }) {
  const tags = article.tags || [];
  
  return (
    <button
      onClick={() => onClick(article)}
      className="card text-left hover:shadow-lg transition-shadow cursor-pointer w-full"
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl">{article.icon || '📚'}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 text-white">{article.title}</h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {article.summary}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-primary-900/50 text-primary-400 text-xs rounded-full">
              {article.category}
            </span>
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-surface-700 text-gray-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

function AdviceDetailModal({ article, onClose }) {
  if (!article) return null;

  const content = article.content || '';
  const tags = article.tags || [];
  const resources = article.resources || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-surface-700 flex items-start gap-4">
          <span className="text-5xl">{article.icon || '📚'}</span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-white">{article.title}</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary-900/50 text-primary-400 text-sm rounded-full">
                {article.category}
              </span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-surface-700 text-gray-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-gray-400 mb-6 text-lg">{article.summary}</p>

          <div className="prose max-w-none">
            {content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h3 key={i} className="text-xl font-semibold mt-6 mb-3 text-white">
                    {paragraph.replace('## ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter(Boolean);
                return (
                  <ul key={i} className="list-disc list-inside space-y-1 mb-4">
                    {items.map((item, j) => (
                      <li key={j} className="text-gray-300">
                        {item.replace('- ', '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.match(/^\d+\./)) {
                const items = paragraph.split('\n').filter(Boolean);
                return (
                  <ol key={i} className="list-decimal list-inside space-y-1 mb-4">
                    {items.map((item, j) => (
                      <li key={j} className="text-gray-300">
                        {item.replace(/^\d+\.\s*/, '')}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={i} className="text-gray-300 mb-4">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {resources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-surface-700">
              <h4 className="font-semibold mb-3 text-white">Further Reading</h4>
              <ul className="space-y-2">
                {resources.map((resource, i) => (
                  <li key={i}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:underline"
                    >
                      {resource.title} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-700 bg-surface-800">
          <button onClick={onClose} className="btn-secondary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudyAdvicePage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [adviceRes, categoriesRes] = await Promise.all([
          adviceApi.getAllAdvice(),
          adviceApi.getCategories(),
        ]);
        setArticles(adviceRes.advice || []);
        setCategories(categoriesRes || []);
      } catch (err) {
        setError('Failed to load study advice');
        logger.error('Failed to load study advice:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        !selectedCategory || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-surface-700 rounded w-96 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card">
                  <div className="h-24 bg-surface-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-red-900/20 text-red-400 text-center">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2 text-white">Study Advice</h1>
        <p className="text-gray-400 mb-8">
          Curated strategies and techniques to boost your learning effectiveness.
        </p>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search advice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-full"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-400 mb-4">
          Showing {filteredArticles.length} of {articles.length} articles
          {selectedCategory && ` in "${selectedCategory}"`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <AdviceCard
                key={article.id}
                article={article}
                onClick={setSelectedArticle}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-400 mb-4">No articles found</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="text-primary-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Quick Category Links */}
        {!selectedCategory && !searchQuery && (
          <div className="mt-8 pt-8 border-t border-surface-700">
            <h2 className="font-semibold mb-4 text-white">Browse by Category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-2 bg-surface-700 hover:bg-surface-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  {cat} (
                  {articles.filter((a) => a.category === cat).length})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AdviceDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
