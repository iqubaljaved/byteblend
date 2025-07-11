// /schemas/post.js

// This is the schema definition for our blog posts in Sanity.io.
// It defines the structure and fields for the "Post" content type.

export default {
  // The name of the schema type. This is used in the Sanity Studio and in API queries.
  name: 'post',
  // A user-friendly title for the schema type.
  title: 'Post',
  // The type of schema. 'document' means it's a top-level content type.
  type: 'document',
  
  // These are the fields that will appear in the Sanity Studio when you create or edit a post.
  fields: [
    {
      // Field for the post title.
      name: 'title',
      title: 'Title',
      type: 'string', // The data type is a simple string.
      validation: Rule => Rule.required().error('A title is required.'), // Makes this field mandatory.
    },
    {
      // Field for the post's URL slug (e.g., /the-future-of-ai).
      name: 'slug',
      title: 'Slug',
      type: 'slug', // A special type in Sanity for generating unique slugs.
      options: {
        source: 'title', // Automatically generate the slug from the 'title' field.
        maxLength: 96,
      },
      validation: Rule => Rule.required().error('A slug is required.'), // Makes this field mandatory.
    },
    {
      // Field to reference the author of the post.
      // This creates a connection to another document type, 'author'.
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'}, // Points to the 'author' schema (we would create this next).
      validation: Rule => Rule.required().error('An author is required.'),
    },
    {
      // Field for the main image of the post.
      name: 'mainImage',
      title: 'Main image',
      type: 'image', // Sanity's built-in image type.
      options: {
        hotspot: true, // Enables a "hotspot" for better cropping control.
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
          options: {
            isHighlighted: true,
          },
        },
      ],
    },
    {
      // Field for categorizing the post.
      name: 'categories',
      title: 'Categories',
      type: 'array', // This will be an array of references.
      of: [{type: 'reference', to: {type: 'category'}}], // Points to the 'category' schema.
    },
    {
      // Field for the publication date.
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime', // A date and time picker.
      validation: Rule => Rule.required().error('A publication date is required.'),
    },
    {
      // Field for the main content of the blog post.
      name: 'body',
      title: 'Body',
      type: 'blockContent', // This references another schema file for rich text.
      // We would create a 'blockContent.js' schema to define what's allowed in the body
      // (e.g., bold text, headings, images, code blocks).
    },
  ],

  // This defines how each post is displayed in lists within the Sanity Studio.
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection;
      return {
        ...selection,
        subtitle: author && `by ${author}`,
      };
    },
  },
};
