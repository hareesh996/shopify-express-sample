import "./loadEnv.js";

// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import { getShopInformation, validateAppProxyHmac } from "./delegateToken.js";
import { DeliveryMethod } from "@shopify/shopify-api";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

const webhookHandlers = {
  ...PrivacyWebhookHandlers,
  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      console.log(`Received webhook for ${topic} from shop ${shop}`);
      // Handle the order creation logic here
      // For example, you could log the order details or process them further
      console.log("Order details:", body);
    },
  },
  CARTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      console.log(`Received webhook for ${topic} from shop ${shop}`);
      // Handle the cart update logic here
      console.log("Cart update details:", body);
    },
  },
};

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.get("/api/user", async (_req, res) => {
  const session = res.locals.shopify.session;
  if (!session) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  res.status(200).send({
    name: session.shop,
  });
});

const verifyShopifyRequest = async (req, res, next) => {
  const isValid = await validateAppProxyHmac(req.url);
  if (!isValid) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  next();
};

app.get("/custom-apis/test", async (req, res) => {
  const isValid = await validateAppProxyHmac(req.query);
  if (!isValid) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  const shopInformation = await getShopInformation([
    "read_products",
    "write_products",
  ]);
  if (shopInformation) {
    res.status(200).json(shopInformation);
  } else {
    res.status(500).json({ error: "Failed to create delegate access token" });
  }
});

app.use(shopify.cspHeaders());

// Serve static files from the frontend build directory
app.use(serveStatic(STATIC_PATH, { index: false }));

/**
 * This is the catch-all route that serves the React app.
 * It should be the last route defined in this file.
 */
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
