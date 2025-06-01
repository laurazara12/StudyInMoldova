import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import './blog.css';

const BlogTemplate = ({ post }) => {
  const navigate = useNavigate();

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="blog-container" style={{ color: 'var(--dl-color-theme-neutral-dark)' }}>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif' }}>Article not found</h1>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/blog')}
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            Back to Blog
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const { title, category, date, image, content } = post;

  return (
    <>
      <Navbar />
      <div className="blog-container" style={{ color: 'var(--dl-color-theme-neutral-dark)' }}>
        <article className="blog-post">
          <div className="blog-post-header">
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/blog')}
              style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.9rem' }}
            >
              ← Back to Blog
            </button>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem' }}>{title}</h1>
            <div className="blog-post-meta">
              <span className="category-tag" style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.8rem' }}>{category}</span>
              <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.8rem' }}>
                {new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          <div className="blog-post-image">
            <img src={image} alt={title} />
          </div>
          
          <div className="blog-post-content" style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '1rem' }}>
            <p>{content}</p>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
};

export default BlogTemplate; 