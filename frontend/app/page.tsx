'use client'
import React, { useEffect, useState } from 'react'
import sanityClient from '../sanityClient'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PostCard from '../components/PostCard'

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      const query = `*[_type == "post"] | order(publishedAt desc) {
        _id, title, slug, "author": author->{name, "image": image.asset->url},
        mainImage{asset->{url}, alt}, "categories": categories[]->{title},
        publishedAt, "excerpt": pt::text(body[0]), readTime
      }`
      const data = await sanityClient.fetch(query)
      setPosts(data)
      setLoading(false)
    }

    fetchPosts()
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 space-y-10">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </main>
      <Footer />
    </>
  )
}
