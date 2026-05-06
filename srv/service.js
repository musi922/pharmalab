import cds from '@sap/cds';

export default class MainService extends cds.ApplicationService {
  async init() {
    this.before('CREATE', 'Products', this.#validateProduct);
    this.before('UPDATE', 'Products', this.#validateProduct);

    this.before('CREATE', 'Orders', this.#validateOrder);
    this.before('UPDATE', 'Orders', this.#validateOrder);

    this.before('CREATE', 'Order_Details', this.#validateOrderDetail);
    this.after('CREATE', 'Order_Details', this.#onOrderDetailCreated);
    this.after('DELETE', 'Order_Details', this.#onOrderDetailDeleted);

    this.on('shipOrder', this.#onShipOrder);
    this.on('discontinueProduct', this.#onDiscontinueProduct);
    this.on('getLowStockProducts', this.#onGetLowStockProducts);

    return super.init();
  }

  #validateProduct = async (req) => {
    const { unitPrice, unitsInStock } = req.data;
    if (unitPrice !== undefined && unitPrice <= 0) {
      req.error(400, 'Unit price must be greater than 0');
    }
    if (unitsInStock !== undefined && unitsInStock < 0) {
      req.error(400, 'Units in stock cannot be negative');
    }
  }

  #validateOrder = async (req) => {
    const { orderDate, requiredDate } = req.data;
    if (orderDate && requiredDate && new Date(requiredDate) <= new Date(orderDate)) {
      req.error(400, 'Required date must be after order date');
    }
  }

  #validateOrderDetail = async (req) => {
    const { quantity, discount, product_ID, unitPrice } = req.data;

    if (quantity !== undefined && quantity <= 0) {
      req.error(400, 'Quantity must be greater than 0');
    }
    if (discount !== undefined && (discount < 0 || discount > 1)) {
      req.error(400, 'Discount must be between 0 and 1');
    }
    if (unitPrice !== undefined && unitPrice <= 0) {
      req.error(400, 'Unit price must be greater than 0');
    }

    if (product_ID) {
      const product = await SELECT.one.from('com.moyo.demo.myfiorielementsproject.Products')
        .where({ ID: product_ID });

      if (!product) {
        req.error(404, `Product ${product_ID} not found`);
        return;
      }
      if (product.discontinued) {
        req.error(400, `Product "${product.name}" is discontinued and cannot be ordered`);
        return;
      }
      if (quantity > product.unitsInStock) {
        req.error(400, `Insufficient stock for "${product.name}". Available: ${product.unitsInStock}, Requested: ${quantity}`);
      }
    }
  }

  #onOrderDetailCreated = async (data, req) => {
    const { product_ID, quantity } = data;
    if (!product_ID || !quantity) return;

    const product = await SELECT.one.from('com.moyo.demo.myfiorielementsproject.Products')
      .where({ ID: product_ID });

    if (!product) return;

    await UPDATE('com.moyo.demo.myfiorielementsproject.Products')
      .set({
        unitsInStock: product.unitsInStock - quantity,
        unitsOnOrder: product.unitsOnOrder + quantity
      })
      .where({ ID: product_ID });

    if ((product.unitsInStock - quantity) <= product.reorderLevel) {
      req.warn(202, `Product "${product.name}" has reached its reorder level. Current stock: ${product.unitsInStock - quantity}`);
    }
  }

  #onOrderDetailDeleted = async (data, req) => {
    const { product_ID, quantity } = data;
    if (!product_ID || !quantity) return;

    const product = await SELECT.one.from('com.moyo.demo.myfiorielementsproject.Products')
      .where({ ID: product_ID });

    if (!product) return;

    await UPDATE('com.moyo.demo.myfiorielementsproject.Products')
      .set({
        unitsInStock: product.unitsInStock + quantity,
        unitsOnOrder: Math.max(0, product.unitsOnOrder - quantity)
      })
      .where({ ID: product_ID });
  }

  #onShipOrder = async (req) => {
    const { orderID } = req.data;

    const order = await SELECT.one.from('com.moyo.demo.myfiorielementsproject.Orders')
      .where({ ID: orderID });

    if (!order) return req.error(404, `Order ${orderID} not found`);
    if (order.shippedDate) return req.error(400, `Order ${orderID} has already been shipped`);

    const orderDetails = await SELECT.from('com.moyo.demo.myfiorielementsproject.Order_Details')
      .where({ order_ID: orderID });

    if (!orderDetails.length) return req.error(400, `Order ${orderID} has no items`);

    await UPDATE('com.moyo.demo.myfiorielementsproject.Orders')
      .set({ shippedDate: new Date().toISOString().split('T')[0] })
      .where({ ID: orderID });

    for (const detail of orderDetails) {
      const product = await SELECT.one.from('com.moyo.demo.myfiorielementsproject.Products')
        .where({ ID: detail.product_ID });

      if (product) {
        await UPDATE('com.moyo.demo.myfiorielementsproject.Products')
          .set({ unitsOnOrder: Math.max(0, product.unitsOnOrder - detail.quantity) })
          .where({ ID: detail.product_ID });
      }
    }

    return `Order ${orderID} has been successfully shipped`;
  }

  #onDiscontinueProduct = async (req) => {
    const { productID } = req.data;

    const product = await SELECT.one.from('com.moyo.demo.myfiorielementsproject.Products')
      .where({ ID: productID });

    if (!product) return req.error(404, `Product ${productID} not found`);
    if (product.discontinued) return req.error(400, `Product "${product.name}" is already discontinued`);

    const openOrders = await SELECT.from('com.moyo.demo.myfiorielementsproject.Order_Details')
      .where({ product_ID: productID });

    if (openOrders.length) {
      const unshippedOrders = await SELECT.from('com.moyo.demo.myfiorielementsproject.Orders')
        .where({
          ID: { in: openOrders.map(o => o.order_ID) },
          shippedDate: null
        });

      if (unshippedOrders.length) {
        return req.error(400, `Cannot discontinue "${product.name}" — it has ${unshippedOrders.length} open unshipped order(s)`);
      }
    }

    await UPDATE('com.moyo.demo.myfiorielementsproject.Products')
      .set({ discontinued: true })
      .where({ ID: productID });

    return `Product "${product.name}" has been discontinued`;
  }

  #onGetLowStockProducts = async (req) => {
    return SELECT.from('com.moyo.demo.myfiorielementsproject.Products')
      .where('unitsInStock <= reorderLevel')
      .and({ discontinued: false });
  }
}