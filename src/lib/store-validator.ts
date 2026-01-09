export interface StoreInfo {
  exists: boolean;
  frontendUrl: string;
  myshopifyUrl: string;
}

export async function validateAndGetStoreInfo(
  handle: string
): Promise<StoreInfo> {
  const myshopifyUrl = `https://${handle}.myshopify.com`;
  let frontendUrl = myshopifyUrl;
  let exists = false;

  try {
    // Try to fetch the store's robots.txt or homepage to verify it exists
    const response = await fetch(myshopifyUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      exists = true;
      // Get the final URL after redirects (in case of custom domain)
      frontendUrl = response.url;
      
      // If it's still myshopify.com, try to get the custom domain from the storefront
      if (frontendUrl.includes('.myshopify.com')) {
        try {
          // Try to get the store's primary domain from the HTML
          const htmlResponse = await fetch(myshopifyUrl, {
            signal: AbortSignal.timeout(5000),
          });
          const html = await htmlResponse.text();
          
          // Look for canonical URL or og:url meta tag
          const canonicalMatch = html.match(
            /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/
          );
          if (canonicalMatch && canonicalMatch[1]) {
            const canonicalUrl = new URL(canonicalMatch[1]);
            if (!canonicalUrl.hostname.includes('.myshopify.com')) {
              frontendUrl = canonicalUrl.origin;
            }
          }
        } catch {
          // If we can't fetch HTML, just use myshopify.com URL
        }
      }
    }
  } catch (error) {
    // Store might not exist or network error
    exists = false;
  }

  return {
    exists,
    frontendUrl,
    myshopifyUrl,
  };
}
