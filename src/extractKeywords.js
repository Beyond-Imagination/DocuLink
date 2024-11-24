import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('extractKeywords', async (req) => {
  const { text } = req.payload;

  try {
    const keywords = await resolver.invoke('extractKeywords', { text });

    return { keywords };
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred during keyword extraction.');
  }
});

export const handler = resolver.getDefinitions();
