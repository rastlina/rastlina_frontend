// src/pages/BlogDetailPage.tsx

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { blogs } from '@/data/blogs';

const BlogDetailPage = () => {
  const { id } = useParams();

  const blog = blogs.find(
    (item) => item.id === Number(id)
  );

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          Blog Not Found
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Image */}
      <div className="w-full h-[400px] overflow-hidden">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="container-custom max-w-4xl py-16 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#667D00] font-semibold mb-8 hover:underline transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-6">
          <span className="bg-[#667D00]/10 text-[#667D00] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block">
            {blog.tag}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-10 pb-6 border-b border-gray-200">
          <BookOpen className="h-4 w-4" />
          <span>{blog.date}</span>
        </div>

        {/* Render HTML Content */}
        <div 
          className="blog-content max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  );
};

export default BlogDetailPage;