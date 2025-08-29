import axios from "axios";

import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import shopify from "./shopify.js";
import crypto from "crypto";

const SHOP_ADDRESS = process.env.SHOP_ADDRESS;
const ADMIN_API_VERSION = process.env.ADMIN_API_VERSION || "2023-10";
const ADMIN_ACCESS_TOKEN = process.env.ADMIN_ACCESS_TOKEN;
const EXPIRES_IN = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiration
const SHARED_SECRET = 'f96b15cbbee12b02674aee6dfb8155eb';

const client = createStorefrontApiClient({
  storeDomain: `http://${SHOP_ADDRESS}.myshopify.com`,
  //privateAccessToken: ADMIN_ACCESS_TOKEN,
  publicAccessToken: "3c25538adce42412804322c08fd8dca1",
  apiVersion: "2025-07"
});

const shopQuery = `
  query shop {
    shop {
      name
      id
      primaryDomain {
        url
        host
      }
    }
  }
`;

export function getShopInformation(scopes) {
  return client.request(shopQuery)
    .then(response => {
      const shop = response.data.shop;
      console.log("Shop details:", shop);
      return {
        shopName: shop.name,
        shopId: shop.id,
        shopDomain: shop.primaryDomain.url,
        shopHost: shop.primaryDomain.host,
      };
    })
    .catch(error => {
      console.error("Error creating delegate access token:", error);
      return {error: error.message};
    });
}

export async function validateAppProxyHmac(
  queryHash 
) {

  // Parse the query string

  // Remove and save the "signature" entry
  const signature = queryHash.signature;
  delete queryHash.signature;

  // Build the sorted params string
  const sortedParams = Object.keys(queryHash)
    .sort()
    .map(key => `${key}=${Array.isArray(queryHash[key]) ? queryHash[key].join(',') : queryHash[key]}`)
    .join('');

  // Calculate the signature
  const calculatedSignature = crypto
    .createHmac('sha256', SHARED_SECRET)
    .update(sortedParams)
    .digest('hex');

  // Secure compare
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(calculatedSignature, 'utf8')
  );

    return isValid;

}