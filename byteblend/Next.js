import React, { useState, useEffect, createContext, useContext } from 'react';
// In a real project, you would install this with: npm install @sanity/client
// For this browser-based environment, we import from a CDN.
import { createClient } from 'https://cdn.skypack.dev/@sanity/client';

// --- (0) LIVE SANITY API CLIENT ---
// This configuration connects our frontend to the Sanity.io backend.
// It now securely reads the Project ID from environment variables.
const sanityClient = createClient({
  // In your deployment environment (like Vercel), you will set a variable
  // called NEXT_PUBLIC_SANITY_PROJECT_ID.
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'YOUR_PROJECT_ID', // <-- Securely read from environment
  dataset: 'production', // <-- or the name of your dataset
  useCdn: true, // `false` if you want to ensure fresh data
  apiVersion: '2023-05-03', // use a UTC date string
});


// --- (1) THEME (DARK MODE) CONTEXT ---
// In a real Next.js app, this would be in /context/ThemeContext.js
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else if (storedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => useContext(ThemeContext);


// --- (2) UI COMPONENTS ---
// In a real Next.js app, these would be in /components/*.js

const Header = ({ onNavigate }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    return (
        <header className="border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-2xl font-bold text-gray-900 dark:text-white">ByteBlend</a>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                            {isDarkMode ? 
                                <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> :
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

const Footer = () => (
    <footer className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ByteBlend. All Rights Reserved.
        </div>
    </footer>
);

const PostCard = ({ post, onNavigate }) => (
    <article className="flex items-start space-x-6">
        <div className="flex-1">
            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <img src={post.author?.image} alt={post.author?.name} className="w-6 h-6 rounded-full bg-gray-200" />
                <span>{post.author?.name}</span>
            </div>
            <a href={`/post/${post.slug.current}`} onClick={(e) => { e.preventDefault(); onNavigate('post', post.slug.current); }} className="block">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400">{post.title}</h2>
                <p className="hidden md:block text-gray-600 dark:text-gray-400 text-base">{post.excerpt || 'Click to read more...'}</p>
            </a>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &middot; {post.readTime || 5} min read</span>
                {post.categories?.[0] && <span className="ml-auto bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">{post.categories[0].title}</span>}
            </div>
        </div>
        <a href={`/post/${post.slug.current}`} onClick={(e) => { e.preventDefault(); onNavigate('post', post.slug.current); }} className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-28 flex-shrink-0">
            <img src={post.mainImage?.asset?.url} alt={post.mainImage?.alt} className="w-full h-full object-cover rounded-lg bg-gray-200" />
        </a>
    </article>
);

// --- (3) PAGE COMPONENTS ---
// In a real Next.js app, these would be in /pages/index.js and /pages/post/[slug].js

const HomePage = ({ onNavigate }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            // This GROQ query fetches all posts and their related author/category info
            const query = `*[_type == "post"] | order(publishedAt desc) {
                _id,
                title,
                slug,
                "author": author->{name, "image": image.asset->url},
                mainImage{asset->{url}, alt},
                "categories": categories[]->{title},
                publishedAt,
                "excerpt": pt::text(body[0]),
                readTime
            }`;
            try {
                const postData = await sanityClient.fetch(query);
                setPosts(postData);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
                // You could set an error state here to show a message to the user
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return <div className="text-center py-12">Loading posts...</div>;
    if (!posts.length) return <div className="text-center py-12">No posts found. Go write one in your Sanity Studio!</div>;


    const featuredPost = posts[0];
    const otherPosts = posts.slice(1);

    return (
        <main className="container mx-auto px-4 py-8 md:py-12">
            <div className="col-span-12">
                {/* Featured Post */}
                <div className="mb-12">
                    <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <img src={featuredPost.author?.image} alt={featuredPost.author?.name} className="w-8 h-8 rounded-full bg-gray-200" />
                        <span>{featuredPost.author?.name}</span>
                        <span className="text-gray-400 dark:text-gray-600">&middot;</span>
                        <span>{new Date(featuredPost.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <a href={`/post/${featuredPost.slug.current}`} onClick={(e) => { e.preventDefault(); onNavigate('post', featuredPost.slug.current); }} className="block">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{featuredPost.title}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{featuredPost.excerpt}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            {featuredPost.categories?.[0] && <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">{featuredPost.categories[0].title}</span>}
                            <span className="mx-2">&middot;</span>
                            <span>{featuredPost.readTime || 5} min read</span>
                        </div>
                    </a>
                </div>

                {/* Article List */}
                <div className="space-y-10">
                    {otherPosts.map(post => <PostCard key={post._id} post={post} onNavigate={onNavigate} />)}
                </div>
            </div>
        </main>
    );
};

const PostPage = ({ slug, onNavigate }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            // This GROQ query fetches a single post based on its slug
            const query = `*[_type == "post" && slug.current == $slug][0]{
                title,
                "author": author->{name, "image": image.asset->url},
                mainImage{asset->{url}, alt},
                publishedAt,
                readTime,
                body[]{ ..., "asset": asset-> }
            }`;
            const params = { slug };
             try {
                const postData = await sanityClient.fetch(query, params);
                setPost(postData);
            } catch (error) {
                console.error(`Failed to fetch post with slug "${slug}":`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) return <div className="text-center py-12">Loading post...</div>;
    if (!post) return <div className="text-center py-12">Could not find this post.</div>;
    
    // Simple block renderer
    const renderBlock = (block) => {
        if (block._type === 'block') {
            const styleClass = {
                h2: 'text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white',
                normal: 'text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed',
                blockquote: 'border-l-4 border-indigo-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4'
            }[block.style] || 'text-lg text-gray-700 dark:text-gray-300 mb-4';
            const Tag = { h2: 'h2', blockquote: 'blockquote' }[block.style] || 'p';
            return <Tag className={styleClass}>{block.children.map(span => span.text).join('')}</Tag>;
        }
        if (block._type === 'image') {
            return <img src={block.asset.url} alt={block.alt} className="my-8 rounded-lg" />
        }
        return null;
    }

    return (
        <main className="container mx-auto px-4 py-8 md:py-12">
            <article className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">{post.title}</h1>
                <div className="flex items-center space-x-4 my-8">
                    <img src={post.author?.image} alt={post.author?.name} className="w-12 h-12 rounded-full bg-gray-200" />
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{post.author?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Published on {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &middot; {post.readTime || 5} min read
                        </p>
                    </div>
                </div>
                <img src={post.mainImage?.asset?.url} alt={post.mainImage?.alt} className="w-full h-auto object-cover rounded-lg mb-8 bg-gray-200" />
                
                <div className="prose dark:prose-dark max-w-none">
                    {post.body?.map((block, index) => <div key={index}>{renderBlock(block)}</div>)}
                </div>

                <button onClick={() => onNavigate('home')} className="mt-12 text-indigo-600 dark:text-indigo-400 hover:underline">
                    &larr; Back to all posts
                </button>
            </article>
        </main>
    );
};


// --- (4) MAIN APP CONTROLLER ---
// In a real Next.js app, this logic is handled by the framework's file-based routing.
// Here, we simulate it with state.
export default function App() {
    const [page, setPage] = useState('home'); // 'home' or 'post'
    const [currentSlug, setCurrentSlug] = useState(null);

    const handleNavigate = (newPage, slug = null) => {
        setPage(newPage);
        setCurrentSlug(slug);
        window.scrollTo(0, 0); // Scroll to top on page change
    };

    return (
        <ThemeProvider>
            <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300 min-h-screen">
                <Header onNavigate={handleNavigate} />
                {page === 'home' && <HomePage onNavigate={handleNavigate} />}
                {page === 'post' && <PostPage slug={currentSlug} onNavigate={handleNavigate} />}
                <Footer />
            </div>
        </ThemeProvider>
    );
}
