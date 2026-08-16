import { createClient } from 'https://esm.sh/@sanity/client';

export const client = createClient({
  projectId: 'y4q1h6a9',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01'
});