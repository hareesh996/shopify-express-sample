import {
  DiscountClass,
  ProductDiscountSelectionStrategy,
  CartInput,
  CartLinesDiscountsGenerateRunResult,
  CartOperation,
  ProductDiscountCandidate,
} from '../generated/api';

// Hardcoded product types for A and B
const PRODUCT_TYPE_A = 'Shirts'; // e.g., "Shirt"
const PRODUCT_TYPE_B = 'Shirts'; // e.g., "Hat"

export function cartLinesDiscountsGenerateRun(
  input: CartInput,
): CartLinesDiscountsGenerateRunResult {

  // Log the input for debugging
  console.log('cartLinesDiscountsGenerateRun called with input:');
  console.log(JSON.stringify(input, null, 2));

  if (!input.cart.lines.length) {
    throw new Error('No cart lines found');
  }

  // Check if the discount class is Product
  const hasProductDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Product,
  );

  if (!hasProductDiscountClass) {
    return { operations: [] };
  }

  // Read X and Y from metafield JSON value
  const metafield = input.discount.metafield;
  const config = metafield?.jsonValue || {};
  const X = Number(config.X) || 2; // Default to 2 if not set
  const Y = Number(config.Y) || 1; // Default to 1 if not set

  // Find all cart lines for product type A
  const productALines = input.cart.lines.filter(line =>
    (line.merchandise as { __typename: "ProductVariant"; product?: { productType?: string } }).product?.productType === PRODUCT_TYPE_A
  );
  // Sum the quantity of all products of type A in the cart
  const totalAQty = productALines.reduce((sum, line) => sum + line.quantity, 0);

  // Find all cart lines for product type B
  // Since __typename is always "ProductVariant", we can safely cast merchandise
  const productBLines = input.cart.lines.filter(line =>
    (line.merchandise as { __typename: "ProductVariant"; product?: { productType?: string } }).product?.productType === PRODUCT_TYPE_B
  );

  const operations: CartOperation[] = [];

  console.log(`Total quantity of product type A: ${totalAQty}, Type B lines: ${productBLines.length} found.`);

  // If the user bought at least X of type A, discount Y of type B
  if (totalAQty >= X && productBLines.length > 0) {
    // Only discount up to Y quantity of type B products
    let remainingY = Y;
    const candidates: ProductDiscountCandidate[] = [];

    for (const line of productBLines) {
      // Determine how many units to discount in this line
      const discountQty = Math.min(line.quantity, remainingY);
      if (discountQty > 0) {
        candidates.push({
          targets: [
            {
              cartLine: {
                id: line.id,
                quantity: discountQty, // Discount only up to Y units
              },
            },
          ],
          value: {
            percentage: {
              value: 100, // Free
            },
          },
        });
        remainingY -= discountQty;
      }
      if (remainingY <= 0) break;
    }

    operations.push({
      productDiscountsAdd: {
        candidates,
        selectionStrategy: ProductDiscountSelectionStrategy.First,
      },
    });
  }

  // Log the generated operations for debugging
  console.log('Generated operations:', JSON.stringify(operations, null, 2));
  return {
    operations,
  };
}