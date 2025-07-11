'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import sanityClient from '../../../sanityClient'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

export default function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = `*[_type == "post" && slug.current == $slug][0]{
      title, "author": author->{name, "image": image.asset->url},
      mainImage{asset->{url}, alt}, publishedAt, readTime,
      body[]{ ..., "asset": asset-> }
    }`
    sanityClient.fetch(query, { slug }).then(data => {
      setPost(data)
      setLoading(false)
    })
  }, [slug])

  if (loading) return <p>Loading post...</p>
  if (!post) return <p>Post not found</p>

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold">{post.title}</h1>
        <p className="text-sm text-gray-500">
          {new Date(post.publishedAt).toLocaleDateString()}
        </p>
        <img src={post.mainImage.asset.url} alt={post.mainImage.alt} />
        {/* render body here */}
      </main>
      <Footer />
    </>
  )
}
