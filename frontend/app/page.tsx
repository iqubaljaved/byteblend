import { client } from '../sanityClient' // 👈 adjust this if your path is different

type Post = {
  _id: string
  title: string
  slug?: { current: string }
}

export default async function Home() {
  const posts: Post[] = await client.fetch(`*[_type == "post"]{_id, title, slug}`)

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <ul className="space-y-4">
        {posts.map(post => (
          <li key={post._id} className="border p-4 rounded">
            <h2 className="text-xl">{post.title}</h2>
            {post.slug?.current && (
              <p className="text-sm text-gray-500">Slug: {post.slug.current}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
