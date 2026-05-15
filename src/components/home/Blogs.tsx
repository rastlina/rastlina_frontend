// src/components/home/Blogs.tsx

import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { blogs } from '@/data/blogs';

const Blogs = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="flex justify-center mb-12">
          <h2 className="text-3xl font-serif text-gray-900">
            Blogs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              to={`/blog/${blog.id}`}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-xl mb-4 bg-gray-100">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary uppercase tracking-wide">
                  {blog.tag}
                </div>
              </div>

              <div className="pr-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <BookOpen className="h-3 w-3" />

                  <span>{blog.date}</span>
                </div>

                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {blog.excerpt}
                </p>

                <span className="text-sm font-bold text-accent-earth underline decoration-transparent group-hover:decoration-accent-earth transition-all">
                  Read More
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blogs;