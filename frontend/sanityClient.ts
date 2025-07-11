import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: 'hrz2l3l9',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-05-03',
});

export default sanityClient;
