import React from 'react';
import { useParams } from 'react-router-dom';
import { blogPosts } from './blogData';
import BlogTemplate from './BlogTemplate';

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find(post => post.id === parseInt(id));

  return <BlogTemplate post={post} />;
};

export default BlogPost; 