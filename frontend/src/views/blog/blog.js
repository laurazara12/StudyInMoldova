import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { blogPosts } from './blogData';
import './blog.css';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();

  // Obține toate categoriile unice
  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  // Obține toate lunile unice pentru filtrare
  const months = Array.from(new Set(blogPosts.map(post => {
    const date = new Date(post.date);
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }))).sort().reverse();

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    
    const matchesDate = !selectedDate || (() => {
      const postDate = new Date(post.date);
      const [year, month] = selectedDate.split('-');
      return postDate.getFullYear() === parseInt(year) && 
             postDate.getMonth() + 1 === parseInt(month);
    })();

    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleReadMore = (postId) => {
    navigate(`/blog/${postId}`);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDate('');
  };

  return (
    <>
      <Navbar />
      <div className="blog-container">
        <div className="blog-header">
          <h1>
            StudyInMoldova Blog
          </h1>
          <p>
            Discover insights, tips, and stories about studying in Moldova
          </p>
        </div>

        <div className="blog-filters">
          <div className="filter-section">
            <div className="filter-group search-group">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <select 
                value={selectedDate}
                onChange={handleDateChange}
                className="filter-select"
              >
                <option value="">All dates</option>
                {months.map(month => {
                  const [year, monthNum] = month.split('-');
                  const date = new Date(year, monthNum - 1);
                  return (
                    <option key={month} value={month}>
                      {date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </option>
                  );
                })}
              </select>
            </div>

            <button 
              className="clear-filters-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>

          <div className="filter-section">
            <div className="category-tags">
              <span 
                className={`category-tag ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('')}
              >
                Toate categoriile
              </span>
              {categories.map(category => (
                <span 
                  key={category} 
                  className={`category-tag ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="blog-grid">
          {filteredPosts.map(post => (
            <article key={post.id} className="blog-card">
              <div className="blog-image">
                <img src={post.image} alt={post.title} />
                <span className="category-tag">{post.category}</span>
              </div>
              <div className="blog-content">
                <h2>
                  {post.title}
                </h2>
                <p className="blog-date">
                  {new Date(post.date).toLocaleDateString('ro-RO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="blog-excerpt">
                  {post.excerpt}
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleReadMore(post.id)}
                >
                  Citește mai mult
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blog; 